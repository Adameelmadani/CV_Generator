# 🔍 Système de Recherche CV

Ce dossier contient tous les fichiers du système de recherche CV avancé pour recruter les meilleurs talents.

## 📁 Structure du Dossier

```
cv_search_system/
├── cv_search_system.php         # Moteur de recherche principal
├── cv_search_interface.html     # Interface utilisateur premium
├── cv_search_config.php         # Configuration système
├── README_CV_SEARCH.md         # Documentation détaillée
├── README.md                   # Ce fichier
├── index.html                  # Page d'accueil du système
└── logs/                       # Dossier des logs
    └── README.md              # Documentation des logs
```

## 🚀 Démarrage Rapide

### 1. **Interface Web (Recommandé)**
```
http://localhost/CV_Generator/cv_search_system/cv_search_interface.html
```

### 2. **API Direct**
```php
<?php
require_once 'cv_search_system.php';

// Recherche simple
$results = searchCV('php', 25);

// Recherche avancée avec filtres
$results = searchCV('javascript', 50, [
    'ville' => 'Paris',
    'competences_requises' => ['react', 'node.js']
]);
?>
```

## ✨ Fonctionnalités Principales

### 🎯 **Recherche Intelligente**
- ✅ Comptage précis des mots-clés (regex word boundaries)
- ✅ Support des synonymes et variations
- ✅ Recherche dans toutes les sections du CV
- ✅ Filtrage par ville et compétences

### 🎨 **Interface Premium**
- ✅ Design ultra-responsive (mobile-first)
- ✅ Animations sophistiquées et micro-interactions
- ✅ Statistiques en temps réel
- ✅ Aperçu CV intégré

### 🔧 **Configuration Avancée**
- ✅ Plus de 50 paramètres configurables
- ✅ Support multi-environnements
- ✅ Logging et monitoring
- ✅ Sécurité renforcée

## 🎪 **Exemples d'Utilisation**

### Recherche de Développeur PHP
```javascript
// Dans l'interface web
searchKeyword: "php"
ville: "Paris"
competences: "symfony, mysql, docker"
```

### Recherche de Designer UX
```javascript
// Dans l'interface web
searchKeyword: "designer"
ville: "Lyon"
competences: "figma, photoshop, ui"
```

## 🔗 **Intégrations**

### Base de Données
- **Base** : `cv_craft`
- **Tables** : `cvs`, `informations_personnelles`, `competences`, etc.
- **Connexion** : PDO avec gestion d'erreurs

### Système Principal
- **Aperçu CV** : `../Cv_generator/view_saved_cv_mvc.php`
- **Authentification** : Intégration avec le système existant
- **Logging** : Logs détaillés des recherches

## 🛠️ **Configuration**

### Variables Principales
```php
// Base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'cv_craft');
define('DB_USER', 'root');
define('DB_PASS', '');

// Limites
define('DEFAULT_LIMIT', 25);
define('MAX_LIMIT', 100);

// Sécurité
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_REQUESTS', 100);
```

## 📊 **Statistiques**

Le système fournit des statistiques en temps réel :
- **Total CVs trouvés**
- **Fréquence moyenne des mots-clés**
- **Fréquence maximale**
- **Temps d'exécution**

## 🔒 **Sécurité**

- ✅ **Protection SQL Injection** : Requêtes préparées
- ✅ **Rate Limiting** : Limitation des requêtes
- ✅ **Validation** : Contrôle des entrées utilisateur
- ✅ **Logging** : Audit des recherches

## 📈 **Performance**

- ✅ **Optimisations SQL** : Index sur les colonnes de recherche
- ✅ **Cache** : Support Redis (optionnel)
- ✅ **Pagination** : Limitation des résultats
- ✅ **Compression** : Minimisation des données

## 🆘 **Support**

Pour toute question ou problème :
1. Consultez `README_CV_SEARCH.md` pour la documentation complète
2. Vérifiez les logs dans `/logs/`
3. Testez directement l'interface web

## 🎯 **Roadmap**

- [ ] Integration Elasticsearch
- [ ] Machine Learning recommendations
- [ ] Export avancé (PDF, Excel)
- [ ] API RESTful complète
- [ ] Dashboard analytics

---

**Dernière mise à jour** : Juillet 2025  
**Version** : 1.0.0  
**Développeur** : Système CV Generator
