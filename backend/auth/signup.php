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

// Extract data
$firstName = $data['firstName'] ?? '';
$lastName = $data['lastName'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$confirmPassword = $data['confirmPassword'] ?? '';
$agreeToTerms = $data['agreeToTerms'] ?? false;
$selectedPlan = $data['selectedPlan'] ?? '';
$accountType = $data['accountType'] ?? '';

// Validate data
$response = ['success' => false, 'errors' => []];

if (empty($firstName)) {
    $response['errors']['firstName'] = 'First name is required';
}

if (empty($lastName)) {
    $response['errors']['lastName'] = 'Last name is required';
}

if (empty($email)) {
    $response['errors']['email'] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['errors']['email'] = 'Please enter a valid email';
}

if (empty($password)) {
    $response['errors']['password'] = 'Password is required';
} elseif (strlen($password) < 8) {
    $response['errors']['password'] = 'Password must be at least 8 characters';
}

if ($password !== $confirmPassword) {
    $response['errors']['confirmPassword'] = 'Passwords don\'t match';
}

if (!$agreeToTerms) {
    $response['errors']['agreeToTerms'] = 'You must agree to the terms and conditions';
}

// If there are validation errors, return them
if (!empty($response['errors'])) {
    echo json_encode($response);
    exit;
}

// Connect to database
require_once('../db_connection.php');

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $emailExists = (bool)$stmt->fetchColumn();
    
    if ($emailExists) {
        $response['errors']['email'] = 'This email is already registered';
        echo json_encode($response);
        exit;
    }
    
    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert the user into the database
    $stmt = $pdo->prepare("INSERT INTO users (email, first_name, last_name, hashed_password, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([$email, $firstName, $lastName, $hashedPassword]);
    
    $userId = $pdo->lastInsertId();
    
    // Create session for the new user
    $_SESSION['user'] = [
        'id' => $userId,
        'email' => $email,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'loggedIn' => true,
        'plan' => $selectedPlan,
        'accountType' => $accountType
    ];
    
    $response['success'] = true;
    $redirectUrl = $selectedPlan
        ? "/dashboard?signup=success&plan={$selectedPlan}&user=new&type={$accountType}"
        : "/dashboard?signup=success&user=new&type={$accountType}";
    $response['redirect'] = $redirectUrl;
    
} catch (PDOException $e) {
    $response['errors']['general'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>