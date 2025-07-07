-- Create database (optional)
CREATE DATABASE cv_craft;
USE cv_craft;

-- Table: filieres
CREATE TABLE filieres (
    id INT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT
);

-- Table: filiere_associee
CREATE TABLE filiere_associee (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filiere_id INT NOT NULL,
    filiere_associee_id INT NOT NULL,
    FOREIGN KEY (filiere_id) REFERENCES filieres(id),
    FOREIGN KEY (filiere_associee_id) REFERENCES filieres(id),
    UNIQUE(filiere_id, filiere_associee_id)
);

-- Table: utilisateurs
CREATE TABLE utilisateurs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    id_filiere INT,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    numero_telephone VARCHAR(20),
    date_inscription DATE NOT NULL,
    FOREIGN KEY (id_filiere) REFERENCES filieres(id)
);

-- Table: cvs
CREATE TABLE cvs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_utilisateur INT NOT NULL,
    contenu_xml TEXT,
    lien_pdf VARCHAR(255),
    template_xslt TEXT,
    est_publie BOOLEAN DEFAULT FALSE,
    date_creation DATE,
    date_modification DATE,
    id_filiere INT,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id),
    FOREIGN KEY (id_filiere) REFERENCES filieres(id)
);

-- Table: informations_personnelles
CREATE TABLE informations_personnelles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cv INT NOT NULL,
    nom VARCHAR(255),
    prenom VARCHAR(255),
    localisation VARCHAR(255),
    email VARCHAR(255),
    telephone VARCHAR(20),
    site_web VARCHAR(255),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    chemin_photo VARCHAR(255),
    FOREIGN KEY (id_cv) REFERENCES cvs(id)
);

-- Table: profils
CREATE TABLE profils (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cv INT NOT NULL,
    description TEXT,
    FOREIGN KEY (id_cv) REFERENCES cvs(id)
);

-- Table: formations
CREATE TABLE formations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cv INT NOT NULL,
    diplome VARCHAR(255),
    dates VARCHAR(255),
    universite VARCHAR(255),
    specialite VARCHAR(255),
    description TEXT,
    FOREIGN KEY (id_cv) REFERENCES cvs(id)
);

-- Table: experiences
CREATE TABLE experiences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cv INT NOT NULL,
    lieu VARCHAR(255),
    dates VARCHAR(255),
    entreprise VARCHAR(255),
    poste VARCHAR(255),
    description TEXT,
    FOREIGN KEY (id_cv) REFERENCES cvs(id)
);

-- Table: projets
CREATE TABLE projets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cv INT NOT NULL,
    nom_projet VARCHAR(255),
    lien_projet VARCHAR(255),
    description TEXT,
    FOREIGN KEY (id_cv) REFERENCES cvs(id)
);

-- Table: certificats
CREATE TABLE certificats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cv INT NOT NULL,
    nom_certificat VARCHAR(255),
    date_certificat VARCHAR(255),
    organisme VARCHAR(255),
    lieu VARCHAR(255),
    description TEXT,
    FOREIGN KEY (id_cv) REFERENCES cvs(id)
);

-- Table: competences
CREATE TABLE competences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cv INT NOT NULL,
    categorie VARCHAR(255),
    competences TEXT,
    FOREIGN KEY (id_cv) REFERENCES cvs(id)
);

-- Table: langues
CREATE TABLE langues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cv INT NOT NULL,
    nom_langue VARCHAR(255),
    niveau VARCHAR(100),
    FOREIGN KEY (id_cv) REFERENCES cvs(id)
);

-- Optional: Add indexes for better performance
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_cvs_utilisateur ON cvs(id_utilisateur);
CREATE INDEX idx_cvs_filiere ON cvs(id_filiere);
CREATE INDEX idx_informations_personnelles_cv ON informations_personnelles(id_cv);
CREATE INDEX idx_profils_cv ON profils(id_cv);
CREATE INDEX idx_formations_cv ON formations(id_cv);
CREATE INDEX idx_experiences_cv ON experiences(id_cv);
CREATE INDEX idx_projets_cv ON projets(id_cv);
CREATE INDEX idx_certificats_cv ON certificats(id_cv);
CREATE INDEX idx_competences_cv ON competences(id_cv);
CREATE INDEX idx_langues_cv ON langues(id_cv);