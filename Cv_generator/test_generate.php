<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Log that the script is being accessed
error_log("test_generate.php accessed at " . date('Y-m-d H:i:s'));

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die("Error: This script only accepts POST requests. Current method: " . $_SERVER['REQUEST_METHOD']);
}

// Log form data received
error_log("POST data received: " . print_r($_POST, true));

echo "<!DOCTYPE html>";
echo "<html>";
echo "<head><title>CV Generation Test</title></head>";
echo "<body>";
echo "<h1>✅ CV Generation Test - Form Data Received!</h1>";
echo "<p>If you see this message, the form submission is working perfectly.</p>";

// Check required fields
$required_fields = ['nom', 'prenom', 'email', 'telephone', 'location', 'profil_description'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    echo "<h3 style='color: red;'>❌ Missing required fields:</h3>";
    echo "<ul>";
    foreach ($missing_fields as $field) {
        echo "<li>$field</li>";
    }
    echo "</ul>";
} else {
    echo "<h3 style='color: green;'>✅ All required fields are filled!</h3>";
}

echo "<h2>📋 Form Data Received:</h2>";
echo "<pre style='background: #f5f5f5; padding: 20px; border-radius: 5px;'>";
print_r($_POST);
echo "</pre>";

// Test file operations
echo "<h2>🔧 System Test:</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Current Directory:</strong> " . getcwd() . "</p>";
echo "<p><strong>Script Location:</strong> " . __FILE__ . "</p>";
echo "<p><strong>Apache Document Root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "</p>";

echo "<br><a href='home.html'>← Back to Form</a>";
echo "</body>";
echo "</html>";
?>
