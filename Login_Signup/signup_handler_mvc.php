<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

try {
    require_once __DIR__ . '/../core/bootstrap.php';
    require_once __DIR__ . '/../app/Controllers/AuthController.php';

    $authController = new AuthController();
    $authController->signup();
} catch (Exception $e) {
    error_log("Signup Handler Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur serveur. Veuillez réessayer.'
    ]);
} catch (Error $e) {
    error_log("Signup Handler Fatal Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur serveur. Veuillez réessayer.'
    ]);
}