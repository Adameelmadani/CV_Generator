-- Create the database
CREATE DATABASE IF NOT EXISTS cv_craft CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cv_craft;

-- DemandesEntreprises
CREATE TABLE demandes_entreprises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    raison_sociale VARCHAR(255),
    forme_juridique VARCHAR(100),
    registre_commerce VARCHAR(100),
    ice VARCHAR(50),
    if_fiscal VARCHAR(50),
    secteur_activite VARCHAR(100),
    cnss VARCHAR(50),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(100),
    telephone VARCHAR(30),
    site_web VARCHAR(255),
    prenom_contact VARCHAR(100),
    nom_contact VARCHAR(100),
    poste_contact VARCHAR(100),
    telephone_contact VARCHAR(30),
    email_contact VARCHAR(150),
    taille_equipe INT,
    message_demande TEXT,
    etat ENUM('accepté', 'refusé', 'en_attente') DEFAULT 'en_attente',
    date_demande DATE,
    date_traitement DATE
);

-- Utilisateurs
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    telephone VARCHAR(30),
    date_inscription DATE,
    est_employe BOOLEAN DEFAULT FALSE
);

-- Auth (with polymorphic relationship using entity_type and entity_id)
CREATE TABLE auth (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    entity_type ENUM('utilisateur', 'demande_entreprise') NOT NULL,
    entity_id INT NOT NULL,
    date_creation DATE,
    derniere_connexion DATE,
    token VARCHAR(255)
    -- Note: Referential integrity (foreign keys) must be handled in application logic
);

-- Entreprises
CREATE TABLE entreprises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    demande_id INT,
    code_invitation VARCHAR(100),
    date_creation DATE,
    FOREIGN KEY (demande_id) REFERENCES demandes_entreprises(id) ON DELETE SET NULL
);

-- MembresEntreprise
CREATE TABLE membres_entreprise (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    entreprise_id INT,
    role ENUM('RH', 'Chef') NOT NULL,
    date_adhesion DATE,
    est_membre_equipe BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
);

-- CVs
CREATE TABLE cvs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    contenue_xml TEXT,
    est_publie BOOLEAN DEFAULT FALSE,
    date_creation DATE,
    date_modification DATE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- EntrepriseNonEnregistre
CREATE TABLE entreprise_non_enregistre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    nom VARCHAR(255),
    telephone VARCHAR(30),
    email VARCHAR(150),
    domaine VARCHAR(100),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);
