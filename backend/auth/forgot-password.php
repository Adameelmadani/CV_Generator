<?php
// Add these CORS headers at the top
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

// Get the form data
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';

// Basic validation
$response = ['success' => false, 'errors' => []];

if (empty($email)) {
    $response['errors']['email'] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['errors']['email'] = 'Please enter a valid email';
}

// If there are validation errors, return them
if (!empty($response['errors'])) {
    echo json_encode($response);
    exit;
}

// Here you would typically:
// 1. Check if the email exists in your database
// 2. Generate a secure token
// 3. Store the token with an expiry time
// 4. Send an email with a reset link

// For this example, we'll simulate success
$response['success'] = true;
$response['message'] = 'Password reset email sent successfully';

echo json_encode($response);
?>