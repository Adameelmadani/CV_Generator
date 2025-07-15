-- Script pour ajouter de nouvelles filières à la base de données CV Generator
-- À exécuter après avoir créé la base de données principale (db.sql)

USE cv_craft;

-- Vérifier les filières existantes pour éviter les doublons
SELECT * FROM filieres;

-- Ajouter de nouvelles filières
INSERT INTO filieres (id, nom, description) VALUES
(6, 'Commerce', 'Vente, commerce et gestion commerciale'),
(7, 'Santé', 'Professions médicales et paramédicales'),
(8, 'Enseignement', 'Éducation et formation'),
(9, 'Droit', 'Domaine juridique et réglementaire'),
(10, 'Arts et Culture', 'Création artistique et gestion culturelle'),
(11, 'Communication', 'Médias et communication'),
(12, 'Logistique', 'Transport et gestion de chaîne d''approvisionnement'),
(13, 'Hôtellerie-Restauration', 'Services d''accueil et restauration'),
(14, 'Environnement', 'Développement durable et écologie'),
(15, 'Sciences', 'Recherche scientifique et académique');

-- Associer certaines filières entre elles (filières complémentaires)
INSERT INTO filiere_associee (filiere_id, filiere_associee_id) VALUES
(1, 5),   -- Informatique associée à Ingénierie
(1, 11),  -- Informatique associée à Communication
(2, 6),   -- Marketing associé à Commerce
(2, 11),  -- Marketing associé à Communication
(3, 6),   -- Finance associée à Commerce
(4, 8),   -- RH associée à Enseignement
(5, 14),  -- Ingénierie associée à Environnement
(9, 3),   -- Droit associé à Finance
(10, 11), -- Arts et Culture associés à Communication
(14, 15); -- Environnement associé à Sciences

-- Vérifier l'insertion
SELECT * FROM filieres ORDER BY id;
SELECT * FROM filiere_associee;
