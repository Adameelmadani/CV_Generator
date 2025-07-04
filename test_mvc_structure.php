<?php
/**
 * Script de test pour vérifier la structure MVC
 * Ce script teste si tous les composants MVC fonctionnent correctement
 */

require_once __DIR__ . '/core/bootstrap.php';

echo "<h2>Test de la Structure MVC</h2>\n";

// Test 1: Vérifier que les classes se chargent correctement
echo "<h3>1. Test du chargement des classes</h3>\n";

try {
    $userModel = new User();
    echo "✅ User Model chargé avec succès<br>\n";
} catch (Exception $e) {
    echo "❌ Erreur lors du chargement du User Model: " . $e->getMessage() . "<br>\n";
}

try {
    $authController = new AuthController();
    echo "✅ AuthController chargé avec succès<br>\n";
} catch (Exception $e) {
    echo "❌ Erreur lors du chargement d'AuthController: " . $e->getMessage() . "<br>\n";
}

// Test 2: Vérifier la connexion à la base de données
echo "<h3>2. Test de la connexion à la base de données</h3>\n";

try {
    $db = Database::getInstance();
    $connection = $db->getConnection();
    if ($connection) {
        echo "✅ Connexion à la base de données réussie<br>\n";
        
        // Vérifier si la table users existe et a la colonne username
        $stmt = $connection->query("DESCRIBE users");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (in_array('username', $columns)) {
            echo "✅ La colonne 'username' existe dans la table users<br>\n";
        } else {
            echo "❌ La colonne 'username' n'existe pas dans la table users<br>\n";
            echo "💡 Exécutez le script database_update_username.sql<br>\n";
        }
        
    } else {
        echo "❌ Échec de la connexion à la base de données<br>\n";
    }
} catch (Exception $e) {
    echo "❌ Erreur de base de données: " . $e->getMessage() . "<br>\n";
}

// Test 3: Vérifier les méthodes du modèle User
echo "<h3>3. Test des méthodes du User Model</h3>\n";

try {
    $userModel = new User();
    
    // Test de validation
    $usernameErrors = $userModel->validateUsername('test123');
    if (empty($usernameErrors)) {
        echo "✅ Validation username fonctionne<br>\n";
    } else {
        echo "❌ Validation username échoue: " . implode(', ', $usernameErrors) . "<br>\n";
    }
    
    $emailErrors = $userModel->validateEmail('test@example.com');
    if (empty($emailErrors)) {
        echo "✅ Validation email fonctionne<br>\n";
    } else {
        echo "❌ Validation email échoue: " . implode(', ', $emailErrors) . "<br>\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur lors du test du User Model: " . $e->getMessage() . "<br>\n";
}

// Test 4: Vérifier que les fichiers handlers MVC existent
echo "<h3>4. Test de l'existence des fichiers handlers MVC</h3>\n";

$mvcFiles = [
    'Login_Signup/signup_handler_mvc.php',
    'Login_Signup/login_handler_mvc.php',
    'Login_Signup/check_session_mvc.php',
    'Login_Signup/logout_mvc.php',
    'Login_Signup/password_manager_mvc.php'
];

foreach ($mvcFiles as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "✅ $file existe<br>\n";
    } else {
        echo "❌ $file n'existe pas<br>\n";
    }
}

// Test 5: Vérifier que db_connection.php utilise la classe Database MVC
echo "<h3>5. Test de l'unification de la base de données</h3>\n";

try {
    // Inclure db_connection.php et vérifier qu'il utilise la même instance
    ob_start(); // Capturer toute sortie
    include __DIR__ . '/Login_Signup/db_connection.php';
    $output = ob_get_clean(); // Récupérer et nettoyer la sortie
    
    if (isset($pdo) && $pdo instanceof PDO) {
        echo "✅ db_connection.php fournit une connexion PDO valide<br>\n";
        
        // Vérifier que c'est la même instance que celle utilisée par Database
        $dbInstance = Database::getInstance()->getConnection();
        if ($pdo === $dbInstance) {
            echo "✅ db_connection.php utilise la même instance que la classe Database<br>\n";
        } else {
            echo "⚠️ db_connection.php utilise une instance différente (mais compatible)<br>\n";
        }
    } else {
        echo "❌ db_connection.php ne fournit pas de connexion PDO valide<br>\n";
    }
    
    if (empty($output)) {
        echo "✅ Aucune erreur lors du chargement de db_connection.php<br>\n";
    } else {
        echo "⚠️ Sortie lors du chargement: " . htmlspecialchars($output) . "<br>\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur lors du test de db_connection.php: " . $e->getMessage() . "<br>\n";
}

echo "<h3>Résumé</h3>\n";
echo "<p>Si tous les tests montrent ✅, votre structure MVC est correctement configurée !</p>\n";
echo "<p>Les anciens fichiers (signup_handler.php, login_handler.php, etc.) ont été mis à jour pour rediriger vers les versions MVC.</p>\n";
?>
