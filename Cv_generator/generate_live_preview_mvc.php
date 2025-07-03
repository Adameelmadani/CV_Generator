<?php

// Suppress all output until we're ready to send JSON
ob_start();

// Turn on error reporting but don't display errors
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug_live_preview_errors.log');

try {
    require_once __DIR__ . '/../core/bootstrap.php';

    $controller = new CVController();
    
    // Clear any accumulated output before calling the method
    if (ob_get_level()) {
        ob_clean();
    }
    
    // Call the method (it will handle its own JSON output)
    $controller->generateLivePreview();
    
} catch (Exception $e) {
    // Clear any output and return clean JSON error
    if (ob_get_level()) {
        ob_clean();
    }
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
} catch (Error $e) {
    // Handle fatal errors
    if (ob_get_level()) {
        ob_clean();
    }
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Fatal error: ' . $e->getMessage()
    ]);
}

// End output buffering
if (ob_get_level()) {
    ob_end_flush();
}
