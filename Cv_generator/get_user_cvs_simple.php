<?php
// Simple working version of get_user_cvs
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
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User not logged in',
        'debug' => [
            'session_data' => $_SESSION,
            'session_id' => session_id()
        ]
    ]);
    exit();
}

$userId = $_SESSION['userId'];

try {
    // First check if updated_at column exists
    $stmt = $pdo->query("SHOW COLUMNS FROM user_cvs LIKE 'updated_at'");
    $hasUpdatedAt = $stmt->rowCount() > 0;
    
    // Get user CVs with conditional column selection
    if ($hasUpdatedAt) {
        $sql = "SELECT id, cv_name, xml_content, created_at, updated_at 
                FROM user_cvs 
                WHERE user_id = :user_id 
                ORDER BY updated_at DESC";
    } else {
        $sql = "SELECT id, cv_name, xml_content, created_at, created_at as updated_at 
                FROM user_cvs 
                WHERE user_id = :user_id 
                ORDER BY created_at DESC";
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $userId]);
    $cvs = $stmt->fetchAll();
    
    echo json_encode([
        'status' => 'success',
        'cvs' => $cvs,
        'debug' => [
            'user_id' => $userId,
            'cv_count' => count($cvs),
            'has_updated_at' => $hasUpdatedAt,
            'sql_used' => $sql
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error retrieving CVs: ' . $e->getMessage()
    ]);
    error_log("Error in get_user_cvs_simple: " . $e->getMessage());
}
?>
