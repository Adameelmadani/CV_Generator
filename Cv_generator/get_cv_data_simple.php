<?php
// Simple working version of get_cv_data
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
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User not logged in'
    ]);
    exit();
}

if (!isset($_GET['cv_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'CV ID is required'
    ]);
    exit();
}

$cvId = intval($_GET['cv_id']);
$userId = $_SESSION['userId'];

try {
    $sql = "SELECT xml_content FROM user_cvs WHERE id = :cv_id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cv_id' => $cvId, ':user_id' => $userId]);
    $result = $stmt->fetch();
    
    if (!$result) {
        echo json_encode([
            'status' => 'error',
            'message' => 'CV not found'
        ]);
        exit();
    }
    
    echo json_encode([
        'status' => 'success',
        'xml_content' => $result['xml_content']
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error retrieving CV data'
    ]);
    error_log("Error in get_cv_data_simple: " . $e->getMessage());
}
?>
