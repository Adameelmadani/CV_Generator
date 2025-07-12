# Système d'Authentification CV Generator

## Vue d'ensemble

Le système d'authentification comprend deux types d'accès :

### 1. Authentification Utilisateur Standard
- **Accès** : Bouton "Se connecter" sur la page d'accueil
- **URL** : `auth.html`
- **Fonctionnalités** : 
  - Connexion (Sign In)
  - Inscription (Sign Up)
  - Gestion des comptes utilisateurs

### 2. Authentification RH (Ressources Humaines)
- **Accès** : Bouton "Espace RH" sur la page d'accueil
- **URL** : `auth.html#rhLoginForm`
- **Fonctionnalités** :
  - Connexion uniquement (Sign In seulement)
  - Accès au portail RH pour la recherche de candidats

## Configuration

### Credentials RH
Les credentials RH sont stockés dans le fichier `rh.env` :

```
RH_EMAIL=rh@gmail.com
RH_PASSWORD=motdepasse123
```

⚠️ **Important** : Changez ces credentials en production !

### Test des Credentials
Pour tester la configuration RH :
```bash
php test_rh_credentials.php
```

## Flux d'Utilisation

### Pour les Utilisateurs Standards
1. Cliquer sur "Se connecter" dans `main_page.html`
2. Redirection vers `auth.html`
3. Choisir entre "Se connecter" ou "S'inscrire"
4. Après authentification → redirection vers `Cv_generator/user_home.html`

### Pour les RH
1. Cliquer sur "Espace RH" dans `main_page.html`
2. Redirection vers `auth.html#rhLoginForm`
3. Section RH s'affiche automatiquement
4. Saisir les credentials RH
5. Après authentification → redirection vers `rh/index.html`

## Navigation

### Depuis les Sections Normales vers RH
- Lien "Accéder à l'espace RH" en bas de page

### Depuis la Section RH vers les Sections Normales
- Lien "← Retour à la connexion utilisateur"

## Sécurité

- Les sessions RH sont séparées des sessions utilisateurs
- Les credentials RH sont stockés dans un fichier `.env` séparé
- Validation côté serveur pour tous les formulaires

## Fichiers Principaux

- `auth.html` : Page d'authentification principale
- `auth.js` : Logique JavaScript pour l'authentification
- `auth_style.css` : Styles pour l'interface
- `rh_login_handler_mvc.php` : Gestionnaire de connexion RH
- `login_handler_mvc.php` : Gestionnaire de connexion utilisateur
- `signup_handler_mvc.php` : Gestionnaire d'inscription utilisateur
- `rh.env` : Configuration des credentials RH 