
<?php
// Add CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the request data
$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? '';
$password = $data['password'] ?? '';
$confirmPassword = $data['confirmPassword'] ?? '';

// Initialize response
$response = ['success' => false, 'errors' => []];

// Validate token
if (empty($token)) {
    $response['errors']['general'] = 'Invalid or expired token';
    echo json_encode($response);
    exit;
}

// Validate password
if (empty($password)) {
    $response['errors']['password'] = 'Password is required';
}

if (strlen($password) < 8) {
    $response['errors']['password'] = 'Password must be at least 8 characters';
}

// Check that passwords match
if ($password !== $confirmPassword) {
    $response['errors']['confirmPassword'] = 'Passwords do not match';
}

// If there are validation errors, return them
if (!empty($response['errors'])) {
    echo json_encode($response);
    exit;
}

// Here you would:
// 1. Validate the token in your database
// 2. Check if it's expired
// 3. Update the user's password
// 4. Invalidate the token so it can't be used again

// For this example, we'll simulate a successful password reset
$response['success'] = true;
$response['message'] = 'Password has been successfully reset';

echo json_encode($response);
?>