-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 10, 2025 at 03:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cv_craft`
--

-- --------------------------------------------------------

--
-- Table structure for table `certificats`
--

CREATE TABLE `certificats` (
  `id` int(11) NOT NULL,
  `id_cv` int(11) NOT NULL,
  `nom_certificat` varchar(255) DEFAULT NULL,
  `date_certificat` varchar(255) DEFAULT NULL,
  `organisme` varchar(255) DEFAULT NULL,
  `lieu` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `competences`
--

CREATE TABLE `competences` (
  `id` int(11) NOT NULL,
  `id_cv` int(11) NOT NULL,
  `categorie` varchar(255) DEFAULT NULL,
  `competences` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cvs`
--

CREATE TABLE `cvs` (
  `id` int(11) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `contenu_xml` text DEFAULT NULL,
  `lien_pdf` varchar(255) DEFAULT NULL,
  `cv_name` varchar(255) DEFAULT NULL,
  `template_xslt` text DEFAULT NULL,
  `est_publie` tinyint(1) DEFAULT 0,
  `date_creation` date DEFAULT NULL,
  `date_modification` date DEFAULT NULL,
  `id_filiere` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `experiences`
--

CREATE TABLE `experiences` (
  `id` int(11) NOT NULL,
  `id_cv` int(11) NOT NULL,
  `lieu` varchar(255) DEFAULT NULL,
  `dates` varchar(255) DEFAULT NULL,
  `entreprise` varchar(255) DEFAULT NULL,
  `poste` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `filieres`
--

CREATE TABLE `filieres` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `filieres`
--

INSERT INTO `filieres` (`id`, `nom`, `description`) VALUES
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

-- --------------------------------------------------------

--
-- Table structure for table `formations`
--

CREATE TABLE `formations` (
  `id` int(11) NOT NULL,
  `id_cv` int(11) NOT NULL,
  `diplome` varchar(255) DEFAULT NULL,
  `dates` varchar(255) DEFAULT NULL,
  `universite` varchar(255) DEFAULT NULL,
  `specialite` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `informations_personnelles`
--

CREATE TABLE `informations_personnelles` (
  `id` int(11) NOT NULL,
  `id_cv` int(11) NOT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `localisation` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `site_web` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `chemin_photo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `langues`
--

CREATE TABLE `langues` (
  `id` int(11) NOT NULL,
  `id_cv` int(11) NOT NULL,
  `nom_langue` varchar(255) DEFAULT NULL,
  `niveau` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profils`
--

CREATE TABLE `profils` (
  `id` int(11) NOT NULL,
  `id_cv` int(11) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projets`
--

CREATE TABLE `projets` (
  `id` int(11) NOT NULL,
  `id_cv` int(11) NOT NULL,
  `nom_projet` varchar(255) DEFAULT NULL,
  `lien_projet` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) DEFAULT NULL,
  `prenom` varchar(255) DEFAULT NULL,
  `id_filiere` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mot_de_passe_hash` varchar(255) NOT NULL,
  `numero_telephone` varchar(20) DEFAULT NULL,
  `date_inscription` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `certificats`
--
ALTER TABLE `certificats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_certificats_cv` (`id_cv`);

--
-- Indexes for table `competences`
--
ALTER TABLE `competences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_competences_cv` (`id_cv`);

--
-- Indexes for table `cvs`
--
ALTER TABLE `cvs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cvs_utilisateur` (`id_utilisateur`),
  ADD KEY `idx_cvs_filiere` (`id_filiere`);

--
-- Indexes for table `experiences`
--
ALTER TABLE `experiences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_experiences_cv` (`id_cv`);

--
-- Indexes for table `filieres`
--
ALTER TABLE `filieres`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `formations`
--
ALTER TABLE `formations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_formations_cv` (`id_cv`);

--
-- Indexes for table `informations_personnelles`
--
ALTER TABLE `informations_personnelles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_informations_personnelles_cv` (`id_cv`);

--
-- Indexes for table `langues`
--
ALTER TABLE `langues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_langues_cv` (`id_cv`);

--
-- Indexes for table `profils`
--
ALTER TABLE `profils`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_profils_cv` (`id_cv`);

--
-- Indexes for table `projets`
--
ALTER TABLE `projets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_projets_cv` (`id_cv`);

--
-- Indexes for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `id_filiere` (`id_filiere`),
  ADD KEY `idx_utilisateurs_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `certificats`
--
ALTER TABLE `certificats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `competences`
--
ALTER TABLE `competences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `cvs`
--
ALTER TABLE `cvs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `experiences`
--
ALTER TABLE `experiences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `formations`
--
ALTER TABLE `formations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `informations_personnelles`
--
ALTER TABLE `informations_personnelles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `langues`
--
ALTER TABLE `langues`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `profils`
--
ALTER TABLE `profils`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `projets`
--
ALTER TABLE `projets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10002;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `certificats`
--
ALTER TABLE `certificats`
  ADD CONSTRAINT `fk_certificats_cv` FOREIGN KEY (`id_cv`) REFERENCES `cvs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `competences`
--
ALTER TABLE `competences`
  ADD CONSTRAINT `fk_competences_cv` FOREIGN KEY (`id_cv`) REFERENCES `cvs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cvs`
--
ALTER TABLE `cvs`
  ADD CONSTRAINT `cvs_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cvs_ibfk_2` FOREIGN KEY (`id_filiere`) REFERENCES `filieres` (`id`);

--
-- Constraints for table `experiences`
--
ALTER TABLE `experiences`
  ADD CONSTRAINT `fk_experiences_cv` FOREIGN KEY (`id_cv`) REFERENCES `cvs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `formations`
--
ALTER TABLE `formations`
  ADD CONSTRAINT `fk_formations_cv` FOREIGN KEY (`id_cv`) REFERENCES `cvs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `informations_personnelles`
--
ALTER TABLE `informations_personnelles`
  ADD CONSTRAINT `fk_info_cv` FOREIGN KEY (`id_cv`) REFERENCES `cvs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `langues`
--
ALTER TABLE `langues`
  ADD CONSTRAINT `fk_langues_cv` FOREIGN KEY (`id_cv`) REFERENCES `cvs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `profils`
--
ALTER TABLE `profils`
  ADD CONSTRAINT `fk_profils_cv` FOREIGN KEY (`id_cv`) REFERENCES `cvs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projets`
--
ALTER TABLE `projets`
  ADD CONSTRAINT `fk_projets_cv` FOREIGN KEY (`id_cv`) REFERENCES `cvs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `utilisateurs_ibfk_1` FOREIGN KEY (`id_filiere`) REFERENCES `filieres` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
