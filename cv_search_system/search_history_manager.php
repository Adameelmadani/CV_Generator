<?php
/**
 * Gestionnaire de l'historique des recherches
 */

// Supprimer les erreurs pour éviter les problèmes JSON
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    require_once 'cv_search_config.php';
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de configuration: ' . $e->getMessage()
    ]);
    exit;
}

try {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'list':
            listSearchHistory();
            break;
            
        case 'get':
            getSearchHistory();
            break;
            
        case 'save':
            saveSearchHistory();
            break;
            
        case 'delete':
            deleteSearchHistory();
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'message' => 'Action non valide'
            ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}

function listSearchHistory() {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                sh.*,
                wp.profile_name as weight_profile_name,
                r.username as recruiter_name
            FROM search_history sh
            LEFT JOIN weight_profiles wp ON sh.weight_profile_id = wp.id
            LEFT JOIN recruiters r ON sh.recruiter_id = r.id
            ORDER BY sh.search_date DESC
            LIMIT 50
        ");
        $stmt->execute();
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'history' => $history
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la récupération de l\'historique: ' . $e->getMessage()
        ]);
    }
}

function getSearchHistory() {
    global $pdo;
    
    $historyId = $_GET['id'] ?? null;
    
    if (!$historyId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID de l\'historique manquant'
        ]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                sh.*,
                wp.profile_name as weight_profile_name,
                r.username as recruiter_name
            FROM search_history sh
            LEFT JOIN weight_profiles wp ON sh.weight_profile_id = wp.id
            LEFT JOIN recruiters r ON sh.recruiter_id = r.id
            WHERE sh.id = ?
        ");
        $stmt->execute([$historyId]);
        $search = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$search) {
            echo json_encode([
                'success' => false,
                'message' => 'Recherche non trouvée dans l\'historique'
            ]);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'search' => $search
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la récupération de la recherche: ' . $e->getMessage()
        ]);
    }
}

function saveSearchHistory() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode([
            'success' => false,
            'message' => 'Données invalides'
        ]);
        return;
    }
    
    $searchKeywords = $input['search_keywords'] ?? '';
    $filters = $input['filters'] ?? null;
    $weights = $input['weights'] ?? null;
    $resultsCount = $input['results_count'] ?? 0;
    $weightProfileId = $input['weight_profile_id'] ?? null;
    
    if (empty($searchKeywords)) {
        echo json_encode([
            'success' => false,
            'message' => 'Mots-clés de recherche requis'
        ]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO search_history (
                recruiter_id, 
                search_keywords, 
                filters, 
                weights, 
                results_count, 
                weight_profile_id, 
                search_date
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            1, // ID du recruteur (à adapter selon votre système d'authentification)
            $searchKeywords,
            $filters ? json_encode($filters) : null,
            $weights ? json_encode($weights) : null,
            $resultsCount,
            $weightProfileId
        ]);
        
        $historyId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Recherche sauvegardée dans l\'historique',
            'history_id' => $historyId
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la sauvegarde: ' . $e->getMessage()
        ]);
    }
}

function deleteSearchHistory() {
    global $pdo;
    
    $historyId = $_GET['id'] ?? null;
    
    if (!$historyId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID de l\'historique manquant'
        ]);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM search_history WHERE id = ?");
        $stmt->execute([$historyId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Recherche supprimée de l\'historique'
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
        ]);
    }
}
?>
