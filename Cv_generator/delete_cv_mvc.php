<?php

// Suppress any output before JSON response
ob_start();

// Error handling setup
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug_delete_cv_errors.log');

try {
    require_once __DIR__ . '/../core/bootstrap.php';
    require_once __DIR__ . '/../app/Controllers/CVController.php';

    // Clear any output buffer before calling the controller
    if (ob_get_level()) {
        ob_clean();
    }

    $controller = new CVController();
    $controller->deleteCV();

} catch (Exception $e) {
    // Clear any output buffer
    if (ob_get_level()) {
        ob_clean();
    }
    
    error_log("Delete CV Error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error during CV deletion: ' . $e->getMessage()
    ]);
} catch (Error $e) {
    // Clear any output buffer
    if (ob_get_level()) {
        ob_clean();
    }
    
    error_log("Delete CV Fatal Error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Fatal server error during CV deletion'
    ]);
}

// End output buffering
if (ob_get_level()) {
    ob_end_flush();
}
?>
