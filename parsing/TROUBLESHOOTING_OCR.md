# Guide de dépannage OCR

## Problème : "Erreur lors de l'import ! , il faut qu'il soit parser par ocr !"

Cette erreur indique que votre PDF contient uniquement des images et que l'OCR n'a pas pu extraire le texte.

## Solutions étape par étape

### 1. Vérifier l'installation de Tesseract

Exécutez le script de vérification :
```bash
cd CV_Generator/parsing
python install_ocr.py
```

### 2. Installation manuelle de Tesseract

#### Windows
1. Téléchargez Tesseract depuis : https://github.com/UB-Mannheim/tesseract/wiki
2. Choisissez la version avec les langues françaises
3. Installez en cochant "Add to PATH"
4. Redémarrez votre terminal/IDE

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install tesseract-ocr
sudo apt install tesseract-ocr-fra
```

#### macOS
```bash
brew install tesseract
brew install tesseract-lang
```

### 3. Vérifier que Tesseract fonctionne

```bash
tesseract --version
tesseract --list-langs
```

Vous devriez voir `fra` dans la liste des langues.

### 4. Test simple de l'OCR

Créez un fichier de test :
```python
from PIL import Image, ImageDraw, ImageFont
import pytesseract

# Créer une image avec du texte
img = Image.new('RGB', (400, 100), color='white')
draw = ImageDraw.Draw(img)
draw.text((10, 10), "Test OCR", fill='black')

# Tester l'OCR
result = pytesseract.image_to_string(img, lang='fra')
print(f"Résultat: {result}")
```

### 5. Améliorer la qualité du PDF

Si l'OCR échoue toujours :

1. **Augmentez la résolution** : Convertissez votre PDF en images haute résolution (300 DPI minimum)
2. **Améliorez le contraste** : Assurez-vous que le texte est bien contrasté
3. **Évitez les polices décoratives** : Utilisez des polices standard (Arial, Times New Roman)
4. **Vérifiez l'orientation** : Le texte doit être horizontal

### 6. Alternatives si l'OCR échoue

#### Option A : Convertir le PDF en texte
1. Ouvrez le PDF dans un éditeur de texte
2. Copiez le texte manuellement
3. Créez un nouveau PDF avec du texte natif

#### Option B : Utiliser un service OCR en ligne
1. Google Drive (OCR automatique)
2. Adobe Acrobat Pro
3. Services OCR en ligne

#### Option C : Saisie manuelle
1. Créez un nouveau CV dans le générateur
2. Saisissez les informations manuellement

## Messages d'erreur courants

### "Tesseract non trouvé"
- **Cause** : Tesseract n'est pas installé ou pas dans le PATH
- **Solution** : Installez Tesseract et ajoutez-le au PATH système

### "Français non disponible"
- **Cause** : Le pack de langue française n'est pas installé
- **Solution** : Installez `tesseract-ocr-fra` (Linux) ou le pack français (Windows/macOS)

### "OCR a échoué sur cette page"
- **Cause** : Image de mauvaise qualité ou texte illisible
- **Solution** : Améliorez la qualité de l'image ou utilisez un PDF avec du texte natif

### "Aucun texte n'a pu être extrait"
- **Cause** : PDF entièrement en images de mauvaise qualité
- **Solution** : Utilisez un PDF avec du texte natif ou des images haute résolution

## Vérification du système

Exécutez ce script pour vérifier votre installation :

```bash
cd CV_Generator/parsing
python test_parsing.py
```

## Support

Si le problème persiste :

1. Vérifiez les logs détaillés dans la console
2. Testez avec un PDF simple contenant du texte natif
3. Vérifiez que toutes les dépendances sont installées
4. Contactez le support avec les logs d'erreur complets

## Conseils pour de meilleurs résultats

1. **Utilisez des PDF avec du texte natif** quand possible
2. **Évitez les PDF scannés** de mauvaise qualité
3. **Vérifiez la résolution** : minimum 200 DPI pour l'OCR
4. **Assurez-vous que le texte est lisible** et bien contrasté
5. **Évitez les polices décoratives** ou manuscrites 