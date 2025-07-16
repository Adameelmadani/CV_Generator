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

# Exemple d'utilisation
if __name__ == "__main__":
    # Télécharger les ressources NLTK (à exécuter une seule fois)
    # download_nltk_resources()
    
    # Configuration de la base de données
    db_config = {
        'host': 'localhost',
        'user': 'root',
        'password': '',
        'database': 'cv_craft'
    }
    
    # Exemple de requête RH
    query = {
        'description': "Développeur expérimenté en Spring Boot",
        'taches': "TechCorp",
        'competences': "Java, Python, MySQL"
    }
    
    # Initialiser le système de classement
    ranker = CVRanker(db_config)
    
    # Connexion à la base de données
    if ranker.connect_to_db():
        # Méthode de ranking à utiliser (TF ou TF-IDF)
        method = "tf-idf"  # ou "tf" pour utiliser la méthode TF
        
        # Classer les CVs selon la méthode choisie
        if method.lower() == "tf-idf":
            print("\nUtilisation de la méthode TF-IDF pour le classement...")
            ranked_cvs = ranker.rank_cvs_tf_idf(query)
        else:
            print("\nUtilisation de la méthode TF pour le classement...")
            ranked_cvs = ranker.rank_cvs_tf(query)
        
        # Afficher les résultats
        print("\nRésultats du classement :")
        for i, cv in enumerate(ranked_cvs[:10], 1):  # Top 10
            print(f"{i}. {cv['nom_complet']} (ID: {cv['cv_id']}) - Score: {cv['total_score']:.4f}")
            print(f"   Description: {cv['description_score']:.4f}, Tâches: {cv['tasks_score']:.4f}, Compétences: {cv['skills_score']:.4f}")
            print(f"   Contact: {cv['email']} | {cv['telephone']}")
            print("-" * 80)
        
        # Fermer la connexion
        ranker.close_connection()