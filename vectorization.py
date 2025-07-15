import os
import logging
import mysql.connector
from transformers import BertTokenizer, BertModel
import torch
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
import re
import unicodedata
from typing import List, Dict, Any, Optional, Set
import spacy
from spacy.matcher import PhraseMatcher
from spacy.lang.fr.stop_words import STOP_WORDS as SPACY_FRENCH_STOPWORDS
from textblob import TextBlob
from fuzzywuzzy import fuzz
import string
from spellchecker import SpellChecker
# Add SkillNER imports
from skillNer.general_params import SKILL_DB
from skillNer.skill_extractor_class import SkillExtractor

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

# Load French model (requires: python -m spacy download fr_core_news_sm)
nlp = spacy.load('fr_core_news_sm')
french_stopwords = nlp.Defaults.stop_words

# Lazy-load BERT model and tokenizer
def get_bert():
    global _tokenizer, _model
    if '_tokenizer' not in globals() or '_model' not in globals():
        _tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        _model = BertModel.from_pretrained('bert-base-uncased')
    return _tokenizer, _model


class SpellCorrector:
    """Handles spell correction using spellchecker library with domain-specific vocabularies"""
    
    def __init__(self):
        # Initialize spell checker for French only
        self.spell_fr = SpellChecker(language='fr')
        
        # Domain-specific vocabularies
        self.it_vocabulary = {
            # Langages de programmation
            'java', 'javascript', 'python', 'react', 'angular', 'vue', 'nodejs', 'node',
            'php', 'laravel', 'symfony', 'spring', 'django', 'flask', 'express',
            'html', 'css', 'bootstrap', 'jquery', 'sass', 'less', 'webpack', 'babel',
            'typescript', 'coffeescript', 'dart', 'kotlin', 'swift', 'golang', 'rust',
            'cpp', 'csharp', 'dotnet', 'aspnet', 'xamarin', 'unity',
            
            # Bases de données en français
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
            'oracle', 'sqlite', 'mariadb', 'firestore', 'dynamodb',
            'base', 'données', 'bdd', 'sgbd', 'requête', 'sql',
            
            # DevOps et outils
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'gitlab',
            'terraform', 'ansible', 'vagrant', 'prometheus', 'grafana',
            'intégration', 'continue', 'déploiement', 'conteneur', 'orchestration',
            
            # Contrôle de version
            'git', 'github', 'bitbucket', 'mercurial', 'svn',
            'versioning', 'contrôle', 'version', 'dépôt', 'branche', 'fusion',
            
            # Systèmes d'exploitation
            'linux', 'ubuntu', 'centos', 'debian', 'fedora', 'alpine',
            'windows', 'macos', 'android', 'ios',
            'système', 'exploitation', 'serveur', 'administration',
            
            # Architecture et APIs
            'api', 'rest', 'graphql', 'soap', 'grpc', 'websocket',
            'microservices', 'serverless', 'lambda', 'cloudformation',
            'architecture', 'service', 'web', 'endpoint', 'middleware',
            
            # Serveurs web
            'nginx', 'apache', 'tomcat', 'iis', 'lighttpd',
            'serveur', 'hébergement', 'domaine', 'ssl', 'https',
            
            # Outils de build et package
            'maven', 'gradle', 'npm', 'yarn', 'pip', 'composer',
            'compilation', 'construction', 'dépendance', 'paquet',
            
            # Tests
            'junit', 'mockito', 'selenium', 'cypress', 'jest', 'mocha',
            'test', 'unitaire', 'intégration', 'fonctionnel', 'automatisation',
            
            # Méthodologies
            'agile', 'scrum', 'kanban', 'devops', 'cicd', 'tdd', 'bdd',
            'méthodologie', 'gestion', 'projet', 'itération', 'sprint',
            
            # Types de développement
            'fullstack', 'frontend', 'backend', 'mobile', 'web', 'desktop',
            'développement', 'application', 'logiciel', 'programmation'
        }
        
        self.ai_vocabulary = {
            # Intelligence artificielle en français
            'intelligence', 'artificielle', 'ia', 'apprentissage', 'automatique',
            'apprentissage', 'profond', 'réseaux', 'neurones', 'neuronaux',
            'convolutionnel', 'récurrent', 'lstm', 'transformer', 'attention',
            'rétropropagation', 'gradient', 'descente',
            
            # Types d'apprentissage
            'régression', 'classification', 'clustering', 'renforcement',
            'supervisé', 'non', 'supervisé', 'semi', 'supervisé',
            'prédiction', 'modèle', 'algorithme', 'entraînement',
            
            # Frameworks et outils
            'tensorflow', 'pytorch', 'keras', 'scikit', 'sklearn', 'pandas',
            'numpy', 'matplotlib', 'seaborn', 'plotly', 'opencv', 'nltk',
            'spacy', 'huggingface', 'transformers', 'datasets',
            
            # Optimisation
            'optimiseur', 'sgd', 'adam', 'rmsprop', 'fonction', 'coût',
            'surapprentissage', 'sous', 'apprentissage', 'régularisation',
            'dropout', 'validation', 'croisée', 'hyperparamètre',
            
            # Préprocessing
            'prétraitement', 'normalisation', 'standardisation', 'acp', 'pca',
            'réduction', 'dimensionnalité', 'caractéristique', 'feature',
            
            # Méthodes ensemble
            'ensemble', 'bagging', 'boosting', 'forêt', 'aléatoire', 'xgboost',
            'svm', 'knn', 'kmeans', 'dbscan', 'hiérarchique',
            
            # Métriques
            'précision', 'rappel', 'f1', 'exactitude', 'auc', 'roc',
            'matrice', 'confusion', 'biais', 'variance', 'données', 'dataset',
            'traitement', 'naturel', 'langage', 'vision', 'ordinateur'
        }
        
        self.business_vocabulary = {
            # Gestion et management
            'gestion', 'management', 'direction', 'encadrement', 'équipe',
            'marketing', 'communication', 'commercial', 'vente', 'client',
            'finance', 'comptabilité', 'audit', 'contrôle', 'budget',
            'trésorerie', 'investissement', 'rentabilité', 'coût',
            
            # Stratégie
            'stratégie', 'business', 'conseil', 'consulting', 'projet',
            'portefeuille', 'partie', 'prenante', 'stakeholder', 'roi',
            'kpi', 'indicateur', 'performance', 'tableau', 'bord',
            'reporting', 'rapport', 'analyse', 'étude', 'marché',
            
            # Outils métier
            'crm', 'erp', 'salesforce', 'sap', 'oracle', 'dynamics',
            'excel', 'powerpoint', 'word', 'outlook', 'teams', 'slack',
            'powerbi', 'tableau', 'qlik', 'looker', 'datastudio',
            'données', 'business', 'intelligence', 'décisionnel'
        }
        
        self.french_tech_vocabulary = {
            # Développement en français
            'développement', 'programmation', 'logiciel', 'application',
            'programme', 'code', 'codage', 'algorithme', 'structure',
            'données', 'variable', 'fonction', 'méthode', 'classe',
            'objet', 'héritage', 'polymorphisme', 'encapsulation',
            
            # Métiers IT
            'ingénieur', 'développeur', 'programmeur', 'architecte', 'analyste',
            'consultant', 'expert', 'spécialiste', 'technicien', 'administrateur',
            'chef', 'projet', 'responsable', 'équipe', 'lead', 'senior',
            'junior', 'stagiaire', 'alternant', 'freelance', 'indépendant',
            
            # Processus de développement
            'conception', 'analyse', 'design', 'modélisation', 'planification',
            'réalisation', 'implémentation', 'développement', 'codage',
            'test', 'débogage', 'correction', 'optimisation', 'amélioration',
            'maintenance', 'évolution', 'migration', 'refactoring',
            
            # Qualité et sécurité
            'qualité', 'performance', 'sécurité', 'fiabilité', 'robustesse',
            'scalabilité', 'montée', 'charge', 'disponibilité', 'sauvegarde',
            'restauration', 'authentification', 'autorisation', 'chiffrement',
            
            # Documentation et formation
            'documentation', 'spécification', 'cahier', 'charges', 'manuel',
            'guide', 'formation', 'apprentissage', 'encadrement', 'mentorat',
            'expertise', 'compétence', 'savoir', 'faire', 'expérience',
            
            # Domaines techniques
            'informatique', 'technologie', 'numérique', 'digital', 'innovation',
            'recherche', 'développement', 'r&d', 'poc', 'prototype', 'mvp'
        }
        
        # Combine all vocabularies
        self.custom_vocabulary = (
            self.it_vocabulary | 
            self.ai_vocabulary | 
            self.business_vocabulary | 
            self.french_tech_vocabulary
        )
        
        # Add custom vocabulary to spell checkers
        self.spell_fr.word_frequency.load_words(self.custom_vocabulary)
        
        # Common technical term corrections (for fuzzy matching fallback)
        self.manual_corrections = {
            'tava': 'java', 'jaba': 'java', 'jva': 'java', 'javas': 'java',
            'pyton': 'python', 'piton': 'python', 'pythoon': 'python',
            'javascrit': 'javascript', 'javscript': 'javascript', 'js': 'javascript',
            'reactjs': 'react', 'react.js': 'react', 'reacte': 'react',
            'angulr': 'angular', 'angualr': 'angular', 'anglar': 'angular',
            'vuejs': 'vue', 'vue.js': 'vue', 'vuej': 'vue',
            'nods': 'nodejs', 'node.js': 'nodejs', 'nodjs': 'nodejs',
            'html5': 'html', 'htm': 'html', 'htlm': 'html',
            'css3': 'css', 'cs': 'css', 'ccs': 'css',
            'sql': 'sql', 'mysql': 'mysql', 'postgresql': 'postgresql',
            'mongodb': 'mongodb', 'mongo': 'mongodb', 'mongdb': 'mongodb',
            'git': 'git', 'github': 'github', 'gitlab': 'gitlab',
            'docker': 'docker', 'doker': 'docker', 'dokcer': 'docker',
            'kubernetes': 'kubernetes', 'k8s': 'kubernetes', 'kuberntes': 'kubernetes',
            'aws': 'aws', 'amazon': 'aws', 'azure': 'azure', 'gcp': 'gcp',
            'tensorflow': 'tensorflow', 'keras': 'keras', 'pytorch': 'pytorch',
            'machinelearning': 'machine learning', 'ml': 'machine learning',
            'artificialintelligence': 'intelligence artificielle', 'ai': 'intelligence artificielle',
            'ia': 'intelligence artificielle', 'deeplearning': 'deep learning',
            'datascience': 'data science', 'bigdata': 'big data',
            'blockchain': 'blockchain', 'blokchain': 'blockchain',
            'api': 'api', 'rest': 'rest', 'restapi': 'rest api',
            'graphql': 'graphql', 'grphql': 'graphql',
            'microservices': 'microservices', 'microservice': 'microservices',
            'devops': 'devops', 'cicd': 'ci/cd', 'ci cd': 'ci/cd',
            'agile': 'agile', 'scrum': 'scrum', 'kanban': 'kanban',
            'testing': 'testing', 'junit': 'junit', 'selenium': 'selenium',
            'spring': 'spring', 'springframework': 'spring framework',
            'django': 'django', 'flask': 'flask', 'fastapi': 'fastapi',
            'laravel': 'laravel', 'symfony': 'symfony', 'php': 'php',
            'ruby': 'ruby', 'rails': 'ruby on rails', 'ror': 'ruby on rails',
            'csharp': 'c#', 'c#': 'c#', 'dotnet': '.net', '.net': '.net',
            'java': 'java', 'kotlin': 'kotlin', 'scala': 'scala',
            'go': 'go', 'golang': 'go', 'rust': 'rust',
            'swift': 'swift', 'objectivec': 'objective-c', 'objc': 'objective-c',
            'flutter': 'flutter', 'dart': 'dart', 'reactnative': 'react native',
            'ionic': 'ionic', 'xamarin': 'xamarin', 'cordova': 'cordova',
            'android': 'android', 'ios': 'ios', 'mobile': 'mobile',
            'frontend': 'frontend', 'backend': 'backend', 'fullstack': 'fullstack',
            'ui': 'ui', 'ux': 'ux', 'uiux': 'ui/ux', 'design': 'design',
            'photoshop': 'photoshop', 'illustrator': 'illustrator', 'figma': 'figma',
            'sketch': 'sketch', 'adobexd': 'adobe xd', 'invision': 'invision',
            'bootstrap': 'bootstrap', 'tailwind': 'tailwind', 'materialize': 'materialize',
            'sass': 'sass', 'scss': 'scss', 'less': 'less', 'stylus': 'stylus',
            'webpack': 'webpack', 'gulp': 'gulp', 'grunt': 'grunt', 'npm': 'npm',
            'yarn': 'yarn', 'bower': 'bower', 'typescript': 'typescript',
            'coffescript': 'coffeescript', 'babel': 'babel', 'eslint': 'eslint',
            'prettier': 'prettier', 'jest': 'jest', 'mocha': 'mocha',
            'cypress': 'cypress', 'puppeteer': 'puppeteer', 'playwright': 'playwright'
        }
    
    def correct_word(self, word: str) -> str:
        """Correction d'un mot avec la bibliothèque spellchecker en français"""
        if not word or len(word) < 2:
            return word
            
        word_lower = word.lower()
        
        # Check manual corrections first
        if word_lower in self.manual_corrections:
            return self.manual_corrections[word_lower]
        
        # Check if word is in custom vocabulary (no correction needed)
        if word_lower in self.custom_vocabulary:
            return word_lower
        
        # Check if word is correct
        if word_lower in self.spell_fr:
            return word_lower
        
        # Get correction
        correction = self.spell_fr.correction(word_lower)
        
        # If still no correction, try fuzzy matching with custom vocabulary
        if correction == word_lower:
            best_match = self._fuzzy_match_vocabulary(word_lower)
            if best_match:
                correction = best_match
        
        return correction if correction else word
    
    def _fuzzy_match_vocabulary(self, word: str, threshold: int = 85) -> Optional[str]:
        """Correspondance approximative d'un mot avec le vocabulaire personnalisé"""
        best_match = None
        best_score = 0
        
        for vocab_word in self.custom_vocabulary:
            score = max(
                fuzz.ratio(word, vocab_word),
                fuzz.partial_ratio(word, vocab_word),
                fuzz.token_sort_ratio(word, vocab_word)
            )
            if score > best_score and score >= threshold:
                best_score = score
                best_match = vocab_word
        
        return best_match
    
    def correct_text(self, text: str) -> str:
        """Correction orthographique du texte entier en français"""
        if not text:
            return ""
        
        # Split text into words while preserving spaces
        words = re.findall(r'\S+|\s+', text)
        corrected_words = []
        
        for word in words:
            if word.isspace():
                corrected_words.append(word)
            else:
                # Remove punctuation for correction, then add it back
                clean_word = re.sub(r'[^\w]', '', word)
                if clean_word:
                    corrected = self.correct_word(clean_word)
                    # Replace the clean part in the original word
                    corrected_word = word.replace(clean_word, corrected)
                    corrected_words.append(corrected_word)
                else:
                    corrected_words.append(word)
        
        return ''.join(corrected_words)
    
    def get_candidates(self, word: str) -> Set[str]:
        """Obtenir des suggestions de correction pour un mot en français"""
        if not word:
            return set()
        
        word_lower = word.lower()
        candidates = set()
        
        # Get candidates from French spell checker only
        fr_candidates = self.spell_fr.candidates(word_lower)
        if fr_candidates:
            candidates.update(fr_candidates)
        
        # Add fuzzy matches from custom vocabulary
        fuzzy_matches = []
        for vocab_word in self.custom_vocabulary:
            score = max(
                fuzz.ratio(word_lower, vocab_word),
                fuzz.partial_ratio(word_lower, vocab_word),
                fuzz.token_sort_ratio(word_lower, vocab_word)
            )
            if score >= 80:  # Lower threshold for candidates
                fuzzy_matches.append(vocab_word)
        
        candidates.update(fuzzy_matches)
        
        return candidates


class TextNormalizer:
    """Handles text normalization including accent removal and character cleaning"""
    
    @staticmethod
    def remove_accents(text: str) -> str:
        """Remove accents from French text"""
        if not text:
            return ""
        
        # Normalize to NFD (decomposed form)
        nfd = unicodedata.normalize('NFD', text)
        # Remove combining characters (accents)
        without_accents = ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
        return without_accents
    
    @staticmethod
    def remove_punctuation(text: str) -> str:
        """Remove punctuation while preserving spaces"""
        if not text:
            return ""
        
        # Create translation table to remove punctuation
        translator = str.maketrans('', '', string.punctuation)
        return text.translate(translator)
    
    @staticmethod
    def clean_special_characters(text: str) -> str:
        """Clean special characters and normalize whitespace"""
        if not text:
            return ""
        
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text)
        # Keep only alphanumeric characters and spaces
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        # Remove extra spaces again
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """Complete text normalization pipeline"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        # Remove accents
        text = TextNormalizer.remove_accents(text)
        # Remove punctuation
        text = TextNormalizer.remove_punctuation(text)
        # Clean special characters
        text = TextNormalizer.clean_special_characters(text)
        
        return text


class StopWordRemover:
    """Handles stop word removal with French language support"""
    
    def __init__(self):
        # Combine spaCy stop words with custom technical stop words
        self.stop_words = set(french_stopwords)
        
        # Add common French stop words that might be missed
        additional_stop_words = {
            'alors', 'au', 'aucuns', 'aussi', 'autre', 'avant', 'avec', 'avoir',
            'bon', 'car', 'ce', 'cela', 'ces', 'ceux', 'chaque', 'ci', 'comme',
            'comment', 'dans', 'des', 'du', 'dedans', 'dehors', 'depuis', 'deux',
            'devrait', 'doit', 'donc', 'dos', 'droite', 'début', 'elle', 'elles',
            'en', 'encore', 'essai', 'est', 'et', 'eu', 'fait', 'faites', 'fois',
            'font', 'force', 'haut', 'hors', 'ici', 'il', 'ils', 'je', 'juste',
            'la', 'le', 'les', 'leur', 'là', 'ma', 'maintenant', 'mais', 'mes',
            'mine', 'moins', 'mon', 'mot', 'même', 'ni', 'nommés', 'notre', 'nous',
            'nouveaux', 'ou', 'où', 'par', 'parce', 'parole', 'pas', 'personnes',
            'peut', 'peu', 'pièce', 'plupart', 'pour', 'pourquoi', 'quand', 'que',
            'quel', 'quelle', 'quelles', 'quels', 'qui', 'sa', 'sans', 'ses', 'seulement',
            'si', 'sien', 'son', 'sont', 'sous', 'soyez', 'sujet', 'sur', 'ta',
            'tandis', 'tellement', 'tels', 'tes', 'ton', 'tous', 'tout', 'trop',
            'très', 'tu', 'voient', 'vont', 'votre', 'vous', 'vu', 'ça', 'étaient',
            'état', 'étions', 'été', 'être'
        }
        
        self.stop_words.update(additional_stop_words)
    
    def remove_stop_words(self, text: str) -> str:
        """Remove stop words from text"""
        if not text:
            return ""
        
        words = text.split()
        filtered_words = [word for word in words if word.lower() not in self.stop_words]
        return ' '.join(filtered_words)


class Lemmatizer:
    """Handles lemmatization using spaCy"""
    
    def __init__(self):
        self.nlp = nlp
    
    def lemmatize_text(self, text: str) -> str:
        """Lemmatize text using spaCy"""
        if not text:
            return ""
        
        doc = self.nlp(text)
        lemmatized_words = [token.lemma_ for token in doc if not token.is_space]
        return ' '.join(lemmatized_words)


class SkillsExtractor:
    """Handles skill extraction using SkillNER"""
    
    def __init__(self):
        self.skill_extractor = SkillExtractor(nlp, SKILL_DB, PhraseMatcher)
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using SkillNER"""
        if not text:
            return []
        
        annotations = self.skill_extractor.annotate(text)
        skills = []
        
        if 'results' in annotations and 'full_matches' in annotations['results']:
            for match in annotations['results']['full_matches']:
                skills.append(match['doc_node_value'])
        
        # Add any partial matches with high confidence
        if 'results' in annotations and 'ngram_scored' in annotations['results']:
            for match in annotations['results']['ngram_scored']:
                if match['score'] > 0.7:  # Only include high-confidence matches
                    skills.append(match['doc_node_value'])
        
        return list(set(skills))  # Remove duplicates
    
    def focus_on_key_skills(self, text: str) -> str:
        """Focus on key skills by extracting them and adding to the text"""
        if not text:
            return ""
        
        skills = self.extract_skills(text)
        
        # If no skills found, return original text
        if not skills:
            return text
        
        # Combine skills with original text, giving priority to skills
        skills_text = ' '.join(skills)
        focused_text = skills_text + ' ' + text
        return focused_text


class AdvancedTextPreprocessor:
    """Main text preprocessing class that orchestrates all processing steps"""
    
    def __init__(self):
        self.spell_corrector = SpellCorrector()
        self.normalizer = TextNormalizer()
        self.stop_word_remover = StopWordRemover()
        self.lemmatizer = Lemmatizer()
        # Replace NER with SkillsExtractor
        self.skills_extractor = SkillsExtractor()
    
    def preprocess_text(self, text: str, extract_skills: bool = True) -> str:
        """Complete text preprocessing pipeline"""
        if not text:
            return ""
        
        # Step 1: Spell correction
        text = self.spell_corrector.correct_text(text)
        
        # Step 2: Text normalization (accents, punctuation, special characters)
        text = self.normalizer.normalize_text(text)
        
        # Step 3: Remove stop words
        text = self.stop_word_remover.remove_stop_words(text)
        
        # Step 4: Lemmatization
        text = self.lemmatizer.lemmatize_text(text)
        
        # Step 5: Skill extraction and key term focusing (optional)
        if extract_skills:
            text = self.skills_extractor.focus_on_key_skills(text)
        
        return text
    
    def preprocess_query(self, query: str) -> str:
        """Preprocess user query with full pipeline including skill extraction"""
        return self.preprocess_text(query, extract_skills=True)
    
    def preprocess_cv_content(self, content: str) -> str:
        """Preprocess CV content with lighter processing"""
        return self.preprocess_text(content, extract_skills=False)


class Vectorizer:
    """Enhanced vectorizer with improved preprocessing"""
    
    def __init__(self):
        self.preprocessor = AdvancedTextPreprocessor()
        
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words=list(french_stopwords),
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8,
            preprocessor=self.preprocessor.preprocess_cv_content
        )
        
        self.tf_vectorizer = CountVectorizer(
            max_features=5000,
            stop_words=list(french_stopwords),
            ngram_range=(1, 2),
            min_df=2,
            max_df=0.8,
            preprocessor=self.preprocessor.preprocess_cv_content
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
        """Get BERT embedding for text"""
        if not text or text.strip() == '':
            return np.zeros(768)
        
        tokenizer, model = get_bert()
        processed_text = self.preprocessor.preprocess_cv_content(text)
        
        inputs = tokenizer(processed_text, return_tensors='pt', truncation=True, padding=True, max_length=512)
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        return embedding


class CVVectorPreparer:
    """Main class for preparing CV vectors with enhanced preprocessing"""
    
    def __init__(self):
        self.vectorizer = Vectorizer()
        self.preprocessor = AdvancedTextPreprocessor()

    def get_db_connection(self):
        """Get database connection"""
        try:
            return mysql.connector.connect(**db_config)
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise

    def fetch_cv_data(self, filiere_ids: Optional[List[int]] = None) -> Dict[int, Dict[str, Any]]:
        """Fetch CV data from database"""
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
                        
                        # Fetch profile
                        cursor.execute("SELECT description FROM profils WHERE id_cv = %s", (cv_id,))
                        profile = cursor.fetchone()
                        cv_data['profile'] = profile['description'] if profile else ""
                        
                        # Fetch formations
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
                        
                        # Fetch experiences
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
                        
                        # Fetch projets
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
                        
                        # Fetch certificats
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
                        
                        # Fetch competences
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
                        
                        # Fetch langues
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
                        
                        # Fetch personal information
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
        """Prepare CV vectors with enhanced preprocessing"""
        cvs_data = self.fetch_cv_data(filiere_ids)
        
        if not cvs_data:
            return {}
        
        # Prepare texts for vectorization
        texts = []
        skills_per_cv = {}
        
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
            texts.append(all_text)
            
            # Extract skills from CV text
            skills = self.preprocessor.skills_extractor.extract_skills(all_text)
            skills_per_cv[cv_id] = skills
        
        # Vectorize texts
        tfidf_matrix = self.vectorizer.fit_tfidf(texts)
        tf_matrix = self.vectorizer.fit_tf(texts)
        embeddings = [self.vectorizer.get_embedding(text) for text in texts]

        return {
            'tfidf': tfidf_matrix,
            'tf': tf_matrix,
            'embeddings': embeddings,
            'cv_ids': list(cvs_data.keys()),
            'raw_texts': texts,
            'cvs_data': cvs_data,
            'skills_per_cv': skills_per_cv
        }

    def vectorize_query(self, query: str) -> Dict[str, Any]:
        """Vectorize user query with enhanced preprocessing"""
        # Preprocess query with full pipeline
        clean_query = self.preprocessor.preprocess_query(query)
        
        # Extract skills from the query
        skills = self.preprocessor.skills_extractor.extract_skills(query)
        
        # Vectorize
        tfidf_vec = self.vectorizer.transform_tfidf([clean_query])
        tf_vec = self.vectorizer.transform_tf([clean_query])
        embedding = self.vectorizer.get_embedding(query)
        
        return {
            'tfidf': tfidf_vec,
            'tf': tf_vec,
            'embedding': embedding,
            'raw_text': clean_query,
            'original_query': query,
            'skills': skills
        }


# Example usage
if __name__ == "__main__":
    # Initialize the system
    cv_preparer = CVVectorPreparer()
    
    # Example query processing
    test_query = "Je cherche un développeur tava avec expérience en réact et databse"
    processed_query = cv_preparer.vectorize_query(test_query)
    
    print(f"Original query: {test_query}")
    print(f"Processed query: {processed_query['raw_text']}")
    
    # Prepare CV vectors
    cv_vectors = cv_preparer.prepare_cv_vectors()
    print(f"Processed {len(cv_vectors.get('cv_ids', []))} CVs")