<?php
/**
 * Script d'installation des tables pour les nouvelles fonctionnalités
 * Exécutez ce fichier une seule fois pour créer toutes les tables nécessaires
 */

require_once 'cv_search_config.php';

echo "<h1>🔧 Installation des tables pour les nouvelles fonctionnalités</h1>";

try {
    // Lire le fichier SQL
    $sqlFile = __DIR__ . '/create_tables.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("Le fichier create_tables.sql est introuvable.");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Séparer les requêtes SQL
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    
    echo "<h2>📋 Exécution des requêtes SQL...</h2>";
    
    $successCount = 0;
    $totalQueries = 0;
    
    foreach ($queries as $query) {
        if (empty($query) || strpos($query, '--') === 0) {
            continue; // Ignorer les commentaires et lignes vides
        }
        
        $totalQueries++;
        
        try {
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            
            // Afficher le résultat si c'est un SELECT
            if (stripos($query, 'SELECT') === 0) {
                $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
                if (!empty($result)) {
                    echo "<div style='background: #e8f5e8; padding: 10px; margin: 5px 0; border-radius: 5px;'>";
                    foreach ($result as $row) {
                        foreach ($row as $key => $value) {
                            echo "<strong>$key:</strong> $value<br>";
                        }
                    }
                    echo "</div>";
                }
            } else {
                $successCount++;
                $affectedRows = $stmt->rowCount();
                echo "<div style='background: #e8f5e8; padding: 5px; margin: 2px 0; border-radius: 3px;'>";
                echo "✅ Requête exécutée avec succès ($affectedRows lignes affectées)";
                echo "</div>";
            }
            
        } catch (PDOException $e) {
            echo "<div style='background: #ffe8e8; padding: 5px; margin: 2px 0; border-radius: 3px;'>";
            echo "❌ Erreur: " . $e->getMessage();
            echo "</div>";
        }
    }
    
    echo "<h2>📊 Résumé de l'installation</h2>";
    echo "<div style='background: #e8f4fd; padding: 15px; border-radius: 8px;'>";
    echo "<p><strong>Requêtes exécutées avec succès:</strong> $successCount / $totalQueries</p>";
    
    // Vérifier l'état des tables
    echo "<h3>État des tables:</h3>";
    
    $tables = ['recruiters', 'weight_profiles', 'search_weights', 'search_history'];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            echo "<p>✅ Table <strong>$table</strong>: $count enregistrements</p>";
        } catch (PDOException $e) {
            echo "<p>❌ Table <strong>$table</strong>: Erreur - " . $e->getMessage() . "</p>";
        }
    }
    echo "</div>";
    
    // Test des API
    echo "<h2>🧪 Test des API</h2>";
    echo "<div style='background: #f0f8ff; padding: 15px; border-radius: 8px;'>";
    
    // Test de l'API weight_manager
    echo "<h3>Test Weight Manager API:</h3>";
    $testUrl = 'weight_manager.php?action=list';
    echo "<p><a href='$testUrl' target='_blank'>🔗 Tester l'API des pondérations</a></p>";
    
    // Test de l'API search_history
    echo "<h3>Test Search History API:</h3>";
    $testUrl2 = 'search_history_manager.php?action=list';
    echo "<p><a href='$testUrl2' target='_blank'>🔗 Tester l'API de l'historique</a></p>";
    
    // Test des tables
    echo "<h3>Test Table Checker:</h3>";
    $testUrl3 = 'test_tables.php';
    echo "<p><a href='$testUrl3' target='_blank'>🔗 Vérifier les tables</a></p>";
    
    echo "</div>";
    
    echo "<h2>🎉 Installation terminée !</h2>";
    echo "<div style='background: #e8ffe8; padding: 15px; border-radius: 8px; border: 2px solid #4CAF50;'>";
    echo "<p><strong>Les nouveaux boutons devraient maintenant fonctionner correctement !</strong></p>";
    echo "<p>Vous pouvez maintenant :</p>";
    echo "<ul>";
    echo "<li>✅ Utiliser le bouton 'Gérer pondération' pour charger des pondérations pré-définies</li>";
    echo "<li>✅ Utiliser le bouton 'Sauvegarder pondération' pour créer vos propres profils</li>";
    echo "<li>✅ Utiliser le bouton 'Historique des recherches' pour voir vos recherches passées</li>";
    echo "</ul>";
    echo "<p><a href='cv_search_interface.html' style='background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>🚀 Aller à l'interface de recherche</a></p>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div style='background: #ffe8e8; padding: 15px; border-radius: 8px; border: 2px solid #f44336;'>";
    echo "<h2>❌ Erreur lors de l'installation</h2>";
    echo "<p><strong>Message d'erreur:</strong> " . $e->getMessage() . "</p>";
    echo "<p><strong>Solution:</strong> Vérifiez votre configuration de base de données dans cv_search_config.php</p>";
    echo "</div>";
}
?>
