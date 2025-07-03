<?php
session_start();
header('Content-Type: application/json');

// Debug session information
$debug_info = [
    'session_id' => session_id(),
    'session_data' => $_SESSION,
    'user_id' => $_SESSION['userId'] ?? null,
    'session_status' => session_status(),
    'cookie_params' => session_get_cookie_params(),
    'server_info' => [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
        'HTTP_X_REQUESTED_WITH' => $_SERVER['HTTP_X_REQUESTED_WITH'] ?? null,
        'HTTP_ACCEPT' => $_SERVER['HTTP_ACCEPT'] ?? null,
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? null,
        'PHP_SELF' => $_SERVER['PHP_SELF'] ?? null
    ]
];

echo json_encode($debug_info, JSON_PRETTY_PRINT);
exit();
?>
