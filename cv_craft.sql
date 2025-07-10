-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 10, 2025 at 02:46 PM
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

--
-- Dumping data for table `certificats`
--

INSERT INTO `certificats` (`id`, `id_cv`, `nom_certificat`, `date_certificat`, `organisme`, `lieu`, `description`) VALUES
(32, 27, 'AWS Certified Developer', 'Mars 2023', 'Amazon Web Services', 'En ligne', 'Certification professionnelle en développement d\'applications sur AWS');

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

--
-- Dumping data for table `competences`
--

INSERT INTO `competences` (`id`, `id_cv`, `categorie`, `competences`) VALUES
(32, 27, 'Langages de programmation', 'JavaScript, TypeScript, Python, Java, PHP, SQL');

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

--
-- Dumping data for table `cvs`
--

INSERT INTO `cvs` (`id`, `id_utilisateur`, `contenu_xml`, `lien_pdf`, `cv_name`, `template_xslt`, `est_publie`, `date_creation`, `date_modification`, `id_filiere`) VALUES
(27, 10001, '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<cv>\n  <personalization>\n    <primaryColor>#667eea</primaryColor>\n  </personalization>\n\n  <personalInfo>\n    <firstname>Jean</firstname>\n    <lastname>Dupont</lastname>\n    <location>Paris, France</location>\n    <email>jean.dupont@email.com</email>\n    <phone>+33 1 23 45 67 89</phone>\n    <website>https://jeandupont.dev</website>\n    <linkedin>https://linkedin.com/in/jeandupont</linkedin>\n    <github>https://github.com/jeandupont</github>\n  </personalInfo>\n\n  <profil>\n    <description>Développeur Full-Stack passionné avec 5 ans d&amp;#039;expérience dans la création d&amp;#039;applications web modernes. Expertise en JavaScript, React, Node.js et bases de données. Recherche de nouveaux défis techniques dans une équipe dynamique.</description>\n  </profil>\n\n  <education>\n    <degree>\n      <title>Master en Informatique</title>\n      <period>2020</period>\n      <institution>Université Pierre et Marie Curie</institution>\n      <field>Génie Logiciel</field>\n      <description>Mention Bien - Spécialisation en développement web et architecture logicielle</description>\n    </degree>\n  </education>\n\n  <certificates>\n    <certificate>\n      <name>AWS Certified Developer</name>\n      <date>Mars 2023</date>\n      <issuer>Amazon Web Services</issuer>\n      <location>En ligne</location>\n      <description>Certification professionnelle en développement d&#039;applications sur AWS</description>\n    </certificate>\n  </certificates>\n\n  <experiences>\n    <experience>\n      <location>Paris, France</location>\n      <period>Jan 2021 – Présent</period>\n      <company>TechCorp Solutions</company>\n      <position>Développeur Full-Stack Senior</position>\n      <description>Développement d&amp;#039;applications web modernes avec React et Node.js\r\nGestion et encadrement d&amp;#039;une équipe de 3 développeurs juniors\r\nOptimisation des performances applicatives et renforcement de la sécurité\r\nMise en place de pipelines CI/CD avec Docker et Kubernetes\r\nConception d&amp;#039;architectures scalables et maintenables\r\nParticipation aux décisions techniques et choix technologiques</description>\n    </experience>\n  </experiences>\n\n  <projects>\n    <project>\n      <name>E-Commerce Platform</name>\n      <link>https://github.com/jeandupont/ecommerce-platform</link>\n      <description>Plateforme e-commerce complète développée avec React, Node.js, MongoDB et Stripe. Fonctionnalités: gestion des produits, panier, paiements sécurisés, dashboard admin.</description>\n    </project>\n  </projects>\n\n  <skills>\n    <skill>\n      <category>Langages de programmation</category>\n      <items>JavaScript, TypeScript, Python, Java, PHP, SQL</items>\n    </skill>\n  </skills>\n\n  <languages>\n    <language>\n      <name>Français</name>\n      <level>Native</level>\n    </language>\n  </languages>\n\n</cv>', 'saved_pdfs/CV_Jean_Dupont_27_10001.pdf', 'test', NULL, 1, '2025-07-10', '2025-07-10', 8);

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

--
-- Dumping data for table `experiences`
--

INSERT INTO `experiences` (`id`, `id_cv`, `lieu`, `dates`, `entreprise`, `poste`, `description`) VALUES
(32, 27, 'Paris, France', 'Jan 2021 – Présent', 'TechCorp Solutions', 'Développeur Full-Stack Senior', 'Développement d\'applications web modernes avec React et Node.js\r\nGestion et encadrement d\'une équipe de 3 développeurs juniors\r\nOptimisation des performances applicatives et renforcement de la sécurité\r\nMise en place de pipelines CI/CD avec Docker et Kubernetes\r\nConception d\'architectures scalables et maintenables\r\nParticipation aux décisions techniques et choix technologiques');

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

--
-- Dumping data for table `formations`
--

INSERT INTO `formations` (`id`, `id_cv`, `diplome`, `dates`, `universite`, `specialite`, `description`) VALUES
(32, 27, 'Master en Informatique', '2020', 'Université Pierre et Marie Curie', 'Génie Logiciel', 'Mention Bien - Spécialisation en développement web et architecture logicielle');

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

--
-- Dumping data for table `informations_personnelles`
--

INSERT INTO `informations_personnelles` (`id`, `id_cv`, `nom`, `prenom`, `localisation`, `email`, `telephone`, `site_web`, `linkedin`, `github`, `chemin_photo`) VALUES
(24, 27, 'Dupont', 'Jean', 'Paris, France', 'jean.dupont@email.com', '+33 1 23 45 67 89', 'https://jeandupont.dev', 'https://linkedin.com/in/jeandupont', 'https://github.com/jeandupont', NULL);

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

--
-- Dumping data for table `langues`
--

INSERT INTO `langues` (`id`, `id_cv`, `nom_langue`, `niveau`) VALUES
(32, 27, 'Français', 'Native');

-- --------------------------------------------------------

--
-- Table structure for table `profils`
--

CREATE TABLE `profils` (
  `id` int(11) NOT NULL,
  `id_cv` int(11) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profils`
--

INSERT INTO `profils` (`id`, `id_cv`, `description`) VALUES
(18, 27, NULL);

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

--
-- Dumping data for table `projets`
--

INSERT INTO `projets` (`id`, `id_cv`, `nom_projet`, `lien_projet`, `description`) VALUES
(32, 27, 'E-Commerce Platform', 'https://github.com/jeandupont/ecommerce-platform', 'Plateforme e-commerce complète développée avec React, Node.js, MongoDB et Stripe. Fonctionnalités: gestion des produits, panier, paiements sécurisés, dashboard admin.');

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
-- Dumping data for table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `id_filiere`, `email`, `mot_de_passe_hash`, `numero_telephone`, `date_inscription`) VALUES
(10001, 'Zbida', 'Amine', 8, 'itzzbida@gmail.com', '$2y$10$Dg4cSAzgzxtrqgYOASUqQOvWVcZCyFhtR2QrpcCxxA9X8eQeW2hnO', '0767671765', '2025-07-10');

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
  ADD CONSTRAINT `cvs_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id`),
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
