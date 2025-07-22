-- Script SQL pour créer les tables nécessaires aux nouvelles fonctionnalités
-- Exécuter ce script dans votre base de données avant d'utiliser les nouveaux boutons

-- Table pour les recruteurs (si elle n'existe pas déjà)
CREATE TABLE IF NOT EXISTS `recruiters` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL,
    `email` varchar(100) NOT NULL,
    `password_hash` varchar(255) DEFAULT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`),
    UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insérer un recruteur par défaut si la table est vide
INSERT IGNORE INTO `recruiters` (`id`, `username`, `email`) VALUES 
(1, 'admin', 'admin@cv-search.com');

-- Table pour les profils de pondération
CREATE TABLE IF NOT EXISTS `weight_profiles` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `profile_name` varchar(100) NOT NULL,
    `description` text DEFAULT NULL,
    `recruiter_id` int(11) NOT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `recruiter_id` (`recruiter_id`),
    CONSTRAINT `weight_profiles_ibfk_1` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table pour stocker les valeurs de pondération
CREATE TABLE IF NOT EXISTS `search_weights` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `weight_profile_id` int(11) NOT NULL,
    `section_name` varchar(50) NOT NULL,
    `weight_value` decimal(3,1) NOT NULL DEFAULT 1.0,
    PRIMARY KEY (`id`),
    KEY `weight_profile_id` (`weight_profile_id`),
    UNIQUE KEY `unique_profile_section` (`weight_profile_id`, `section_name`),
    CONSTRAINT `search_weights_ibfk_1` FOREIGN KEY (`weight_profile_id`) REFERENCES `weight_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table pour l'historique des recherches
CREATE TABLE IF NOT EXISTS `search_history` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `recruiter_id` int(11) NOT NULL,
    `search_keywords` text NOT NULL,
    `filters` json DEFAULT NULL,
    `weights` json DEFAULT NULL,
    `results_count` int(11) DEFAULT 0,
    `weight_profile_id` int(11) DEFAULT NULL,
    `search_date` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `recruiter_id` (`recruiter_id`),
    KEY `weight_profile_id` (`weight_profile_id`),
    KEY `search_date` (`search_date`),
    CONSTRAINT `search_history_ibfk_1` FOREIGN KEY (`recruiter_id`) REFERENCES `recruiters` (`id`) ON DELETE CASCADE,
    CONSTRAINT `search_history_ibfk_2` FOREIGN KEY (`weight_profile_id`) REFERENCES `weight_profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insérer quelques profils de pondération par défaut
INSERT IGNORE INTO `weight_profiles` (`id`, `profile_name`, `description`, `recruiter_id`) VALUES 
(1, 'Profil Technique', 'Pondération optimisée pour les postes techniques', 1),
(2, 'Profil Management', 'Pondération pour les postes de management', 1),
(3, 'Profil Junior', 'Pondération adaptée aux profils juniors', 1),
(4, 'Profil Équilibré', 'Pondération équilibrée pour tous types de postes', 1);

-- Insérer les poids par défaut pour le profil technique
INSERT IGNORE INTO `search_weights` (`weight_profile_id`, `section_name`, `weight_value`) VALUES 
(1, 'experience', 4.0),
(1, 'education', 1.5),
(1, 'skills', 5.0),
(1, 'projects', 3.5),
(1, 'certificates', 2.5),
(1, 'languages', 1.0),
(1, 'profils', 2.5),
(1, 'informations_personnelles', 0.5);

-- Insérer les poids par défaut pour le profil management
INSERT IGNORE INTO `search_weights` (`weight_profile_id`, `section_name`, `weight_value`) VALUES 
(2, 'experience', 5.0),
(2, 'education', 2.5),
(2, 'skills', 2.0),
(2, 'projects', 3.0),
(2, 'certificates', 2.0),
(2, 'languages', 1.5),
(2, 'profils', 3.5),
(2, 'informations_personnelles', 1.0);

-- Insérer les poids par défaut pour le profil junior
INSERT IGNORE INTO `search_weights` (`weight_profile_id`, `section_name`, `weight_value`) VALUES 
(3, 'experience', 2.0),
(3, 'education', 4.0),
(3, 'skills', 3.5),
(3, 'projects', 4.5),
(3, 'certificates', 3.0),
(3, 'languages', 1.5),
(3, 'profils', 3.0),
(3, 'informations_personnelles', 1.0);

-- Insérer les poids par défaut pour le profil équilibré
INSERT IGNORE INTO `search_weights` (`weight_profile_id`, `section_name`, `weight_value`) VALUES 
(4, 'experience', 3.0),
(4, 'education', 2.0),
(4, 'skills', 4.0),
(4, 'projects', 2.5),
(4, 'certificates', 1.5),
(4, 'languages', 1.0),
(4, 'profils', 2.0),
(4, 'informations_personnelles', 1.0);

-- Afficher un résumé des tables créées
SELECT 'Tables créées avec succès !' as message;
SELECT COUNT(*) as 'Profils de pondération' FROM weight_profiles;
SELECT COUNT(*) as 'Poids configurés' FROM search_weights;
SELECT COUNT(*) as 'Recruteurs' FROM recruiters;
