# 🔍 Système de Recherche CV

Ce système de recherche de CV est spécialement adapté à votre base de données existante `cv_craft`.

## 📋 Fichiers du système

| Fichier | Description |
|---------|-------------|
| `cv_search_config.php` | Configuration du système (BDD, paramètres) |
| `cv_search_system.php` | Système principal de recherche et API |
| `cv_search_example.php` | Exemples d'utilisation et tests |
| `cv_search_interface.html` | Interface web pour les recruteurs |

## 🚀 Installation et Configuration

### 1. Vérification de la base de données

Assurez-vous que votre base de données `cv_craft` est active avec les tables suivantes :
- `cvs` (CVs principaux)
- `informations_personnelles` (informations personnelles)
- `competences` (compétences)
- `experiences` (expériences professionnelles)
- `formations` (formations)
- `projets` (projets)
- `certificats` (certificats)
- `langues` (langues)
- `profils` (profils professionnels)
- `utilisateurs` (utilisateurs)

### 2. Configuration

Modifiez `cv_search_config.php` si nécessaire :

```php
// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'cv_craft');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### 3. Test du système

Exécutez le fichier de test :

```bash
php cv_search_example.php
```

## 🔧 Utilisation

### Interface Web

Ouvrez dans votre navigateur :
```
http://localhost/CV_Generator/cv_search_interface.html
```

#### Actions disponibles :
- **Recherche** : Tapez un mot-clé et cliquez sur "Rechercher"
- **Aperçu CV** : Cliquez sur "👁️ Voir l'aperçu" pour voir le CV formaté
- **Données brutes** : Cliquez sur "📋 Données" pour les informations structurées
- **Clic sur carte** : Cliquez n'importe où sur une carte CV pour l'aperçu rapide

### Utilisation en PHP

```php
require_once 'cv_search_system.php';

$search = new CVSearchSystemAdapted();

// Recherche simple
$results = $search->searchByKeyword('Java');

// Recherche avec filtres
$results = $search->searchByKeyword('Python', 25, [
    'ville' => 'Paris',
    'competences_requises' => ['PHP', 'MySQL']
]);

// Statistiques
$stats = $search->getGeneralStats();
```

### API JSON

Envoyez une requête POST à `cv_search_system.php` :

```javascript
fetch('cv_search_system.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        keyword: 'développeur',
        limit: 10,
        filters: {
            ville: 'Lyon',
            competences_requises: ['PHP', 'JavaScript']
        }
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🎯 Fonctionnalités

### Recherche Optimisée pour l'Utilisateur

Le système a été conçu pour une **expérience utilisateur optimale** :

#### 🔍 **Recherche Rapide**
- **Résultats simplifiés** : Affichage uniquement des informations essentielles
- **Vue d'ensemble** : Nom du CV, auteur, email, localisation, compétence principale
- **Performance** : Chargement instantané de la liste des résultats

#### 📋 **Informations Affichées dans la Liste**
- **Nom du CV** : Titre du CV
- **Nom complet** : Nom et prénom du candidat
- **Email** : Contact direct
- **Localisation** : Ville/région
- **Compétence principale** : Aperçu des compétences
- **Occurrences** : Nombre de fois où le mot-clé apparaît
- **Date de création** : Fraîcheur du CV

#### 👁️ **Aperçu Visuel sur Demande**
- **Clic pour l'aperçu** : Accès direct à l'aperçu visuel du CV (PDF)
- **Nouvel onglet** : Ouverture dans un nouvel onglet pour faciliter la navigation
- **Intégration native** : Utilise le système d'aperçu existant du générateur de CV
- **Données brutes** : Bouton secondaire pour accéder aux données structurées si nécessaire

#### 🔄 **Navigation Optimisée**
- **Deux options d'affichage** : 
  - **"Voir l'aperçu"** (principal) : Affichage visuel du CV
  - **"Données"** (secondaire) : Informations structurées dans une modal
- **Expérience fluide** : Retour facile à la liste de recherche
- **Interface intuitive** : Actions claires et accessibles

### Recherche Multi-Sections

Le système recherche dans toutes les sections du CV :
- ✅ Informations personnelles (nom, prénom, email, localisation)
- ✅ Compétences (nom, catégorie)
- ✅ Expériences (poste, entreprise, description)
- ✅ Formations (diplôme, université, spécialité)
- ✅ Projets (nom, description)
- ✅ Certificats (nom, organisme, description)
- ✅ Profils (description professionnelle)
- ✅ Langues (langue, niveau)

### Calcul de Fréquence

Le système calcule les occurrences exactes des mots-clés avec les caractéristiques suivantes :

- **🎯 Recherche de mots entiers uniquement** : 
  - Utilise des expressions régulières avec `\b` (word boundary) 
  - Ne trouve que les mots complets, pas les sous-chaînes
  
- **📝 Exemples concrets** :
  - Recherche `"java"` → trouve `"java"` mais **PAS** `"javascript"`
  - Recherche `"script"` → trouve `"script"` dans `"javascript"` et `"scripts"`
  - Recherche `"PHP"` → trouve `"PHP"` mais **PAS** `"PHPUnit"`
  - Recherche `"React"` → trouve `"React"` mais **PAS** `"ReactJS"`

- **✅ Avantages** :
  - **Précision maximale** : Évite les faux positifs
  - **Comptage exact** : Chaque mot entier est compté une seule fois
  - **Accumulation correcte** : Les occurrences de toutes les sections sont additionnées
  - **Insensible à la casse** : `"Java"` et `"java"` sont équivalents

### Filtres Disponibles

- **Ville** : Filtrer par localisation
- **Compétences requises** : Filtrer par compétences spécifiques
- **Limite** : Nombre maximum de résultats

## 📊 Statistiques

Le système fournit des statistiques détaillées :
- Nombre total de CVs trouvés
- Fréquence moyenne des mots-clés
- Fréquence maximale
- Temps d'exécution
- Top des compétences
- Top des localisations
- Nombre de CVs par mois

## 🛠️ Structure de Réponse API

### Recherche Simplifiée (par défaut)

```json
{
    "success": true,
    "results": [
        {
            "cv_id": 1,
            "frequency": 5,
            "nom_cv": "CV Développeur Full Stack",
            "nom_complet": "Jean Dupont",
            "email": "jean.dupont@email.com",
            "localisation": "Paris, France",
            "date_creation": "2024-01-15",
            "competence_principale": "JavaScript, React, Node.js"
        }
    ],
    "statistics": {
        "total_cvs": 10,
        "avg_frequency": 3.5,
        "max_frequency": 8,
        "min_frequency": 1
    },
    "execution_time": 0.025,
    "keyword": "Java",
    "filters_applied": {...},
    "timestamp": "2025-07-16 18:00:00"
}
```

### Détails Complets du CV

```javascript
// Requête GET pour les détails
fetch('cv_search_system.php?action=cv_details&cv_id=1')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log(data.cv_details);
    }
  });
```

```json
{
    "success": true,
    "cv_details": {
        "cv_id": 1,
        "frequency": 0,
        "informations_personnelles": {
            "nom": "Dupont",
            "prenom": "Jean",
            "email": "jean.dupont@email.com",
            "localisation": "Paris, France",
            "linkedin": "linkedin.com/in/jeandupont",
            "github": "github.com/jeandupont"
        },
        "competences": [...],
        "experiences": [...],
        "formations": [...],
        "projets": [...],
        "langues": [...],
        "certificats": [...],
        "profil": {...}
    }
}
```

## 🔒 Sécurité

- ✅ Requêtes SQL préparées
- ✅ Validation des données d'entrée
- ✅ Échappement des caractères spéciaux
- ✅ Limitation des résultats
- ✅ Gestion des erreurs

## ⚡ Performance

- ✅ Index sur les colonnes de recherche
- ✅ Requêtes optimisées
- ✅ Limitation des résultats
- ✅ Cache (configurable)
- ✅ Recherche en < 0.1 seconde

## 🎨 Personnalisation

### Modifier la Fonction de Comptage

Dans `cv_search_system.php`, vous pouvez modifier la méthode `countWordOccurrences()` :

```php
private function countWordOccurrences($text, $keyword) {
    // Utilise des regex pour chercher le mot entier seulement
    $pattern = '/\b' . preg_quote($keyword, '/') . '\b/i';
    return preg_match_all($pattern, $text);
}
```

### Ajouter des Synonymes

```php
// Exemple d'extension future pour les synonymes
define('SYNONYMS', [
    'java' => ['java', 'j2ee', 'spring', 'hibernate'],
    'javascript' => ['javascript', 'js', 'node.js', 'react', 'angular'],
    // ... plus de synonymes
]);
```

## 🐛 Dépannage

### Problème de Connexion BDD

Vérifiez la configuration dans `cv_search_config.php` :
- Host correct
- Nom de base de données
- Utilisateur et mot de passe
- Charset

### Aucun Résultat

- Vérifiez que les CVs ont `est_publie = 1`
- Vérifiez l'orthographe des mots-clés
- Essayez des mots-clés plus génériques

### Erreur PHP

- Vérifiez que PHP est installé
- Vérifiez les extensions PDO et MySQL
- Consultez les logs d'erreur

## 📈 Évolutions Futures

- [ ] Recherche par proximité géographique
- [ ] Recherche par plage de salaire
- [ ] Recherche par années d'expérience
- [ ] Notifications de nouveaux CVs
- [ ] Export des résultats (PDF, Excel)
- [ ] Intégration IA pour améliorer la recherche
- [ ] Recherche vocale
- [ ] Recherche par image (photo de profil)

## 🤝 Support

Pour toute question ou problème, consultez :
1. Ce fichier README
2. Les exemples dans `cv_search_example.php`
3. Les commentaires dans le code
4. Les logs d'erreur PHP

---

**Dernière mise à jour :** 16 juillet 2025  
**Version :** 1.0.0  
**Compatible avec :** PHP 7.4+, MySQL 5.7+
