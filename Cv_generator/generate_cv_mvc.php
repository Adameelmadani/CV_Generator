<?php

// Suppress all output until we're ready to send JSON
ob_start();

// Turn off error display but keep error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
// ini_set('error_log', __DIR__ . '/debug_cv_generation_errors.log'); // Disabled debug logging

require_once __DIR__ . '/../core/bootstrap.php';
require_once __DIR__ . '/../app/Controllers/CVController.php';

// Add comprehensive logging
error_log("=== CV Generation Request Started ===");
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request URI: " . $_SERVER['REQUEST_URI']);
error_log("User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'));
error_log("Session ID: " . session_id());
error_log("Session Status: " . session_status());

// Enhanced AJAX detection
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
          strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Check for Accept header containing application/json
$acceptsJson = isset($_SERVER['HTTP_ACCEPT']) && 
               strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

// Check for fetch requests (modern browsers)
$isFetch = isset($_SERVER['HTTP_SEC_FETCH_MODE']) && 
           $_SERVER['HTTP_SEC_FETCH_MODE'] === 'cors';

// Additional check: if it's a POST request and not from a form submission
$isPostNotForm = $_SERVER['REQUEST_METHOD'] === 'POST' && 
                 (!isset($_SERVER['HTTP_REFERER']) || 
                  strpos($_SERVER['HTTP_REFERER'], 'home.html') !== false);

// Log the request for debugging
error_log("CV Generation Request - AJAX: " . ($isAjax ? 'true' : 'false') . 
          ", JSON Accept: " . ($acceptsJson ? 'true' : 'false') . 
          ", Fetch: " . ($isFetch ? 'true' : 'false') .
          ", POST not form: " . ($isPostNotForm ? 'true' : 'false'));

// If this is NOT an AJAX/Fetch request, redirect back to the form
// Re-enable this check now that we've fixed the frontend
if (!$isAjax && !$acceptsJson && !$isFetch) {
    error_log("Non-AJAX request detected, redirecting to home.html");
    header('Location: home.html?error=invalid_submission');
    exit();
}

try {
    error_log("Creating CVController instance...");
    $controller = new CVController();
    error_log("CVController created, calling generateCV...");
    
    // Add debug info about POST data
    error_log("POST data keys: " . implode(', ', array_keys($_POST)));
    error_log("POST data sample: " . json_encode(array_slice($_POST, 0, 5, true)));
    
    // Clear any output buffer before calling the method
    if (ob_get_level()) {
        ob_clean();
    }
    
    $controller->generateCV();
    error_log("=== CV Generation Request Completed Successfully ===");
} catch (Exception $e) {
    // Clear any output buffer
    if (ob_get_level()) {
        ob_clean();
    }
    
    error_log("CV Generation Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la génération du CV. Veuillez réessayer.',
        'debug' => $e->getMessage() // Add debug info
    ]);
} catch (Error $e) {
    // Clear any output buffer
    if (ob_get_level()) {
        ob_clean();
    }
    
    error_log("CV Generation Fatal Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la génération du CV. Veuillez réessayer.',
        'debug' => $e->getMessage() // Add debug info
    ]);
}

// End output buffering
if (ob_get_level()) {
    ob_end_flush();
}
