<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/core/bootstrap.php';
require_once __DIR__ . '/app/Controllers/RHController.php';

$rhController = new RHController();

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'advanced_search':
            $rhController->advancedSearch();
            break;
            
        case 'search_cvs':
            $rhController->searchCVs();
            break;
            
        case 'get_cv_details':
            $rhController->getCVDetails();
            break;
            
        case 'get_filieres':
            $rhController->getFilieres();
            break;
            
        case 'get_stats':
            $rhController->getStats();
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Action non trouvée']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}
?> 