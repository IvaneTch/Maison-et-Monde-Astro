-- Structure Maison & Monde. Importer dans une base vide. Aucune donnée personnelle.

SET NAMES utf8mb4;

CREATE TABLE `administrateurs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `sessions_admin` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `administrateur_id` int unsigned NOT NULL,
  `token_hash` char(64) NOT NULL,
  `date_expiration` datetime NOT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `administrateur_id` (`administrateur_id`),
  CONSTRAINT `sessions_admin_ibfk_1` FOREIGN KEY (`administrateur_id`) REFERENCES `administrateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `clients` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type_client` enum('particulier','professionnel') NOT NULL DEFAULT 'particulier',
  `prenom` varchar(100) DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `entreprise` varchar(200) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telephone` varchar(30) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `complement_adresse` varchar(255) DEFAULT NULL,
  `code_postal` varchar(15) DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `notes` text,
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_suppression` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_clients_email` (`email`),
  KEY `idx_clients_telephone` (`telephone`),
  KEY `idx_clients_suppression` (`date_suppression`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `demandes_devis` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `client_id` int unsigned DEFAULT NULL,
  `reference_devis` varchar(30) DEFAULT NULL,
  `type_devis` enum('simple','detaille') NOT NULL DEFAULT 'detaille',
  `nom` varchar(100) DEFAULT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telephone` varchar(30) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `type_logement` varchar(50) DEFAULT NULL,
  `surface_m2` decimal(8,2) DEFAULT NULL,
  `nombre_pieces` int DEFAULT NULL,
  `nombre_salles_bain` int DEFAULT NULL,
  `animaux_presents` tinyint(1) DEFAULT NULL,
  `prestations` json DEFAULT NULL,
  `frequence` varchar(100) DEFAULT NULL,
  `duree_souhaitee` varchar(100) DEFAULT NULL,
  `disponibilites` json DEFAULT NULL,
  `commentaires` text,
  `statut` enum('nouvelle','en_cours','devis_envoye','acceptee','refusee') DEFAULT 'nouvelle',
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_suppression` datetime DEFAULT NULL,
  `prestation_souhaitee` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference_devis` (`reference_devis`),
  KEY `idx_demandes_client` (`client_id`),
  CONSTRAINT `fk_demandes_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `demandes_contact` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(30) NOT NULL,
  `type_demande` enum('contact','rappel') NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telephone` varchar(30) NOT NULL,
  `objet` varchar(100) DEFAULT NULL,
  `message` text,
  `disponibilite` varchar(100) DEFAULT NULL,
  `consentement` tinyint NOT NULL DEFAULT '1',
  `statut` enum('nouvelle','traitee','archivee') NOT NULL DEFAULT 'nouvelle',
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(30) NOT NULL,
  `categorie` varchar(30) NOT NULL,
  `etat` enum('en_attente','envoyee') NOT NULL DEFAULT 'en_attente',
  `tentatives` int NOT NULL DEFAULT '0',
  `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_envoi` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notification_unique` (`reference`,`categorie`),
  KEY `etat` (`etat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
