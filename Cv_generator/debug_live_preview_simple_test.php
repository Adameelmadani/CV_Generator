<?php
// Simple debug endpoint to test live preview functionality
session_start();

// Set test user session if not set
if (!isset($_SESSION['userId'])) {
    $_SESSION['userId'] = 1;
}

// Debug info
header('Content-Type: application/json');

try {
    echo json_encode([
        'debug' => 'Starting live preview test',
        'session_user_id' => $_SESSION['userId'] ?? 'not set',
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
