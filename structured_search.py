
import os
import logging
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Any, Optional, Tuple

# Import modules from other files
from vectorization import CVVectorPreparer, AdvancedTextPreprocessor
from ranking_tfidf import rank_cvs_tfidf
from ranking_tf import rank_cvs_tf
from ranking_embedding import rank_cvs_embedding

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StructuredSearchEngine:
    """
    Structured Search Engine for HR queries with multiple input fields:
    - Description: general profile and intentions
    - Tasks: expected missions
    - Competences: technical and behavioral skills
    
    Each field is processed separately and matched with corresponding CV sections.
    """
    
    def __init__(self):
        """Initialize the search engine with necessary components"""
        self.cv_preparer = CVVectorPreparer()
        self.preprocessor = AdvancedTextPreprocessor()
        
        # Default weights for combining scores
        self.weights = {
            'description': 0.3,  # α - weight for description matching
            'tasks': 0.3,        # β - weight for tasks matching
            'competences': 0.4,  # γ - weight for competences matching
            
            # Method weights
            'tfidf': 0.4,
            'tf': 0.2,
            'embedding': 0.4,
        }
    
    def set_weights(self, weights: Dict[str, float]) -> None:
        """Update the weights used for scoring"""
        self.weights.update(weights)
        logger.info(f"Updated weights: {self.weights}")
    
    def process_query(self, description: str, tasks: str, competences: str) -> Dict[str, Any]:
        """
        Process the three query fields separately
        
        Args:
            description: General profile description
            tasks: Expected missions/tasks
            competences: Required skills and competencies
        
        Returns:
            Dictionary with processed query vectors and metadata
        """
        query_data = {
            'description': self._process_query_field(description, 'description'),
            'tasks': self._process_query_field(tasks, 'tasks'),
            'competences': self._process_query_field(competences, 'competences'),
            'raw_queries': {
                'description': description,
                'tasks': tasks,
                'competences': competences
            }
        }
        
        return query_data
    
    def _process_query_field(self, query_text: str, field_type: str) -> Dict[str, Any]:
        """Process a single query field"""
        if not query_text:
            return {
                'tfidf': None,
                'tf': None,
                'embedding': None,
                'raw_text': '',
                'skills': []
            }
        
        # Use the vectorizer to process query
        query_vectors = self.cv_preparer.vectorize_query(query_text)
        
        return query_vectors
    
    def prepare_cv_data(self, filiere_ids: Optional[List[int]] = None) -> Dict[str, Any]:
        """Prepare CV data and their vectors"""
        cv_data = self.cv_preparer.prepare_cv_vectors(filiere_ids)
        
        # Extract sections from CVs for structured matching
        cv_sections = self._extract_cv_sections(cv_data['cvs_data'])
        
        # Add sections to the CV data
        cv_data['sections'] = cv_sections
        
        return cv_data
    
    def _extract_cv_sections(self, cvs_data: Dict[int, Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
        """
        Extract and process different sections from CVs
        
        Sections:
        - description: Profile section (matches with description query)
        - tasks: Formation, experience, projects, certificates (matches with tasks query)
        - competences: Competences and languages (matches with competences query)
        """
        cv_sections = {}
        
        for cv_id, cv_data in cvs_data.items():
            # Initialize section vectors
            profile_section = cv_data.get('profile', '')
            
            # Tasks section: combine formation, experience, projects, certificates
            tasks_section = ' '.join([
                cv_data.get('formation', ''),
                cv_data.get('experience', ''),
                cv_data.get('projets', ''),
                cv_data.get('certificats', '')
            ])
            
            # Competences section: combine competences and languages
            competences_section = ' '.join([
                cv_data.get('competences', ''),
                cv_data.get('langues', '')
            ])
            
            # Process each section
            sections = {
                'description': {
                    'text': profile_section,
                    'vectors': self._vectorize_section(profile_section)
                },
                'tasks': {
                    'text': tasks_section,
                    'vectors': self._vectorize_section(tasks_section)
                },
                'competences': {
                    'text': competences_section,
                    'vectors': self._vectorize_section(competences_section)
                }
            }
            
            cv_sections[cv_id] = sections
        
        return cv_sections
    
    def _vectorize_section(self, text: str) -> Dict[str, Any]:
        """Vectorize a CV section"""
        if not text or text.strip() == '':
            return {
                'tfidf': None,
                'tf': None,
                'embedding': None,
                'skills': []
            }
        
        # Process and vectorize the text
        processed = self.preprocessor.preprocess_cv_content(text)
        tfidf_vec = self.cv_preparer.vectorizer.transform_tfidf([processed])
        tf_vec = self.cv_preparer.vectorizer.transform_tf([processed])
        embedding = self.cv_preparer.vectorizer.get_embedding(processed)
        skills = self.preprocessor.skills_extractor.extract_skills(text)
        
        return {
            'tfidf': tfidf_vec,
            'tf': tf_vec,
            'embedding': embedding,
            'skills': skills
        }
    
    def search(self, description: str, tasks: str, competences: str, 
              filiere_ids: Optional[List[int]] = None, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Perform a structured search with the three query fields
        
        Args:
            description: General profile description
            tasks: Expected missions/tasks
            competences: Required skills and competencies
            filiere_ids: Optional list of filiere IDs to filter CVs
            top_n: Number of top results to return
        
        Returns:
            List of ranked CV results with scores and explanations
        """
        # Step 1: Process the query fields
        query_data = self.process_query(description, tasks, competences)
        
        # Step 2: Prepare CV data
        cv_data = self.prepare_cv_data(filiere_ids)
        
        if not cv_data or 'cv_ids' not in cv_data or not cv_data['cv_ids']:
            logger.warning("No CV data available for search")
            return []
        
        # Step 3: Match each query field with corresponding CV sections
        section_scores = self._match_sections(query_data, cv_data)
        
        # Step 4: Calculate final scores and rank CVs
        ranked_results = self._rank_cvs(section_scores, cv_data['cvs_data'], top_n)
        
        return ranked_results
    
    def _match_sections(self, query_data: Dict[str, Any], cv_data: Dict[str, Any]) -> Dict[str, Dict[int, Dict[str, float]]]:
        """Match each query field with corresponding CV sections"""
        cv_ids = cv_data['cv_ids']
        sections = cv_data['sections']
        
        section_scores = {
            'description': {},
            'tasks': {},
            'competences': {}
        }
        
        # Process each section type
        for section_type in ['description', 'tasks', 'competences']:
            query_vectors = query_data[section_type]
            
            # Skip if query is empty
            if not query_vectors['raw_text']:
                for cv_id in cv_ids:
                    section_scores[section_type][cv_id] = {
                        'tfidf': 0.0,
                        'tf': 0.0,
                        'embedding': 0.0,
                        'skill_overlap': 0.0,
                        'combined': 0.0
                    }
                continue
            
            # Calculate scores for each CV
            for cv_id in cv_ids:
                cv_section = sections[cv_id][section_type]
                
                # Initialize scores
                scores = {
                    'tfidf': 0.0,
                    'tf': 0.0,
                    'embedding': 0.0,
                    'skill_overlap': 0.0
                }
                
                # Calculate TF-IDF similarity
                if query_vectors['tfidf'] is not None and cv_section['vectors']['tfidf'] is not None:
                    scores['tfidf'] = float(
                        cosine_similarity(
                            query_vectors['tfidf'], 
                            cv_section['vectors']['tfidf']
                        )[0][0]
                    )
                
                # Calculate TF similarity
                if query_vectors['tf'] is not None and cv_section['vectors']['tf'] is not None:
                    scores['tf'] = float(
                        cosine_similarity(
                            query_vectors['tf'], 
                            cv_section['vectors']['tf']
                        )[0][0]
                    )
                
                # Calculate embedding similarity
                if query_vectors['embedding'] is not None and cv_section['vectors']['embedding'] is not None:
                    scores['embedding'] = float(
                        cosine_similarity(
                            [query_vectors['embedding']], 
                            [cv_section['vectors']['embedding']]
                        )[0][0]
                    )
                
                # Calculate skill overlap score
                if query_vectors['skills'] and cv_section['vectors']['skills']:
                    query_skills = set(s.lower() for s in query_vectors['skills'])
                    cv_skills = set(s.lower() for s in cv_section['vectors']['skills'])
                    
                    if query_skills and cv_skills:
                        overlap = len(query_skills.intersection(cv_skills))
                        scores['skill_overlap'] = min(1.0, overlap / len(query_skills) if query_skills else 0)
                
                # Combine scores with weights
                scores['combined'] = (
                    self.weights['tfidf'] * scores['tfidf'] +
                    self.weights['tf'] * scores['tf'] +
                    self.weights['embedding'] * scores['embedding']
                )
                
                # Add skill overlap bonus
                scores['combined'] += min(0.3, scores['skill_overlap'])
                
                # Store scores
                section_scores[section_type][cv_id] = scores
        
        return section_scores
    
    def _rank_cvs(self, section_scores: Dict[str, Dict[int, Dict[str, float]]], 
                 cvs_data: Dict[int, Dict[str, Any]], top_n: int) -> List[Dict[str, Any]]:
        """Calculate final scores and rank CVs"""
        final_scores = {}
        
        for cv_id in cvs_data.keys():
            # Calculate weighted average of section scores
            weighted_score = (
                self.weights['description'] * section_scores['description'][cv_id]['combined'] +
                self.weights['tasks'] * section_scores['tasks'][cv_id]['combined'] +
                self.weights['competences'] * section_scores['competences'][cv_id]['combined']
            )
            
            # Store score with explanation
            final_scores[cv_id] = {
                'cv_id': cv_id,
                'total_score': weighted_score,
                'section_scores': {
                    'description': section_scores['description'][cv_id],
                    'tasks': section_scores['tasks'][cv_id],
                    'competences': section_scores['competences'][cv_id]
                },
                'cv_data': {
                    'nom': cvs_data[cv_id].get('nom', ''),
                    'email': cvs_data[cv_id].get('email', ''),
                    'telephone': cvs_data[cv_id].get('telephone', '')
                }
            }
        
        # Sort by total score
        ranked_results = sorted(
            final_scores.values(), 
            key=lambda x: x['total_score'], 
            reverse=True
        )
        
        # Return top N results
        return ranked_results[:top_n]
    
    def get_cv_details(self, cv_id: int) -> Dict[str, Any]:
        """Get detailed information about a specific CV"""
        try:
            # Prepare CV data for a single CV
            cv_data = self.cv_preparer.fetch_cv_data([])
            
            if cv_id in cv_data:
                return cv_data[cv_id]
            else:
                logger.warning(f"CV with ID {cv_id} not found")
                return {}
                
        except Exception as e:
            logger.error(f"Error fetching CV details: {e}")
            return {}

# Example usage
if __name__ == "__main__":
    engine = StructuredSearchEngine()
    
    # Example search
    results = engine.search(
        description="Développeur web passionné avec expérience en front-end",
        tasks="Création d'applications web, optimisation de performance, travail en équipe agile",
        competences="JavaScript, React, HTML, CSS, NodeJS, Git"
    )
    
    # Print results
    for i, result in enumerate(results[:5]):
        print(f"\n{i+1}. {result['cv_data']['nom']} - Score: {result['total_score']:.2f}")
        print(f"   - Description score: {result['section_scores']['description']['combined']:.2f}")
        print(f"   - Tasks score: {result['section_scores']['tasks']['combined']:.2f}")
        print(f"   - Competences score: {result['section_scores']['competences']['combined']:.2f}")