<?php
session_start();
include('db_connection.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var(trim($_POST['signup_email']), FILTER_VALIDATE_EMAIL);
    $password = $_POST['signup_password'];
    $telephone = $_POST['signup_tel'];
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    header('Content-Type: application/json');

    if (!$email) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Adresse email invalide.',
            'redirect' => 'Login_Signup/auth.html'
        ]);
        exit();
    }

    try {
        // Vérifier si l'email existe déjà
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':email' => $email]);
        $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existingUser) {
            echo json_encode([
                'status' => 'error',
                'message' => "L'email est déjà utilisé.",
                'redirect' => 'Login_Signup/auth.html'
            ]);
            exit();
        }

        // Insérer l'utilisateur dans la base
        $sql = "INSERT INTO users (email, hashed_password, phone_number) VALUES (:email, :password, :telephone)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':email' => $email,
            ':password' => $hashed_password,
            ':telephone' => $telephone,
        ]);

        // Récupérer l'ID nouvellement inséré
        $userId = $pdo->lastInsertId();
        $_SESSION['userId'] = $userId;
        $_SESSION['userEmail'] = $email;        echo json_encode([
            'status' => 'success',
            'message' => 'Inscription réussie !',
            'redirect' => '../Cv_generator/user_home.html'
        ]);
        exit();
    } catch (Exception $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Erreur serveur. Veuillez réessayer.',
            'redirect' => 'Login_Signup/auth.html'
        ]);
        error_log("Erreur lors de l'inscription : " . $e->getMessage());
        exit();
    }
}
?>