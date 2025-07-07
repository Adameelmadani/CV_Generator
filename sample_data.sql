-- Insert sample filieres
INSERT INTO filieres (id, nom, description) VALUES
(1, 'Informatique', 'Sciences informatiques et technologies de l\'information'),
(2, 'Génie Logiciel', 'Développement et maintenance de logiciels'),
(3, 'Réseaux et Télécommunications', 'Administration et sécurité des réseaux'),
(4, 'Cybersécurité', 'Sécurité informatique et protection des données'),
(5, 'Intelligence Artificielle', 'Machine learning et intelligence artificielle'),
(6, 'Sciences des Données', 'Analyse et traitement des données'),
(7, 'Développement Web', 'Création d\'applications web et mobiles'),
(8, 'Administration Système', 'Gestion des systèmes et infrastructure IT'),
(9, 'Commerce', 'Commerce international et gestion'),
(10, 'Marketing', 'Marketing digital et communication'),
(11, 'Finance', 'Finance et comptabilité'),
(12, 'Ressources Humaines', 'Gestion des ressources humaines'),
(13, 'Droit', 'Sciences juridiques'),
(14, 'Médecine', 'Sciences médicales et santé'),
(15, 'Ingénierie', 'Sciences de l\'ingénieur'),
(16, 'Architecture', 'Architecture et urbanisme'),
(17, 'Design', 'Design graphique et industriel'),
(18, 'Communication', 'Communication et journalisme'),
(19, 'Éducation', 'Sciences de l\'éducation'),
(20, 'Arts', 'Arts et créativité');

-- Insert sample filiere associations (optional)
INSERT INTO filiere_associee (filiere_id, filiere_associee_id) VALUES
(1, 2), -- Informatique <-> Génie Logiciel
(2, 1), -- Génie Logiciel <-> Informatique
(1, 3), -- Informatique <-> Réseaux
(3, 1), -- Réseaux <-> Informatique
(1, 4), -- Informatique <-> Cybersécurité
(4, 1), -- Cybersécurité <-> Informatique
(1, 5), -- Informatique <-> IA
(5, 1), -- IA <-> Informatique
(5, 6), -- IA <-> Sciences des Données
(6, 5), -- Sciences des Données <-> IA
(7, 2), -- Développement Web <-> Génie Logiciel
(2, 7), -- Génie Logiciel <-> Développement Web
(9, 10), -- Commerce <-> Marketing
(10, 9), -- Marketing <-> Commerce
(9, 11), -- Commerce <-> Finance
(11, 9); -- Finance <-> Commerce
