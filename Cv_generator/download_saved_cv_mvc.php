<?php
// Log requests for monitoring
error_log("download_saved_cv_mvc.php accessed - CV ID: " . ($_GET['cv_id'] ?? 'not provided'));

try {
    require_once __DIR__ . '/../core/bootstrap.php';
    
    $controller = new CVController();
    $controller->downloadSavedPDF();
    
} catch (Exception $e) {
    error_log("Error in download_saved_cv_mvc.php: " . $e->getMessage());
    
    // Send error response
    http_response_code(500);
    header('Content-Type: text/plain');
    echo "Error downloading CV: " . $e->getMessage();
}
