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

// Connect to database
require_once('../db_connection.php');

try {
    // Check if the email exists
    $stmt = $pdo->prepare("SELECT auth_id FROM auth WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Generate a secure token
        $token = bin2hex(random_bytes(32));
        
        // Store the token in the database
        $stmt = $pdo->prepare("UPDATE auth SET token = ? WHERE auth_id = ?");
        $stmt->execute([$token, $user['auth_id']]);
        
        // In a real application, send an email with the reset link
        // For this example, we'll simulate that step
        
        $response['success'] = true;
        $response['message'] = 'Password reset email sent successfully';
    } else {
        // We don't want to reveal if an email exists or not for security reasons
        // So we'll still return success even if email doesn't exist
        $response['success'] = true;
        $response['message'] = 'If your email exists in our system, you will receive a password reset link';
    }
} catch (PDOException $e) {
    $response['errors']['general'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>