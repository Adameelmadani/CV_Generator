<?php
/**
 * Installation rapide des tables via AJAX
 */

// Supprimer les erreurs
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');

try {
    require_once 'cv_search_config.php';
    
    // Connexion à la base de données
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    // Lire et exécuter le script SQL
    $sqlFile = __DIR__ . '/create_tables.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("Le fichier create_tables.sql est introuvable.");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Séparer les requêtes
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    
    $successCount = 0;
    $errors = [];
    
    foreach ($queries as $query) {
        if (empty($query) || strpos($query, '--') === 0 || strpos($query, 'SELECT') === 0) {
            continue;
        }
        
        try {
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            $successCount++;
        } catch (PDOException $e) {
            $errors[] = $e->getMessage();
        }
    }
    
    // Vérifier que les tables ont été créées
    $tables = ['recruiters', 'weight_profiles', 'search_weights', 'search_history'];
    $tablesCounts = [];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch()['count'];
            $tablesCounts[$table] = $count;
        } catch (PDOException $e) {
            $tablesCounts[$table] = 'Erreur';
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Installation terminée avec succès !',
        'queries_executed' => $successCount,
        'errors' => $errors,
        'tables_status' => $tablesCounts
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'installation: ' . $e->getMessage()
    ]);
}
?>
