<?php
require_once __DIR__ . '/../app/Controllers/CVController.php';

// Set JSON content type
header('Content-Type: application/json');

try {
    $controller = new CVController();
    $controller->getFilieres();
} catch (Exception $e) {
    error_log("Error in get_filieres_mvc.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error occurred'
    ]);
}
?>
