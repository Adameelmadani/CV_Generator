<?php
// Temporary debug version without authentication for testing
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input)) {
        echo json_encode(['success' => false, 'error' => 'No data provided']);
        exit;
    }
    
    // Log received data for debugging
    error_log("Live preview (no auth) - received data keys: " . implode(', ', array_keys($input)));
    
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
(Live Preview Working!) Tj
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
    echo json_encode([
        'success' => true,
        'pdf_base64' => base64_encode($testPdfContent),
        'message' => 'Test PDF generated successfully (no auth required)',
        'debug' => [
            'received_fields' => array_keys($input),
            'form_data_sample' => [
                'nom' => $input['nom'] ?? 'not provided',
                'prenom' => $input['prenom'] ?? 'not provided',
                'email' => $input['email'] ?? 'not provided'
            ]
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Live preview (no auth) error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Debug error: ' . $e->getMessage()
    ]);
}
?>
