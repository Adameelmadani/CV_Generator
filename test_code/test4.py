import spacy

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
      
# Load French model (requires: python -m spacy download fr_core_news_sm)
nlp = spacy.load('fr_core_news_sm')

print(Lemmatizer().lemmatize_text("Bonjour, je suis Adam."))