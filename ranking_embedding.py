import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def rank_cvs_embedding(query_embedding, cv_embeddings, cv_ids):
    similarities = cosine_similarity([query_embedding], cv_embeddings)[0]
    ranked = sorted(zip(cv_ids, similarities), key=lambda x: x[1], reverse=True)
    return [{'cv_id': cv_id, 'similarity': float(sim)} for cv_id, sim in ranked] 