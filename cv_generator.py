import mysql.connector
from datetime import datetime

# MySQL connection
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",  # change if needed
    database="cv_craft"
)
cursor = conn.cursor()

# You must have at least 20 users in utilisateurs table; else adjust user_ids accordingly
user_ids = list(range(10043, 10053)) + list(range(10063, 10073)) # using first 20 user ids

# Profiles fixed data for 20 CVs
profiles = [
    # 3 Java Experts
    {
        "label": "Java Expert",
        "skills": "Java, Spring, Hibernate",
        "description": "Experienced Java developer specialized in Spring and Hibernate frameworks.",
        "poste": "Java Developer",
        "company": "TechCorp",
        "location": "Paris",
        "education": {
            "diplome": "Master",
            "dates": "2015 - 2018",
            "universite": "Université Paris-Saclay",
            "specialite": "Informatique",
            "description": "Master's degree in Computer Science with specialization in software development."
        },
        "certificat": {
            "nom_certificat": "Oracle Certified Professional Java SE",
            "date_certificat": "2020-06-15",
            "organisme": "Oracle",
            "lieu": "Paris",
            "description": "Certification in advanced Java programming."
        },
        "langues": [("Français", "Bilingue"), ("Anglais", "Avancé")],
        "projet": {
            "nom_projet": "Enterprise Java App",
            "lien_projet": "https://github.com/javaexpert/enterprise-app",
            "description": "Developed scalable enterprise applications."
        }
    },
    # 2 Python Experts
    {
        "label": "Python Expert",
        "skills": "Python, Django, Flask",
        "description": "Skilled Python developer experienced with Django and Flask.",
        "poste": "Python Developer",
        "company": "DataSolutions",
        "location": "Lyon",
        "education": {
            "diplome": "Master",
            "dates": "2016 - 2019",
            "universite": "Université de Lyon",
            "specialite": "Informatique",
            "description": "Master's degree focused on software engineering and data science."
        },
        "certificat": {
            "nom_certificat": "Certified Python Developer",
            "date_certificat": "2021-03-20",
            "organisme": "Python Institute",
            "lieu": "Lyon",
            "description": "Professional Python development certification."
        },
        "langues": [("Français", "Bilingue"), ("Anglais", "Intermédiaire")],
        "projet": {
            "nom_projet": "Web API with Flask",
            "lien_projet": "https://github.com/pythonexpert/webapi",
            "description": "Created RESTful APIs with Flask."
        }
    },
    # 5 Frontend Developers
    {
        "label": "Frontend Developer",
        "skills": "HTML, CSS, JavaScript, React",
        "description": "Frontend developer specialized in React and modern web technologies.",
        "poste": "Frontend Developer",
        "company": "WebInnov",
        "location": "Marseille",
        "education": {
            "diplome": "Licence",
            "dates": "2017 - 2020",
            "universite": "Université Aix-Marseille",
            "specialite": "Informatique",
            "description": "Bachelor's degree in computer science."
        },
        "certificat": {
            "nom_certificat": "Front-End Web Developer",
            "date_certificat": "2022-01-10",
            "organisme": "FreeCodeCamp",
            "lieu": "Online",
            "description": "Certification in frontend web development."
        },
        "langues": [("Français", "Bilingue"), ("Anglais", "Avancé")],
        "projet": {
            "nom_projet": "React Portfolio",
            "lien_projet": "https://github.com/frontenddev/portfolio",
            "description": "Personal portfolio website built with React."
        }
    },
    # Repeat the above Frontend Developer data 5 times with minor variations
]

# Fill profiles list with exact numbers: 3 Java, 2 Python, 5 Frontend, plus 10 minimal blank CVs
# For simplicity, replicate the Frontend profile 5 times with index suffix
java_profiles = [profiles[0]] * 3
python_profiles = [profiles[1]] * 2
frontend_base = profiles[2]
frontend_profiles = []
for i in range(5):
    p = frontend_base.copy()
    p['label'] += f" #{i+1}"
    p['projet'] = {
        "nom_projet": f"React Portfolio #{i+1}",
        "lien_projet": f"https://github.com/frontenddev/portfolio{i+1}",
        "description": "Personal portfolio website built with React."
    }
    frontend_profiles.append(p)

# Minimal empty CVs
minimal_profile = {
    "label": "Developer",
    "skills": "",
    "description": "Developer with basic skills.",
    "poste": "Developer",
    "company": "Company Inc",
    "location": "City",
    "education": {
        "diplome": "Licence",
        "dates": "2015 - 2018",
        "universite": "Some University",
        "specialite": "Informatique",
        "description": "Basic university degree."
    },
    "certificat": {
        "nom_certificat": "None",
        "date_certificat": "2018-01-01",
        "organisme": "None",
        "lieu": "City",
        "description": "No certifications."
    },
    "langues": [("Français", "Intermédiaire")],
    "projet": {
        "nom_projet": "None",
        "lien_projet": "",
        "description": "No projects."
    }
}
minimal_profiles = [minimal_profile] * 10

all_profiles = java_profiles + python_profiles + frontend_profiles + minimal_profiles

for i, profile in enumerate(all_profiles):
    user_id = user_ids[i]
    cv_name = f"CV_{i+1}_{profile['label'].replace(' ', '_')}"
    contenu_xml = f"<cv><profile>{profile['label']}</profile><skills>{profile['skills']}</skills></cv>"
    lien_pdf = f"cv_{i+1}.pdf"
    template_xslt = "<template>basic</template>"
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Insert CV
    cursor.execute("""
        INSERT INTO cvs (id_utilisateur, contenu_xml, lien_pdf, cv_name, template_xslt, est_publie, date_creation, date_modification)
        VALUES (%s, %s, %s, %s, %s, 1, %s, %s)
    """, (user_id, contenu_xml, lien_pdf, cv_name, template_xslt, now, now))
    cv_id = cursor.lastrowid

    # Informations personnelles (static for demo)
    cursor.execute("""
        INSERT INTO informations_personnelles (id_cv, nom, prenom, localisation, email, telephone, site_web, linkedin, github, chemin_photo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, '/images/photo.jpg')
    """, (
        cv_id, "Nom"+str(i+1), "Prenom"+str(i+1), profile['location'], f"user{i+1}@example.com",
        "0102030405", f"http://user{i+1}.website.com", f"http://linkedin.com/in/user{i+1}",
        f"https://github.com/user{i+1}"
    ))

    # Profil
    cursor.execute("INSERT INTO profils (id_cv, description) VALUES (%s, %s)", (cv_id, profile['description']))

    # Competences
    cursor.execute("INSERT INTO competences (id_cv, categorie, competences) VALUES (%s, %s, %s)", 
                   (cv_id, "Programmation", profile['skills']))

    # Certifications
    c = profile['certificat']
    cursor.execute("""
        INSERT INTO certificats (id_cv, nom_certificat, date_certificat, organisme, lieu, description)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (cv_id, c['nom_certificat'], c['date_certificat'], c['organisme'], c['lieu'], c['description']))

    # Experiences
    cursor.execute("""
        INSERT INTO experiences (id_cv, lieu, dates, entreprise, poste, description)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        cv_id, profile['location'], "2019 - 2021", profile['company'], profile['poste'],
        f"Worked as {profile['poste']} at {profile['company']}."
    ))

    # Formations
    e = profile['education']
    cursor.execute("""
        INSERT INTO formations (id_cv, diplome, dates, universite, specialite, description)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (cv_id, e['diplome'], e['dates'], e['universite'], e['specialite'], e['description']))

    # Langues
    for lang, niveau in profile['langues']:
        cursor.execute("INSERT INTO langues (id_cv, nom_langue, niveau) VALUES (%s, %s, %s)", (cv_id, lang, niveau))

    # Projets
    p = profile['projet']
    cursor.execute("""
        INSERT INTO projets (id_cv, nom_projet, lien_projet, description)
        VALUES (%s, %s, %s, %s)
    """, (cv_id, p['nom_projet'], p['lien_projet'], p['description']))

conn.commit()
cursor.close()
conn.close()

print("✅ 20 CVs with fixed data inserted successfully.")
