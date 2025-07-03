<?php

// Load configuration
$config = require_once __DIR__ . '/../config/app.php';

// Autoloader for classes
spl_autoload_register(function ($className) {
    $paths = [
        __DIR__ . '/',
        __DIR__ . '/../app/Models/',
        __DIR__ . '/../app/Controllers/'
    ];
    
    foreach ($paths as $path) {
        $file = $path . $className . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Include core classes
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Model.php';
require_once __DIR__ . '/Controller.php';
require_once __DIR__ . '/Router.php';

// Make config globally available
if (!defined('APP_CONFIG')) {
    define('APP_CONFIG', $config);
}
