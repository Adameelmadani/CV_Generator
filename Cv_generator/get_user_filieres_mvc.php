<?php
// This endpoint is deprecated since filière associations have been removed
// CVs can now be published directly without filière selection

require_once __DIR__ . '/../core/bootstrap.php';

header('Content-Type: application/json');

// Return empty response for backward compatibility
echo json_encode([
    'status' => 'success',
    'filieres' => [],
    'message' => 'Filière associations have been removed. Publishing is now direct.'
]);
?>
