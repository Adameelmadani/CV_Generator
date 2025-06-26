<?php

session_start();
include('db_connection.php');

header('Content-Type: application/json');

// Si l'utilisateur soumet le formulaire de connexion
if (isset($_POST['login_email']) && isset($_POST['login_password'])) {
    $email = $_POST['login_email'];
    $password = $_POST['login_password'];

    try {
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);        if ($user && password_verify($password, $user['hashed_password'])) {
            $_SESSION['userId'] = $user['id'];
            $_SESSION['userEmail'] = $user['email'];
            $_SESSION['userTel'] = $user['phone_number'];
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Connexion réussie !',
                'redirect' => '../Cv_generator/user_home.html'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Email ou mot de passe incorrect.',
                'redirect' => 'Login_Signup/auth.html'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Erreur serveur. Veuillez réessayer.',
            'redirect' => 'Login_Signup/auth.html'
        ]);
        error_log("Erreur lors de la connexion : " . $e->getMessage());
    }

    exit();
}
?>
