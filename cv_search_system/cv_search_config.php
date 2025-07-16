<?php
/**
 * Configuration pour le système de recherche de CV
 */

// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'cv_craft');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Configuration de l'API
define('API_TIMEOUT', 30); // secondes
define('DEFAULT_LIMIT', 25);
define('MAX_LIMIT', 100);

// Configuration des logs
define('LOG_QUERIES', true);
define('LOG_FILE', __DIR__ . '/logs/search_queries.log');

// Configuration des performances
define('CACHE_ENABLED', false);
define('CACHE_DURATION', 300); // 5 minutes

// Configuration de sécurité
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_REQUESTS', 100); // requêtes par heure
define('RATE_LIMIT_WINDOW', 3600); // 1 heure

// Configuration des mots-clés
define('MIN_KEYWORD_LENGTH', 2);
define('MAX_KEYWORD_LENGTH', 50);

// Stop words (mots à ignorer dans la recherche)
define('STOP_WORDS', [
    'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car',
    'de', 'du', 'des', 'dans', 'sur', 'avec', 'par', 'pour', 'sans', 'sous',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'mon', 'ma', 'mes',
    'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre', 'leur', 'leurs',
    'ce', 'cette', 'ces', 'cet', 'qui', 'que', 'quoi', 'dont', 'où', 'quand',
    'comment', 'pourquoi', 'est', 'sont', 'était', 'étaient', 'être', 'avoir',
    'a', 'ai', 'as', 'avons', 'avez', 'ont', 'très', 'plus', 'moins', 'bien',
    'mal', 'beaucoup', 'peu', 'assez', 'trop', 'encore', 'déjà', 'jamais',
    'toujours', 'souvent', 'parfois', 'aussi', 'ainsi', 'alors', 'après',
    'avant', 'pendant', 'depuis', 'jusqu', 'vers', 'chez', 'entre', 'parmi'
]);

// Configuration du scoring
define('SCORING_WEIGHTS', [
    'personal_info' => 1.0,
    'skills' => 2.0,
    'experience' => 1.8,
    'education' => 1.5,
    'projects' => 1.7,
    'languages' => 1.3,
    'certificates' => 1.6,
    'profile' => 1.4
]);

// Configuration des formats de sortie
define('OUTPUT_FORMATS', ['json', 'xml', 'csv']);
define('DEFAULT_OUTPUT_FORMAT', 'json');

// Configuration des emails (pour les notifications)
define('EMAIL_ENABLED', false);
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', '');
define('SMTP_PASSWORD', '');
define('FROM_EMAIL', 'no-reply@cv-generator.com');
define('FROM_NAME', 'CV Generator');

// Configuration des exports
define('EXPORT_ENABLED', true);
define('EXPORT_FORMATS', ['pdf', 'excel', 'word']);
define('EXPORT_PATH', __DIR__ . '/exports/');

// Configuration de debug
define('DEBUG_MODE', true);
define('DEBUG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR

// Configuration des notifications
define('WEBHOOK_URL', '');
define('WEBHOOK_ENABLED', false);

// Configuration des statistiques
define('STATS_ENABLED', true);
define('STATS_RETENTION_DAYS', 30);

// Configuration de l'interface
define('UI_THEME', 'default');
define('UI_LANGUAGE', 'fr');
define('UI_PAGINATION', 25);

// Configuration des filtres avancés
define('ADVANCED_FILTERS', [
    'age_range' => ['min' => 18, 'max' => 65],
    'salary_range' => ['min' => 0, 'max' => 200000],
    'experience_range' => ['min' => 0, 'max' => 40],
    'education_levels' => ['BAC', 'BAC+2', 'BAC+3', 'BAC+5', 'PHD'],
    'contract_types' => ['CDI', 'CDD', 'STAGE', 'FREELANCE', 'INTERIM'],
    'availability' => ['IMMEDIATELY', 'WITHIN_MONTH', 'WITHIN_3_MONTHS', 'NEGOTIABLE']
]);

// Configuration des synonymes pour améliorer la recherche
define('SYNONYMS', [
    'java' => ['java', 'j2ee', 'spring', 'hibernate'],
    'javascript' => ['javascript', 'js', 'node.js', 'nodejs', 'react', 'angular', 'vue'],
    'python' => ['python', 'django', 'flask', 'pandas', 'numpy'],
    'php' => ['php', 'symfony', 'laravel', 'codeigniter'],
    'database' => ['database', 'db', 'mysql', 'postgresql', 'mongodb', 'sql'],
    'mobile' => ['mobile', 'android', 'ios', 'react native', 'flutter'],
    'web' => ['web', 'html', 'css', 'bootstrap', 'responsive'],
    'devops' => ['devops', 'docker', 'kubernetes', 'aws', 'azure', 'gcp'],
    'ai' => ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'ml', 'dl'],
    'security' => ['security', 'cybersecurity', 'penetration testing', 'encryption']
]);

// Configuration des messages d'erreur
define('ERROR_MESSAGES', [
    'DB_CONNECTION_FAILED' => 'Impossible de se connecter à la base de données',
    'INVALID_KEYWORD' => 'Mot-clé invalide',
    'KEYWORD_TOO_SHORT' => 'Le mot-clé doit contenir au moins ' . MIN_KEYWORD_LENGTH . ' caractères',
    'KEYWORD_TOO_LONG' => 'Le mot-clé ne peut pas dépasser ' . MAX_KEYWORD_LENGTH . ' caractères',
    'RATE_LIMIT_EXCEEDED' => 'Trop de requêtes, veuillez réessayer plus tard',
    'INVALID_FILTERS' => 'Filtres invalides',
    'NO_RESULTS' => 'Aucun résultat trouvé',
    'SEARCH_FAILED' => 'Erreur lors de la recherche',
    'EXPORT_FAILED' => 'Erreur lors de l\'export',
    'INVALID_FORMAT' => 'Format de sortie invalide'
]);

// Configuration des messages de succès
define('SUCCESS_MESSAGES', [
    'SEARCH_COMPLETED' => 'Recherche terminée avec succès',
    'EXPORT_COMPLETED' => 'Export terminé avec succès',
    'CACHE_CLEARED' => 'Cache vidé avec succès',
    'STATS_UPDATED' => 'Statistiques mises à jour'
]);

// Configuration des couleurs pour l'interface
define('UI_COLORS', [
    'primary' => '#667eea',
    'secondary' => '#764ba2',
    'success' => '#28a745',
    'warning' => '#ffc107',
    'error' => '#dc3545',
    'info' => '#17a2b8',
    'light' => '#f8f9fa',
    'dark' => '#343a40'
]);

// Configuration des icônes
define('ICONS', [
    'search' => '🔍',
    'user' => '👤',
    'email' => '📧',
    'phone' => '📞',
    'location' => '📍',
    'company' => '🏢',
    'education' => '🎓',
    'skills' => '🛠️',
    'experience' => '💼',
    'projects' => '🚀',
    'languages' => '🗣️',
    'certificates' => '📜',
    'download' => '⬇️',
    'export' => '📤',
    'stats' => '📊',
    'settings' => '⚙️',
    'success' => '✅',
    'error' => '❌',
    'warning' => '⚠️',
    'info' => 'ℹ️'
]);

// Configuration des formats de date
define('DATE_FORMAT', 'Y-m-d H:i:s');
define('DISPLAY_DATE_FORMAT', 'd/m/Y H:i');
define('TIMEZONE', 'Europe/Paris');

// Configuration des limites
define('MAX_RESULTS_PER_PAGE', 100);
define('MAX_EXPORT_RESULTS', 1000);
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('MAX_QUERY_LENGTH', 1000);

// Configuration des permissions
define('PERMISSIONS', [
    'SEARCH' => 'search',
    'EXPORT' => 'export',
    'STATS' => 'stats',
    'ADMIN' => 'admin'
]);

// Configuration des rôles utilisateur
define('USER_ROLES', [
    'RECRUITER' => 'recruiter',
    'HR_MANAGER' => 'hr_manager',
    'ADMIN' => 'admin'
]);

// Configuration des logs d'audit
define('AUDIT_LOG_ENABLED', true);
define('AUDIT_LOG_FILE', __DIR__ . '/logs/audit.log');
define('AUDIT_LOG_RETENTION_DAYS', 90);

// Configuration de sauvegarde
define('BACKUP_ENABLED', false);
define('BACKUP_PATH', __DIR__ . '/backups/');
define('BACKUP_RETENTION_DAYS', 30);

// Configuration des notifications push
define('PUSH_NOTIFICATIONS_ENABLED', false);
define('PUSH_API_KEY', '');
define('PUSH_API_URL', '');

// Configuration des hooks
define('HOOKS_ENABLED', true);
define('HOOKS', [
    'BEFORE_SEARCH' => 'before_search',
    'AFTER_SEARCH' => 'after_search',
    'BEFORE_EXPORT' => 'before_export',
    'AFTER_EXPORT' => 'after_export'
]);

// Configuration des métriques
define('METRICS_ENABLED', true);
define('METRICS_PROVIDER', 'internal'); // internal, prometheus, statsd

// Configuration du cache Redis (si activé)
define('REDIS_HOST', 'localhost');
define('REDIS_PORT', 6379);
define('REDIS_PASSWORD', '');
define('REDIS_DATABASE', 0);

// Configuration Elasticsearch (si activé)
define('ELASTICSEARCH_ENABLED', false);
define('ELASTICSEARCH_HOST', 'localhost');
define('ELASTICSEARCH_PORT', 9200);
define('ELASTICSEARCH_INDEX', 'cv_generator');

// Configuration des API externes
define('EXTERNAL_APIs', [
    'linkedin' => [
        'enabled' => false,
        'api_key' => '',
        'api_secret' => ''
    ],
    'indeed' => [
        'enabled' => false,
        'api_key' => ''
    ],
    'glassdoor' => [
        'enabled' => false,
        'api_key' => ''
    ]
]);

// Configuration des templates d'export
define('EXPORT_TEMPLATES', [
    'detailed' => 'Template détaillé avec toutes les informations',
    'summary' => 'Template résumé avec les informations essentielles',
    'contact' => 'Template contact avec uniquement les coordonnées'
]);

// Fonction pour charger la configuration depuis un fichier externe
function loadExternalConfig($configFile) {
    if (file_exists($configFile)) {
        $config = include $configFile;
        if (is_array($config)) {
            foreach ($config as $key => $value) {
                if (!defined($key)) {
                    define($key, $value);
                }
            }
        }
    }
}

// Chargement de la configuration personnalisée si elle existe
loadExternalConfig(__DIR__ . '/config.local.php');

// Configuration des versions
define('API_VERSION', '1.0.0');
define('SYSTEM_VERSION', '1.0.0');
define('LAST_UPDATE', '2024-01-01');

// Configuration des environnements
define('ENVIRONMENT', 'development'); // development, staging, production

// Configuration spécifique à l'environnement
if (ENVIRONMENT === 'production') {
    define('DEBUG_MODE', false);
    define('LOG_QUERIES', false);
    define('CACHE_ENABLED', true);
    define('RATE_LIMIT_ENABLED', true);
} elseif (ENVIRONMENT === 'staging') {
    define('DEBUG_MODE', true);
    define('LOG_QUERIES', true);
    define('CACHE_ENABLED', true);
    define('RATE_LIMIT_ENABLED', false);
}

// Configuration des headers CORS
define('CORS_ENABLED', true);
define('CORS_ORIGIN', '*');
define('CORS_METHODS', 'GET, POST, PUT, DELETE, OPTIONS');
define('CORS_HEADERS', 'Content-Type, Authorization, X-Requested-With');

// Configuration de sécurité avancée
define('SECURITY_HEADERS', [
    'X-Frame-Options' => 'DENY',
    'X-Content-Type-Options' => 'nosniff',
    'X-XSS-Protection' => '1; mode=block',
    'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy' => "default-src 'self'",
    'Referrer-Policy' => 'strict-origin-when-cross-origin'
]);

// Configuration du monitoring
define('MONITORING_ENABLED', true);
define('HEALTH_CHECK_ENDPOINT', '/health');
define('METRICS_ENDPOINT', '/metrics');

// Configuration des tests
define('TESTING_ENABLED', true);
define('TEST_DATABASE', 'cv_generator_test');
define('TEST_DATA_PATH', __DIR__ . '/tests/data/');

// Configuration des migrations
define('MIGRATIONS_ENABLED', true);
define('MIGRATIONS_PATH', __DIR__ . '/migrations/');

// Configuration des seeders
define('SEEDERS_ENABLED', true);
define('SEEDERS_PATH', __DIR__ . '/seeders/');

// Configuration des jobs en arrière-plan
define('BACKGROUND_JOBS_ENABLED', false);
define('QUEUE_DRIVER', 'database'); // database, redis, sqs

// Configuration des notifications par email
define('EMAIL_NOTIFICATIONS', [
    'search_completed' => false,
    'export_ready' => false,
    'system_error' => true,
    'maintenance_mode' => true
]);

// Configuration des limites par utilisateur
define('USER_LIMITS', [
    'searches_per_day' => 1000,
    'exports_per_day' => 50,
    'api_calls_per_hour' => 100
]);

// Configuration des messages d'aide
define('HELP_MESSAGES', [
    'search_tips' => 'Utilisez des mots-clés spécifiques pour de meilleurs résultats',
    'filter_tips' => 'Combinez plusieurs filtres pour affiner votre recherche',
    'export_tips' => 'Limitez le nombre de résultats pour des exports plus rapides'
]);

// Configuration des raccourcis clavier
define('KEYBOARD_SHORTCUTS', [
    'search' => 'Ctrl+F',
    'export' => 'Ctrl+E',
    'clear' => 'Ctrl+R',
    'help' => 'F1'
]);

// Configuration des widgets
define('WIDGETS_ENABLED', true);
define('AVAILABLE_WIDGETS', [
    'search_stats',
    'recent_searches',
    'popular_keywords',
    'system_status'
]);

// Configuration des plugins
define('PLUGINS_ENABLED', true);
define('PLUGINS_PATH', __DIR__ . '/plugins/');

// Configuration des thèmes
define('THEMES_ENABLED', true);
define('THEMES_PATH', __DIR__ . '/themes/');
define('AVAILABLE_THEMES', ['default', 'dark', 'light', 'blue', 'green']);

// Configuration des langues
define('LANGUAGES_ENABLED', true);
define('AVAILABLE_LANGUAGES', ['fr', 'en', 'es', 'de', 'it']);
define('LANGUAGE_PATH', __DIR__ . '/languages/');

// Configuration des rapports
define('REPORTS_ENABLED', true);
define('REPORTS_PATH', __DIR__ . '/reports/');
define('AVAILABLE_REPORTS', [
    'search_analytics',
    'user_activity',
    'system_performance',
    'cv_statistics'
]);

// Configuration des alertes
define('ALERTS_ENABLED', true);
define('ALERT_TYPES', [
    'system_error' => 'error',
    'high_cpu' => 'warning',
    'low_disk' => 'warning',
    'new_cv' => 'info'
]);

// Configuration des intégrations
define('INTEGRATIONS_ENABLED', true);
define('AVAILABLE_INTEGRATIONS', [
    'slack',
    'teams',
    'discord',
    'webhook'
]);

// Configuration des API keys
define('API_KEYS_ENABLED', true);
define('API_KEY_LENGTH', 32);
define('API_KEY_EXPIRY_DAYS', 365);

// Configuration des sessions
define('SESSION_LIFETIME', 3600); // 1 heure
define('SESSION_HANDLER', 'database'); // database, redis, files

// Configuration des cookies
define('COOKIE_SECURE', true);
define('COOKIE_HTTPONLY', true);
define('COOKIE_SAMESITE', 'Strict');

// Configuration du load balancing
define('LOAD_BALANCER_ENABLED', false);
define('LOAD_BALANCER_SERVERS', []);

// Configuration du clustering
define('CLUSTERING_ENABLED', false);
define('CLUSTER_NODES', []);

// Configuration de la géolocalisation
define('GEOLOCATION_ENABLED', false);
define('GEOLOCATION_API_KEY', '');
define('GEOLOCATION_PROVIDER', 'google'); // google, mapbox, opencage

// Configuration des graphiques
define('CHARTS_ENABLED', true);
define('CHARTS_LIBRARY', 'chartjs'); // chartjs, d3, highcharts

// Configuration des exports avancés
define('ADVANCED_EXPORTS', [
    'pdf_template' => 'default',
    'excel_template' => 'default',
    'word_template' => 'default',
    'custom_fields' => true,
    'watermark' => false
]);

// Configuration des webhooks
define('WEBHOOKS_ENABLED', false);
define('WEBHOOK_TIMEOUT', 10); // secondes
define('WEBHOOK_RETRY_COUNT', 3);

// Configuration des crons
define('CRON_ENABLED', true);
define('CRON_JOBS', [
    'cleanup_logs' => '0 0 * * *',
    'backup_database' => '0 2 * * *',
    'update_statistics' => '*/15 * * * *',
    'check_system_health' => '*/5 * * * *'
]);

// Configuration des notifications temps réel
define('REALTIME_NOTIFICATIONS', false);
define('WEBSOCKET_ENABLED', false);
define('WEBSOCKET_PORT', 8080);

// Configuration des A/B tests
define('AB_TESTING_ENABLED', false);
define('AB_TEST_VARIANTS', []);

// Configuration des featured flags
define('FEATURE_FLAGS', [
    'new_search_algorithm' => false,
    'advanced_filters' => true,
    'bulk_operations' => false,
    'ai_recommendations' => false
]);

// Configuration finale
if (!defined('CONFIG_LOADED')) {
    define('CONFIG_LOADED', true);
}
?>
