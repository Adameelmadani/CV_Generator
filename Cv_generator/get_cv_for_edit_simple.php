<?php
// Simple working version of get_cv_for_edit
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

// Simple database connection
try {
    $pdo = new PDO("mysql:host=localhost;dbname=cv_generator;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    header('Location: user_home.html?error=database_error');
    exit();
}

// Check if user is logged in
if (!isset($_SESSION['userId'])) {
    header('Location: ../Login_Signup/auth.html');
    exit();
}

// Check CV ID parameter
if (!isset($_GET['cv_id']) || empty($_GET['cv_id'])) {
    header('Location: user_home.html?error=cv_id_required');
    exit();
}

$cvId = intval($_GET['cv_id']);
$userId = $_SESSION['userId'];

try {
    // Verify CV exists and belongs to user
    $sql = "SELECT id FROM user_cvs WHERE id = :cv_id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cv_id' => $cvId, ':user_id' => $userId]);
    $cv = $stmt->fetch();
    
    if (!$cv) {
        header('Location: user_home.html?error=cv_not_found');
        exit();
    }
    
    // Redirect to home.html with edit parameter
    header('Location: home.html?edit=' . $cvId);
    exit();
    
} catch (Exception $e) {
    error_log("Error in get_cv_for_edit_simple: " . $e->getMessage());
    header('Location: user_home.html?error=database_error');
    exit();
}
?>
