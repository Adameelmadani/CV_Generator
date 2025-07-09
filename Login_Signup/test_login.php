<?php
// Test login functionality
// First, let's create a test user to login with
require_once __DIR__ . '/../core/bootstrap.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';

// Create a test user first
$userModel = new User();
$testEmail = 'testuser@example.com';

// Check if test user exists, if not create one
$existingUser = $userModel->findByEmail($testEmail);
if (!$existingUser) {
    echo "Creating test user...\n";
    $hashedPassword = $userModel->hashPassword('password123');
    $userId = $userModel->createUser('Test', 'User', $testEmail, $hashedPassword, '1234567890', 1);
    echo "Test user created with ID: $userId\n";
}

// Now test login
echo "Testing login...\n";

$postData = [
    'login_email' => $testEmail,
    'login_password' => 'password123'
];

// Simulate POST request
$_POST = $postData;
$_SERVER['REQUEST_METHOD'] = 'POST';

// Capture output
ob_start();

try {
    $authController = new AuthController();
    $authController->login();
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$output = ob_get_clean();
echo "Login response: " . $output . "\n";
?>
