<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

require_once __DIR__ . '/../core/bootstrap.php';
require_once __DIR__ . '/../app/Controllers/FiliereController.php';

header('Content-Type: application/json');

try {
    $controller = new FiliereController();
    
    $action = $_GET['action'] ?? 'getAllFilieres';
    
    switch ($action) {
        case 'getAllFilieres':
            $controller->getAllFilieres();
            break;
        case 'getFiliereById':
            $controller->getFiliereById();
            break;
        default:
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Action not found'
            ]);
            break;
    }
    
} catch (Exception $e) {
    error_log("Error in filiere endpoint: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error'
    ]);
} catch (Error $e) {
    error_log("Fatal error in filiere endpoint: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error'
    ]);
}
