<?php

define('APP_CONFIG', [
    'database' => [
        'host' => 'localhost',
        'dbname' => 'cv_craft',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4'
    ],
    'app' => [
        'name' => 'CV Craft',
        'version' => '2.0',
        'timezone' => 'Europe/Paris'
    ],
    'session' => [
        'name' => 'CV_CRAFT_SESSION',
        'lifetime' => 3600 * 24 * 7, // 7 days
        'secure' => false,
        'httponly' => true
    ]
]);

// Set timezone
date_default_timezone_set(APP_CONFIG['app']['timezone']);
