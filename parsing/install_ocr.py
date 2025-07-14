#!/usr/bin/env python3
"""
Script d'installation et de vérification des dépendances OCR
"""

import os
import sys
import subprocess
import platform

def check_tesseract():
    """Vérifie si Tesseract est installé"""
    print("=== Vérification de Tesseract OCR ===")
    
    try:
        # Vérifier la version de Tesseract
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("[OK] Tesseract est installé")
            print(f"Version: {result.stdout.strip()}")
            return True
        else:
            print("[ERREUR] Tesseract n'est pas installé ou ne fonctionne pas")
            return False
    except FileNotFoundError:
        print("[ERREUR] Tesseract n'est pas installé")
        return False
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la vérification de Tesseract: {e}")
        return False

def check_tesseract_languages():
    """Vérifie les langues disponibles pour Tesseract"""
    print("\n=== Vérification des langues Tesseract ===")
    
    try:
        result = subprocess.run(['tesseract', '--list-langs'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            languages = result.stdout.strip().split('\n')[1:]  # Ignorer la première ligne
            print("Langues disponibles:")
            for lang in languages:
                if lang.strip():
                    print(f"  - {lang.strip()}")
            
            # Vérifier si le français est disponible
            french_available = any('fra' in lang.lower() or 'french' in lang.lower() for lang in languages)
            if french_available:
                print("[OK] Français disponible")
                return True
            else:
                print("[ATTENTION] Français non disponible")
                return False
        else:
            print("[ERREUR] Impossible de récupérer la liste des langues")
            return False
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la vérification des langues: {e}")
        return False

def install_tesseract_windows():
    """Instructions d'installation pour Windows"""
    print("\n=== Installation de Tesseract sur Windows ===")
    print("1. Téléchargez Tesseract depuis: https://github.com/UB-Mannheim/tesseract/wiki")
    print("2. Installez avec les langues françaises")
    print("3. Ajoutez Tesseract au PATH système")
    print("4. Redémarrez votre terminal/IDE")
    
    # Vérifier si Chocolatey est disponible
    try:
        result = subprocess.run(['choco', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("\nOu utilisez Chocolatey:")
            print("choco install tesseract")
            print("choco install tesseract-fra")
    except:
        pass

def install_tesseract_linux():
    """Instructions d'installation pour Linux"""
    print("\n=== Installation de Tesseract sur Linux ===")
    
    system = platform.system().lower()
    if system == "ubuntu" or system == "debian":
        print("Ubuntu/Debian:")
        print("sudo apt update")
        print("sudo apt install tesseract-ocr")
        print("sudo apt install tesseract-ocr-fra")
    elif system == "centos" or system == "rhel" or system == "fedora":
        print("CentOS/RHEL/Fedora:")
        print("sudo yum install tesseract")
        print("sudo yum install tesseract-langpack-fra")
    else:
        print("Distribution non reconnue. Installez manuellement Tesseract.")

def install_tesseract_macos():
    """Instructions d'installation pour macOS"""
    print("\n=== Installation de Tesseract sur macOS ===")
    print("Avec Homebrew:")
    print("brew install tesseract")
    print("brew install tesseract-lang")
    
    # Vérifier si Homebrew est disponible
    try:
        result = subprocess.run(['brew', '--version'], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("\nOu utilisez ces commandes:")
            print("brew install tesseract")
            print("brew install tesseract-lang")
    except:
        pass

def install_python_dependencies():
    """Installe les dépendances Python"""
    print("\n=== Installation des dépendances Python ===")
    
    dependencies = [
        'pdfplumber',
        'pytesseract',
        'lxml',
        'Pillow'  # Nécessaire pour le traitement d'images
    ]
    
    for dep in dependencies:
        try:
            print(f"Installation de {dep}...")
            subprocess.run([sys.executable, '-m', 'pip', 'install', dep], 
                         check=True, capture_output=True)
            print(f"[OK] {dep} installé")
        except subprocess.CalledProcessError as e:
            print(f"[ERREUR] Erreur lors de l'installation de {dep}: {e}")
            return False
    
    return True

def test_ocr_simple():
    """Test simple de l'OCR"""
    print("\n=== Test simple de l'OCR ===")
    
    try:
        import pytesseract
        from PIL import Image, ImageDraw, ImageFont
        
        # Créer une image de test simple
        img = Image.new('RGB', (400, 100), color='white')
        draw = ImageDraw.Draw(img)
        
        # Essayer d'utiliser une police système
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 20)
            except:
                font = ImageFont.load_default()
        
        draw.text((10, 10), "Test OCR - Test de reconnaissance", fill='black', font=font)
        
        # Sauvegarder temporairement
        test_image_path = "test_ocr.png"
        img.save(test_image_path)
        
        # Tester l'OCR
        ocr_result = pytesseract.image_to_string(img, lang='fra')
        
        # Nettoyer
        os.remove(test_image_path)
        
        if ocr_result.strip():
            print("[OK] Test OCR réussi")
            print(f"Texte détecté: '{ocr_result.strip()}'")
            return True
        else:
            print("[ERREUR] Test OCR échoué - aucun texte détecté")
            return False
            
    except Exception as e:
        print(f"[ERREUR] Erreur lors du test OCR: {e}")
        return False

def main():
    """Fonction principale"""
    print("=== Installation et vérification des dépendances OCR ===\n")
    
    # Vérifier le système d'exploitation
    system = platform.system()
    print(f"Système détecté: {system}")
    
    # Vérifier Tesseract
    tesseract_ok = check_tesseract()
    
    if not tesseract_ok:
        print("\nTesseract n'est pas installé. Instructions d'installation:")
        if system == "Windows":
            install_tesseract_windows()
        elif system == "Linux":
            install_tesseract_linux()
        elif system == "Darwin":  # macOS
            install_tesseract_macos()
        else:
            print("Système non supporté. Installez Tesseract manuellement.")
        
        print("\nAprès installation, relancez ce script.")
        return False
    
    # Vérifier les langues
    languages_ok = check_tesseract_languages()
    
    if not languages_ok:
        print("\nLe français n'est pas disponible pour Tesseract.")
        print("Installez le pack de langue français:")
        if system == "Windows":
            print("Téléchargez et installez tesseract-fra")
        elif system == "Linux":
            print("sudo apt install tesseract-ocr-fra")
        elif system == "Darwin":
            print("brew install tesseract-lang")
    
    # Installer les dépendances Python
    python_deps_ok = install_python_dependencies()
    
    if not python_deps_ok:
        print("[ERREUR] Erreur lors de l'installation des dépendances Python")
        return False
    
    # Test simple de l'OCR
    ocr_test_ok = test_ocr_simple()
    
    print("\n=== Résumé ===")
    print(f"Tesseract: {'OK' if tesseract_ok else 'ERREUR'}")
    print(f"Langues: {'OK' if languages_ok else 'ERREUR'}")
    print(f"Dépendances Python: {'OK' if python_deps_ok else 'ERREUR'}")
    print(f"Test OCR: {'OK' if ocr_test_ok else 'ERREUR'}")
    
    if tesseract_ok and languages_ok and python_deps_ok and ocr_test_ok:
        print("\n[OK] Toutes les dépendances OCR sont installées et fonctionnelles!")
        return True
    else:
        print("\n[ERREUR] Certaines dépendances nécessitent une attention.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 