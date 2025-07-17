import mysql.connector
import re
import unicodedata
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import numpy as np
import math

# Télécharger les ressources NLTK nécessaires (à exécuter une seule fois)
def download_nltk_resources():
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('punkt_tab')

# Classe principale pour le classement des CVs
class CVRanker:
    def __init__(self, db_config):
        """
        Initialise le système de classement des CVs
        
        Args:
            db_config (dict): Configuration de la base de données
        """
        self.db_config = db_config
        self.conn = None
        self.cursor = None
        self.stopwords_fr = set(stopwords.words('french'))
        self.lemmatizer = WordNetLemmatizer()
        # Ajouter dictionnaires pour stocker les termes et documents pour le calcul d'IDF
        self.document_frequency = {}
        self.total_documents = 0
        # Add embedding cache to avoid recomputing embeddings
        self.embedding_cache = {}
        
    def connect_to_db(self):
        """Établit une connexion à la base de données"""
        try:
            self.conn = mysql.connector.connect(**self.db_config)
            self.cursor = self.conn.cursor(dictionary=True)
            return True
        except mysql.connector.Error as err:
            print(f"Erreur de connexion à la base de données: {err}")
            return False
    
    def close_connection(self):
        """Ferme la connexion à la base de données"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
    
    def preprocess_text(self, text):
        """
        Prétraite le texte (suppression des accents, ponctuation, stopwords, etc.)
        
        Args:
            text (str): Le texte à prétraiter
            
        Returns:
            list: Liste de tokens prétraités
        """
        if not text:
            return []
        
        # Convertir en minuscules
        text = text.lower()
        
        # Supprimer les accents
        text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')
        
        # Supprimer la ponctuation et les caractères spéciaux
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Tokenisation
        tokens = word_tokenize(text, language='french')
        
        # Suppression des stopwords et lemmatisation
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens if token not in self.stopwords_fr and len(token) > 2]
        
        return tokens
    
    def calculate_tf(self, term, document_tokens):
        """
        Calcule la fréquence du terme dans le document
        
        Args:
            term (str): Le terme à rechercher
            document_tokens (list): Liste des tokens du document
            
        Returns:
            float: La fréquence du terme (TF)
        """
        if not document_tokens:
            return 0
        
        term_count = document_tokens.count(term)
        return term_count / len(document_tokens)
    
    def calculate_idf(self, term):
        """
        Calcule l'IDF (Inverse Document Frequency) d'un terme
        
        Args:
            term (str): Le terme pour lequel calculer l'IDF
            
        Returns:
            float: Score IDF du terme
        """
        if term not in self.document_frequency:
            return 0
            
        return math.log(self.total_documents / (1 + self.document_frequency[term]))
    
    def calculate_tf_idf(self, term, document_tokens):
        """
        Calcule le score TF-IDF d'un terme dans un document
        
        Args:
            term (str): Le terme pour lequel calculer le TF-IDF
            document_tokens (list): Liste des tokens du document
            
        Returns:
            float: Score TF-IDF du terme dans le document
        """
        tf = self.calculate_tf(term, document_tokens)
        idf = self.calculate_idf(term)
        return tf * idf
    
    def build_document_frequency_index(self):
        """
        Construit un index de fréquence des documents pour calculer l'IDF
        """
        cv_ids = self.get_all_cvs()
        self.total_documents = len(cv_ids)
        
        # Réinitialiser le dictionnaire de fréquence des documents
        self.document_frequency = {}
        
        for cv_id in cv_ids:
            cv_sections = self.get_cv_sections(cv_id)
            
            # Prétraiter les sections du CV
            preprocessed_cv = {
                'profile': set(self.preprocess_text(cv_sections['profile'])),
                'tasks': set(self.preprocess_text(cv_sections['tasks'])),
                'skills': set(self.preprocess_text(cv_sections['skills']))
            }
            
            # Mettre à jour la fréquence des documents pour chaque terme unique
            all_terms = set()
            all_terms.update(preprocessed_cv['profile'])
            all_terms.update(preprocessed_cv['tasks'])
            all_terms.update(preprocessed_cv['skills'])
            
            for term in all_terms:
                if term in self.document_frequency:
                    self.document_frequency[term] += 1
                else:
                    self.document_frequency[term] = 1
    
    def get_all_cvs(self):
        """
        Récupère tous les IDs de CVs dans la base de données
        
        Returns:
            list: Liste des IDs de CVs
        """
        self.cursor.execute("SELECT id FROM cvs")
        return [cv['id'] for cv in self.cursor.fetchall()]
    
    def get_cv_sections(self, cv_id):
        """
        Récupère toutes les sections d'un CV
        
        Args:
            cv_id (int): ID du CV
            
        Returns:
            dict: Sections du CV (profil, certificats, expériences, formations, projets, compétences)
        """
        # Récupérer le profil (description)
        self.cursor.execute("SELECT description FROM profils WHERE id_cv = %s", (cv_id,))
        profiles = self.cursor.fetchall()
        profile_text = ' '.join([p['description'] for p in profiles if p['description']]) if profiles else ''
        
        # Récupérer les certificats, expériences, formations, projets
        tasks_text = ''
        
        # Certificats
        self.cursor.execute("SELECT nom_certificat, description FROM certificats WHERE id_cv = %s", (cv_id,))
        certificates = self.cursor.fetchall()
        if certificates:
            tasks_text += ' '.join([f"{c['nom_certificat']} {c['description']}" for c in certificates 
                                   if c['nom_certificat'] or c['description']])
        
        # Expériences
        self.cursor.execute("SELECT poste, entreprise, description FROM experiences WHERE id_cv = %s", (cv_id,))
        experiences = self.cursor.fetchall()
        if experiences:
            tasks_text += ' ' + ' '.join([f"{e['poste']} {e['entreprise']} {e['description']}" for e in experiences 
                                         if e['poste'] or e['entreprise'] or e['description']])
        
        # Formations
        self.cursor.execute("SELECT diplome, specialite, description FROM formations WHERE id_cv = %s", (cv_id,))
        formations = self.cursor.fetchall()
        if formations:
            tasks_text += ' ' + ' '.join([f"{f['diplome']} {f['specialite']} {f['description']}" for f in formations 
                                         if f['diplome'] or f['specialite'] or f['description']])
        
        # Projets
        self.cursor.execute("SELECT nom_projet, description FROM projets WHERE id_cv = %s", (cv_id,))
        projects = self.cursor.fetchall()
        if projects:
            tasks_text += ' ' + ' '.join([f"{p['nom_projet']} {p['description']}" for p in projects 
                                         if p['nom_projet'] or p['description']])
        
        # Récupérer les compétences (compétences et langues)
        skills_text = ''
        
        # Compétences
        self.cursor.execute("SELECT categorie, competences FROM competences WHERE id_cv = %s", (cv_id,))
        skills = self.cursor.fetchall()
        if skills:
            skills_text += ' '.join([f"{s['categorie']} {s['competences']}" for s in skills 
                                    if s['categorie'] or s['competences']])
        
        # Langues
        self.cursor.execute("SELECT nom_langue, niveau FROM langues WHERE id_cv = %s", (cv_id,))
        languages = self.cursor.fetchall()
        if languages:
            skills_text += ' ' + ' '.join([f"{l['nom_langue']} {l['niveau']}" for l in languages 
                                          if l['nom_langue'] or l['niveau']])
        
        return {
            'profile': profile_text,
            'tasks': tasks_text,
            'skills': skills_text
        }
    
    def get_cv_info(self, cv_id):
        """
        Récupère les informations personnelles d'un CV
        
        Args:
            cv_id (int): ID du CV
            
        Returns:
            dict: Informations personnelles du CV
        """
        self.cursor.execute("""
            SELECT nom, prenom, email, telephone
            FROM informations_personnelles
            WHERE id_cv = %s
        """, (cv_id,))
        
        result = self.cursor.fetchone()
        return result if result else {}
    
    def rank_cvs_tf(self, query):
        """
        Classe les CVs en fonction de la requête RH
        
        Args:
            query (dict): Requête avec description, tâches et compétences
            
        Returns:
            list: Liste des CVs classés
        """
        # Prétraiter la requête
        preprocessed_query = {
            'description': self.preprocess_text(query.get('description', '')),
            'tasks': self.preprocess_text(query.get('taches', '')),
            'skills': self.preprocess_text(query.get('competences', ''))
        }
        
        # Récupérer tous les CVs
        cv_ids = self.get_all_cvs()
        
        # Initialiser les scores
        scores = []
        
        for cv_id in cv_ids:
            # Récupérer les sections du CV
            cv_sections = self.get_cv_sections(cv_id)
            
            # Prétraiter les sections du CV
            preprocessed_cv = {
                'profile': self.preprocess_text(cv_sections['profile']),
                'tasks': self.preprocess_text(cv_sections['tasks']),
                'skills': self.preprocess_text(cv_sections['skills'])
            }
            
            # Calculer les scores TF pour chaque section
            description_score = 0
            for term in preprocessed_query['description']:
                description_score += self.calculate_tf(term, preprocessed_cv['profile'])
            
            tasks_score = 0
            for term in preprocessed_query['tasks']:
                tasks_score += self.calculate_tf(term, preprocessed_cv['tasks'])
            
            skills_score = 0
            for term in preprocessed_query['skills']:
                skills_score += self.calculate_tf(term, preprocessed_cv['skills'])
            
            # Calculer le score total avec les coefficients
            total_score = (0.2 * description_score) + (0.6 * tasks_score) + (0.2 * skills_score)
            
            # Récupérer les informations du CV
            cv_info = self.get_cv_info(cv_id)
            
            # Ajouter le score à la liste
            scores.append({
                'cv_id': cv_id,
                'total_score': total_score,
                'description_score': description_score,
                'tasks_score': tasks_score,
                'skills_score': skills_score,
                'nom_complet': f"{cv_info.get('prenom', '')} {cv_info.get('nom', '')}",
                'email': cv_info.get('email', ''),
                'telephone': cv_info.get('telephone', '')
            })
        
        # Trier les CVs par score total décroissant
        ranked_cvs = sorted(scores, key=lambda x: x['total_score'], reverse=True)
        
        return ranked_cvs
    
    def rank_cvs_tf_idf(self, query):
        """
        Classe les CVs en fonction de la requête RH en utilisant TF-IDF
        
        Args:
            query (dict): Requête avec description, tâches et compétences
            
        Returns:
            list: Liste des CVs classés
        """
        # Construire l'index de fréquence des documents pour le calcul d'IDF
        self.build_document_frequency_index()
        
        # Prétraiter la requête
        preprocessed_query = {
            'description': self.preprocess_text(query.get('description', '')),
            'tasks': self.preprocess_text(query.get('taches', '')),
            'skills': self.preprocess_text(query.get('competences', ''))
        }
        
        # Récupérer tous les CVs
        cv_ids = self.get_all_cvs()
        
        # Initialiser les scores
        scores = []
        
        for cv_id in cv_ids:
            # Récupérer les sections du CV
            cv_sections = self.get_cv_sections(cv_id)
            
            # Prétraiter les sections du CV
            preprocessed_cv = {
                'profile': self.preprocess_text(cv_sections['profile']),
                'tasks': self.preprocess_text(cv_sections['tasks']),
                'skills': self.preprocess_text(cv_sections['skills'])
            }
            
            # Calculer les scores TF-IDF pour chaque section
            description_score = 0
            for term in preprocessed_query['description']:
                description_score += self.calculate_tf_idf(term, preprocessed_cv['profile'])
            
            tasks_score = 0
            for term in preprocessed_query['tasks']:
                tasks_score += self.calculate_tf_idf(term, preprocessed_cv['tasks'])
            
            skills_score = 0
            for term in preprocessed_query['skills']:
                skills_score += self.calculate_tf_idf(term, preprocessed_cv['skills'])
            
            # Calculer le score total avec les coefficients
            total_score = (0.2 * description_score) + (0.6 * tasks_score) + (0.2 * skills_score)
            
            # Récupérer les informations du CV
            cv_info = self.get_cv_info(cv_id)
            
            # Ajouter le score à la liste
            scores.append({
                'cv_id': cv_id,
                'total_score': total_score,
                'description_score': description_score,
                'tasks_score': tasks_score,
                'skills_score': skills_score,
                'nom_complet': f"{cv_info.get('prenom', '')} {cv_info.get('nom', '')}",
                'email': cv_info.get('email', ''),
                'telephone': cv_info.get('telephone', '')
            })
        
        # Trier les CVs par score total décroissant
        ranked_cvs = sorted(scores, key=lambda x: x['total_score'], reverse=True)
        
        return ranked_cvs

    def vectorize_document(self, tokens, all_terms):
        """
        Convertit une liste de tokens en vecteur numérique
        
        Args:
            tokens (list): Liste des tokens du document
            all_terms (list): Liste de tous les termes dans le corpus
            
        Returns:
            list: Vecteur représentant le document
        """
        vector = [0] * len(all_terms)
        for i, term in enumerate(all_terms):
            vector[i] = tokens.count(term)
        return vector
    
    def cosine_similarity(self, vec_a, vec_b):
        """
        Calcule la similarité cosinus entre deux vecteurs
        
        Args:
            vec_a (list): Premier vecteur
            vec_b (list): Deuxième vecteur
            
        Returns:
            float: Similarité cosinus entre les deux vecteurs
        """
        dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        
        if norm_a == 0 or norm_b == 0:
            return 0
            
        return dot_product / (norm_a * norm_b)
    
    def rank_cvs_cosine(self, query):
        """
        Classe les CVs en fonction de la requête RH en utilisant la similarité cosinus
        
        Args:
            query (dict): Requête avec description, tâches et compétences
            
        Returns:
            list: Liste des CVs classés
        """
        # Prétraiter la requête
        preprocessed_query = {
            'description': self.preprocess_text(query.get('description', '')),
            'tasks': self.preprocess_text(query.get('taches', '')),
            'skills': self.preprocess_text(query.get('competences', ''))
        }
        
        # Récupérer tous les CVs
        cv_ids = self.get_all_cvs()
        
        # Récupérer tous les CV prétraités
        all_cvs_preprocessed = {}
        all_terms = {
            'description': set(),
            'tasks': set(),
            'skills': set()
        }
        
        # Construire l'ensemble de tous les termes
        for cv_id in cv_ids:
            cv_sections = self.get_cv_sections(cv_id)
            
            # Prétraiter les sections du CV
            preprocessed_cv = {
                'profile': self.preprocess_text(cv_sections['profile']),
                'tasks': self.preprocess_text(cv_sections['tasks']),
                'skills': self.preprocess_text(cv_sections['skills'])
            }
            
            all_cvs_preprocessed[cv_id] = preprocessed_cv
            
            # Collecter tous les termes uniques
            all_terms['description'].update(preprocessed_cv['profile'])
            all_terms['tasks'].update(preprocessed_cv['tasks'])
            all_terms['skills'].update(preprocessed_cv['skills'])
        
        # Ajouter les termes de la requête
        all_terms['description'].update(preprocessed_query['description'])
        all_terms['tasks'].update(preprocessed_query['tasks'])
        all_terms['skills'].update(preprocessed_query['skills'])
        
        # Convertir les ensembles en listes pour indexation
        all_terms = {
            'description': list(all_terms['description']),
            'tasks': list(all_terms['tasks']),
            'skills': list(all_terms['skills'])
        }
        
        # Vectoriser la requête
        query_vectors = {
            'description': self.vectorize_document(preprocessed_query['description'], all_terms['description']),
            'tasks': self.vectorize_document(preprocessed_query['tasks'], all_terms['tasks']),
            'skills': self.vectorize_document(preprocessed_query['skills'], all_terms['skills'])
        }
        
        # Initialiser les scores
        scores = []
        
        for cv_id in cv_ids:
            preprocessed_cv = all_cvs_preprocessed[cv_id]
            
            # Vectoriser les sections du CV
            cv_vectors = {
                'description': self.vectorize_document(preprocessed_cv['profile'], all_terms['description']),
                'tasks': self.vectorize_document(preprocessed_cv['tasks'], all_terms['tasks']),
                'skills': self.vectorize_document(preprocessed_cv['skills'], all_terms['skills'])
            }
            
            # Calculer la similarité cosinus pour chaque section
            description_score = self.cosine_similarity(query_vectors['description'], cv_vectors['description'])
            tasks_score = self.cosine_similarity(query_vectors['tasks'], cv_vectors['tasks'])
            skills_score = self.cosine_similarity(query_vectors['skills'], cv_vectors['skills'])
            
            # Calculer le score total avec les coefficients
            total_score = (0.2 * description_score) + (0.6 * tasks_score) + (0.2 * skills_score)
            
            # Récupérer les informations du CV
            cv_info = self.get_cv_info(cv_id)
            
            # Ajouter le score à la liste
            scores.append({
                'cv_id': cv_id,
                'total_score': total_score,
                'description_score': description_score,
                'tasks_score': tasks_score,
                'skills_score': skills_score,
                'nom_complet': f"{cv_info.get('prenom', '')} {cv_info.get('nom', '')}",
                'email': cv_info.get('email', ''),
                'telephone': cv_info.get('telephone', '')
            })
        
        # Trier les CVs par score total décroissant
        ranked_cvs = sorted(scores, key=lambda x: x['total_score'], reverse=True)
        
        return ranked_cvs

    def get_embedding(self, text):
        """
        Génère un vecteur d'embedding pour un texte en utilisant TF-IDF
        
        Args:
            text (str): Le texte à transformer en vecteur
            
        Returns:
            np.ndarray: Vecteur d'embedding du texte
        """
        if not text:
            return np.array([])
        
        # Vérifier si l'embedding est déjà en cache
        cache_key = hash(text)
        if cache_key in self.embedding_cache:
            return self.embedding_cache[cache_key]
        
        # Prétraiter le texte
        tokens = self.preprocess_text(text)
        
        # Construire un dictionnaire de fréquence des termes
        term_freq = {}
        for token in tokens:
            if token in term_freq:
                term_freq[token] += 1
            else:
                term_freq[token] = 1
        
        # Normaliser les fréquences
        total_tokens = len(tokens)
        if total_tokens > 0:
            for token in term_freq:
                term_freq[token] = term_freq[token] / total_tokens
        
        # Calculer l'IDF pour chaque terme si disponible
        if self.document_frequency and self.total_documents > 0:
            embedding_vector = []
            for token, tf in term_freq.items():
                idf = math.log(self.total_documents / (1 + self.document_frequency.get(token, 1)))
                embedding_vector.append((token, tf * idf))
        else:
            # Utiliser uniquement la fréquence des termes si IDF n'est pas disponible
            embedding_vector = [(token, freq) for token, freq in term_freq.items()]
        
        # Trier par importance (fréquence ou TF-IDF)
        embedding_vector.sort(key=lambda x: x[1], reverse=True)
        
        # Limiter la taille du vecteur aux N termes les plus importants
        max_terms = 300  # Paramètre ajustable
        embedding_vector = embedding_vector[:max_terms]
        
        # Stocker dans le cache
        self.embedding_cache[cache_key] = embedding_vector
        
        return embedding_vector
    
    def embedding_similarity(self, embedding1, embedding2):
        """
        Calcule la similarité entre deux embeddings
        
        Args:
            embedding1 (list): Premier embedding [(terme, poids), ...]
            embedding2 (list): Deuxième embedding [(terme, poids), ...]
            
        Returns:
            float: Score de similarité entre 0 et 1
        """
        if not embedding1 or not embedding2:
            return 0
        
        # Créer des dictionnaires pour un accès plus rapide
        dict1 = dict(embedding1)
        dict2 = dict(embedding2)
        
        # Trouver les termes communs
        common_terms = set(dict1.keys()) & set(dict2.keys())
        
        if not common_terms:
            return 0
        
        # Calculer la similarité en fonction des poids des termes communs
        similarity = 0
        for term in common_terms:
            similarity += dict1[term] * dict2[term]
        
        # Normaliser par la norme des vecteurs
        norm1 = math.sqrt(sum(w*w for _, w in embedding1))
        norm2 = math.sqrt(sum(w*w for _, w in embedding2))
        
        if norm1 == 0 or norm2 == 0:
            return 0
            
        return similarity / (norm1 * norm2)
    
    def rank_cvs_embedding(self, query):
        """
        Classe les CVs en fonction de la requête RH en utilisant les embeddings
        
        Args:
            query (dict): Requête avec description, tâches et compétences
            
        Returns:
            list: Liste des CVs classés
        """
        # Construire d'abord l'index de fréquence de documents pour les embeddings
        self.build_document_frequency_index()
        
        # Générer des embeddings pour la requête
        query_embeddings = {
            'description': self.get_embedding(query.get('description', '')),
            'tasks': self.get_embedding(query.get('taches', '')),
            'skills': self.get_embedding(query.get('competences', ''))
        }
        
        # Récupérer tous les CVs
        cv_ids = self.get_all_cvs()
        print(f"Traitement de {len(cv_ids)} CVs avec la méthode d'embedding...")
        
        # Initialiser les scores
        scores = []
        
        for cv_id in cv_ids:
            # Récupérer les sections du CV
            cv_sections = self.get_cv_sections(cv_id)
            
            # Générer les embeddings pour chaque section du CV
            cv_embeddings = {
                'profile': self.get_embedding(cv_sections['profile']),
                'tasks': self.get_embedding(cv_sections['tasks']),
                'skills': self.get_embedding(cv_sections['skills'])
            }
            
            # Calculer les similarités entre les embeddings de la requête et du CV
            description_score = self.embedding_similarity(query_embeddings['description'], cv_embeddings['profile'])
            tasks_score = self.embedding_similarity(query_embeddings['tasks'], cv_embeddings['tasks'])
            skills_score = self.embedding_similarity(query_embeddings['skills'], cv_embeddings['skills'])
            
            # Calculer le score total avec les coefficients
            total_score = (0.2 * description_score) + (0.6 * tasks_score) + (0.2 * skills_score)
            
            # Récupérer les informations du CV
            cv_info = self.get_cv_info(cv_id)
            
            # Ajouter le score à la liste
            scores.append({
                'cv_id': cv_id,
                'total_score': total_score,
                'description_score': description_score,
                'tasks_score': tasks_score,
                'skills_score': skills_score,
                'nom_complet': f"{cv_info.get('prenom', '')} {cv_info.get('nom', '')}",
                'email': cv_info.get('email', ''),
                'telephone': cv_info.get('telephone', '')
            })
        
        # Trier les CVs par score total décroissant
        ranked_cvs = sorted(scores, key=lambda x: x['total_score'], reverse=True)
        
        return ranked_cvs
