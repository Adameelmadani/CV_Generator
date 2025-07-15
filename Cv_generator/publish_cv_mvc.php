<?php
require_once __DIR__ . '/../app/Controllers/CVController.php';

// Set JSON content type
header('Content-Type: application/json');

// Enable error logging for debugging
error_reporting(E_ALL);
ini_set('log_errors', 1);

// Log the incoming request
$input = file_get_contents('php://input');
error_log("publish_cv_mvc.php - Received input: " . $input);
error_log("publish_cv_mvc.php - POST data: " . print_r($_POST, true));
error_log("publish_cv_mvc.php - Session data: " . print_r($_SESSION ?? [], true));

try {
    $controller = new CVController();
    $controller->publishCV();
} catch (Exception $e) {
    error_log("Error in publish_cv_mvc.php: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error occurred: ' . $e->getMessage()
    ]);
}
?>
