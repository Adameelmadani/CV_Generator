<?php
session_start();
include('db_connection.php');

header('Content-Type: application/json');

// Vérifier si l'utilisateur est connecté
if (isset($_SESSION['userId']) && !empty($_SESSION['userId'])) {
    try {
        // Récupérer les informations utilisateur depuis la base de données
        $sql = "SELECT email, phone_number FROM users WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $_SESSION['userId']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo json_encode([
                'status' => 'success',
                'logged_in' => true,
                'user_id' => $_SESSION['userId'],
                'user_email' => $user['email'],
                'user_tel' => $user['phone_number'],
                'session_id' => session_id()
            ]);
        } else {
            // Utilisateur introuvable en base, détruire la session
            session_unset();
            session_destroy();
            echo json_encode([
                'status' => 'error',
                'logged_in' => false,
                'message' => 'Utilisateur introuvable'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'logged_in' => false,
            'message' => 'Erreur base de données'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'logged_in' => false,
        'message' => 'Session non valide ou expirée'
    ]);
}
exit();
?>