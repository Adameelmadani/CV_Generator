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
    $stmt = $pdo->prepare("
        SELECT a.auth_id, a.email, a.mot_de_passe, u.id, u.prenom, u.nom
        FROM auth a
        INNER JOIN utilisateurs u ON a.auth_id = u.auth_id
        WHERE a.email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify if user exists and password is correct
    if ($user && password_verify($password, $user['mot_de_passe'])) {
        // Update last login time
        $updateStmt = $pdo->prepare("UPDATE auth SET derniere_connexion = CURDATE() WHERE auth_id = ?");
        $updateStmt->execute([$user['auth_id']]);
        
        // Password is correct - create session
        $_SESSION['user'] = [
            'id' => $user['id'],
            'auth_id' => $user['auth_id'],
            'email' => $user['email'],
            'first_name' => $user['prenom'],
            'last_name' => $user['nom'],
            'loggedIn' => true
        ];
        
        if ($rememberMe) {
            // Set a cookie that expires in 30 days
            setcookie('remember_user', $email, time() + (86400 * 30), '/');
        }
        
        $response['success'] = true;
        $response['redirect'] = '/dashboard';
        $response['user'] = [
            'firstName' => $user['prenom'],
            'lastName' => $user['nom'],
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