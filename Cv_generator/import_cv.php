<?php
session_start();
include('../Login_Signup/db_connection.php');

header('Content-Type: application/json');

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Utilisateur non connecté'
    ]);
    exit();
}

// Vérifier que la méthode est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Méthode non autorisée'
    ]);
    exit();
}

// Vérifier qu'un fichier a été uploadé
if (!isset($_FILES['xml_file']) || $_FILES['xml_file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Aucun fichier valide reçu'
    ]);
    exit();
}

$file = $_FILES['xml_file'];
$userId = $_SESSION['userId'];

// Vérifier le type de fichier
if ($file['type'] !== 'text/xml' && pathinfo($file['name'], PATHINFO_EXTENSION) !== 'xml') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Le fichier doit être au format XML'
    ]);
    exit();
}

// Vérifier la taille du fichier (max 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Le fichier est trop volumineux (max 5MB)'
    ]);
    exit();
}

try {
    // Lire le contenu du fichier XML
    $xmlContent = file_get_contents($file['tmp_name']);
    
    if ($xmlContent === false) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Impossible de lire le fichier'
        ]);
        exit();
    }
    
    // Valider le XML
    $xml = simplexml_load_string($xmlContent);
    
    if ($xml === false) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Le fichier XML n\'est pas valide'
        ]);
        exit();
    }
    
    // Extraire le nom du CV (depuis le nom ou le nom du fichier)
    $cvName = 'CV Importé';
    if (isset($xml->PersonalInfo->Name) && !empty($xml->PersonalInfo->Name)) {
        $cvName = 'CV - ' . (string)$xml->PersonalInfo->Name;
    } else {
        $cvName = pathinfo($file['name'], PATHINFO_FILENAME);
    }
    
    // Vérifier si un CV avec ce nom existe déjà pour cet utilisateur
    $sql = "SELECT id FROM user_cvs WHERE user_id = :user_id AND cv_name = :cv_name";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':user_id' => $userId, ':cv_name' => $cvName]);
    $existingCV = $stmt->fetch();
    
    if ($existingCV) {
        // Ajouter un suffixe numérique
        $counter = 1;
        $originalName = $cvName;
        do {
            $cvName = $originalName . ' (' . $counter . ')';
            $stmt->execute([':user_id' => $userId, ':cv_name' => $cvName]);
            $existingCV = $stmt->fetch();
            $counter++;
        } while ($existingCV && $counter < 100);
        
        if ($counter >= 100) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Trop de CV avec des noms similaires'
            ]);
            exit();
        }
    }
    
    // Insérer le CV dans la base de données
    $sql = "INSERT INTO user_cvs (user_id, cv_name, xml_content, created_at, updated_at) 
            VALUES (:user_id, :cv_name, :xml_content, NOW(), NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':user_id' => $userId,
        ':cv_name' => $cvName,
        ':xml_content' => $xmlContent
    ]);
    
    $cvId = $pdo->lastInsertId();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'CV importé avec succès',
        'cv_id' => $cvId,
        'cv_name' => $cvName
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de l\'import: ' . $e->getMessage()
    ]);
    error_log("Erreur import_cv.php: " . $e->getMessage());
}
exit();
?>
