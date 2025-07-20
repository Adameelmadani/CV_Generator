<?php
/**
 * Handler MVC pour le système de recherche CV
 * Point d'entrée pour les requêtes de recherche
 */

// Configuration pour éviter les erreurs de sortie
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Headers pour CORS si nécessaire
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require_once __DIR__ . '/../core/bootstrap.php';
    require_once __DIR__ . '/../app/Controllers/SearchController.php';
    
    $controller = new SearchController();
    
    // Déterminer l'action basée sur la requête
    $action = $_GET['action'] ?? 'search';
    
    switch ($action) {
        case 'search':
            echo $controller->search();
            break;
            
        case 'details':
            echo $controller->getCVDetails();
            break;
            
        case 'stats':
            echo $controller->getStatistics();
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'message' => 'Action non reconnue',
                'available_actions' => ['search', 'details', 'stats']
            ]);
            break;
    }
    
} catch (Throwable $e) {
    error_log("Erreur dans search_handler_mvc.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erreur interne du serveur',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
