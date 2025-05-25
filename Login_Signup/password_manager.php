<?php

session_start();
include('connection.php');

// Vérifier si le formulaire a été soumis
if (isset($_POST['email']) && isset($_POST['tel'])) {
    $email = trim($_POST['email']);
    $tel = trim($_POST['tel']);

    try {
        // Désactiver les contraintes de clé étrangère
        $pdo->exec("SET foreign_key_checks = 0");

        // Préparer les requêtes pour vérifier les utilisateurs
        $stmt1 = $pdo->prepare("SELECT * FROM UsersProf WHERE Email = :email");
        $stmt1->execute([':email' => $email]);
        $userProf = $stmt1->fetch(PDO::FETCH_ASSOC);

        $stmt3 = $pdo->prepare("SELECT * FROM UsersStudent WHERE Email = :email");
        $stmt3->execute([':email' => $email]);
        $userStudent = $stmt3->fetch(PDO::FETCH_ASSOC);

        header('Content-Type: application/json'); // Définir le type de contenu JSON

        // Validation des résultats
        if ($userProf) {
            // Supprimer les informations dans UsersProf
            $deleteStmt = $pdo->prepare("DELETE FROM UsersProf WHERE Email = :email");
            $deleteStmt->execute([':email' => $email]);

            echo json_encode(['status' => 'success', 'message' => 'Utilisateur supprimé. Vous pouvez vous inscrire à nouveau.', 'redirect' => '../Login-Signup/knowledgeGuild.html']);
        } elseif ($userStudent) {
            // Supprimer les informations dans UsersStudent
            $deleteStmt = $pdo->prepare("DELETE FROM UsersStudent WHERE Email = :email");
            $deleteStmt->execute([':email' => $email]);

            echo json_encode(['status' => 'success', 'message' => 'Utilisateur supprimé. Vous pouvez vous inscrire à nouveau.', 'redirect' => '../Login-Signup/knowledgeGuild.html']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Utilisateur non trouvé.']);
        }

        // Réactiver les contraintes de clé étrangère
        $pdo->exec("SET foreign_key_checks = 1");
    } catch (PDOException $e) {
        // Gérer les erreurs liées à la base de données
        echo json_encode(['status' => 'error', 'message' => 'Erreur de base de données : ' . $e->getMessage()]);
    }
    exit();
} else {
    // Retourner une erreur si les champs requis ne sont pas fournis
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Champs email et tel requis']);
    exit();
}
