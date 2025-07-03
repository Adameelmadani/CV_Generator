<?php
session_start();

// Enhanced debugging for authentication issues
header('Content-Type: application/json');

// Debug session information
$sessionDebug = [
    'session_id' => session_id(),
    'session_status' => session_status(),
    'session_name' => session_name(),
    'session_cookie_params' => session_get_cookie_params(),
    'cookie_value' => $_COOKIE[session_name()] ?? 'not set',
    'session_data' => $_SESSION ?? [],
    'user_id_exists' => isset($_SESSION['userId']),
    'user_id_value' => $_SESSION['userId'] ?? null,
    'all_cookies' => $_COOKIE,
    'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
];

// Check if user is logged in (using correct session variable name)
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        'success' => false, 
        'error' => 'Not authenticated',
        'debug' => $sessionDebug
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'No data provided']);
        exit;
    }
    
    // Log received data for debugging
    error_log("Live preview debug - received data keys: " . implode(', ', array_keys($input)));
    
    // Create a simple test PDF content (base64 encoded minimal PDF)
    $testPdfContent = "%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Live Preview Test) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000189 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
282
%%EOF";
    
    // Return successful response with test PDF
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'pdf_base64' => base64_encode($testPdfContent),
        'message' => 'Test PDF generated successfully',
        'debug' => [
            'received_fields' => array_keys($input),
            'user_id' => $_SESSION['userId']
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Live preview debug error: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Debug error: ' . $e->getMessage()
    ]);
}
?>
