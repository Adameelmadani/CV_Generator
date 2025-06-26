<?php
include('db_connection.php');

if (isset($_POST['email'], $_POST['code'], $_POST['new_password'])) {
    $email = trim($_POST['email']);
    $code = trim($_POST['code']);
    $newPassword = password_hash($_POST['new_password'], PASSWORD_DEFAULT);

    // Verify again before resetting
    $stmt = $pdo->prepare("SELECT * FROM PasswordResets WHERE email = :email AND code = :code AND expires_at >= NOW() ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([':email' => $email, ':code' => $code]);
    $reset = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reset) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired code.']);
        exit();
    }

    // Update user password
    $stmt = $pdo->prepare("UPDATE Users SET Password = :password WHERE Email = :email");
    $stmt->execute([':password' => $newPassword, ':email' => $email]);

    // Invalidate the code
    $stmt = $pdo->prepare("DELETE FROM PasswordResets WHERE email = :email");
    $stmt->execute([':email' => $email]);

    echo json_encode(['status' => 'success', 'message' => 'Password has been reset successfully.']);
}
