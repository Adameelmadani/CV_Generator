<?php
session_start();
include('db_connection.php');
require_once 'mailer.php'; // include the mailer

if (isset($_POST['email'])) {
    $email = trim($_POST['email']);

    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT * FROM Users WHERE Email = :email");
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(['status' => 'error', 'message' => 'Email not found.']);
            exit();
        }

        // Limit to 3 reset attempts per day
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM PasswordResets WHERE email = :email AND DATE(created_at) = CURDATE()");
        $stmt->execute([':email' => $email]);
        $attemptsToday = $stmt->fetchColumn();

        if ($attemptsToday >= 3) {
            echo json_encode(['status' => 'error', 'message' => 'Maximum reset attempts reached for today.']);
            exit();
        }

        // Generate a secure 6-digit code
        $code = random_int(100000, 999999);

        // Store the code with timestamp and expiry
        $stmt = $pdo->prepare("INSERT INTO PasswordResets (email, code, created_at, expires_at) VALUES (:email, :code, NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE))");
        $stmt->execute([':email' => $email, ':code' => $code]);

        if (sendResetCode($email, $code)) {
            echo json_encode(['status' => 'success', 'message' => 'Reset code sent to your email.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to send reset email.']);
        }

        echo json_encode(['status' => 'success', 'message' => 'Reset code sent to your email.']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
