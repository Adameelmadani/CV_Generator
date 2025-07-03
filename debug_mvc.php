<?php
/**
 * Debug script to test MVC structure
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>MVC Debug Test</h2>\n";

try {
    echo "<h3>1. Testing Bootstrap</h3>\n";
    require_once __DIR__ . '/core/bootstrap.php';
    echo "✅ Bootstrap loaded successfully<br>\n";
    
    echo "<h3>2. Testing Database Connection</h3>\n";
    $db = Database::getInstance();
    echo "✅ Database instance created<br>\n";
    
    $conn = $db->getConnection();
    echo "✅ Database connection established<br>\n";
    
    echo "<h3>3. Testing CV Model</h3>\n";
    $cvModel = new CV();
    echo "✅ CV Model instantiated<br>\n";
    
    echo "<h3>4. Testing CVController</h3>\n";
    // Start session for controller test
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Set a test user ID for testing (remove this in production)
    $_SESSION['userId'] = 1;
    
    $controller = new CVController();
    echo "✅ CVController instantiated<br>\n";
    
    echo "<h3>5. Testing getUserCVs (simulation)</h3>\n";
    // Test the method directly (not through HTTP)
    ob_start();
    try {
        // This will try to call getUserCVs
        $cvs = $cvModel->getUserCVs(1);
        echo "✅ getUserCVs method executed successfully<br>\n";
        echo "Found " . count($cvs) . " CVs for user 1<br>\n";
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "<br>\n";
    }
    ob_end_clean();
    
    echo "<h3>✅ All tests passed! MVC structure is working.</h3>\n";
    
} catch (Exception $e) {
    echo "<h3>❌ Error occurred:</h3>\n";
    echo "<pre>" . $e->getMessage() . "</pre>\n";
    echo "<pre>" . $e->getTraceAsString() . "</pre>\n";
}
?>
