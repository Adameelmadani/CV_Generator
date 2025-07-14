# Système de Parsing de CV - Documentation

## Vue d'ensemble

Le système de parsing de CV permet d'extraire automatiquement les informations d'un CV au format PDF et de les convertir en XML structuré pour l'import dans le générateur de CV.

## Améliorations apportées

### 1. Correction du chemin du script Python

**Problème** : Le chemin du script Python était incorrect dans `CVController.php`
```php
// Ancien (incorrect)
$script = 'C:/xampp/htdocs/CV_Generator-3/parsing/parse_cv.py';

// Nouveau (correct)
$script = __DIR__ . '/../../parsing/parse_cv.py';
```

### 2. Amélioration de la gestion d'erreurs

#### Dans le script Python (`parse_cv.py`) :
- **Vérification de la taille du PDF** : Détection des fichiers vides
- **Gestion des erreurs OCR** : Meilleure gestion des échecs d'OCR
- **Logs détaillés** : Messages d'erreur plus informatifs
- **Validation du texte extrait** : Vérification que du texte a bien été extrait

#### Dans le contrôleur PHP (`CVController.php`) :
- **Messages d'erreur spécifiques** : Différenciation des types d'erreurs
- **Informations de debug** : Retour d'informations détaillées pour le diagnostic
- **Vérifications multiples** : Contrôle du code de retour ET de l'existence du fichier XML

### 3. Parsing plus robuste

#### Détection de sections améliorée :
- **Sections multilingues** : Support des titres en français et en anglais
- **Approche alternative** : Si aucune section standard n'est détectée, analyse par mots-clés
- **Patterns flexibles** : Reconnaissance de variations dans les titres de sections

#### Extraction d'informations personnelles améliorée :
- **Recherche de nom plus robuste** : Analyse des 15 premières lignes
- **Patterns de téléphone étendus** : Support de formats français et internationaux
- **Détection de localisation flexible** : Plusieurs patterns pour les adresses
- **Initialisation des champs** : Tous les champs sont initialisés même si vides

### 4. Script de test

Un script de test complet (`test_parsing.py`) a été créé pour :
- Vérifier les dépendances Python
- Tester l'existence et l'exécutabilité du script
- Valider le modèle XML
- Tester le parsing complet avec un PDF de test

## Utilisation

### Test du système

```bash
cd CV_Generator/parsing
python test_parsing.py
```

### Parsing manuel

```bash
python parse_cv.py chemin/vers/cv.pdf chemin/vers/sortie.xml
```

### Dépendances requises

#### 1. Dépendances Python
```bash
pip install pdfplumber pytesseract lxml Pillow
```

#### 2. Tesseract OCR (obligatoire pour les PDF contenant des images)

**Windows :**
- Téléchargez depuis : https://github.com/UB-Mannheim/tesseract/wiki
- Installez avec les langues françaises
- Ajoutez au PATH système

**Linux (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install tesseract-ocr
sudo apt install tesseract-ocr-fra
```

**macOS :**
```bash
brew install tesseract
brew install tesseract-lang
```

#### 3. Installation automatique
Utilisez le script d'installation :
```bash
cd CV_Generator/parsing
python install_ocr.py
```

## Diagnostic des erreurs

### Erreur "Module lxml non trouvé"
```bash
pip install lxml
```

### Erreur "Le PDF semble vide"
- Le PDF ne contient que des images sans texte
- Le PDF est protégé par mot de passe
- Le PDF est corrompu

### Erreur "Tesseract non trouvé"
- Tesseract OCR n'est pas installé
- Tesseract n'est pas dans le PATH système
- Solution : Installez Tesseract avec les langues françaises

### Erreur "OCR a échoué"
- Les images du PDF sont de mauvaise qualité
- La résolution est trop faible
- Le texte est illisible ou flou
- Solution : Utilisez un PDF avec des images de meilleure qualité

### Erreur "Le fichier XML de sortie n'a pas été généré"
- Problème de permissions sur le répertoire temporaire
- Espace disque insuffisant
- Erreur dans la génération du XML

## Logs et debug

Le système génère des logs détaillés dans :
- `error_log` de PHP pour les erreurs du contrôleur
- Sortie standard du script Python pour les erreurs de parsing

Les informations de debug incluent :
- Code de retour de la commande
- Sortie complète du script Python
- Existence des fichiers temporaires
- Taille du PDF uploadé

## Structure du XML généré

Le XML suit la structure définie dans `modele_cv.xml` :

```xml
<cv>
  <personalInfo>
    <firstname>...</firstname>
    <lastname>...</lastname>
    <email>...</email>
    <phone>...</phone>
    <location>...</location>
    <!-- ... -->
  </personalInfo>
  
  <profil>
    <description>...</description>
  </profil>
  
  <experiences>
    <experience>
      <position>...</position>
      <company>...</company>
      <period>...</period>
      <!-- ... -->
    </experience>
  </experiences>
  
  <!-- ... autres sections ... -->
</cv>
```

## Améliorations futures possibles

1. **Support de formats supplémentaires** : DOC, DOCX, TXT
2. **OCR multilingue** : Support de langues autres que le français
3. **Apprentissage automatique** : Amélioration de la détection de sections
4. **Validation de contenu** : Vérification de la cohérence des données extraites
5. **Interface de configuration** : Paramétrage des patterns de détection 