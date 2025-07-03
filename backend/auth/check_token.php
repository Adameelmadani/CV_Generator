
<?php
// Add CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

session_start();

// Check if user is already logged in via session
if (isset($_SESSION['user']) && $_SESSION['user']['loggedIn']) {
    echo json_encode([
        'success' => true,
        'userType' => $_SESSION['user']['type']
    ]);
    exit;
}

// Check for remember token
if (isset($_COOKIE['remember_token']) && isset($_COOKIE['user_email'])) {
    require_once('../db_connection.php');
    
    $token = $_COOKIE['remember_token'];
    $email = $_COOKIE['user_email'];
    
    try {
        // Get user by email
        $stmt = $pdo->prepare("SELECT id, mot_de_passe, token, entity_type, entity_id FROM auth WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($token, $user['token'])) {
            // Token is valid
            $userType = null;
            
            // Determine user type based on entity_type
            if ($user['entity_type'] === 'utilisateur') {
                // Get user info to check if they're an employee
                $userStmt = $pdo->prepare("SELECT id, est_employe FROM utilisateurs WHERE id = ?");
                $userStmt->execute([$user['entity_id']]);
                $userInfo = $userStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($userInfo) {
                    $userType = $userInfo['est_employe'] ? 'employee' : 'user';
                }
            } else if ($user['entity_type'] === 'demande_entreprise') {
                $userType = 'company';
            }
            
            // Create session
            $_SESSION['user'] = [
                'auth_id' => $user['id'],
                'email' => $email,
                'type' => $userType,
                'loggedIn' => true
            ];
            
            echo json_encode([
                'success' => true,
                'userType' => $userType
            ]);
        } else {
            // Invalid token, clear cookies
            setcookie('remember_token', '', time() - 3600, '/');
            setcookie('user_email', '', time() - 3600, '/');
            
            echo json_encode([
                'success' => false,
                'message' => 'Invalid token'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No authentication token'
    ]);
}
?>