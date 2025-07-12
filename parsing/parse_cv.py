import sys
import re
import os
import pdfplumber
import pytesseract
from lxml import etree
import sys
print("PYTHON USED:", sys.executable)


def restore_spaces(text):
    text = re.sub(r'([a-zéèàùâêîôûç])([A-ZÉÈÀÙÂÊÎÔÛÇ])', r'\1 \2', text)
    text = re.sub(r'([a-zéèàùâêîôûç])\\.([A-ZÉÈÀÙÂÊÎÔÛÇ])', r'\1. \2', text)
    text = re.sub(r"-\n", "", text)  # Correction des mots coupés
    text = re.sub(r'd039;', "'", text)  # Apostrophe mal encodée
    text = re.sub(r'[\x00-\x1F]+', ' ', text)  # Nettoyage caractères invisibles
    return text


def extract_text_from_pdf(pdf_path):
    text = ""
    print(f"--- Extraction du fichier : {pdf_path} ---")
    try:
        extract_options = {"x_tolerance": 3, "layout": True}
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text(**extract_options)
                if page_text and page_text.strip():
                    print(f"Page {i+1}: PDF natif détecté (texte propre).")
                    text += page_text + "\n"
                else:
                    print(f"Page {i+1}: Pas de texte natif, tentative d'OCR...")
                    img = page.to_image(resolution=200).original
                    ocr_text = pytesseract.image_to_string(img, lang="fra")
                    text += ocr_text + "\n"
        print("--- Extraction terminée ---")
    except Exception as e:
        print(f"ERREUR Critique lors de l'ouverture ou de la lecture du PDF: {e}")
    return re.sub(r"d039;", "'", text)

def parse_cv_into_sections(text):
    sections = {}
    known_section_titles = [
        "Profil", "Profil Professionnel", "À propos", "Présentation", "Résumé",
        "Expériences", "Expérience", "Expériences Professionnelles", "Parcours professionnel",
        "Formation", "Éducation", "Diplômes", "Compétences", "Projets",
        "Certificats", "Certifications", "Langues", "Centres d'intérêt"
    ]
    pattern = re.compile(r"^\s*(" + "|".join(known_section_titles) + r")\b", re.IGNORECASE | re.MULTILINE)
    matches = list(pattern.finditer(text))
    title_map = {
        
        'experiences': ['expériences', 'expérience', 'expériences professionnelles', 'parcours professionnel'],
        'education': ['formation', 'éducation', 'diplômes'],
        'profil': ['profil', 'profil professionnel', 'à propos', 'présentation', 'résumé'],
        'skills': ['compétences'], 'projects': ['projets'], 'certificates': ['certificats', 'certifications'],
        'languages': ['langues'], 'interests': ['centres d\'intérêt']
    }
    for i, match in enumerate(matches):
        found_title = match.group(1).lower()
        section_key = next((key for key, titles in title_map.items() if found_title in titles), None)
        if not section_key:
            continue
        start_pos = match.end()
        end_pos = matches[i+1].start() if i + 1 < len(matches) else len(text)
        sections[section_key] = text[start_pos:end_pos].strip()
    print(f"Sections détectées : {list(sections.keys())}")
    return sections

def extract_info(text):
    info = {}
    print("\n--- Analyse des informations ---")
    sections = parse_cv_into_sections(text)

    # Informations personnelles
    info['personalInfo'] = {}
    lines = text.splitlines()
    for line in lines[:10]:
        possible_name = re.match(r"^\s*([A-ZÀ-ÿ][a-zà-ÿA-ZÀ-ÿ'\-]+)\s+([A-ZÀ-ÿ][a-zà-ÿA-ZÀ-ÿ'\-]+)", line)
        if possible_name:
            info['personalInfo']['firstname'] = possible_name.group(1).strip()
            info['personalInfo']['lastname'] = possible_name.group(2).strip()
            break
    info['personalInfo']['email'] = next((m.group(0) for m in [re.search(r"[\w\.\-]+@[\w\.\-]+", text)] if m), None)
    phone_regex = re.compile(r"(\+?\d{1,3}[\s\-\.]?\d{1,2}[\s\-\.]?\d{2}[\s\-\.]?\d{2}[\s\-\.]?\d{2})|" r"(\b0[1-9](?:[\s\.\-]?\d{2}){4}\b)")
    phone_match = phone_regex.search(text)
    info['personalInfo']['phone'] = phone_match.group(0) if phone_match else None
    location = None
    location_patterns = [
        r"\d{5}\s*,?\s*[A-Z][a-zA-ZÀ-ÿ\-]+",           # 50070, Meknès ou 75001 Paris
        r"Marjane\s*\d*\s*,?\s*\d{5,}\s*,?\s*[A-Z][a-zA-ZÀ-ÿ\-]+", # Marjane 1 , 50070, Meknès
        r"[A-Z][a-zA-ZÀ-ÿ\s\-]+,\s*[A-Z][a-zA-ZÀ-ÿ\s\-]+", # Paris, France
        r"\d{1,3}\s+\w+.*",                               # 12 rue de Paris, etc.
        r"[A-Z][a-zA-ZÀ-ÿ\s\-]+",                         # Meknès ou Paris
    ]
    for pat in location_patterns:
        m = re.search(pat, text)
        if m:
            location = m.group(0).strip(" ,.-")
            break
    info['personalInfo']['location'] = location
    info['personalInfo']['linkedin'] = next((m.group(0) for m in [re.search(r"https?://(?:www\.)?linkedin\.com/in/[\w\-]+/?", text)] if m), None)
    info['personalInfo']['github'] = next((m.group(0) for m in [re.search(r"https://github\.com/[\w\-]+/?", text)] if m), None)

    # Profil
    if 'profil' in sections:
        profil_lines = [l.strip() for l in sections['profil'].split('\n') if l.strip()]
        if profil_lines and profil_lines[0].lower().startswith(('professionnel', 'profil professionnel')):
            profil_lines = profil_lines[1:]
        # Correction ici :
        description = " ".join(profil_lines)
        description = restore_spaces(description)
        info['profil'] = {'description': description}

    # Expériences
    info['experiences'] = []
    if 'experiences' in sections:
        exp_blocks = re.split(r'\n\s*\n', sections['experiences'])
        for block in exp_blocks:
            lines = [line.strip('•– ').strip() for line in block.strip().split('\n') if line.strip()]
            # Ignore les titres génériques
            while lines and lines[0].lower() in [
                "professionnelles", "expériences professionnelles", "expérience professionnelle", "expérience", "expériences"
            ]:
                lines = lines[1:]
            if not lines or len(lines[0]) < 3:
                continue
            # Extraction du poste et de la période sur la première ligne
            m = re.match(r"(.+?)\s{2,}(.+\d{4})", lines[0])
            if m:
                position = m.group(1).strip()
                period = m.group(2).strip()
                # Recherche du nom de l'entreprise sur la ligne suivante
                company = ""
                location = ""
                description_lines = []
                for l in lines[1:]:
                    # Si la ligne ressemble à un nom d'entreprise (commence par une majuscule et pas trop longue)
                    if not company and re.match(r"^[A-ZÉÈÀÂÎÔÛÇ][\w\s\-’']{2,}$", l) and len(l) < 50:
                        company = l.strip()
                    else:
                        description_lines.append(l)
                description = "\n".join(description_lines).strip()
            else:
                # fallback si le format ne correspond pas
                position = lines[0]
                period = ""
                company = lines[1] if len(lines) > 1 else ""
                description = "\n".join(lines[2:]) if len(lines) > 2 else ""
                location = ""
            info['experiences'].append({
                'position': position,
                'company': company,
                'period': period,
                'location': location,
                'description': description
            })

    # Éducation
    info['education'] = []
    if 'education' in sections:
        degrees = []
        lines = [l.strip('•– ').strip() for l in sections['education'].split('\n') if l.strip()]
        buffer = []
        for line in lines:
            # Nouveau diplôme si la ligne contient une période (ex: 2022 - En cours, 2021 - 2022)
            if re.search(r"\d{4}\s*-\s*(En cours|\d{4})", line):
                if buffer:
                    degrees.append(buffer)
                buffer = [line]
            else:
                buffer.append(line)
        if buffer:
            degrees.append(buffer)

        result = []
        for degree_lines in degrees:
            # Cherche la période
            period_match = re.search(r"(\d{4}\s*-\s*(En cours|\d{4}))", " ".join(degree_lines))
            period = period_match.group(1) if period_match else ""
            # Titre = première ligne sans la période
            title = re.sub(r"\d{4}\s*-\s*(En cours|\d{4})", "", degree_lines[0]).strip(" ,.-")
            # Institution = deuxième ligne si existe
            institution = degree_lines[1] if len(degree_lines) > 1 else ""
            # Description = reste
            description = " ".join(degree_lines[2:]) if len(degree_lines) > 2 else ""
            result.append({
                "title": title,
                "institution": institution,
                "period": period,
                "description": description
            })
        info['education'] = result


    # Compétences
    info['skills'] = []
    if 'skills' in sections:
        for line in sections['skills'].split('\n'):
            if ':' in line:
                category, items_str = line.split(':', 1)
                info['skills'].append({'category': category.strip(), 'items': items_str.strip()})

    # Langues
    info['languages'] = []
    if 'languages' in sections:
        lines = sections['languages'].split('\n')
        for line in lines:
            matches_colon = re.findall(r"([\wÀ-ÿ\- ]+)\s*:\s*(Niveau\s+[ABC][1-2]|Langue\s+maternelle)", line, re.IGNORECASE)
            for name, level in matches_colon:
                info['languages'].append({'name': name.strip(), 'level': level.strip()})
            matches_paren = re.findall(r"([\wÀ-ÿ\- ]+)\s*\(([\wÀ-ÿ \-]+)\)", line)
            for name, level in matches_paren:
                info['languages'].append({'name': name.strip(), 'level': level.strip()})

    # Projets
    info['projects'] = []
    if 'projects' in sections:
        project_blocks = re.split(r'\n\s*\n', sections['projects'])
        for block in project_blocks:
            if len(block.strip()) < 10: continue
            lines = [line.strip() for line in block.strip().split('\n') if line.strip()]
            proj = {
                'name': lines[0] if lines else None,
                'link': "",
                'description': ' '.join(lines[1:]) if len(lines) > 1 else ""
            }
            info['projects'].append(proj)

    # Certificats
    info['certificates'] = []
    if 'certificates' in sections:
        lines = [line.strip('•– ').strip() for line in sections['certificates'].split('\n') if line.strip()]
        current_cert = {}
        for line in lines:
            # Détecte le début d'un nouveau certificat par la présence d'un mot-clé ou d'une année
            if (re.search(r'(certificat|certified|developer|engineer|aws|microsoft|google|cisco|oracle)', line, re.IGNORECASE)
                or re.search(r'\d{4}', line)) and not current_cert.get('name'):
                if current_cert:
                    info['certificates'].append(current_cert)
                    current_cert = {}
                # Découpe par virgule ou double espace
                parts = re.split(r',\s*|\s{2,}', line)
                current_cert['name'] = parts[0].strip()
                if len(parts) > 1:
                    current_cert['issuer'] = parts[1].strip()
                if len(parts) > 2:
                    # Si la 3e partie ressemble à une date
                    if re.search(r'\d{4}', parts[2]):
                        current_cert['date'] = parts[2].strip()
                    else:
                        current_cert['description'] = parts[2].strip()
            elif re.search(r'lieu|location', line, re.IGNORECASE):
                loc = line.split(':')[-1].strip()
                current_cert['location'] = loc
            elif len(line) > 10:
                # Ajoute à la description si ce n'est pas déjà pris
                if 'description' in current_cert:
                    current_cert['description'] += " " + line
                else:
                    current_cert['description'] = line
        if current_cert:
            info['certificates'].append(current_cert)

    print("--- Analyse terminée ---")
    return info

def fill_xml(info, xml_model_path, output_path):
    print(f"\n--- Génération du fichier XML : {output_path} ---")
    try:
        parser = etree.XMLParser(remove_blank_text=True)
        tree = etree.parse(xml_model_path, parser)
        root = tree.getroot()

        def set_node_text(parent, tag, text):
            if text:
                node = parent.find(tag)
                if node is None:
                    node = etree.SubElement(parent, tag)
                node.text = text  # Pas de CDATA

        p_info_node = root.find('personalInfo')
        if p_info_node is not None:
            for key, value in info.get('personalInfo', {}).items():
                set_node_text(p_info_node, key, value)

        profil_node = root.find('profil')
        if profil_node is not None:
            set_node_text(profil_node, 'description', info.get('profil', {}).get('description'))

        exps_node = root.find('experiences')
        if exps_node is not None:
            for data in info.get('experiences', []):
                el = etree.SubElement(exps_node, 'experience')
                for k, v in data.items():
                    set_node_text(el, k, v)

        edu_node = root.find('education')
        if edu_node is not None:
            for data in info.get('education', []):
                el = etree.SubElement(edu_node, 'degree')
                for k, v in data.items():
                    set_node_text(el, k, v)

        skills_node = root.find('skills')
        if skills_node is not None:
            for data in info.get('skills', []):
                el = etree.SubElement(skills_node, 'skill')
                for k, v in data.items():
                    set_node_text(el, k, v)

        lang_node = root.find('languages')
        if lang_node is not None:
            for data in info.get('languages', []):
                el = etree.SubElement(lang_node, 'language')
                for k, v in data.items():
                    set_node_text(el, k, v)

        proj_node = root.find('projects')
        if proj_node is not None:
            for data in info.get('projects', []):
                el = etree.SubElement(proj_node, 'project')
                set_node_text(el, 'name', data.get('name'))
                set_node_text(el, 'link', data.get('link'))
                set_node_text(el, 'description', data.get('description'))

        cert_node = root.find('certificates')
        if cert_node is not None:
            for data in info.get('certificates', []):
                el = etree.SubElement(cert_node, 'certificate')
                for k, v in data.items():
                    set_node_text(el, k, v)

        tree.write(output_path, pretty_print=True, xml_declaration=True, encoding='utf-8')
        print("--- Génération XML réussie ---")
    except Exception as e:
        print(f"ERREUR Critique lors de la génération du fichier XML: {e}")


def main():
    if len(sys.argv) != 3:
        print("Usage: python parse_cv.py <chemin_vers_le_CV.pdf> <chemin_vers_resultat.xml>")
        sys.exit(1)

    pdf_path, output_path = sys.argv[1], sys.argv[2]
    script_dir = os.path.dirname(os.path.abspath(__file__))
    xml_model_path = os.path.join(script_dir, 'modele_cv.xml')

    if not os.path.exists(pdf_path):
        print(f"Erreur: Le fichier PDF '{pdf_path}' n'existe pas.")
        sys.exit(1)
    if not os.path.exists(xml_model_path):
        print(f"Erreur: Le fichier modèle XML '{xml_model_path}' n'existe pas.")
        sys.exit(1)

    text = extract_text_from_pdf(pdf_path)
    if not text.strip():
        print("Le PDF semble vide ou n'a pas pu être lu. Arrêt du script.")
        sys.exit(1)

    info = extract_info(text)
    fill_xml(info, xml_model_path, output_path)

if __name__ == "__main__":
    main()