from spellchecker import SpellChecker

# For French
spell = SpellChecker(language='fr')

# For English
spell_en = SpellChecker(language='en')

# Correct a word
word = "impossibl"  # misspelled "bonjour"
if word in spell:
    print(f"{word} is correct")
else:
    correction = spell.correction(word)
    print(f"Correction for '{word}': {correction}")
    
    # Get multiple candidates
    candidates = spell.candidates(word)
    print(f"Candidates: {candidates}")