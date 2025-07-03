<?php

require_once __DIR__ . '/core/Router.php';

// Define CV routes
Router::get('/api/cv/list', 'CVController', 'getUserCVs');
Router::get('/api/cv/data', 'CVController', 'getCVData');
Router::get('/api/cv/edit', 'CVController', 'getCVForEdit');
Router::post('/api/cv/delete', 'CVController', 'deleteCV');
Router::post('/api/cv/generate', 'CVController', 'generateCV');
Router::post('/api/cv/import', 'CVController', 'importCV');
Router::get('/api/cv/download', 'CVController', 'downloadCV');
Router::post('/api/cv/download', 'CVController', 'downloadCV');
Router::post('/api/cv/preview', 'CVController', 'generatePreview');
Router::post('/api/cv/live-preview', 'CVController', 'generateLivePreview');

// Handle the request
Router::handleRequest();
