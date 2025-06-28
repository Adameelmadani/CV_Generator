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

// Vérifier que le CV ID est fourni
if (!isset($_GET['cv_id']) || empty($_GET['cv_id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'ID du CV requis'
    ]);
    exit();
}

$cvId = intval($_GET['cv_id']);
$userId = $_SESSION['userId'];

try {
    // Récupérer le CV avec vérification d'appartenance à l'utilisateur
    $sql = "SELECT id, cv_name, xml_content, created_at, updated_at 
            FROM user_cvs 
            WHERE id = :cv_id AND user_id = :user_id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':cv_id' => $cvId, ':user_id' => $userId]);
    $cv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cv) {
        echo json_encode([
            'status' => 'error',
            'message' => 'CV introuvable ou accès non autorisé'
        ]);
        exit();
    }
    
    // Parser le XML pour extraire les données
    $cvData = null;
    if (!empty($cv['xml_content'])) {
        try {
            $xml = simplexml_load_string($cv['xml_content']);
            if ($xml !== false) {
                $cvData = [
                    'personal_info' => [
                        'nom' => (string)$xml->personalInfo->lastname ?? '',
                        'prenom' => (string)$xml->personalInfo->firstname ?? '',
                        'location' => (string)$xml->personalInfo->location ?? '',
                        'email' => (string)$xml->personalInfo->email ?? '',
                        'telephone' => (string)$xml->personalInfo->phone ?? '',
                        'website' => (string)$xml->personalInfo->website ?? '',
                        'linkedin' => (string)$xml->personalInfo->linkedin ?? '',
                        'github' => (string)$xml->personalInfo->github ?? ''
                    ],
                    'profile' => [
                        'description' => (string)$xml->profil->description ?? ''
                    ],
                    'education' => [],
                    'certificates' => [],
                    'experiences' => [],
                    'projects' => [],
                    'skills' => [],
                    'languages' => []
                ];
                
                // Education
                if (isset($xml->education->degree)) {
                    foreach ($xml->education->degree as $edu) {
                        $cvData['education'][] = [
                            'degree' => (string)$edu->title ?? '',
                            'dates' => (string)$edu->period ?? '',
                            'university' => (string)$edu->institution ?? '',
                            'field' => (string)$edu->field ?? '',
                            'details' => (string)$edu->description ?? ''
                        ];
                    }
                }
                
                // Certificates
                if (isset($xml->certificates->certificate)) {
                    foreach ($xml->certificates->certificate as $cert) {
                        $cvData['certificates'][] = [
                            'name' => (string)$cert->n ?? '',
                            'date' => (string)$cert->date ?? '',
                            'issuer' => (string)$cert->issuer ?? '',
                            'location' => (string)$cert->location ?? '',
                            'description' => (string)$cert->description ?? ''
                        ];
                    }
                }
                
                // Experiences
                if (isset($xml->experiences->experience)) {
                    foreach ($xml->experiences->experience as $exp) {
                        $cvData['experiences'][] = [
                            'location' => (string)$exp->location ?? '',
                            'dates' => (string)$exp->period ?? '',
                            'company' => (string)$exp->company ?? '',
                            'position' => (string)$exp->position ?? '',
                            'description' => (string)$exp->description ?? ''
                        ];
                    }
                }
                
                // Projects
                if (isset($xml->projects->project)) {
                    foreach ($xml->projects->project as $project) {
                        $cvData['projects'][] = [
                            'name' => (string)$project->n ?? '',
                            'link' => (string)$project->link ?? '',
                            'description' => (string)$project->description ?? ''
                        ];
                    }
                }
                
                // Skills
                if (isset($xml->skills->skill)) {
                    foreach ($xml->skills->skill as $skill) {
                        $cvData['skills'][] = [
                            'category' => (string)$skill->category ?? '',
                            'items' => (string)$skill->item ?? ''
                        ];
                    }
                }
                
                // Languages
                if (isset($xml->languages->language)) {
                    foreach ($xml->languages->language as $lang) {
                        $cvData['languages'][] = [
                            'name' => (string)$lang->n ?? '',
                            'level' => (string)$lang->level ?? ''
                        ];
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Erreur parsing XML: " . $e->getMessage());
        }
    }
    
    echo json_encode([
        'status' => 'success',
        'cv' => [
            'id' => $cv['id'],
            'name' => $cv['cv_name'],
            'data' => $cvData
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur lors de la récupération du CV: ' . $e->getMessage()
    ]);
    error_log("Erreur get_cv_data.php: " . $e->getMessage());
}
exit();
?>
