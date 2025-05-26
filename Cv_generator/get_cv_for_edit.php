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
        'message' => 'CV ID requis'
    ]);
    exit();
}

$cvId = $input['cv_id'];
$userId = $_SESSION['userId'];

try {
    // Récupérer le CV de l'utilisateur
    $sql = "SELECT xml_content, cv_name FROM user_cvs WHERE id = :cv_id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cv_id' => $cvId, ':user_id' => $userId]);
    $cv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cv) {
        echo json_encode([
            'status' => 'error',
            'message' => 'CV non trouvé ou vous n\'avez pas les droits pour le modifier'
        ]);
        exit();
    }
    
    if (!$cv['xml_content']) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Aucune donnée XML disponible pour ce CV'
        ]);
        exit();
    }
    
    echo json_encode([
        'status' => 'success',
        'cv_data' => $cv['xml_content'],
        'cv_name' => $cv['cv_name']
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la récupération du CV: ' . $e->getMessage()
    ]);
    error_log("Erreur get_cv_for_edit.php: " . $e->getMessage());
}
exit();
?>
