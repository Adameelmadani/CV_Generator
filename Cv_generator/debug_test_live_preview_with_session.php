<?php
// Test script that simulates login and then tests live preview

session_start();

// Simulate a logged-in user (you would normally do this through the login form)
$_SESSION['userId'] = 1; // Assuming user ID 1 exists

echo "Session userId set to: " . $_SESSION['userId'] . "\n";

// Now test the live preview endpoint
$testData = [
    'nom' => 'Test',
    'prenom' => 'User',
    'email' => 'test@example.com',
    'telephone' => '123-456-7890',
    'location' => 'Test City',
    'profil_description' => 'This is a test profile description for live preview testing.'
];

$jsonData = json_encode($testData);

echo "Testing live preview with data: " . $jsonData . "\n";

// Create a context for the HTTP request
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Cookie: PHPSESSID=' . session_id()
        ],
        'content' => $jsonData
    ]
]);

echo "Making request to live preview endpoint...\n";

// Make the request
$response = file_get_contents('http://localhost/Projets/CV_Generator/Cv_generator/generate_live_preview_mvc.php', false, $context);

echo "Response received:\n";
echo "Response length: " . strlen($response) . "\n";
echo "Response preview: " . substr($response, 0, 500) . "\n";

// Try to parse as JSON
try {
    $jsonResponse = json_decode($response, true);
    if ($jsonResponse) {
        echo "✅ Valid JSON response:\n";
        if (isset($jsonResponse['success']) && $jsonResponse['success']) {
            echo "✅ Success! PDF generated.\n";
            echo "PDF base64 length: " . (isset($jsonResponse['pdf_base64']) ? strlen($jsonResponse['pdf_base64']) : 'N/A') . "\n";
        } else {
            echo "❌ Error in response: " . ($jsonResponse['error'] ?? 'Unknown error') . "\n";
        }
    } else {
        echo "❌ Response is not valid JSON\n";
    }
} catch (Exception $e) {
    echo "❌ JSON parse error: " . $e->getMessage() . "\n";
}
?>
