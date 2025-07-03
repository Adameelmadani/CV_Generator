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
    // Check if the user exists in the auth table
    $stmt = $pdo->prepare("
        SELECT a.id, a.email, a.mot_de_passe, a.entity_type, a.entity_id
        FROM auth a
        WHERE a.email = ?
    ");
    $stmt->execute([$email]);
    $authUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Verify if user exists and password is correct
    if ($authUser && password_verify($password, $authUser['mot_de_passe'])) {
        // Update last login time
        $updateStmt = $pdo->prepare("UPDATE auth SET derniere_connexion = CURDATE() WHERE id = ?");
        $updateStmt->execute([$authUser['id']]);
        
        $userType = null;
        
        // Determine user type based on entity_type
        if ($authUser['entity_type'] === 'utilisateur') {
            // Get user info to check if they're an employee
            $userStmt = $pdo->prepare("SELECT id, est_employe FROM utilisateurs WHERE id = ?");
            $userStmt->execute([$authUser['entity_id']]);
            $userInfo = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($userInfo) {
                $userType = $userInfo['est_employe'] ? 'employee' : 'user';
            }
        } else if ($authUser['entity_type'] === 'demande_entreprise') {
            $userType = 'company';
        }
        
        // Generate remember me token if requested
        if ($rememberMe) {
            // Generate a secure token
            $token = bin2hex(random_bytes(32));
            
            // Store token in database
            $tokenStmt = $pdo->prepare("UPDATE auth SET token = ? WHERE id = ?");
            $tokenStmt->execute([password_hash($token, PASSWORD_DEFAULT), $authUser['id']]);
            
            // Set cookies with token that expires in 30 days
            setcookie('remember_token', $token, time() + (86400 * 30), '/', '', false, true);
            setcookie('user_email', $email, time() + (86400 * 30), '/', '', false, false);
        }
        
        // Create session with minimal information
        $_SESSION['user'] = [
            'auth_id' => $authUser['id'],
            'email' => $authUser['email'],
            'type' => $userType,
            'loggedIn' => true
        ];
        
        // Prepare response with minimal information
        $response['success'] = true;
        $response['userType'] = $userType; // Just send user type for redirection
    } else {
        // Invalid login
        $response['errors']['general'] = 'Invalid email or password';
    }
} catch (PDOException $e) {
    $response['errors']['general'] = 'Database error: ' . $e->getMessage();
}

echo json_encode($response);
?>