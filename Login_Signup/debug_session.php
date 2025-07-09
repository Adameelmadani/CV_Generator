<?php
// Debug endpoint to check session status
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$sessionData = [
    'session_status' => session_status(),
    'session_id' => session_id(),
    'session_name' => session_name(),
    'session_data' => $_SESSION,
    'cookie_params' => session_get_cookie_params(),
    'php_session_id' => session_id()
];

echo json_encode([
    'status' => 'success',
    'message' => 'Session debug info',
    'data' => $sessionData
], JSON_PRETTY_PRINT);
?>
