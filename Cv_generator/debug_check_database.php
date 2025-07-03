<?php
require_once '../core/bootstrap.php';

header('Content-Type: text/plain');

try {
    $db = Database::getInstance();
    
    // Check if users exist
    echo "=== CHECKING USERS ===\n";
    $result = $db->query('SELECT id, email, first_name, last_name FROM users LIMIT 5');
    $users = $result->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($users)) {
        echo "No users found in database.\n";
        
        // Create a test user
        echo "Creating test user...\n";
        $stmt = $db->prepare("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)");
        $hashedPassword = password_hash('test123', PASSWORD_DEFAULT);
        $stmt->execute(['Test', 'User', 'test@test.com', $hashedPassword]);
        
        $testUserId = $db->lastInsertId();
        echo "Test user created with ID: $testUserId\n";
        
        // Re-fetch users
        $result = $db->query('SELECT id, email, first_name, last_name FROM users LIMIT 5');
        $users = $result->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo "Users in database:\n";
    foreach ($users as $user) {
        echo "ID: {$user['id']}, Email: {$user['email']}, Name: {$user['first_name']} {$user['last_name']}\n";
    }
    
    echo "\n=== CHECKING SESSION ===\n";
    session_start();
    echo "Session ID: " . session_id() . "\n";
    echo "Session userId: " . ($_SESSION['userId'] ?? 'not set') . "\n";
    echo "Session user_id: " . ($_SESSION['user_id'] ?? 'not set') . "\n";
    
    // Set test session
    $_SESSION['userId'] = $users[0]['id'];
    echo "Set session userId to: " . $_SESSION['userId'] . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
