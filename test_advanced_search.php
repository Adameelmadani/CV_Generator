<?php
/**
 * Script de test pour la recherche avancée RH
 * Teste les différents endpoints de l'API RH
 */

echo "<h1>Test de la Recherche Avancée RH</h1>";

// Configuration
$baseUrl = 'http://localhost/CVCRAFT/CV_Generator/rh_api.php';

// Fonction pour tester un endpoint
function testEndpoint($url, $description) {
    echo "<h2>$description</h2>";
    echo "<p><strong>URL:</strong> $url</p>";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "<p><strong>Code HTTP:</strong> $httpCode</p>";
    
    if ($error) {
        echo "<p style='color: red;'><strong>Erreur cURL:</strong> $error</p>";
        return false;
    }
    
    if ($httpCode !== 200) {
        echo "<p style='color: red;'><strong>Erreur HTTP:</strong> $httpCode</p>";
        return false;
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "<p style='color: red;'><strong>Erreur JSON:</strong> " . json_last_error_msg() . "</p>";
        echo "<p><strong>Réponse brute:</strong> " . htmlspecialchars($response) . "</p>";
        return false;
    }
    
    echo "<p style='color: green;'><strong>✓ Succès</strong></p>";
    echo "<p><strong>Réponse:</strong></p>";
    echo "<pre>" . htmlspecialchars(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>";
    
    return $data;
}

// Test 1: Statistiques
echo "<hr>";
testEndpoint($baseUrl . '?action=get_stats', 'Test des statistiques');

// Test 2: Filières
echo "<hr>";
testEndpoint($baseUrl . '?action=get_filieres', 'Test des filières');

// Test 3: Recherche avancée - Description uniquement
echo "<hr>";
$searchUrl = $baseUrl . '?action=advanced_search&description=développeur&description_weight=0.5&tasks_weight=0.3&skills_weight=0.2';
testEndpoint($searchUrl, 'Test recherche avancée - Description (développeur)');

// Test 4: Recherche avancée - Compétences uniquement
echo "<hr>";
$searchUrl = $baseUrl . '?action=advanced_search&skills=java&description_weight=0.3&tasks_weight=0.3&skills_weight=0.4';
testEndpoint($searchUrl, 'Test recherche avancée - Compétences (java)');

// Test 5: Recherche avancée - Expériences uniquement
echo "<hr>";
$searchUrl = $baseUrl . '?action=advanced_search&tasks=gestion&description_weight=0.2&tasks_weight=0.6&skills_weight=0.2';
testEndpoint($searchUrl, 'Test recherche avancée - Expériences (gestion)');

// Test 6: Recherche avancée - Combinaison
echo "<hr>";
$searchUrl = $baseUrl . '?action=advanced_search&description=chef&tasks=projet&skills=management&description_weight=0.3&tasks_weight=0.4&skills_weight=0.3';
testEndpoint($searchUrl, 'Test recherche avancée - Combinaison (chef + projet + management)');

// Test 7: Recherche avec filtre filière
echo "<hr>";
$searchUrl = $baseUrl . '?action=advanced_search&description=développeur&filiere=1&description_weight=0.5&tasks_weight=0.3&skills_weight=0.2';
testEndpoint($searchUrl, 'Test recherche avancée avec filtre filière');

// Test 8: Recherche avec filtre date
echo "<hr>";
$searchUrl = $baseUrl . '?action=advanced_search&description=développeur&date_range=30&description_weight=0.5&tasks_weight=0.3&skills_weight=0.2';
testEndpoint($searchUrl, 'Test recherche avancée avec filtre date (30 jours)');

// Test 9: Recherche vide (tous les CV)
echo "<hr>";
$searchUrl = $baseUrl . '?action=advanced_search&description_weight=0.33&tasks_weight=0.34&skills_weight=0.33';
testEndpoint($searchUrl, 'Test recherche avancée vide (tous les CV)');

// Test 10: Détails d'un CV (si des résultats existent)
echo "<hr>";
testEndpoint($baseUrl . '?action=get_cv_details&id=1', 'Test détails CV (ID 1)');

echo "<hr>";
echo "<h2>Résumé des tests</h2>";
echo "<p>Les tests ci-dessus vérifient :</p>";
echo "<ul>";
echo "<li>✓ Récupération des statistiques</li>";
echo "<li>✓ Récupération des filières</li>";
echo "<li>✓ Recherche par description/profil</li>";
echo "<li>✓ Recherche par compétences/langues</li>";
echo "<li>✓ Recherche par expériences/formations</li>";
echo "<li>✓ Recherche combinée</li>";
echo "<li>✓ Filtres par filière et date</li>";
echo "<li>✓ Récupération des détails CV</li>";
echo "</ul>";

echo "<p><strong>Note:</strong> Les résultats dépendent des données présentes dans la base de données.</p>";
?> 