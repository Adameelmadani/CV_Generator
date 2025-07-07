<?php

// Prevent any output before JSON response
ob_start();

// Suppress PHP notices and warnings from being displayed
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', 0);

try {
    require_once __DIR__ . '/../core/bootstrap.php';

    $controller = new CVController();
    $controller->clearCVSession();
    
} catch (Exception $e) {
    // Clear any output buffer
    ob_clean();
    
    // Log the error
    error_log("Error in clear_cv_session_mvc.php: " . $e->getMessage());
    
    // Send proper JSON error response
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>
