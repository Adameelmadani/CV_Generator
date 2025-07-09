<?php
// Test CV Controller instantiation
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "Testing CV Controller instantiation...\n";

try {
    echo "1. Loading bootstrap...\n";
    require_once __DIR__ . '/../core/bootstrap.php';
    echo "✓ Bootstrap loaded\n";
    
    echo "2. Loading CVController...\n";
    require_once __DIR__ . '/../app/Controllers/CVController.php';
    echo "✓ CVController file loaded\n";
    
    echo "3. Creating CVController instance...\n";
    $controller = new CVController();
    echo "✓ CVController instance created\n";
    
    echo "4. Testing session access...\n";
    session_start();
    $_SESSION['userId'] = 5; // Test user ID
    $_SESSION['userEmail'] = 'test@example.com';
    echo "✓ Session variables set\n";
    
    echo "5. Testing requireAuth method...\n";
    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('requireAuth');
    $method->setAccessible(true);
    $userId = $method->invoke($controller);
    echo "✓ RequireAuth returned user ID: $userId\n";
    
    echo "All tests passed!\n";
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "❌ Fatal Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
