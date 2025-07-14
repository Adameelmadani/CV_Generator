import os
import logging
import mysql.connector
from transformers import BertTokenizer, BertModel
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import redis
import json
import asyncio
import aiohttp
from datetime import datetime, timedelta
import re
from collections import defaultdict
import pickle
import hashlib
from typing import List, Dict, Any, Optional, Tuple
from difflib import SequenceMatcher
import unicodedata

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration from environment variables
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))
CACHE_EXPIRY = int(os.getenv('CACHE_EXPIRY', 3600))  # 1 hour

# Database connection configuration from environment
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_NAME = os.getenv('DB_NAME', 'cv_craft')

db_config = {
    'host': DB_HOST,
    'user': DB_USER,
    'password': DB_PASSWORD,
    'database': DB_NAME
}

# French stop words
FRENCH_STOP_WORDS = {
    'le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour',
    'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus',
    'par', 'grand', 'en', 'une', 'être', 'et', 'à', 'avoir', 'que', 'pour', 'dans',
    'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par',
    'grand', 'en', 'une', 'être', 'et', 'à', 'avoir', 'que', 'pour', 'dans', 'ce',
    'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand',
    'du', 'des', 'la', 'les', 'au', 'aux', 'comme', 'mais', 'ou', 'donc', 'ni',
    'car', 'si', 'bien', 'très', 'aussi', 'encore', 'déjà', 'ici', 'là', 'où',
    'quand', 'comment', 'pourquoi', 'combien', 'chaque', 'autre', 'même', 'tel',
    'tous', 'toute', 'toutes', 'quelque', 'plusieurs', 'certain', 'certaine',
    'certains', 'certaines', 'aucun', 'aucune', 'nul', 'nulle'
}

# Initialize Redis connection
try:
    redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)
    redis_client.ping()
    logger.info("Redis connected successfully")
except Exception as e:
    logger.warning(f"Redis connection failed, using in-memory cache: {e}")
    redis_client = None

# In-memory cache as fallback
cache = {}

# Lazy-load BERT model and tokenizer
_tokenizer = None
_model = None

def get_bert():
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        try:
            from transformers import BertTokenizer, BertModel
            _tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
            _model = BertModel.from_pretrained('bert-base-uncased')
        except Exception as e:
            logger.error(f"Error loading BERT model: {e}")
            raise
    return _tokenizer, _model

class CVSearchEngine:
    def __init__(self):
        self.embeddings_cache = {}
        self.suggestions_cache = {}
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words=list(FRENCH_STOP_WORDS),
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8
        )
        self.load_embeddings_cache()
        
    def normalize_text(self, text: str) -> str:
        """Normalize text for better matching"""
        if not text:
            return ""
        
        # Remove accents
        text = unicodedata.normalize('NFD', text)
        text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
        
        # Convert to lowercase and remove extra spaces
        text = re.sub(r'\s+', ' ', text.lower().strip())
        
        # Remove special characters but keep alphanumeric and spaces
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        
        return text
    
    def remove_stop_words(self, text: str) -> str:
        """Remove French stop words from text"""
        words = text.split()
        return ' '.join([word for word in words if word not in FRENCH_STOP_WORDS])
    
    def get_cache_key(self, prefix: str, data: Any) -> str:
        """Generate cache key from data"""
        return f"{prefix}:{hashlib.md5(str(data).encode()).hexdigest()}"
    
    def get_from_cache(self, key: str) -> Any:
        """Get data from cache (Redis or memory)"""
        try:
            if redis_client:
                data = redis_client.get(key)
                return json.loads(data) if data else None
            else:
                return cache.get(key)
        except:
            return None
    
    def set_cache(self, key: str, data: Any, expiry: int = CACHE_EXPIRY) -> None:
        """Set data in cache (Redis or memory)"""
        try:
            if redis_client:
                redis_client.setex(key, expiry, json.dumps(data, default=str))
            else:
                cache[key] = data
        except:
            pass
    
    def get_embedding(self, text: str) -> np.ndarray:
        """Get BERT embedding for text with caching"""
        if not text or text.strip() == '':
            return np.zeros(768)
        
        # Normalize text
        normalized_text = self.normalize_text(text)
        processed_text = self.remove_stop_words(normalized_text)
        
        # Check cache first
        cache_key = self.get_cache_key("embedding", processed_text)
        cached_embedding = self.get_from_cache(cache_key)
        
        if cached_embedding is not None:
            return np.array(cached_embedding)
        
        # Generate embedding
        try:
            tokenizer, model = get_bert()
            inputs = tokenizer(processed_text, return_tensors='pt', truncation=True, padding=True, max_length=512)
            with torch.no_grad():
                outputs = model(**inputs)
            embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
            # Cache the embedding
            self.set_cache(cache_key, embedding.tolist())
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return np.zeros(768)
    
    def get_db_connection(self):
        """Get database connection with error handling"""
        try:
            return mysql.connector.connect(**db_config)
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    def calculate_recency_score(self, cv_id: int) -> float:
        """Calculate recency score based on CV creation/update date"""
        try:
            with self.get_db_connection() as conn:
                with conn.cursor() as cursor:
                    # Get CV creation date and last update
                    cursor.execute("""
                        SELECT date_creation, date_modification 
                        FROM cvs 
                        WHERE id = %s
                    """, (cv_id,))
                    result = cursor.fetchone()
                    if not result:
                        return 0.5  # Default score
                    created_at, updated_at = result
                    reference_date = updated_at or created_at
                    if not reference_date or not isinstance(reference_date, datetime):
                        return 0.5
                    now = datetime.now()
                    if not isinstance(now, datetime):
                        return 0.5
                    days_since_update = (now - reference_date).days
                    # Recency score decreases over time (exponential decay)
                    if days_since_update <= 30:
                        return 1.0 - (days_since_update / 30) * 0.1
                    elif days_since_update <= 90:
                        return 0.9 - ((days_since_update - 30) / 60) * 0.3
                    elif days_since_update <= 180:
                        return 0.6 - ((days_since_update - 90) / 90) * 0.2
                    else:
                        return max(0.4 - ((days_since_update - 180) / 365) * 0.2, 0.1)
        except Exception as e:
            logger.error(f"Error calculating recency score: {e}")
            return 0.5
    
    def fetch_cv_data(self, filiere_ids: Optional[List[int]] = None) -> Dict[int, Dict[str, Any]]:
        """Fetch CV data from database with caching and error handling"""
        cache_key = self.get_cache_key("cv_data", filiere_ids or "all")
        cached_data = self.get_from_cache(cache_key)
        if cached_data:
            return cached_data
        try:
            with self.get_db_connection() as conn:
                with conn.cursor(dictionary=True) as cursor:
                    cvs_data = {}
                    # Get CV IDs with filiere filtering
                    if filiere_ids:
                        if len(filiere_ids) > 1:
                            placeholders = ', '.join(['%s'] * len(filiere_ids))
                            query = f"""
                                SELECT id, date_creation, date_modification, id_filiere 
                                FROM cvs 
                                WHERE est_publie = TRUE AND id_filiere IN ({placeholders})
                            """
                            cursor.execute(query, filiere_ids)
                        else:
                            query = """
                                SELECT id, date_creation, date_modification, id_filiere 
                                FROM cvs 
                                WHERE est_publie = TRUE AND id_filiere = %s
                            """
                            cursor.execute(query, (int(filiere_ids[0]),))
                    else:
                        query = """
                            SELECT id, date_creation, date_modification, id_filiere 
                            FROM cvs 
                            WHERE est_publie = TRUE
                        """
                        cursor.execute(query)
                    cv_records = cursor.fetchall()
                    for cv_record in cv_records:
                        try:
                            cv_id = cv_record['id']
                            created_at = cv_record['date_creation']
                            updated_at = cv_record['date_modification']
                            id_filiere = cv_record['id_filiere']
                        except KeyError:
                            continue
                        cv_data = {
                            'id': cv_id,
                            'created_at': created_at,
                            'updated_at': updated_at,
                            'id_filiere': id_filiere
                        }
                        
                        # Get profile data
                        cursor.execute("SELECT description FROM profils WHERE id_cv = %s", (cv_id,))
                        profile = cursor.fetchone()
                        cv_data['profile'] = profile['description'] if profile else ""
                        
                        # Get formation data
                        cursor.execute("""
                            SELECT diplome, dates, universite, specialite, description 
                            FROM formations 
                            WHERE id_cv = %s
                        """, (cv_id,))
                        formations = cursor.fetchall()
                        formation_texts = []
                        for f in formations:
                            formation_text = f"{f['diplome']} {f['specialite']} {f['universite']} {f['description']}"
                            formation_texts.append(formation_text)
                        cv_data['formation'] = " ".join(formation_texts)
                        
                        # Get experience data
                        cursor.execute("""
                            SELECT lieu, dates, entreprise, poste, description 
                            FROM experiences 
                            WHERE id_cv = %s
                        """, (cv_id,))
                        experiences = cursor.fetchall()
                        experience_texts = []
                        for e in experiences:
                            experience_text = f"{e['poste']} {e['entreprise']} {e['lieu']} {e['description']}"
                            experience_texts.append(experience_text)
                        cv_data['experience'] = " ".join(experience_texts)
                        
                        # Get project data
                        cursor.execute("""
                            SELECT nom_projet, description 
                            FROM projets 
                            WHERE id_cv = %s
                        """, (cv_id,))
                        projets = cursor.fetchall()
                        projets_texts = []
                        for p in projets:
                            projet_text = f"{p['nom_projet']} {p['description']}"
                            projets_texts.append(projet_text)
                        cv_data['projets'] = " ".join(projets_texts)
                        
                        # Get certificate data
                        cursor.execute("""
                            SELECT nom_certificat, organisme, description 
                            FROM certificats 
                            WHERE id_cv = %s
                        """, (cv_id,))
                        certificats = cursor.fetchall()
                        certificats_texts = []
                        for c in certificats:
                            certificat_text = f"{c['nom_certificat']} {c['organisme']} {c['description']}"
                            certificats_texts.append(certificat_text)
                        cv_data['certificats'] = " ".join(certificats_texts)
                        
                        # Get skills data
                        cursor.execute("""
                            SELECT categorie, competences 
                            FROM competences 
                            WHERE id_cv = %s
                        """, (cv_id,))
                        competences = cursor.fetchall()
                        competences_texts = []
                        for c in competences:
                            competence_text = f"{c['categorie']} {c['competences']}"
                            competences_texts.append(competence_text)
                        cv_data['competences'] = " ".join(competences_texts)
                        
                        # Get languages data
                        cursor.execute("""
                            SELECT nom_langue, niveau 
                            FROM langues 
                            WHERE id_cv = %s
                        """, (cv_id,))
                        langues = cursor.fetchall()
                        langues_texts = []
                        for l in langues:
                            langue_text = f"{l['nom_langue']} {l['niveau']}"
                            langues_texts.append(langue_text)
                        cv_data['langues'] = " ".join(langues_texts)
                        
                        # Get personal information
                        cursor.execute("""
                            SELECT nom, prenom, email, telephone 
                            FROM informations_personnelles 
                            WHERE id_cv = %s
                        """, (cv_id,))
                        info = cursor.fetchone()
                        if info:
                            cv_data['nom'] = f"{info['prenom']} {info['nom']}"
                            cv_data['email'] = info['email']
                            cv_data['telephone'] = info['telephone']
                        
                        cvs_data[cv_id] = cv_data
                    self.set_cache(cache_key, cvs_data, 1800)  # 30 minutes
                    return cvs_data
        except Exception as e:
            logger.error(f"Error fetching CV data: {e}")
            return {}
    
    def prepare_cv_embeddings(self, filiere_ids: Optional[List[int]] = None) -> Dict[int, Dict[str, Any]]:
        """Prepare embeddings for all CVs with caching"""
        cache_key = self.get_cache_key("cv_embeddings", filiere_ids or "all")
        cached_embeddings = self.get_from_cache(cache_key)
        
        if cached_embeddings:
            # Convert lists back to numpy arrays
            for cv_id, data in cached_embeddings.items():
                for key in ['profile', 'tasks', 'competences']:
                    if key in data and isinstance(data[key], list):
                        data[key] = np.array(data[key])
            return cached_embeddings
        
        cvs_data = self.fetch_cv_data(filiere_ids)
        cvs_embeddings = {}
        
        for cv_id, cv_data in cvs_data.items():
            # Create embeddings for different sections
            profile_embedding = self.get_embedding(cv_data.get('profile', ''))
            
            # Tasks-related embeddings
            tasks_text = (
                cv_data.get('formation', '') + " " + 
                cv_data.get('experience', '') + " " + 
                cv_data.get('projets', '') + " " + 
                cv_data.get('certificats', '')
            )
            tasks_embedding = self.get_embedding(tasks_text)
            
            # Competences-related embeddings
            competences_text = cv_data.get('competences', '') + " " + cv_data.get('langues', '')
            competences_embedding = self.get_embedding(competences_text)
            
            # Calculate recency score
            recency_score = self.calculate_recency_score(cv_id)
            
            cvs_embeddings[cv_id] = {
                'profile': profile_embedding,
                'tasks': tasks_embedding,
                'competences': competences_embedding,
                'recency_score': recency_score,
                'data': cv_data
            }
        
        # Cache embeddings (convert numpy arrays to lists for JSON serialization)
        cache_data = {}
        for cv_id, data in cvs_embeddings.items():
            cache_data[cv_id] = {
                'profile': data['profile'].tolist(),
                'tasks': data['tasks'].tolist(),
                'competences': data['competences'].tolist(),
                'recency_score': data['recency_score'],
                'data': data['data']
            }
        
        self.set_cache(cache_key, cache_data, 3600)  # 1 hour
        
        return cvs_embeddings
    
    def levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein distance between two strings"""
        if len(s1) < len(s2):
            return self.levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    def fuzzy_similarity(self, query: str, text: str, threshold: float = 0.6) -> float:
        """Calculate fuzzy similarity using Levenshtein distance"""
        query_normalized = self.normalize_text(query)
        text_normalized = self.normalize_text(text)
        
        if not query_normalized or not text_normalized:
            return 0.0
        
        # Use SequenceMatcher for more accurate similarity
        similarity = SequenceMatcher(None, query_normalized, text_normalized).ratio()
        
        # Also check for partial matches
        words_query = query_normalized.split()
        words_text = text_normalized.split()
        
        partial_matches = 0
        for query_word in words_query:
            for text_word in words_text:
                if len(query_word) >= 3 and len(text_word) >= 3:
                    word_similarity = SequenceMatcher(None, query_word, text_word).ratio()
                    if word_similarity >= threshold:
                        partial_matches += 1
                        break
        
        # Combine exact and partial similarity
        partial_score = partial_matches / max(len(words_query), 1)
        return max(similarity, partial_score * 0.8)
    
    def get_auto_complete_suggestions(self, query: str, field_type: str = 'all', limit: int = 10) -> List[str]:
        """Get auto-complete suggestions using fuzzy matching"""
        cache_key = self.get_cache_key("suggestions", f"{query}_{field_type}_{limit}")
        cached_suggestions = self.get_from_cache(cache_key)
        
        if cached_suggestions:
            return cached_suggestions
        
        query_normalized = self.normalize_text(query)
        if len(query_normalized) < 2:
            return []
        
        cvs_data = self.fetch_cv_data()
        suggestions = set()
        
        for cv_data in cvs_data.values():
            # Extract relevant text based on field type
            if field_type == 'profile':
                texts = [cv_data.get('profile', '')]
            elif field_type == 'experience':
                texts = [cv_data.get('experience', ''), cv_data.get('formation', '')]
            elif field_type == 'competences':
                texts = [cv_data.get('competences', ''), cv_data.get('langues', '')]
            else:
                texts = [
                    cv_data.get('profile', ''),
                    cv_data.get('experience', ''),
                    cv_data.get('formation', ''),
                    cv_data.get('competences', ''),
                    cv_data.get('langues', '')
                ]
            
            for text in texts:
                if not text:
                    continue
                
                # Extract meaningful phrases
                text_normalized = self.normalize_text(text)
                words = text_normalized.split()
                
                # Check individual words
                for word in words:
                    if len(word) >= 3 and self.fuzzy_similarity(query_normalized, word) >= 0.6:
                        suggestions.add(word)
                
                # Check bigrams and trigrams
                for i in range(len(words) - 1):
                    bigram = ' '.join(words[i:i+2])
                    if self.fuzzy_similarity(query_normalized, bigram) >= 0.5:
                        suggestions.add(bigram)
                
                for i in range(len(words) - 2):
                    trigram = ' '.join(words[i:i+3])
                    if self.fuzzy_similarity(query_normalized, trigram) >= 0.4:
                        suggestions.add(trigram)
        
        # Sort suggestions by similarity to query
        suggestions_list = list(suggestions)
        suggestions_scored = []
        
        for suggestion in suggestions_list:
            similarity = self.fuzzy_similarity(query_normalized, suggestion)
            suggestions_scored.append((suggestion, similarity))
        
        # Sort by similarity and take top results
        suggestions_scored.sort(key=lambda x: x[1], reverse=True)
        final_suggestions = [s[0] for s in suggestions_scored[:limit]]
        
        # Cache suggestions
        self.set_cache(cache_key, final_suggestions, 1800)  # 30 minutes
        
        return final_suggestions
    
    def search_cvs(self, description: str = "", tasks: str = "", competences: str = "", 
                  filiere_ids: Optional[List[int]] = None, 
                  weights: Optional[Dict[str, float]] = None,
                  limit: int = 50) -> List[Dict[str, Any]]:
        """Enhanced search with customizable weights and hybrid ranking"""
        
        # Default weights
        if weights is None:
            weights = {
                'description': 0.3,
                'tasks': 0.4,
                'competences': 0.3,
                'recency': 0.2
            }
        
        # Normalize weights
        total_weight = sum(weights.values())
        if total_weight > 0:
            weights = {k: v / total_weight for k, v in weights.items()}
        
        # Get embeddings for all CVs
        cv_embeddings = self.prepare_cv_embeddings(filiere_ids)
        
        # Get embeddings for search queries
        description_embedding = self.get_embedding(description) if description else np.zeros(768)
        tasks_embedding = self.get_embedding(tasks) if tasks else np.zeros(768)
        competences_embedding = self.get_embedding(competences) if competences else np.zeros(768)
        
        results = []
        
        for cv_id, embeddings in cv_embeddings.items():
            # Calculate semantic similarities
            description_similarity = 0
            if description:
                description_similarity = cosine_similarity(
                    [description_embedding], [embeddings['profile']]
                )[0][0]
            
            tasks_similarity = 0
            if tasks:
                tasks_similarity = cosine_similarity(
                    [tasks_embedding], [embeddings['tasks']]
                )[0][0]
            
            competences_similarity = 0
            if competences:
                competences_similarity = cosine_similarity(
                    [competences_embedding], [embeddings['competences']]
                )[0][0]
            
            # Calculate fuzzy similarities for better matching
            fuzzy_description = 0
            if description:
                fuzzy_description = self.fuzzy_similarity(
                    description, embeddings['data'].get('profile', '')
                )
            
            fuzzy_tasks = 0
            if tasks:
                tasks_text = (
                    embeddings['data'].get('formation', '') + " " + 
                    embeddings['data'].get('experience', '') + " " + 
                    embeddings['data'].get('projets', '')
                )
                fuzzy_tasks = self.fuzzy_similarity(tasks, tasks_text)
            
            fuzzy_competences = 0
            if competences:
                comp_text = (
                    embeddings['data'].get('competences', '') + " " + 
                    embeddings['data'].get('langues', '')
                )
                fuzzy_competences = self.fuzzy_similarity(competences, comp_text)
            
            # Combine semantic and fuzzy similarities
            combined_description = max(description_similarity, fuzzy_description * 0.8)
            combined_tasks = max(tasks_similarity, fuzzy_tasks * 0.8)
            combined_competences = max(competences_similarity, fuzzy_competences * 0.8)
            
            # Get recency score
            recency_score = embeddings.get('recency_score', 0.5)
            
            # Calculate weighted similarity
            weighted_similarity = (
                weights.get('description', 0) * combined_description +
                weights.get('tasks', 0) * combined_tasks +
                weights.get('competences', 0) * combined_competences +
                weights.get('recency', 0) * recency_score
            )
            
            # Apply minimum threshold
            if weighted_similarity > 0.1:
                results.append({
                    'cv_id': int(cv_id),
                    'similarity': float(weighted_similarity),
                    'nom': embeddings['data'].get('nom', f"CV #{cv_id}"),
                    'email': embeddings['data'].get('email', ''),
                    'telephone': embeddings['data'].get('telephone', ''),
                    'filiere_id': embeddings['data'].get('id_filiere'),
                    'recency_score': float(recency_score),
                    'details': {
                        'description_semantic': float(description_similarity),
                        'description_fuzzy': float(fuzzy_description),
                        'tasks_semantic': float(tasks_similarity),
                        'tasks_fuzzy': float(fuzzy_tasks),
                        'competences_semantic': float(competences_similarity),
                        'competences_fuzzy': float(fuzzy_competences),
                        'recency': float(recency_score)
                    }
                })
        
        # Sort results by similarity
        results.sort(key=lambda x: x['similarity'], reverse=True)
        
        return results[:limit]
    
    def load_embeddings_cache(self):
        """Load cached embeddings from file"""
        try:
            with open('embeddings_cache.pkl', 'rb') as f:
                self.embeddings_cache = pickle.load(f)
        except FileNotFoundError:
            self.embeddings_cache = {}
    
    def save_embeddings_cache(self):
        """Save embeddings cache to file"""
        try:
            with open('embeddings_cache.pkl', 'wb') as f:
                pickle.dump(self.embeddings_cache, f)
        except Exception as e:
            logger.error(f"Error saving embeddings cache: {e}")

# Initialize the search engine
search_engine = CVSearchEngine()

# API Functions
def search_candidates(description: str = "", tasks: str = "", competences: str = "", 
                     filiere_ids: Optional[List[int]] = None, 
                     weights: Optional[Dict[str, float]] = None,
                     limit: int = 50) -> List[Dict[str, Any]]:
    """Main search function"""
    return search_engine.search_cvs(
        description=description,
        tasks=tasks,
        competences=competences,
        filiere_ids=filiere_ids,
        weights=weights,
        limit=limit
    )

def get_suggestions(query: str, field_type: str = 'all', limit: int = 10) -> List[str]:
    """Get auto-complete suggestions"""
    return search_engine.get_auto_complete_suggestions(query, field_type, limit)

def get_cv_details(cv_id: int) -> Dict[str, Any]:
    """Get detailed CV information"""
    cvs_data = search_engine.fetch_cv_data()
    return cvs_data.get(cv_id, {})

def get_filieres() -> List[Dict[str, Any]]:
    """Get all available filières"""
    try:
        with search_engine.get_db_connection() as conn:
            with conn.cursor(dictionary=True) as cursor:
                cursor.execute("SELECT id, nom FROM filieres ORDER BY nom")
                filieres = cursor.fetchall()
                return filieres
    except Exception as e:
        logger.error(f"Error fetching filières: {e}")
        return []