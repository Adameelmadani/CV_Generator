<?php
/**
 * Script de test pour le système RH
 * Teste la connexion à la base de données et les fonctionnalités principales
 */

require_once __DIR__ . '/core/bootstrap.php';

echo "<h1>Test du Système RH - CVCRAFT</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .success { background-color: #d4edda; border-color: #c3e6cb; color: #155724; }
    .error { background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; }
    .info { background-color: #d1ecf1; border-color: #bee5eb; color: #0c5460; }
    .test-item { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 3px; }
</style>";

// Test 1: Connexion à la base de données
echo "<div class='test-section'>";
echo "<h2>1. Test de Connexion à la Base de Données</h2>";

try {
    $db = Database::getInstance()->getConnection();
    echo "<div class='test-item success'>✓ Connexion à la base de données réussie</div>";
    
    // Test des tables principales
    $tables = ['utilisateurs', 'cvs', 'filieres', 'informations_personnelles', 'experiences', 'formations', 'competences'];
    foreach ($tables as $table) {
        $stmt = $db->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "<div class='test-item success'>✓ Table '$table' existe</div>";
        } else {
            echo "<div class='test-item error'>✗ Table '$table' n'existe pas</div>";
        }
    }
    
} catch (Exception $e) {
    echo "<div class='test-item error'>✗ Erreur de connexion: " . $e->getMessage() . "</div>";
}
echo "</div>";

// Test 2: Vérification des données
echo "<div class='test-section'>";
echo "<h2>2. Vérification des Données</h2>";

try {
    // Compter les utilisateurs
    $stmt = $db->query("SELECT COUNT(*) as count FROM utilisateurs");
    $userCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "<div class='test-item info'>📊 Nombre d'utilisateurs: $userCount</div>";
    
    // Compter les CV publiés
    $stmt = $db->query("SELECT COUNT(*) as count FROM cvs WHERE est_publie = 1");
    $cvCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "<div class='test-item info'>📊 Nombre de CV publiés: $cvCount</div>";
    
    // Compter les filières
    $stmt = $db->query("SELECT COUNT(*) as count FROM filieres");
    $filiereCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "<div class='test-item info'>📊 Nombre de filières: $filiereCount</div>";
    
    // Afficher quelques filières
    $stmt = $db->query("SELECT nom FROM filieres LIMIT 5");
    $filieres = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<div class='test-item info'>📋 Filières disponibles: " . implode(', ', array_column($filieres, 'nom')) . "</div>";
    
} catch (Exception $e) {
    echo "<div class='test-item error'>✗ Erreur lors de la vérification des données: " . $e->getMessage() . "</div>";
}
echo "</div>";

// Test 3: Test de l'API RH
echo "<div class='test-section'>";
echo "<h2>3. Test de l'API RH</h2>";

$apiTests = [
    'get_filieres' => 'Test récupération des filières',
    'get_stats' => 'Test récupération des statistiques'
];

foreach ($apiTests as $action => $description) {
    $url = "rh_api.php?action=$action";
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Content-Type: application/json'
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        if ($data && isset($data['success'])) {
            if ($data['success']) {
                echo "<div class='test-item success'>✓ $description: OK</div>";
            } else {
                echo "<div class='test-item error'>✗ $description: " . ($data['message'] ?? 'Erreur') . "</div>";
            }
        } else {
            echo "<div class='test-item error'>✗ $description: Réponse invalide</div>";
        }
    } else {
        echo "<div class='test-item error'>✗ $description: Impossible d'accéder à l'API</div>";
    }
}
echo "</div>";

// Test 4: Vérification des fichiers RH
echo "<div class='test-section'>";
echo "<h2>4. Vérification des Fichiers RH</h2>";

$rhFiles = [
    'rh/index.html' => 'Interface RH',
    'rh/styles.css' => 'Styles CSS',
    'rh/script.js' => 'JavaScript RH',
    'app/Controllers/RHController.php' => 'Contrôleur RH',
    'rh_api.php' => 'API RH'
];

foreach ($rhFiles as $file => $description) {
    if (file_exists($file)) {
        $size = filesize($file);
        echo "<div class='test-item success'>✓ $description: $file ($size bytes)</div>";
    } else {
        echo "<div class='test-item error'>✗ $description: $file (manquant)</div>";
    }
}
echo "</div>";

// Test 5: Test de recherche de CV
echo "<div class='test-section'>";
echo "<h2>5. Test de Recherche de CV</h2>";

try {
    // Simuler une recherche
    $sql = "SELECT COUNT(*) as count FROM cvs c 
            LEFT JOIN informations_personnelles ip ON c.id = ip.id_cv 
            WHERE c.est_publie = 1";
    $stmt = $db->query($sql);
    $searchableCVs = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    echo "<div class='test-item info'>📊 CV disponibles pour la recherche: $searchableCVs</div>";
    
    if ($searchableCVs > 0) {
        // Afficher un exemple de CV
        $sql = "SELECT c.id, c.cv_name, ip.nom, ip.prenom, ip.email 
                FROM cvs c 
                LEFT JOIN informations_personnelles ip ON c.id = ip.id_cv 
                WHERE c.est_publie = 1 
                LIMIT 1";
        $stmt = $db->query($sql);
        $exampleCV = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($exampleCV) {
            $name = trim($exampleCV['prenom'] . ' ' . $exampleCV['nom']);
            echo "<div class='test-item success'>✓ Exemple de CV trouvé: $name (ID: {$exampleCV['id']})</div>";
        }
    } else {
        echo "<div class='test-item error'>✗ Aucun CV publié disponible pour la recherche</div>";
    }
    
} catch (Exception $e) {
    echo "<div class='test-item error'>✗ Erreur lors du test de recherche: " . $e->getMessage() . "</div>";
}
echo "</div>";

// Test 6: Instructions d'utilisation
echo "<div class='test-section'>";
echo "<h2>6. Instructions d'Utilisation</h2>";

echo "<div class='test-item info'>";
echo "<h3>Accès au Système RH:</h3>";
echo "<ul>";
echo "<li>Interface RH: <a href='rh/index.html' target='_blank'>rh/index.html</a></li>";
echo "<li>Test API: <a href='test_rh_system.php' target='_blank'>test_rh_system.php</a></li>";
echo "</ul>";
echo "</div>";

echo "<div class='test-item info'>";
echo "<h3>Authentification:</h3>";
echo "<ul>";
echo "<li>L'authentification RH est gérée par le système principal (auth.html)</li>";
echo "<li>Accédez d'abord à auth.html pour vous connecter</li>";
echo "<li>Puis naviguez vers l'interface RH</li>";
echo "</ul>";
echo "</div>";

echo "<div class='test-item info'>";
echo "<h3>Fonctionnalités Disponibles:</h3>";
echo "<ul>";
echo "<li>Recherche de CV avec filtres</li>";
echo "<li>Visualisation détaillée des CV</li>";
echo "<li>Statistiques RH</li>";
echo "<li>Gestion des filières</li>";
echo "</ul>";
echo "</div>";
echo "</div>";

echo "<div class='test-section'>";
echo "<h2>Résumé</h2>";
echo "<p>Le système RH est maintenant intégré avec votre base de données existante et utilise l'authentification principale.</p>";
echo "<p>Pour utiliser le système RH:</p>";
echo "<ol>";
echo "<li>Connectez-vous via auth.html</li>";
echo "<li>Accédez à l'interface RH via rh/index.html</li>";
echo "<li>Utilisez les fonctionnalités de recherche et de visualisation</li>";
echo "</ol>";
echo "</div>";
?> 