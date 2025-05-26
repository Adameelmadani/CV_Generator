<?php
session_start();
include('../Login_Signup/db_connection.php');

header('Content-Type: application/json');

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Non autorisé'
    ]);
    exit();
}

// Vérifier que la méthode est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Méthode non autorisée'
    ]);
    exit();
}

// Lire les données JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['cv_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'ID du CV requis'
    ]);
    exit();
}

$cvId = $input['cv_id'];

try {
    // Vérifier que le CV appartient à l'utilisateur
    $sql = "SELECT id, cv_name FROM user_cvs WHERE id = :cv_id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cv_id' => $cvId, ':user_id' => $_SESSION['userId']]);
    $cv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cv) {
        echo json_encode([
            'status' => 'error',
            'message' => 'CV non trouvé ou vous n\'avez pas les droits pour le supprimer'
        ]);
        exit();
    }
    
    // Supprimer le CV
    $sql = "DELETE FROM user_cvs WHERE id = :cv_id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cv_id' => $cvId, ':user_id' => $_SESSION['userId']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'status' => 'success',
            'message' => 'CV "' . $cv['cv_name'] . '" supprimé avec succès'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Erreur lors de la suppression du CV'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la suppression: ' . $e->getMessage()
    ]);
    error_log("Erreur delete_cv.php: " . $e->getMessage());
}
?>
