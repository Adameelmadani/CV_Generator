<?php
// Test des credentials RH
function getEnvVar($key, $envPath) {
    if (!file_exists($envPath)) {
        echo "Erreur: Fichier $envPath n'existe pas\n";
        return null;
    }
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
echo "Test des credentials RH:\n";
echo "Fichier env: $envPath\n";

$rh_email = getEnvVar('RH_EMAIL', $envPath);
$rh_password = getEnvVar('RH_PASSWORD', $envPath);

echo "RH_EMAIL: " . ($rh_email ? $rh_email : "NON TROUVÉ") . "\n";
echo "RH_PASSWORD: " . ($rh_password ? "***" . substr($rh_password, -3) : "NON TROUVÉ") . "\n";

if ($rh_email && $rh_password) {
    echo "✅ Credentials RH configurés correctement\n";
} else {
    echo "❌ Erreur dans la configuration des credentials RH\n";
}
?> 