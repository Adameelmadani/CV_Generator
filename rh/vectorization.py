import os
import logging
import mysql.connector
from transformers import BertTokenizer, BertModel
import torch
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
import re
import unicodedata
from typing import List, Dict, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# Lazy-load BERT model and tokenizer
def get_bert():
    global _tokenizer, _model
    if '_tokenizer' not in globals() or '_model' not in globals():
        _tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        _model = BertModel.from_pretrained('bert-base-uncased')
    return _tokenizer, _model

class TextPreprocessor:
    @staticmethod
    def normalize_text(text: str) -> str:
        if not text:
            return ""
        text = unicodedata.normalize('NFD', text)
        text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
        text = re.sub(r'\s+', ' ', text.lower().strip())
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        return text

    @staticmethod
    def remove_stop_words(text: str) -> str:
        words = text.split()
        return ' '.join([word for word in words if word not in FRENCH_STOP_WORDS])

    @staticmethod
    def tokenize(text: str) -> List[str]:
        return TextPreprocessor.remove_stop_words(TextPreprocessor.normalize_text(text)).split()

class Vectorizer:
    def __init__(self):
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words=list(FRENCH_STOP_WORDS),
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8
        )
        self.tf_vectorizer = CountVectorizer(
            max_features=5000,
            stop_words=list(FRENCH_STOP_WORDS),
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8
        )

    def fit_tfidf(self, texts: List[str]):
        return self.tfidf_vectorizer.fit_transform(texts)

    def transform_tfidf(self, texts: List[str]):
        return self.tfidf_vectorizer.transform(texts)

    def fit_tf(self, texts: List[str]):
        return self.tf_vectorizer.fit_transform(texts)

    def transform_tf(self, texts: List[str]):
        return self.tf_vectorizer.transform(texts)

    def get_embedding(self, text: str) -> np.ndarray:
        if not text or text.strip() == '':
            return np.zeros(768)
        tokenizer, model = get_bert()
        processed_text = TextPreprocessor.remove_stop_words(TextPreprocessor.normalize_text(text))
        inputs = tokenizer(processed_text, return_tensors='pt', truncation=True, padding=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
        embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        return embedding

class CVVectorPreparer:
    def __init__(self):
        self.vectorizer = Vectorizer()

    def get_db_connection(self):
        try:
            return mysql.connector.connect(**db_config)
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    def fetch_cv_data(self, filiere_ids: Optional[List[int]] = None) -> Dict[int, Dict[str, Any]]:
        try:
            with self.get_db_connection() as conn:
                with conn.cursor(dictionary=True) as cursor:
                    cvs_data = {}
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
                        cursor.execute("SELECT description FROM profils WHERE id_cv = %s", (cv_id,))
                        profile = cursor.fetchone()
                        cv_data['profile'] = profile['description'] if profile else ""
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
                    return cvs_data
        except Exception as e:
            logger.error(f"Error fetching CV data: {e}")
            return {}

    def prepare_cv_vectors(self, filiere_ids: Optional[List[int]] = None) -> Dict[int, Dict[str, Any]]:
        cvs_data = self.fetch_cv_data(filiere_ids)
        texts = []
        for cv_id, cv_data in cvs_data.items():
            all_text = ' '.join([
                cv_data.get('profile', ''),
                cv_data.get('formation', ''),
                cv_data.get('experience', ''),
                cv_data.get('projets', ''),
                cv_data.get('certificats', ''),
                cv_data.get('competences', ''),
                cv_data.get('langues', '')
            ])
            texts.append(TextPreprocessor.remove_stop_words(TextPreprocessor.normalize_text(all_text)))
        tfidf_matrix = self.vectorizer.fit_tfidf(texts)
        tf_matrix = self.vectorizer.fit_tf(texts)
        embeddings = [self.vectorizer.get_embedding(text) for text in texts]
        return {
            'tfidf': tfidf_matrix,
            'tf': tf_matrix,
            'embeddings': embeddings,
            'cv_ids': list(cvs_data.keys()),
            'raw_texts': texts
        }

    def vectorize_query(self, query: str) -> Dict[str, Any]:
        clean_query = TextPreprocessor.remove_stop_words(TextPreprocessor.normalize_text(query))
        tfidf_vec = self.vectorizer.transform_tfidf([clean_query])
        tf_vec = self.vectorizer.transform_tf([clean_query])
        embedding = self.vectorizer.get_embedding(query)
        return {
            'tfidf': tfidf_vec,
            'tf': tf_vec,
            'embedding': embedding,
            'raw_text': clean_query
        }