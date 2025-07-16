# Logs du Système de Recherche CV

Ce dossier contient les fichiers de log du système de recherche CV.

## Types de logs

- `search_queries.log` : Historique des requêtes de recherche
- `audit.log` : Logs d'audit système
- `errors.log` : Erreurs système

## Configuration

Les logs sont configurés dans `cv_search_config.php` :

```php
define('LOG_QUERIES', true);
define('LOG_FILE', __DIR__ . '/logs/search_queries.log');
define('AUDIT_LOG_ENABLED', true);
define('AUDIT_LOG_FILE', __DIR__ . '/logs/audit.log');
```

## Permissions

Assurez-vous que ce dossier a les permissions d'écriture pour le serveur web.
