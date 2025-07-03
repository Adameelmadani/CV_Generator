<?php
// Direct test of the live preview functionality

// Set up environment
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set up request environment
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Start session and set user
session_start();
$_SESSION['userId'] = 1;

try {
    echo "Loading bootstrap...\n";
    require_once __DIR__ . '/../core/bootstrap.php';
    
    echo "Creating controller...\n";
    $controller = new CVController();
    
    // Test data
    $testData = [
        'nom' => 'Test',
        'prenom' => 'User',
        'email' => 'test@example.com',
        'telephone' => '123-456-7890',
        'location' => 'Test City',
        'profil_description' => 'Test profile for live preview'
    ];
    
    echo "Test data: " . json_encode($testData) . "\n\n";
    
    // Mock the getJsonInput method by extending the controller
    class TestLivePreviewController extends CVController {
        private $testData;
        
        public function __construct($testData) {
            parent::__construct();
            $this->testData = $testData;
        }
        
        protected function getJsonInput() {
            return $this->testData;
        }
        
        public function testGenerateLivePreview() {
            // Call the method but capture output
            ob_start();
            
            try {
                $this->generateLivePreview();
                $output = ob_get_clean();
                
                echo "Method executed successfully!\n";
                echo "Output length: " . strlen($output) . "\n";
                echo "Output content: " . $output . "\n";
                
            } catch (Exception $e) {
                ob_end_clean();
                throw $e;
            }
        }
    }
    
    echo "Creating test controller...\n";
    $testController = new TestLivePreviewController($testData);
    
    echo "Calling generateLivePreview...\n";
    $testController->testGenerateLivePreview();
    
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
