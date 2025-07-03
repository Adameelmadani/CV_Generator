<?php
// Debug script to test generateLivePreview with proper HTTP simulation

// Turn on all error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Start session
session_start();

// Set test user
if (!isset($_SESSION['userId'])) {
    $_SESSION['userId'] = 1; // Test user
}

// Set proper request method and content type
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Create test data
$testData = [
    'personal_info' => [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'phone' => '123-456-7890',
        'address' => '123 Test St',
        'city' => 'Test City',
        'postal_code' => '12345',
        'country' => 'Test Country'
    ],
    'experiences' => [
        [
            'company' => 'Test Company',
            'position' => 'Developer',
            'start_date' => '2020-01',
            'end_date' => '2023-12',
            'description' => 'Test experience description'
        ]
    ],
    'educations' => [
        [
            'school' => 'Test University',
            'degree' => 'Computer Science',
            'start_date' => '2016-09',
            'end_date' => '2020-06',
            'description' => 'Test education description'
        ]
    ]
];

// Convert to JSON
$jsonData = json_encode($testData);

// Override the getJsonInput method by putting data in a global variable
$GLOBALS['test_json_input'] = $testData;

// Modify the Controller class to use our test data
class TestController extends CVController {
    protected function getJsonInput() {
        return isset($GLOBALS['test_json_input']) ? $GLOBALS['test_json_input'] : parent::getJsonInput();
    }
}

try {
    // Include the bootstrap
    require_once __DIR__ . '/../core/bootstrap.php';
    
    // Create controller and test
    $controller = new TestController();
    
    // Capture output
    ob_start();
    
    echo "Testing generateLivePreview with test data...\n";
    
    // Call the method
    $controller->generateLivePreview();
    
    $output = ob_get_clean();
    
    // Output as plain text for debugging
    header('Content-Type: text/plain');
    echo "=== LIVE PREVIEW DEBUG OUTPUT ===\n";
    echo "JSON Input: " . $jsonData . "\n\n";
    echo "Controller Output:\n";
    echo $output;
    
} catch (Exception $e) {
    header('Content-Type: text/plain');
    echo "=== EXCEPTION CAUGHT ===\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
} catch (Error $e) {
    header('Content-Type: text/plain');
    echo "=== FATAL ERROR CAUGHT ===\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}
?>
