<?php
/**
 * Gestionnaire des pondérations sauvegardées
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
            listWeightProfiles();
            break;
            
        case 'get':
            getWeightProfile();
            break;
            
        case 'save':
            saveWeightProfile();
            break;
            
        case 'delete':
            deleteWeightProfile();
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

function listWeightProfiles() {
    global $pdo;
    
    // Vérifier la connexion à la base de données
    if (!isset($pdo)) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Impossible de se connecter à la base de données: ' . $e->getMessage()
            ]);
            return;
        }
    }
    
    try {
        // Vérifier que les tables existent
        $stmt = $pdo->query("SHOW TABLES LIKE 'weight_profiles'");
        if ($stmt->rowCount() == 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Les tables de base de données n\'existent pas. Veuillez les créer d\'abord.',
                'tables_missing' => true
            ]);
            return;
        }
        
        $stmt = $pdo->prepare("
            SELECT wp.*, r.username as recruiter_name
            FROM weight_profiles wp
            LEFT JOIN recruiters r ON wp.recruiter_id = r.id
            ORDER BY wp.created_at DESC
        ");
        $stmt->execute();
        $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'profiles' => $profiles
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la récupération des pondérations: ' . $e->getMessage()
        ]);
    }
}

function getWeightProfile() {
    global $pdo;
    
    $profileId = $_GET['id'] ?? null;
    
    if (!$profileId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID du profil manquant'
        ]);
        return;
    }
    
    // Vérifier la connexion à la base de données
    if (!isset($pdo)) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Impossible de se connecter à la base de données: ' . $e->getMessage()
            ]);
            return;
        }
    }
    
    try {
        // Vérifier que les tables existent
        $stmt = $pdo->query("SHOW TABLES LIKE 'weight_profiles'");
        if ($stmt->rowCount() == 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Les tables de base de données n\'existent pas.',
                'tables_missing' => true
            ]);
            return;
        }
        
        // Récupérer le profil
        $stmt = $pdo->prepare("
            SELECT wp.*, r.username as recruiter_name
            FROM weight_profiles wp
            LEFT JOIN recruiters r ON wp.recruiter_id = r.id
            WHERE wp.id = ?
        ");
        $stmt->execute([$profileId]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$profile) {
            echo json_encode([
                'success' => false,
                'message' => 'Profil de pondération non trouvé'
            ]);
            return;
        }
        
        // Récupérer les poids
        $stmt = $pdo->prepare("
            SELECT section_name, weight_value
            FROM search_weights
            WHERE weight_profile_id = ?
        ");
        $stmt->execute([$profileId]);
        $weightsData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $weights = [];
        foreach ($weightsData as $weight) {
            $weights[$weight['section_name']] = floatval($weight['weight_value']);
        }
        
        echo json_encode([
            'success' => true,
            'profile' => $profile,
            'weights' => $weights
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la récupération du profil: ' . $e->getMessage()
        ]);
    }
}

function saveWeightProfile() {
    global $pdo;
    
    // Vérifier la connexion à la base de données
    if (!isset($pdo)) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Impossible de se connecter à la base de données: ' . $e->getMessage()
            ]);
            return;
        }
    }
    
    try {
        // Vérifier que les tables existent
        $stmt = $pdo->query("SHOW TABLES LIKE 'weight_profiles'");
        if ($stmt->rowCount() == 0) {
            echo json_encode([
                'success' => false,
                'message' => 'Les tables de base de données n\'existent pas.',
                'tables_missing' => true
            ]);
            return;
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la vérification des tables: ' . $e->getMessage()
        ]);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode([
            'success' => false,
            'message' => 'Données JSON invalides ou manquantes'
        ]);
        return;
    }
    
    $profileName = $input['profile_name'] ?? '';
    $description = $input['description'] ?? '';
    $weights = $input['weights'] ?? [];
    
    if (empty($profileName)) {
        echo json_encode([
            'success' => false,
            'message' => 'Le nom du profil est requis'
        ]);
        return;
    }
    
    if (empty($weights) || !is_array($weights)) {
        echo json_encode([
            'success' => false,
            'message' => 'Les pondérations sont requises et doivent être un objet valide'
        ]);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Insérer le profil de pondération
        $stmt = $pdo->prepare("
            INSERT INTO weight_profiles (profile_name, description, recruiter_id, created_at)
            VALUES (?, ?, 1, NOW())
        ");
        $stmt->execute([$profileName, $description]);
        $profileId = $pdo->lastInsertId();
        
        // Insérer les poids
        $stmt = $pdo->prepare("
            INSERT INTO search_weights (weight_profile_id, section_name, weight_value)
            VALUES (?, ?, ?)
        ");
        
        $savedWeights = 0;
        foreach ($weights as $section => $weight) {
            if (is_numeric($weight)) {
                $stmt->execute([$profileId, $section, floatval($weight)]);
                $savedWeights++;
            }
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Profil de pondération sauvegardé avec succès',
            'profile_id' => $profileId,
            'weights_saved' => $savedWeights
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollback();
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la sauvegarde: ' . $e->getMessage()
        ]);
    }
}

function deleteWeightProfile() {
    global $pdo;
    
    $profileId = $_GET['id'] ?? null;
    
    if (!$profileId) {
        echo json_encode([
            'success' => false,
            'message' => 'ID du profil manquant'
        ]);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Supprimer les poids associés
        $stmt = $pdo->prepare("DELETE FROM search_weights WHERE weight_profile_id = ?");
        $stmt->execute([$profileId]);
        
        // Supprimer le profil
        $stmt = $pdo->prepare("DELETE FROM weight_profiles WHERE id = ?");
        $stmt->execute([$profileId]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Profil supprimé avec succès'
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
        ]);
    }
}
?>
