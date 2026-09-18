# Structure MVC - CV Generator

## Vue d'ensemble

Le projet CV Generator utilise maintenant une architecture MVC (Modèle-Vue-Contrôleur) pour une meilleure organisation du code et une maintenance facilitée.

## Structure des fichiers

``` bash
/core/
├── bootstrap.php       # Initialisation de l'application
├── Controller.php      # Classe de base pour les contrôleurs
├── Database.php        # Gestion de la base de données
├── Model.php           # Classe de base pour les modèles
└── Router.php          # Gestionnaire de routes

/app/
├── Controllers/
│   ├── AuthController.php    # Contrôleur pour l'authentification
│   ├── CVController.php      # Contrôleur pour les CV
│   ├── FiliereController.php # Contrôleur pour les filières
│   └── SearchController.php  # Contrôleur pour la recherche CV
└── Models/
    ├── User.php              # Modèle utilisateurs
    ├── CV.php                # Modèle CV principal
    ├── CVPersonalInfo.php    # Informations personnelles
    ├── CVEducation.php       # Formations
    ├── CVExperience.php      # Expériences
    ├── CVSkills.php          # Compétences
    ├── CVLanguages.php       # Langues
    ├── CVProjects.php        # Projets
    ├── CVCertificates.php    # Certificats
    ├── CVProfile.php         # Profil/résumé
    ├── CVSectionsManager.php # Gestionnaire de sections
    ├── CVSearchModel.php     # Modèle de recherche
    └── Filiere.php           # Modèle filières

/Login_Signup/
├── signup_handler_mvc.php     # Point d'entrée MVC pour l'inscription
├── login_handler_mvc.php      # Point d'entrée MVC pour la connexion
├── check_session_mvc.php      # Point d'entrée MVC pour vérifier la session
├── logout_mvc.php             # Point d'entrée MVC pour la déconnexion
├── password_manager_mvc.php   # Point d'entrée MVC pour la réinitialisation de mot de passe
└── rh_login_handler_mvc.php   # Point d'entrée MVC pour la connexion RH

/scripts/
└── seed_cvs.py                # Script de génération de données de test (20 CVs)

/tests/
├── test_parse_cv.py           # Tests du module de parsing
└── test_parsing.py            # Tests d'intégration du parsing
```

## Fonctionnalités implémentées

### Authentification avec nom d'utilisateur

- Champ username ajouté au formulaire d'inscription
- Validation côté client et serveur du username
- Vérification d'unicité du username
- Stockage du username en base de données
- Affichage du username dans le dashboard utilisateur
- Session mise à jour pour inclure le username

### Structure MVC

- **User Model** : Gestion des utilisateurs, validation, requêtes DB
- **AuthController** : Logique d'authentification et de session
- **CVController** : Logique de gestion des CV (compatible avec le nouveau système)
- **Handlers MVC** : Points d'entrée qui utilisent les contrôleurs
- **Migration Legacy** : Anciens fichiers redirigent vers MVC

## Utilisation

### Pour les développeurs

1. **Nouveaux endpoints à utiliser** :
   - `signup_handler_mvc.php` au lieu de `signup_handler.php`
   - `login_handler_mvc.php` au lieu de `login_handler.php`
   - `check_session_mvc.php` au lieu de `check_session.php`
   - `logout_mvc.php` au lieu de `logout.php`
   - `password_manager_mvc.php` au lieu de `password_manager.php`

2. **Structure recommandée pour ajouter de nouvelles fonctionnalités** :
   - Créer un modèle dans `/app/Models/`
   - Créer un contrôleur dans `/app/Controllers/`
   - Créer un handler dans le dossier approprié

### Validation du username

Le système valide que le username :

- Contient entre 3 et 30 caractères
- Ne contient que des lettres, chiffres et underscores
- Est unique dans la base de données

## Base de données

### Gestion unifiée de la base de données

Le projet utilise maintenant une gestion centralisée de la base de données :

- **`core/Database.php`** : Classe singleton pour la connexion (pattern Singleton)
- **`config/app.php`** : Configuration centralisée des paramètres DB
- **`core/Model.php`** : Classe de base qui utilise Database
- **`Login_Signup/db_connection.php`** : Fichier de compatibilité qui utilise la classe Database

### Avantages de cette approche

1. **Une seule instance de connexion** : Évite les connexions multiples
2. **Configuration centralisée** : Tous les paramètres dans `config/app.php`
3. **Gestion d'erreurs unifiée** : Pattern cohérent dans toute l'application
4. **Compatibilité maintenue** : Les anciens scripts continuent de fonctionner

### Nouvelle colonne username

La table `users` a été mise à jour avec :

```sql
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
```

### Migration

Exécutez le script [`database_update_username.sql`](database_update_username.sql) pour :

- Ajouter la colonne username
- Générer des usernames pour les utilisateurs existants
- Ajouter les contraintes d'unicité

## Test

Vérifiez manuellement que :


- Toutes les classes se chargent correctement
- La connexion à la base de données fonctionne
- La colonne username existe
- Les méthodes de validation fonctionnent
- Tous les fichiers MVC sont présents

## Compatibilité

Les anciens fichiers PHP continuent de fonctionner car ils redirigent automatiquement vers les versions MVC. Cependant, il est recommandé de mettre à jour le code frontend pour utiliser directement les nouveaux endpoints MVC.

## Frontend mis à jour

Les fichiers JavaScript suivants ont été mis à jour :

- `auth.js` : Utilise les endpoints MVC
- `user_home.js` : Affiche le username et utilise les endpoints MVC
- `home.js` : Utilise les endpoints MVC pour la vérification de session

### Réinitialisation de mot de passe

Le système inclut maintenant une fonctionnalité de réinitialisation de mot de passe :

- **Validation** : Vérifie l'email et le numéro de téléphone
- **Sécurité** : Supprime le compte permettant une réinscription
- **Session** : Déconnecte automatiquement l'utilisateur si c'est son propre compte
- **Endpoint MVC** : `password_manager_mvc.php`

## Système de Recherche CV Avancé

### Recherche Multi-Mots-Clés

Le système de recherche CV a été amélioré avec une fonctionnalité de recherche multi-mots-clés :

- **Recherche entre guillemets** : `"java" "mysql" "spring"`
- **Expressions multi-mots** : `"machine learning" "data science"`
- **Compatibilité ascendante** : Recherche classique toujours supportée
- **Architecture MVC** : Intégration complète avec le système MVC
- **Performance optimisée** : Recherche rapide dans toutes les sections CV

### Fonctionnalités

- **Recherche intelligente** : Parse automatiquement les mots-clés entre guillemets
- **Score de pertinence** : Classement par fréquence d'occurrence
- **Filtres avancés** : Localisation, compétences, expérience
- **Interface responsive** : Optimisée pour mobile et desktop
- **API RESTful** : Endpoints clairs pour intégration

### Utilisation

```javascript
// Exemple de recherche
"java" "spring boot" "microservices"
"web development" "react" "nodejs"
"machine learning" "python" "tensorflow"
```

### Points d'accès

- **Interface principale** : `/cv_search_system/cv_search_interface.html`
- **Page de test** : `/cv_search_system/test_multi_keywords.html`
- **API Handler** : `/cv_search_system/search_handler_mvc.php`

