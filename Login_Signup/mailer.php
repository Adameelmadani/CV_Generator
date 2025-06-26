<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Ensure Composer autoloader is included

function sendResetCode($email, $code) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // e.g., smtp.gmail.com
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('GMAIL_USER');
        $mail->Password   = getenv('GMAIL_PASS');
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Or SSL
        $mail->Port       = 587; // Use 465 for SSL

        // Recipients
        $mail->setFrom(getenv('GMAIL_USER'), 'CVCRAFT');
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Your Password Reset Code';
        $mail->Body    = "
            <p>Hello,</p>
            <p>Your password reset code is: <strong>$code</strong></p>
            <p>This code will expire in 30 minutes.</p>
            <p>If you did not request a password reset, please ignore this message.</p>
        ";

        $mail->send();
        return true;
    } catch (Exception $e) {
        // Log the error or notify admin
        error_log("Mail Error: {$mail->ErrorInfo}");
        return false;
    }
}
