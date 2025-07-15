import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def rank_cvs_tf(query_vector, cv_vectors, cv_ids, query_skills=None, skills_per_cv=None):
    # Basic cosine similarity on TF vectors
    similarities = cosine_similarity(query_vector, cv_vectors)[0]
    
    # If skills are provided, boost scores for CVs with matching skills
    if query_skills and skills_per_cv:
        skill_boost = np.zeros(len(cv_ids))
        for i, cv_id in enumerate(cv_ids):
            if cv_id in skills_per_cv:
                cv_skills = skills_per_cv[cv_id]
                # Count matching skills
                matches = sum(1 for skill in query_skills if skill.lower() in [s.lower() for s in cv_skills])
                if matches > 0:
                    # Boost proportional to the number of matching skills
                    skill_boost[i] = min(0.5, 0.1 * matches)
        
        # Apply the skill boost to the similarities
        similarities = similarities + skill_boost
    
    # Rank the CVs by similarity
    ranked = sorted(zip(cv_ids, similarities), key=lambda x: x[1], reverse=True)
    return [{'cv_id': cv_id, 'similarity': float(sim)} for cv_id, sim in ranked]