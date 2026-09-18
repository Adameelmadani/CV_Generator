import sys
import os
import tempfile

# Test with a very simple dummy PDF to see if the script works at all
def create_test_pdf():
    """Create a simple test PDF with some text"""
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        # Create a temporary PDF file
        temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_pdf_path = temp_pdf.name
        temp_pdf.close()
        
        # Create a simple PDF with text
        c = canvas.Canvas(temp_pdf_path, pagesize=letter)
        c.drawString(100, 750, "John Doe")
        c.drawString(100, 720, "Software Engineer")
        c.drawString(100, 690, "Email: john.doe@example.com")
        c.drawString(100, 660, "Phone: +33 1 23 45 67 89")
        c.drawString(100, 630, "")
        c.drawString(100, 600, "EXPERIENCE")
        c.drawString(100, 570, "2020-2023: Developer at ABC Company")
        c.drawString(100, 540, "- Developed web applications")
        c.drawString(100, 510, "- Worked with Python and JavaScript")
        c.drawString(100, 480, "")
        c.drawString(100, 450, "FORMATION")
        c.drawString(100, 420, "2018-2020: Master in Computer Science")
        c.drawString(100, 390, "University of Technology")
        c.save()
        
        return temp_pdf_path
    except ImportError:
        print("reportlab not available - cannot create test PDF")
        return None

def test_parse_cv():
    """Test the parse_cv.py script with a simple PDF"""
    
    # Create test PDF
    test_pdf_path = create_test_pdf()
    if not test_pdf_path:
        print("Cannot create test PDF - skipping test")
        return
    
    try:
        # Create temporary output XML
        temp_xml = tempfile.NamedTemporaryFile(delete=False, suffix='.xml')
        temp_xml_path = temp_xml.name
        temp_xml.close()
        
        print(f"Testing with PDF: {test_pdf_path}")
        print(f"Output XML: {temp_xml_path}")
        
        # Import the parse_cv module
        import parse_cv
        
        # Test the main parsing function
        print("Testing PDF text extraction...")
        text = parse_cv.extract_text_from_pdf(test_pdf_path)
        print(f"Extracted text length: {len(text)}")
        print(f"Extracted text preview: {text[:200]}...")
        
        if text.strip():
            print("Text extraction successful")
            
            # Test info extraction
            print("Testing info extraction...")
            info = parse_cv.extract_info(text)
            print(f"Extracted info: {info}")
            
            # Test XML generation
            print("Testing XML generation...")
            script_dir = os.path.dirname(os.path.abspath(__file__))
            xml_model_path = os.path.join(script_dir, 'modele_cv.xml')
            parse_cv.fill_xml(info, xml_model_path, temp_xml_path)
            
            # Check if XML was created
            if os.path.exists(temp_xml_path) and os.path.getsize(temp_xml_path) > 0:
                print("XML generation successful")
                with open(temp_xml_path, 'r', encoding='utf-8') as f:
                    xml_content = f.read()
                print(f"Generated XML preview:\n{xml_content[:500]}...")
            else:
                print("XML generation failed")
        else:
            print("Text extraction failed")
            
    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup
        if test_pdf_path and os.path.exists(test_pdf_path):
            os.unlink(test_pdf_path)
        if 'temp_xml_path' in locals() and os.path.exists(temp_xml_path):
            os.unlink(temp_xml_path)

if __name__ == "__main__":
    test_parse_cv()
