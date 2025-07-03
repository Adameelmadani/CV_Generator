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

// Connect to database
require_once('../db_connection.php');

try {
    // Find the user with the given token
    $stmt = $pdo->prepare("SELECT auth_id FROM auth WHERE token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        $response['errors']['general'] = 'Invalid or expired token';
        echo json_encode($response);
        exit;
    }
    
    // Hash the new password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Update the user's password and clear the token
    $stmt = $pdo->prepare("UPDATE auth SET mot_de_passe = ?, token = NULL WHERE auth_id = ?");
    $stmt->execute([$hashedPassword, $user['auth_id']]);
    
    $response['success'] = true;
    $response['message'] = 'Password has been successfully reset';
} catch (PDOException $e) {
    $response['errors']['general'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>