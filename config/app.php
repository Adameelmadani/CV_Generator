<?php

return [
    'database' => [
        'host' => 'localhost',
        'dbname' => 'cv_generator',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4'
    ],
    
    'app' => [
        'name' => 'CV Generator',
        'version' => '2.0.0',
        'debug' => true
    ],
    
    'paths' => [
        'uploads' => __DIR__ . '/../Cv_generator/uploads/',
        'templates' => __DIR__ . '/../Cv_generator/templates/',
        'tmp' => __DIR__ . '/../tmp/'
    ],
    
    'security' => [
        'max_file_size' => 5 * 1024 * 1024, // 5MB
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'xml']
    ]
];
