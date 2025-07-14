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

-- Insert example data for filieres
INSERT INTO filieres (id, nom, description) VALUES
(1, 'Génie Mécanique', 'Conception, fabrication, et maintenance de systèmes mécaniques. Travaille sur les moteurs, les structures mécaniques, la thermodynamique et la résistance des matériaux.'),
(2, 'Génie Industriel', 'Optimisation des systèmes de production, logistique, qualité, organisation et performance des processus industriels.'),
(3, 'Génie Électrique', 'Étude et application de l’électricité, des circuits électriques, des systèmes de puissance et de l’électronique de puissance.'),
(4, 'Génie Électromécanique', 'Filière hybride combinant les systèmes mécaniques et électriques (automatisme, moteurs, maintenance intégrée), avec une forte orientation technique sur les machines.'),
(5, 'Génie Civil', 'Conception, construction et gestion d’infrastructures : bâtiments, ponts, routes, barrages, structures métalliques et en béton.'),
(6, 'Architecture', 'Art et science de la conception des bâtiments et de l’environnement bâti. Inclut design, urbanisme, patrimoine, avec une formation artistique poussée.'),
(7, 'Informatique & Numérique', 'Programmation, systèmes d’exploitation, réseaux, cybersécurité, génie logiciel, administration des systèmes et technologies web.'),
(8, 'Intelligence Artificielle & Data Science', 'Traitement des données massives, apprentissage automatique, vision par ordinateur, modélisation prédictive, traitement du langage naturel.'),
(9, 'Génie Chimique & Procédés', 'Transformation de la matière et de l’énergie à l’échelle industrielle. Inclut réacteurs chimiques, cinétique, thermodynamique appliquée.'),
(10, 'Énergies & Environnement', 'Production, gestion énergétique (renouvelable ou non), traitement des déchets, de l’air, de l’eau, durabilité.'),
(11, 'Télécommunications & Électronique', 'Transmission de données, réseaux sans fil, antennes, fibres optiques, traitement du signal, capteurs.'),
(12, 'Mathématiques Appliquées & Modélisation', 'Modélisation mathématique de systèmes complexes, simulations numériques, optimisation, finance quantitative.'),
(13, 'Économie & Gestion Appliquée', 'Analyse des systèmes économiques, finance, logistique, stratégie, audit, marketing analytique.'),
(14, 'Génie Biomédical', 'Application de l’ingénierie au domaine médical : appareils médicaux, imagerie, prothèses, interfaces homme-machine.'),
(15, 'Génie Maritime', 'Ingénierie navale : construction navale, logistique maritime, mécanique marine, transport international.'),
(16, 'Aéronautique', 'Conception et maintenance des systèmes aéronautiques : moteurs, structures, aérodynamique, contrôle de vol.'),
(17, 'Agroalimentaire', 'Transformation industrielle des produits agricoles : sécurité alimentaire, nutrition, biotechnologie alimentaire.'),
(18, 'Textile & Matériaux', 'Conception de textiles techniques, polymères, matériaux composites à usage industriel, biomédical ou technologique.'),
(19, 'Sciences de la Vie & de la Terre', 'Biologie, géologie, écologie, biochimie, microbiologie, recherche environnementale.'),
(20, 'Sciences Cognitives & Interdisciplinaires', 'Étude de l’intelligence humaine et artificielle : psychologie cognitive, neurosciences, interfaces cerveau-machine.'),
(21, 'Médecine', 'Études médicales classiques : soins aux patients, diagnostic, pathologies, pharmacologie, chirurgie.'),
(22, 'Ingénierie Multimédia & Technologies Interactives', 'Création de contenus numériques, jeux vidéo, réalité virtuelle/augmentée, design interactif.'),
(23, 'Génie Juridique & Droit des Technologies', 'Droit numérique, cybersécurité juridique, RGPD, propriété intellectuelle.'),
(24, 'Géomatique & SIG', 'Traitement de données spatiales : cartographie, GPS, images satellites, SIG.'),
(25, 'Sciences Spatiales & Aérospatiales', 'Technologie des satellites, propulsion spatiale, orbites, capteurs embarqués.'),
(26, 'Sciences de l’Éducation & Ingénierie Pédagogique', 'Conception de dispositifs d’apprentissage, neurosciences éducatives, e-learning.'),
(27, 'Sécurité Industrielle & Gestion des Risques', 'Analyse des dangers, gestion de crise, prévention industrielle et environnementale.'),
(28, 'Pharmacie Industrielle & Biotechnologies', 'Production de médicaments, bioprocédés, génie pharmaceutique, vaccins.'),
(29, 'Actuariat & Ingénierie Financière', 'Mathématiques de l’assurance, modélisation des risques, statistiques financières.'),
(30, 'Diplomatie & Relations Techno-stratégiques', 'Géopolitique de l’innovation, coopération technologique, cybersécurité internationale.');

-- Insert example data for filiere_associee
INSERT INTO filiere_associee (filiere_id, filiere_associee_id) VALUES
(1, '5, 4, 2, 9'),  -- "Génie Mécanique" associé à "Génie Civil", "Génie Électromécanique", "Génie Industriel", "Génie Chimique & Procédés"
(2, '1, 7, 9, 12'),  -- "Génie Industriel" associé à "Génie Mécanique", "Informatique & Numérique", "Génie Chimique & Procédés", "Mathématiques Appliquées & Modélisation"
(3, '7, 8, 1, 10'),  -- "Génie Électrique" associé à "Informatique & Numérique", "Intelligence Artificielle & Data Science", "Génie Mécanique", "Énergies & Environnement"
(4, '1, 7, 5, 8'),   -- "Génie Électromécanique" associé à "Génie Mécanique", "Informatique & Numérique", "Génie Civil", "Intelligence Artificielle & Data Science"
(5, '1, 4, 6, 7'),   -- "Génie Civil" associé à "Génie Mécanique", "Génie Électromécanique", "Architecture", "Informatique & Numérique"
(6, '7, 10, 8, 5'),  -- "Architecture" associé à "Informatique & Numérique", "Énergies & Environnement", "Intelligence Artificielle & Data Science", "Génie Civil"
(7, '3, 2, 8, 1'),   -- "Informatique & Numérique" associé à "Génie Électrique", "Génie Industriel", "Intelligence Artificielle & Data Science", "Génie Mécanique"
(8, '3, 2, 7, 12'),  -- "Intelligence Artificielle & Data Science" associé à "Génie Électrique", "Génie Industriel", "Informatique & Numérique", "Mathématiques Appliquées & Modélisation"
(9, '1, 5, 4, 10'),  -- "Génie Chimique & Procédés" associé à "Génie Mécanique", "Génie Civil", "Génie Électromécanique", "Énergies & Environnement"
(10, '6, 9, 5, 7'),  -- "Énergies & Environnement" associé à "Architecture", "Génie Chimique & Procédés", "Génie Civil", "Informatique & Numérique"
(11, '12, 8, 7, 1'), -- "Télécommunications & Électronique" associé à "Mathématiques Appliquées & Modélisation", "Intelligence Artificielle & Data Science", "Informatique & Numérique", "Génie Mécanique"
(12, '2, 8, 9, 7'),  -- "Mathématiques Appliquées & Modélisation" associé à "Génie Industriel", "Intelligence Artificielle & Data Science", "Génie Chimique & Procédés", "Informatique & Numérique"
(13, '7, 8, 2, 9'),  -- "Économie & Gestion Appliquée" associé à "Informatique & Numérique", "Intelligence Artificielle & Data Science", "Génie Industriel", "Génie Chimique & Procédés"
(14, '19, 7, 9, 6'), -- "Génie Biomédical" associé à "Sciences de la Vie & de la Terre", "Informatique & Numérique", "Génie Chimique & Procédés", "Architecture"
(15, '7, 5, 6, 8'),  -- "Génie Maritime" associé à "Informatique & Numérique", "Génie Civil", "Architecture", "Intelligence Artificielle & Data Science"
(16, '7, 8, 3, 5'),  -- "Aéronautique" associé à "Informatique & Numérique", "Intelligence Artificielle & Data Science", "Génie Électrique", "Génie Civil"
(17, '8, 9, 2, 7'),  -- "Agroalimentaire" associé à "Intelligence Artificielle & Data Science", "Génie Chimique & Procédés", "Génie Industriel", "Informatique & Numérique"
(18, '7, 1, 5, 9'),  -- "Textile & Matériaux" associé à "Informatique & Numérique", "Génie Mécanique", "Génie Civil", "Génie Chimique & Procédés"
(19, '7, 10, 2, 8'), -- "Sciences de la Vie & de la Terre" associé à "Informatique & Numérique", "Énergies & Environnement", "Génie Industriel", "Intelligence Artificielle & Data Science"
(20, '7, 8, 3, 2'),  -- "Sciences Cognitives & Interdisciplinaires" associé à "Informatique & Numérique", "Intelligence Artificielle & Data Science", "Génie Électrique", "Génie Industriel"
(21, '7, 8, 19, 9'), -- "Médecine" associé à "Informatique & Numérique", "Intelligence Artificielle & Data Science", "Sciences de la Vie & de la Terre", "Génie Chimique & Procédés"
(22, '7, 8, 2, 6'),  -- "Ingénierie Multimédia & Technologies Interactives" associé à "Informatique & Numérique", "Intelligence Artificielle & Data Science", "Génie Industriel", "Architecture"
(23, '7, 3, 10, 9'), -- "Génie Juridique & Droit des Technologies" associé à "Informatique & Numérique", "Génie Électrique", "Énergies & Environnement", "Génie Chimique & Procédés"
(24, '7, 3, 12, 10'), -- "Géomatique & SIG" associé à "Informatique & Numérique", "Génie Électrique", "Mathématiques Appliquées & Modélisation", "Énergies & Environnement"
(25, '3, 16, 8, 10'), -- "Sciences Spatiales & Aérospatiales" associé à "Génie Électrique", "Aéronautique", "Intelligence Artificielle & Data Science", "Énergies & Environnement"
(26, '12, 13, 9, 7'), -- "Sciences de l’Éducation & Ingénierie Pédagogique" associé à "Mathématiques Appliquées & Modélisation", "Économie & Gestion Appliquée", "Génie Chimique & Procédés", "Informatique & Numérique"
(27, '5, 9, 3, 1'),  -- "Sécurité Industrielle & Gestion des Risques" associé à "Génie Civil", "Génie Chimique & Procédés", "Génie Électrique", "Génie Mécanique"
(28, '9, 7, 8, 10'), -- "Pharmacie Industrielle & Biotechnologies" associé à "Génie Chimique & Procédés", "Informatique & Numérique", "Intelligence Artificielle & Data Science", "Énergies & Environnement"
(29, '12, 13, 9, 8'), -- "Actuariat & Ingénierie Financière" associé à "Mathématiques Appliquées & Modélisation", "Économie & Gestion Appliquée", "Génie Chimique & Procédés", "Intelligence Artificielle & Data Science"
(30, '12, 8, 19, 7'); -- "Diplomatie & Relations Techno-stratégiques" associé à "Mathématiques Appliquées & Modélisation", "Intelligence Artificielle & Data Science", "Sciences de la Vie & de la Terre", "Informatique & Numérique"