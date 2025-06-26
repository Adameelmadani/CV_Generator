<?php
include('db_connection.php');

if (isset($_POST['email'], $_POST['code'])) {
    $email = trim($_POST['email']);
    $code = trim($_POST['code']);

    $stmt = $pdo->prepare("SELECT * FROM PasswordResets WHERE email = :email AND code = :code AND expires_at >= NOW() ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([':email' => $email, ':code' => $code]);
    $reset = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($reset) {
        echo json_encode(['status' => 'success', 'message' => 'Code verified. You can now reset your password.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired code.']);
    }
}
