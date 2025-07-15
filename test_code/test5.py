import numpy as np
import torch
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from typing import List

# Dummy French stopwords list for illustration
french_stopwords = {"et", "le", "la", "les", "de", "des", "en", "un", "une", "à", "pour", "dans"}

# Dummy Preprocessor
class AdvancedTextPreprocessor:
    def preprocess_cv_content(self, text: str) -> str:
        # Minimal cleaning example
        return text.lower().strip()

# Dummy BERT getter using a small model for fast testing
from transformers import AutoTokenizer, AutoModel

def get_bert():
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    model = AutoModel.from_pretrained("bert-base-uncased")
    return tokenizer, model

# Vectorizer class from your snippet
class Vectorizer:
    def __init__(self):
        self.preprocessor = AdvancedTextPreprocessor()

        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words=list(french_stopwords),
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.9,
            preprocessor=self.preprocessor.preprocess_cv_content
        )

        self.tf_vectorizer = CountVectorizer(
            max_features=5000,
            stop_words=list(french_stopwords),
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.9,
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
        if not text or text.strip() == '':
            return np.zeros(768)

        tokenizer, model = get_bert()
        processed_text = self.preprocessor.preprocess_cv_content(text)

        inputs = tokenizer(processed_text, return_tensors='pt', truncation=True, padding=True, max_length=512)

        with torch.no_grad():
            outputs = model(**inputs)

        embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        return embedding

# Sample CV-like texts
texts = [
    "Développeur Python avec expérience en développement web",
    "Chef de projet avec compétences en gestion et communication"
]

# Instantiate and apply vectorizer
vectorizer = Vectorizer()

# TF-IDF
tfidf_matrix = vectorizer.fit_tfidf(texts)
print("TF-IDF shape:", tfidf_matrix.shape)
print("TF-IDF sample:", tfidf_matrix.toarray()[0][:10])

# TF (Count)
tf_matrix = vectorizer.fit_tf(texts)
print("\nCount Vector shape:", tf_matrix.shape)
print("Count Vector sample:", tf_matrix.toarray()[0][:10])

# BERT Embedding
print("\nBERT Embeddings:")
for text in texts:
    emb = vectorizer.get_embedding(text)
    print("Embedding shape:", emb.shape)
    print("Embedding sample (first 5 dims):", emb[:5])
