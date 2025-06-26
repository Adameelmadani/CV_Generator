<?php
session_start();
include('../Login_Signup/db_connection.php');

header('Content-Type: application/json');

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Utilisateur non connecté'
    ]);
    exit();
}

$userId = $_SESSION['userId'];

try {
    // Récupérer tous les CV de l'utilisateur
    $sql = "SELECT id, cv_name, xml_content, created_at, updated_at 
            FROM user_cvs 
            WHERE user_id = :user_id 
            ORDER BY updated_at DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $userId]);
    $cvs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'cvs' => $cvs
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la récupération des CV: ' . $e->getMessage()
    ]);
    error_log("Erreur get_user_cvs.php: " . $e->getMessage());
}
exit();
?>
