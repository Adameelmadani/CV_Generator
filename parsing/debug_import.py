#!/usr/bin/env python3
"""
Script de debug pour tester l'import de PDF
"""

import os
import sys
import tempfile
import subprocess

def test_parse_cv_directly():
    """Test direct du script parse_cv.py"""
    print("=== Test direct du script parse_cv.py ===")
    
    # Créer un fichier PDF de test simple
    test_pdf = create_simple_test_pdf()
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
        
        print(f"Commande: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        print(f"Code de retour: {result.returncode}")
        print("Sortie standard:")
        print(result.stdout)
        if result.stderr:
            print("Erreurs:")
            print(result.stderr)
        
        if result.returncode == 0 and os.path.exists(output_xml):
            print("[OK] Parsing réussi!")
            
            # Lire le contenu du XML généré
            with open(output_xml, 'r', encoding='utf-8') as f:
                xml_content = f.read()
                print(f"Taille du XML généré: {len(xml_content)} caractères")
                print("Premiers 500 caractères du XML:")
                print(xml_content[:500])
            
            return True
        else:
            print("[ERREUR] Parsing échoué")
            return False
            
    finally:
        # Nettoyage
        if os.path.exists(test_pdf):
            os.unlink(test_pdf)
        if os.path.exists(output_xml):
            os.unlink(output_xml)

def create_simple_test_pdf():
    """Crée un PDF de test simple sans dépendances externes"""
    try:
        # Essayer d'utiliser reportlab si disponible
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
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
        print("[ERREUR] Module reportlab non disponible")
        return None
    except Exception as e:
        print(f"[ERREUR] Erreur lors de la création du PDF: {e}")
        return None

def test_php_integration():
    """Test de l'intégration PHP"""
    print("\n=== Test de l'intégration PHP ===")
    
    # Simuler l'appel PHP
    script_path = os.path.join(os.path.dirname(__file__), 'parse_cv.py')
    python_cmd = 'python'
    
    print(f"Script Python: {script_path}")
    print(f"Commande Python: {python_cmd}")
    print(f"Script existe: {os.path.exists(script_path)}")
    
    # Test de la commande Python
    try:
        result = subprocess.run([python_cmd, '--version'], 
                              capture_output=True, text=True, timeout=10)
        print(f"Python version: {result.stdout.strip()}")
    except Exception as e:
        print(f"Erreur Python: {e}")

def test_file_permissions():
    """Test des permissions de fichiers"""
    print("\n=== Test des permissions ===")
    
    script_path = os.path.join(os.path.dirname(__file__), 'parse_cv.py')
    xml_path = os.path.join(os.path.dirname(__file__), 'modele_cv.xml')
    
    print(f"Script lisible: {os.access(script_path, os.R_OK)}")
    print(f"Script exécutable: {os.access(script_path, os.X_OK)}")
    print(f"XML lisible: {os.access(xml_path, os.R_OK)}")
    
    # Test d'écriture dans le répertoire temporaire
    try:
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=True) as tmp_file:
            tmp_file.write(b"test")
            print(f"Écriture temporaire: OK")
    except Exception as e:
        print(f"Erreur écriture temporaire: {e}")

def main():
    """Fonction principale"""
    print("=== Debug de l'import PDF ===\n")
    
    # Tests
    test_file_permissions()
    test_php_integration()
    test_parse_cv_directly()
    
    print("\n=== Résumé du debug ===")
    print("Si le parsing direct fonctionne mais pas l'import web,")
    print("le problème vient de l'intégration PHP ou des permissions.")

if __name__ == "__main__":
    main() 