<?php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../core/bootstrap.php';
    require_once __DIR__ . '/../app/Controllers/AuthController.php';

    $authController = new AuthController();
    $authController->checkSession();
} catch (Exception $e) {
    error_log("Check Session Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'logged_in' => false,
        'message' => 'Erreur serveur. Veuillez réessayer.'
    ]);
} catch (Error $e) {
    error_log("Check Session Fatal Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'logged_in' => false,
        'message' => 'Erreur serveur. Veuillez réessayer.'
    ]);
}
