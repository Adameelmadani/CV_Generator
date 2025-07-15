-- Insertion des données de test dans la base de données

-- Insertion des filières
INSERT INTO filieres (id, nom, description) VALUES
(1, 'Informatique', 'Technologies de l''information'),
(2, 'Marketing', 'Marketing et communication'),
(3, 'Finance', 'Finance et comptabilité'),
(4, 'Ressources Humaines', 'Gestion des ressources humaines'),
(5, 'Ingénierie', 'Ingénierie et techniques');

-- Insertion des utilisateurs
INSERT INTO utilisateurs (nom, prenom, id_filiere, email, mot_de_passe_hash, numero_telephone, date_inscription) VALUES
('Dupont', 'Jean', 1, 'jean.dupont@email.com', 'hash123', '+33 1 23 45 67 89', '2020-01-15'),
('Martin', 'Sophie', 1, 'sophie.martin@email.com', 'hash456', '+33 4 56 78 90 12', '2018-03-20'),
('Dubois', 'Pierre', 2, 'pierre.dubois@email.com', 'hash789', '+33 4 91 23 45 67', '2019-06-10'),
('Leroy', 'Marie', 3, 'marie.leroy@email.com', 'hash101', '+33 5 61 23 45 67', '2017-09-05'),
('Moreau', 'Thomas', 4, 'thomas.moreau@email.com', 'hash202', '+33 2 40 12 34 56', '2015-11-12'),
('Bernard', 'Julie', 5, 'julie.bernard@email.com', 'hash303', '+33 3 88 12 34 56', '2021-02-28');

-- Insertion des CVs
INSERT INTO cvs (id_utilisateur, est_publie, date_creation, date_modification, id_filiere) VALUES
(1, TRUE, '2024-01-15', '2024-01-15', 1),
(2, TRUE, '2024-02-20', '2024-02-20', 1),
(3, TRUE, '2024-03-10', '2024-03-10', 2),
(4, TRUE, '2024-04-05', '2024-04-05', 3),
(5, TRUE, '2024-05-12', '2024-05-12', 4),
(6, TRUE, '2024-06-28', '2024-06-28', 5);

-- Insertion des informations personnelles
INSERT INTO informations_personnelles (id_cv, nom, prenom, localisation, email, telephone, linkedin, github) VALUES
(1, 'Dupont', 'Jean', 'Paris, France', 'jean.dupont@email.com', '+33 1 23 45 67 89', 'linkedin.com/in/jeandupont', 'github.com/jeandupont'),
(2, 'Martin', 'Sophie', 'Lyon, France', 'sophie.martin@email.com', '+33 4 56 78 90 12', 'linkedin.com/in/sophiemartin', NULL),
(3, 'Dubois', 'Pierre', 'Marseille, France', 'pierre.dubois@email.com', '+33 4 91 23 45 67', 'linkedin.com/in/pierredubois', NULL),
(4, 'Leroy', 'Marie', 'Toulouse, France', 'marie.leroy@email.com', '+33 5 61 23 45 67', 'linkedin.com/in/marieleroy', NULL),
(5, 'Moreau', 'Thomas', 'Nantes, France', 'thomas.moreau@email.com', '+33 2 40 12 34 56', 'linkedin.com/in/thomasmoreau', NULL),
(6, 'Bernard', 'Julie', 'Strasbourg, France', 'julie.bernard@email.com', '+33 3 88 12 34 56', 'linkedin.com/in/juliebernard', NULL);

-- Insertion des profils
INSERT INTO profils (id_cv, description) VALUES
(1, 'Développeur Full-Stack passionné avec 5 ans d''expérience dans le développement d''applications web modernes. Expert en JavaScript, React, Node.js et bases de données.'),
(2, 'Chef de projet digital expérimentée avec 7 ans d''expérience dans la gestion de projets web et mobile. Expertise en méthodologies agiles et gestion d''équipes multidisciplinaires.'),
(3, 'Spécialiste Marketing Digital avec 6 ans d''expérience en stratégie digitale, SEO/SEA et social media. Expert en growth hacking et analytics.'),
(4, 'Analyste financier senior avec 8 ans d''expérience en analyse financière, modélisation et reporting. Expertise en finance d''entreprise et marchés financiers.'),
(5, 'Responsable RH avec 10 ans d''expérience en recrutement, gestion des talents et développement RH. Expert en transformation digitale RH et people analytics.'),
(6, 'Ingénieure logiciel spécialisée en intelligence artificielle et machine learning. 4 ans d''expérience en développement d''algorithmes et déploiement de modèles ML.');

-- Insertion des formations
INSERT INTO formations (id_cv, diplome, dates, universite, specialite, description) VALUES
(1, 'Master en Informatique', '2018-2020', 'Université Paris-Saclay', 'Génie Logiciel', 'Spécialisation en développement web et architecture logicielle'),
(1, 'Licence Informatique', '2015-2018', 'Université Pierre et Marie Curie', 'Informatique Générale', 'Formation générale en informatique et programmation'),
(2, 'Master Management de Projet', '2016-2018', 'EM Lyon', 'Management de Projet Digital', 'Formation en gestion de projet et transformation digitale'),
(3, 'Master Marketing Digital', '2017-2019', 'KEDGE Business School', 'Marketing Digital et E-business', 'Formation spécialisée en marketing digital et e-commerce'),
(4, 'Master Finance', '2015-2017', 'Toulouse Business School', 'Finance d''Entreprise', 'Formation en finance d''entreprise et analyse financière'),
(5, 'Master Ressources Humaines', '2013-2015', 'Université de Nantes', 'Management des Ressources Humaines', 'Formation en GRH et management'),
(6, 'Diplôme d''Ingénieur', '2018-2021', 'INSA Strasbourg', 'Informatique et Intelligence Artificielle', 'Formation d''ingénieur en informatique avec spécialisation IA');

-- Insertion des expériences
INSERT INTO experiences (id_cv, poste, entreprise, lieu, dates, description) VALUES
(1, 'Développeur Full-Stack Senior', 'TechCorp', 'Paris', '2021-2024', 'Développement d''applications web avec React et Node.js. Gestion d''équipe de 3 développeurs. Migration vers le cloud AWS.'),
(1, 'Développeur Frontend', 'WebAgency', 'Lyon', '2020-2021', 'Création d''interfaces utilisateur modernes avec React et Vue.js. Optimisation des performances web.'),
(2, 'Chef de Projet Digital Senior', 'Digital Solutions', 'Lyon', '2020-2024', 'Gestion de projets web et mobile pour des clients grands comptes. Coordination d''équipes de 10+ personnes. Budget de 500K€+'),
(2, 'Chef de Projet Web', 'WebFactory', 'Lyon', '2018-2020', 'Gestion de projets e-commerce et sites vitrine. Méthodologie Scrum et Kanban.'),
(3, 'Responsable Marketing Digital', 'GrowthCorp', 'Marseille', '2021-2024', 'Stratégie marketing digital complète. Gestion budgets Google Ads 100K€/mois. +200% croissance trafic organique.'),
(3, 'Traffic Manager', 'AdAgency', 'Nice', '2019-2021', 'Gestion campagnes SEA multi-clients. Optimisation ROI et conversion.'),
(4, 'Analyste Financier Senior', 'FinanceGroup', 'Toulouse', '2020-2024', 'Analyse financière d''entreprises, modélisation financière, reporting mensuel. Suivi portefeuille 50M€.'),
(4, 'Analyste Junior', 'BankCorp', 'Toulouse', '2017-2020', 'Analyse crédit, évaluation risques, reporting réglementaire.'),
(5, 'Responsable RH', 'TechStart', 'Nantes', '2019-2024', 'Gestion RH complète entreprise 200 personnes. Recrutement, formation, GPEC. Mise en place SIRH.'),
(5, 'Chargé de Recrutement Senior', 'HR Solutions', 'Nantes', '2015-2019', 'Recrutement profils IT et management. 100+ recrutements/an.'),
(6, 'Ingénieure Machine Learning', 'AI Solutions', 'Strasbourg', '2021-2024', 'Développement modèles ML pour reconnaissance d''images. Déploiement en production avec Docker et Kubernetes.');

-- Insertion des projets
INSERT INTO projets (id_cv, nom_projet, description) VALUES
(1, 'E-commerce Platform', 'Plateforme e-commerce complète avec React, Node.js et MongoDB. Gestion des paiements Stripe.'),
(1, 'Task Management App', 'Application de gestion de tâches collaborative avec temps réel (Socket.io)'),
(2, 'Refonte Site E-commerce', 'Refonte complète d''un site e-commerce avec migration vers Shopify Plus. +150% de conversion.'),
(3, 'Stratégie SEO E-commerce', 'Stratégie SEO complète pour site e-commerce. +300% trafic organique en 12 mois.'),
(4, 'Modèle de Valorisation', 'Développement modèle de valorisation d''entreprises avec Excel et VBA.'),
(5, 'Transformation Digitale RH', 'Mise en place SIRH et digitalisation processus RH. ROI +30%.'),
(6, 'Système de Recommandation', 'Développement système de recommandation avec TensorFlow et déploiement sur GCP.'),
(6, 'Chatbot IA', 'Création chatbot intelligent avec NLP et intégration API.');

-- Insertion des certificats
INSERT INTO certificats (id_cv, nom_certificat, organisme, description) VALUES
(1, 'AWS Certified Developer', 'Amazon Web Services', 'Certification en développement sur AWS'),
(2, 'PMP Certification', 'PMI', 'Certification Project Management Professional'),
(2, 'Scrum Master', 'Scrum Alliance', 'Certification Scrum Master'),
(3, 'Google Ads Certified', 'Google', 'Certification Google Ads'),
(3, 'Google Analytics Certified', 'Google', 'Certification Google Analytics'),
(4, 'CFA Level II', 'CFA Institute', 'Certification CFA niveau 2'),
(5, 'Certification GPEC', 'CNAM', 'Certification en Gestion Prévisionnelle des Emplois et Compétences'),
(6, 'TensorFlow Developer', 'Google', 'Certification TensorFlow Developer');

-- Insertion des compétences
INSERT INTO competences (id_cv, categorie, competences) VALUES
(1, 'Frontend', 'React, Vue.js, JavaScript, TypeScript, HTML5, CSS3, Sass'),
(1, 'Backend', 'Node.js, Express, Python, Django, PHP'),
(1, 'Base de données', 'MongoDB, MySQL, PostgreSQL, Redis'),
(1, 'DevOps', 'Docker, AWS, Git, CI/CD, Jenkins'),
(2, 'Gestion de projet', 'Scrum, Kanban, Agile, Waterfall, Jira, Trello'),
(2, 'Digital', 'UX/UI, SEO, Analytics, A/B Testing'),
(3, 'SEO/SEA', 'Google Ads, SEO, SEM, Google Analytics, Search Console'),
(3, 'Social Media', 'Facebook Ads, Instagram, LinkedIn, TikTok, Hootsuite'),
(3, 'Analytics', 'Google Analytics, Data Studio, Hotjar, Mixpanel'),
(4, 'Analyse Financière', 'Modélisation financière, DCF, Valorisation, Excel, VBA'),
(4, 'Reporting', 'Power BI, Tableau, SQL, Python'),
(5, 'Recrutement', 'Sourcing, Entretiens, Assessment, LinkedIn Recruiter'),
(5, 'SIRH', 'Workday, SAP SuccessFactors, Talentsoft'),
(5, 'Analytics', 'People Analytics, Excel, Power BI, Reporting RH'),
(6, 'Machine Learning', 'TensorFlow, PyTorch, Scikit-learn, Keras, OpenCV'),
(6, 'Programmation', 'Python, R, Java, C++, SQL'),
(6, 'Cloud', 'GCP, AWS, Docker, Kubernetes, MLOps');

-- Insertion des langues
INSERT INTO langues (id_cv, nom_langue, niveau) VALUES
(1, 'Français', 'Natif'),
(1, 'Anglais', 'Courant'),
(1, 'Espagnol', 'Intermédiaire'),
(2, 'Français', 'Natif'),
(2, 'Anglais', 'Courant'),
(2, 'Italien', 'Débutant'),
(3, 'Français', 'Natif'),
(3, 'Anglais', 'Courant'),
(3, 'Allemand', 'Intermédiaire'),
(4, 'Français', 'Natif'),
(4, 'Anglais', 'Courant'),
(5, 'Français', 'Natif'),
(5, 'Anglais', 'Courant'),
(5, 'Espagnol', 'Intermédiaire'),
(6, 'Français', 'Natif'),
(6, 'Anglais', 'Courant'),
(6, 'Allemand', 'Courant');
