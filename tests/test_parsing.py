#!/usr/bin/env python3
"""
Script de test pour vérifier le parsing de CV
"""

import os
import sys
import subprocess
import tempfile

def test_python_dependencies():
    """Teste si toutes les dépendances Python sont installées"""
    print("=== Test des dépendances Python ===")
    
    required_modules = [
        'pdfplumber',
        'pytesseract', 
        'lxml'
    ]
    
    missing_modules = []
    for module in required_modules:
        try:
            __import__(module)
            print(f"[OK] {module} - OK")
        except ImportError:
            print(f"[ERREUR] {module} - MANQUANT")
            missing_modules.append(module)
    
    if missing_modules:
        print(f"\nModules manquants: {', '.join(missing_modules)}")
        print("Installez-les avec: pip install " + " ".join(missing_modules))
        return False
    
    print("Toutes les dépendances sont installées [OK]")
    return True

def test_script_path():
    """Teste si le script parse_cv.py existe et est accessible"""
    print("\n=== Test du script parse_cv.py ===")
    
    script_path = os.path.join(os.path.dirname(__file__), 'parse_cv.py')
    
    if not os.path.exists(script_path):
        print(f"[ERREUR] Script non trouvé: {script_path}")
        return False
    
    print(f"[OK] Script trouvé: {script_path}")
    
    # Teste si le script peut être exécuté
    try:
        result = subprocess.run([sys.executable, script_path], 
                              capture_output=True, text=True, timeout=5)
        if "Usage:" in result.stdout:
            print("[OK] Script exécutable correctement")
            return True
        else:
            print("[ERREUR] Script ne s'exécute pas correctement")
            return False
    except subprocess.TimeoutExpired:
        print("[ERREUR] Script prend trop de temps à s'exécuter")
        return False
    except Exception as e:
        print(f"[ERREUR] Erreur lors de l'exécution: {e}")
        return False

def test_xml_model():
    """Teste si le fichier modèle XML existe"""
    print("\n=== Test du modèle XML ===")
    
    xml_path = os.path.join(os.path.dirname(__file__), 'modele_cv.xml')
    
    if not os.path.exists(xml_path):
        print(f"[ERREUR] Modèle XML non trouvé: {xml_path}")
        return False
    
    print(f"[OK] Modèle XML trouvé: {xml_path}")
    
    # Teste si le XML est valide
    try:
        from lxml import etree
        tree = etree.parse(xml_path)
        print("[OK] Modèle XML valide")
        return True
    except Exception as e:
        print(f"[ERREUR] Modèle XML invalide: {e}")
        return False

def create_test_pdf():
    """Crée un PDF de test simple"""
    print("\n=== Création d'un PDF de test ===")
    
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        # Créer un PDF temporaire
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
            pdf_path = tmp_file.name
        
        # Générer un PDF simple avec du texte
        c = canvas.Canvas(pdf_path, pagesize=letter)
        c.drawString(100, 750, "Jean Dupont")
        c.drawString(100, 730, "Développeur Web")
        c.drawString(100, 710, "jean.dupont@email.com")
        c.drawString(100, 690, "0123456789")
        c.drawString(100, 670, "Paris, France")
        c.drawString(100, 650, "Expériences")
        c.drawString(100, 630, "Développeur Web - Entreprise ABC - 2020-2023")
        c.drawString(100, 610, "Formation")
        c.drawString(100, 590, "Master Informatique - Université XYZ - 2018-2020")
        c.drawString(100, 570, "Compétences")
        c.drawString(100, 550, "JavaScript, Python, PHP")
        c.save()
        
        print(f"[OK] PDF de test créé: {pdf_path}")
        return pdf_path
        
    except ImportError:
        print("[ERREUR] Module reportlab non disponible pour créer un PDF de test")
        return None
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la création du PDF: {e}")
        return None

def test_parsing():
    """Teste le parsing complet"""
    print("\n=== Test du parsing complet ===")
    
    # Créer un PDF de test
    test_pdf = create_test_pdf()
    if not test_pdf:
        print("Impossible de créer un PDF de test")
        return False
    
    try:
        # Créer un fichier XML de sortie temporaire
        with tempfile.NamedTemporaryFile(suffix='.xml', delete=False) as tmp_file:
            output_xml = tmp_file.name
        
        # Exécuter le script de parsing
        script_path = os.path.join(os.path.dirname(__file__), 'parse_cv.py')
        cmd = [sys.executable, script_path, test_pdf, output_xml]
        
        print(f"Exécution: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        print(f"Code de retour: {result.returncode}")
        print("Sortie standard:")
        print(result.stdout)
        if result.stderr:
            print("Erreurs:")
            print(result.stderr)
        
        if result.returncode == 0 and os.path.exists(output_xml):
            print("[OK] Parsing réussi!")
            
            # Vérifier le contenu du XML généré
            try:
                from lxml import etree
                tree = etree.parse(output_xml)
                root = tree.getroot()
                
                # Vérifier les éléments de base
                personal_info = root.find('personalInfo')
                if personal_info is not None:
                    firstname = personal_info.find('firstname')
                    if firstname is not None and firstname.text:
                        print(f"[OK] Prénom détecté: {firstname.text}")
                    else:
                        print("[ATTENTION] Prénom non détecté")
                
                print("[OK] XML généré est valide")
                return True
                
            except Exception as e:
                print(f"[ERREUR] Erreur lors de la validation du XML: {e}")
                return False
        else:
            print("[ERREUR] Parsing échoué")
            return False
            
    finally:
        # Nettoyage
        if os.path.exists(test_pdf):
            os.unlink(test_pdf)
        if os.path.exists(output_xml):
            os.unlink(output_xml)

def main():
    """Fonction principale de test"""
    print("=== Test du système de parsing de CV ===\n")
    
    tests = [
        ("Dépendances Python", test_python_dependencies),
        ("Script parse_cv.py", test_script_path),
        ("Modèle XML", test_xml_model),
        ("Parsing complet", test_parsing)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"[ERREUR] Erreur lors du test '{test_name}': {e}")
            results.append((test_name, False))
    
    print("\n=== Résumé des tests ===")
    all_passed = True
    for test_name, result in results:
        status = "OK PASS" if result else "ERREUR FAIL"
        print(f"{test_name}: {status}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n[OK] Tous les tests sont passés!")
    else:
        print("\n[ERREUR] Certains tests ont échoué. Vérifiez les erreurs ci-dessus.")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 