<?php
session_start();
include('../Login_Signup/db_connection.php');

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['userId'])) {
    http_response_code(401);
    exit('Unauthorized');
}

// Vérifier que la méthode est POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed');
}

// Lire les données JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['cv_id'])) {
    http_response_code(400);
    exit('CV ID required');
}

$cvId = $input['cv_id'];
$userId = $_SESSION['userId'];

try {
    // Récupérer le CV de l'utilisateur
    $sql = "SELECT xml_content FROM user_cvs WHERE id = :cv_id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cv_id' => $cvId, ':user_id' => $userId]);
    $cv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cv || !$cv['xml_content']) {
        http_response_code(404);
        exit('CV not found or no XML content');
    }
    
    // Utiliser la même fonction de génération PDF que download_cv.php
    require_once('download_cv.php');
    
    $pdfContent = generatePdfFromXml($cv['xml_content']);
    
    if ($pdfContent !== false && !empty($pdfContent)) {
        // Envoyer le PDF comme aperçu
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="preview.pdf"'); // inline pour affichage dans l'iframe
        header('Content-Length: ' . strlen($pdfContent));
        header('Cache-Control: no-cache, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        echo $pdfContent;
    } else {
        http_response_code(500);
        exit('Erreur lors de la génération du PDF');
    }
    
} catch (Exception $e) {
    error_log("Erreur lors de la génération de l'aperçu : " . $e->getMessage());
    http_response_code(500);
    exit('Erreur serveur');
}
?>
