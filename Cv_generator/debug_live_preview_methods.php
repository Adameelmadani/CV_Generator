<?php
// Simple test to check what happens when calling the generateLivePreview method

// Turn on error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    echo "Starting test...\n";
    
    // Set up test environment
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['CONTENT_TYPE'] = 'application/json';
    
    // Start session
    session_start();
    $_SESSION['userId'] = 1;
    
    echo "Loading bootstrap...\n";
    require_once __DIR__ . '/../core/bootstrap.php';
    
    echo "Creating controller...\n";
    $controller = new CVController();
    
    // Mock input data
    $mockInput = json_encode([
        'nom' => 'Test',
        'prenom' => 'User',
        'email' => 'test@example.com',
        'telephone' => '123-456-7890',
        'location' => 'Test City',
        'profil_description' => 'Test profile description'
    ]);
    
    echo "Mock input: " . $mockInput . "\n";
    
    // We can't really mock php://input easily, so let's test individual methods
    echo "Testing sanitizeInput method...\n";
    
    $testData = [
        'nom' => 'Test',
        'prenom' => 'User',
        'email' => 'test@example.com'
    ];
    
    // Use reflection to access private method
    $reflection = new ReflectionClass($controller);
    $sanitizeMethod = $reflection->getMethod('sanitizeInput');
    $sanitizeMethod->setAccessible(true);
    
    $sanitized = $sanitizeMethod->invoke($controller, $testData);
    echo "Sanitized data: " . print_r($sanitized, true) . "\n";
    
    echo "Testing generateXMLContent method...\n";
    $xmlMethod = $reflection->getMethod('generateXMLContent');
    $xmlMethod->setAccessible(true);
    
    $xmlContent = $xmlMethod->invoke($controller, $sanitized, null);
    echo "XML content length: " . strlen($xmlContent) . "\n";
    echo "XML content preview: " . substr($xmlContent, 0, 200) . "...\n";
    
    echo "Test completed successfully!\n";
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>
