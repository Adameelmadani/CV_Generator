# Système RH - CVCRAFT

## Vue d'ensemble

Le système RH de CVCRAFT est maintenant entièrement intégré avec votre base de données existante. Il fonctionne sans API séparée et utilise directement la structure de données de `cv_craft.sql`.

## Architecture

### Structure des fichiers
```
CV_Generator/
├── app/Controllers/
│   └── RHController.php          # Contrôleur RH principal
├── rh/
│   ├── index.html                # Interface RH
│   ├── styles.css                # Styles modernes
│   ├── script.js                 # JavaScript RH
│   └── README.md                 # Documentation
├── rh_api.php                    # Point d'entrée API
├── Login_Signup/
│   └── rh.env                    # Configuration RH
└── test_rh_system.php           # Script de test
```

### Base de données
Le système utilise directement les tables existantes :
- `utilisateurs` - Informations des utilisateurs
- `cvs` - CV créés par les utilisateurs
- `filieres` - Filières d'études
- `informations_personnelles` - Données personnelles
- `experiences` - Expériences professionnelles
- `formations` - Formations et diplômes
- `competences` - Compétences techniques
- `langues` - Langues maîtrisées
- `projets` - Projets réalisés
- `certificats` - Certifications
- `profils` - Profils professionnels

## Installation et Configuration

### 1. Configuration des credentials RH

Créez ou modifiez le fichier `Login_Signup/rh.env` :

```env
rh@cvcraft.com=$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
admin@cvcraft.com=$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
```

Pour générer un hash de mot de passe :
```php
<?php
echo password_hash('votre_mot_de_passe', PASSWORD_DEFAULT);
?>
```

### 2. Accès au système

- **Interface RH** : `http://localhost/CVCRAFT/CV_Generator/rh/index.html`
- **Test du système** : `http://localhost/CVCRAFT/CV_Generator/test_rh_system.php`

## Fonctionnalités

### 1. Authentification RH
- Connexion sécurisée avec credentials stockés dans `rh.env`
- Session PHP pour maintenir l'authentification
- Déconnexion automatique

### 2. Tableau de bord
- Statistiques en temps réel
- Nombre total de CV publiés
- Répartition par filière
- CV récents (7 derniers jours)

### 3. Recherche de CV
- Recherche par nom, email, compétences
- Filtrage par filière
- Interface moderne et responsive
- Résultats en temps réel

### 4. Visualisation détaillée
- Modal avec tous les détails du CV
- Informations personnelles
- Expériences professionnelles
- Formations et diplômes
- Compétences techniques
- Langues maîtrisées
- Projets réalisés
- Certifications

### 5. Gestion des filières
- Liste complète des 30 filières
- Intégration avec la base de données existante
- Filtrage dynamique

## API Endpoints

### Authentification
- `POST rh_api.php?action=login` - Connexion RH
- `GET rh_api.php?action=logout` - Déconnexion
- `GET rh_api.php?action=check_auth` - Vérification authentification

### Recherche et données
- `GET rh_api.php?action=search_cvs` - Recherche de CV
- `GET rh_api.php?action=get_cv_details&id=X` - Détails d'un CV
- `GET rh_api.php?action=get_filieres` - Liste des filières
- `GET rh_api.php?action=get_stats` - Statistiques RH

## Sécurité

### Authentification
- Credentials stockés de manière sécurisée
- Hachage des mots de passe avec `password_hash()`
- Sessions PHP pour maintenir l'état

### Autorisation
- Toutes les opérations sensibles nécessitent une authentification
- Vérification de session sur chaque requête
- Protection contre les accès non autorisés

### Base de données
- Requêtes préparées pour éviter les injections SQL
- Validation des données d'entrée
- Gestion des erreurs sécurisée

## Interface utilisateur

### Design moderne
- Interface responsive et moderne
- Variables CSS pour la cohérence
- Animations et transitions fluides
- Support mobile complet

### Composants
- **Header** : Logo et informations utilisateur
- **Login** : Formulaire de connexion sécurisé
- **Dashboard** : Statistiques et recherche
- **Modal** : Affichage détaillé des CV
- **Loading** : Indicateurs de chargement

## Tests et débogage

### Script de test
Le fichier `test_rh_system.php` permet de :
- Tester la connexion à la base de données
- Vérifier l'existence des tables
- Compter les données disponibles
- Tester les endpoints API
- Vérifier les fichiers requis

### Accès au test
```
http://localhost/CVCRAFT/CV_Generator/test_rh_system.php
```

## Maintenance

### Logs
- Les erreurs sont loggées dans les logs PHP standard
- Messages d'erreur informatifs pour le débogage

### Sauvegarde
- Le système utilise la base de données existante
- Aucune table supplémentaire requise
- Compatible avec les sauvegardes existantes

### Mise à jour
- Modifications dans `RHController.php` pour la logique métier
- Modifications dans `rh/script.js` pour l'interface
- Modifications dans `rh/styles.css` pour le design

## Avantages du nouveau système

### 1. Intégration complète
- Utilise directement votre base de données existante
- Pas d'API séparée à maintenir
- Cohérence avec le reste de l'application

### 2. Simplicité
- Installation minimale
- Configuration simple
- Maintenance réduite

### 3. Performance
- Requêtes SQL optimisées
- Pas de surcharge d'API
- Réponses rapides

### 4. Sécurité
- Authentification robuste
- Protection contre les injections SQL
- Sessions sécurisées

### 5. Extensibilité
- Architecture modulaire
- Facile d'ajouter de nouvelles fonctionnalités
- Code bien structuré

## Support

Pour toute question ou problème :
1. Vérifiez le script de test : `test_rh_system.php`
2. Consultez les logs PHP
3. Vérifiez la configuration dans `rh.env`
4. Testez la connexion à la base de données

Le système RH est maintenant prêt à être utilisé et entièrement intégré avec votre application CVCRAFT existante. 