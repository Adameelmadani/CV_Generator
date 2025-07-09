<?php
// Test session handling after login
require_once __DIR__ . '/../core/bootstrap.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';

echo "=== SESSION TEST ===\n";

// Test 1: Login
echo "1. Testing login...\n";
$postData = [
    'login_email' => 'testuser@example.com',
    'login_password' => 'password123'
];

$_POST = $postData;
$_SERVER['REQUEST_METHOD'] = 'POST';

ob_start();
try {
    $authController = new AuthController();
    $authController->login();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$loginOutput = ob_get_clean();
echo "Login response: " . $loginOutput . "\n\n";

// Test 2: Check session immediately after login
echo "2. Testing session check...\n";
unset($_POST);
$_SERVER['REQUEST_METHOD'] = 'GET';

ob_start();
try {
    $authController = new AuthController();
    $authController->checkSession();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$sessionOutput = ob_get_clean();
echo "Session check response: " . $sessionOutput . "\n\n";

// Test 3: Show current session data
echo "3. Current session data:\n";
session_start();
foreach ($_SESSION as $key => $value) {
    echo "  $key: $value\n";
}

echo "\n=== END SESSION TEST ===\n";
?>
