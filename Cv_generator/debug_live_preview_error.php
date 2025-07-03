<?php
// Debug script to capture exact error from generateLivePreview

// Turn on all error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Capture all output
ob_start();

echo "=== STARTING DEBUG ===\n";

try {
    // Start session and set user
    session_start();
    
    if (!isset($_SESSION['userId'])) {
        echo "Setting test user session...\n";
        $_SESSION['userId'] = 1; // Test user
    }
    
    echo "User ID: " . $_SESSION['userId'] . "\n";
    echo "Including bootstrap...\n";
    
    require_once __DIR__ . '/../core/bootstrap.php';
    
    echo "Creating controller...\n";
    $controller = new CVController();
    
    echo "Setting up test JSON input...\n";
    
    // Simulate JSON input
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['CONTENT_TYPE'] = 'application/json';
    
    $testData = [
        'personal_info' => [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '123-456-7890',
            'address' => '123 Test St'
        ]
    ];
    
    // Set up input stream for getJsonInput()
    $json = json_encode($testData);
    echo "Test JSON: " . $json . "\n";
    
    // Create a temporary file to simulate php://input
    $tempFile = tmpfile();
    fwrite($tempFile, $json);
    rewind($tempFile);
    
    echo "Calling generateLivePreview...\n";
    
    // Call the method
    $controller->generateLivePreview();
    
    echo "=== METHOD COMPLETED ===\n";
    
} catch (Exception $e) {
    echo "=== EXCEPTION CAUGHT ===\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "=== FATAL ERROR CAUGHT ===\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

echo "=== DEBUG COMPLETE ===\n";

// Capture all output
$output = ob_get_clean();

// Send as plain text
header('Content-Type: text/plain');
echo $output;
?>
