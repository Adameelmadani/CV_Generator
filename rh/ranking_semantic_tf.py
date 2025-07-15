import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def rank_cvs_semantic_tf(query_vector, cv_vectors, cv_ids, semantic_map=None):
    # Optionally, semantic_map can be used to expand query terms or CV terms
    # For now, just use cosine similarity as a placeholder
    similarities = cosine_similarity(query_vector, cv_vectors)[0]
    ranked = sorted(zip(cv_ids, similarities), key=lambda x: x[1], reverse=True)
    return [{'cv_id': cv_id, 'similarity': float(sim)} for cv_id, sim in ranked] 