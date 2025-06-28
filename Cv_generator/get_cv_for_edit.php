<?php
session_start();
include('../Login_Signup/db_connection.php');

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['userId'])) {
    // Rediriger vers la page de connexion si pas connecté
    header('Location: ../Login_Signup/auth.html');
    exit();
}

// Vérifier que le CV ID est fourni via GET
if (!isset($_GET['cv_id']) || empty($_GET['cv_id'])) {
    // Rediriger vers la page d'accueil utilisateur si pas de CV ID
    header('Location: user_home.html?error=cv_id_required');
    exit();
}

$cvId = intval($_GET['cv_id']);
$userId = $_SESSION['userId'];

try {
    // Vérifier que le CV existe et appartient à l'utilisateur
    $sql = "SELECT id FROM user_cvs WHERE id = :cv_id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cv_id' => $cvId, ':user_id' => $userId]);
    $cv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cv) {
        // Rediriger vers la page d'accueil avec message d'erreur
        header('Location: user_home.html?error=cv_not_found');
        exit();
    }
    
    // Rediriger vers home.html avec le paramètre d'édition
    header('Location: home.html?edit=' . $cvId);
    exit();
    
} catch (Exception $e) {
    // Logger l'erreur et rediriger avec message d'erreur
    error_log("Erreur get_cv_for_edit.php: " . $e->getMessage());
    header('Location: user_home.html?error=database_error');
    exit();
}
?>
