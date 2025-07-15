import sys
import os

print("=== Python Environment Test ===")
print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")

# Test required modules
modules_to_test = [
    'pdfplumber',
    'pytesseract', 
    'lxml',
    'PIL'
]

print("\n=== Module Test ===")
for module in modules_to_test:
    try:
        if module == 'lxml':
            from lxml import etree
            print(f"✅ {module} - OK")
        elif module == 'pdfplumber':
            import pdfplumber
            print(f"✅ {module} - OK")
        elif module == 'pytesseract':
            import pytesseract
            # Test if tesseract is available
            try:
                version = pytesseract.get_tesseract_version()
                print(f"✅ {module} - OK (Tesseract version: {version})")
            except Exception as e:
                print(f"⚠️ {module} module found but Tesseract not configured: {e}")
        elif module == 'PIL':
            from PIL import Image
            print(f"✅ {module} - OK")
        else:
            __import__(module)
            print(f"✅ {module} - OK")
    except ImportError as e:
        print(f"❌ {module} - Missing: {e}")
    except Exception as e:
        print(f"⚠️ {module} - Error: {e}")

print("\n=== File System Test ===")
script_dir = os.path.dirname(os.path.abspath(__file__))
xml_model_path = os.path.join(script_dir, 'modele_cv.xml')

print(f"Script directory: {script_dir}")
print(f"XML model path: {xml_model_path}")
print(f"XML model exists: {os.path.exists(xml_model_path)}")

# Test write permissions
temp_test_file = os.path.join(script_dir, 'temp_test.txt')
try:
    with open(temp_test_file, 'w') as f:
        f.write("test")
    os.remove(temp_test_file)
    print("✅ Write permissions - OK")
except Exception as e:
    print(f"❌ Write permissions - Error: {e}")
