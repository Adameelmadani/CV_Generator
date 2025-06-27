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

session_start();

// Get the form data
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$rememberMe = $data['rememberMe'] ?? false;

// Basic validation
$response = ['success' => false, 'errors' => []];

if (empty($email)) {
    $response['errors']['email'] = 'Email is required';
}

if (empty($password)) {
    $response['errors']['password'] = 'Password is required';
}

// If there are validation errors, return them
if (!empty($response['errors'])) {
    echo json_encode($response);
    exit;
}

// Connect to database
require_once('../db_connection.php');

try {
    // Prepare SQL statement to find user by email
    $stmt = $pdo->prepare("SELECT id, email, first_name, last_name, hashed_password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify if user exists and password is correct
    if ($user && password_verify($password, $user['hashed_password'])) {
        // Password is correct - create session
        $_SESSION['user'] = [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'loggedIn' => true
        ];
        
        if ($rememberMe) {
            // Set a cookie that expires in 30 days
            setcookie('remember_user', $email, time() + (86400 * 30), '/');
        }
        
        $response['success'] = true;
        $response['redirect'] = '/dashboard';
        $response['user'] = [
            'firstName' => $user['first_name'],
            'lastName' => $user['last_name'],
            'email' => $user['email']
        ];
    } else {
        // Invalid login
        $response['errors']['general'] = 'Invalid email or password';
    }
} catch (PDOException $e) {
    $response['errors']['general'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>