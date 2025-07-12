<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée. Utilisez POST.'
    ]);
    exit;
}

function getEnvVar($key, $envPath) {
    if (!file_exists($envPath)) return null;
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($k, $v) = explode('=', $line, 2);
            if (trim($k) === $key) return trim($v);
        }
    }
    return null;
}

$envPath = __DIR__ . '/rh.env';
$rh_email = getEnvVar('RH_EMAIL', $envPath);
$rh_password = getEnvVar('RH_PASSWORD', $envPath);

$input_email = isset($_POST['rh_email']) ? $_POST['rh_email'] : '';
$input_password = isset($_POST['rh_password']) ? $_POST['rh_password'] : '';

if ($input_email === $rh_email && $input_password === $rh_password) {
    // Auth RH OK
    session_start();
    $_SESSION['rh_authenticated'] = true;
    $_SESSION['rh_email'] = $input_email;
    echo json_encode([
        'success' => true, 
        'message' => 'Connexion RH réussie',
        'redirect' => '../rh/index.html'
    ]);
    exit;
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Identifiants RH invalides. Veuillez vérifier votre email et mot de passe.'
    ]);
    exit;
}