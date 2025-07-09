<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Debug: Starting signup debug...\n";

try {
    echo "Debug: Including bootstrap...\n";
    require_once __DIR__ . '/../core/bootstrap.php';
    echo "Debug: Bootstrap loaded successfully\n";
    
    echo "Debug: Including AuthController...\n";
    require_once __DIR__ . '/../app/Controllers/AuthController.php';
    echo "Debug: AuthController loaded successfully\n";
    
    echo "Debug: Creating AuthController instance...\n";
    $authController = new AuthController();
    echo "Debug: AuthController instance created successfully\n";
    
    // Test database connection
    echo "Debug: Testing database connection...\n";
    $db = Database::getInstance();
    $conn = $db->getConnection();
    echo "Debug: Database connection successful\n";
    
    // Test if we can access the users table
    $stmt = $conn->query("SHOW TABLES LIKE 'utilisateurs'");
    if ($stmt->rowCount() > 0) {
        echo "Debug: 'utilisateurs' table exists\n";
    } else {
        echo "Debug: ERROR - 'utilisateurs' table does not exist\n";
    }
    
    echo "Debug: All checks passed. If you see this, the issue might be in the signup method itself.\n";
    
} catch (Exception $e) {
    echo "Debug: ERROR - " . $e->getMessage() . "\n";
    echo "Debug: Stack trace:\n" . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "Debug: FATAL ERROR - " . $e->getMessage() . "\n";
    echo "Debug: Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
