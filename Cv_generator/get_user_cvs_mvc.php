<?php

// Prevent any output before JSON response
ob_start();

// Suppress PHP notices and warnings from being displayed
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 0);

try {
    require_once __DIR__ . '/../core/bootstrap.php';

    $controller = new CVController();
    $controller->getUserCVs();
    
} catch (Exception $e) {
    // Clear any output buffer
    ob_clean();
    
    // Log the error
    error_log("Error in get_user_cvs_mvc.php: " . $e->getMessage());
    
    // Send proper JSON error response
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error',
        'debug' => [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
} catch (Error $e) {
    // Handle fatal errors
    ob_clean();
    
    error_log("Fatal error in get_user_cvs_mvc.php: " . $e->getMessage());
    
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Fatal server error',
        'debug' => [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}

// Flush output buffer
ob_end_flush();
