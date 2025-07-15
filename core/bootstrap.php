<?php

// Set the default timezone for the entire application
// Morocco uses GMT+1 (CET) during winter and GMT+1 (no DST since 2018)
date_default_timezone_set('Africa/Casablanca');

// Load configuration
require_once __DIR__ . '/../config/app.php';

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
