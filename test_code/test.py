import spacy

# Load French model (requires: python -m spacy download fr_core_news_sm)
nlp = spacy.load('fr_core_news_sm')
french_stopwords = nlp.Defaults.stop_words
print(french_stopwords)
print(len(french_stopwords))