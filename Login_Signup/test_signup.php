<?php
// Test signup functionality
$postData = [
    'signup_nom' => 'Test',
    'signup_prenom' => 'User',
    'signup_email' => 'test' . time() . '@example.com', // Use unique email
    'signup_password' => 'password123',
    'signup_tel' => '1234567890',
    'signup_filiere' => '1'
];

// Simulate POST request
$_POST = $postData;
$_SERVER['REQUEST_METHOD'] = 'POST';

// Capture output
ob_start();

try {
    require_once __DIR__ . '/../core/bootstrap.php';
    require_once __DIR__ . '/../app/Controllers/AuthController.php';

    $authController = new AuthController();
    $authController->signup();
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

$output = ob_get_clean();
echo $output;
?>
