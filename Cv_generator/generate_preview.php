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
    
    // Créer un fichier temporaire pour le XML
    $tempXmlFile = tempnam(sys_get_temp_dir(), 'cv_preview_') . '.xml';
    file_put_contents($tempXmlFile, $cv['xml_content']);
    
    // Générer le PDF temporaire
    $tempPdfFile = tempnam(sys_get_temp_dir(), 'cv_preview_') . '.pdf';
    
    // Utiliser la même logique de génération PDF que dans generate_cv.php
    require_once('tcpdf/tcpdf.php');
    
    // Charger les données XML
    $xml = simplexml_load_string($cv['xml_content']);
    
    if ($xml === false) {
        unlink($tempXmlFile);
        http_response_code(400);
        exit('Invalid XML content');
    }
    
    // Créer le PDF avec TCPDF
    class MYPDF extends TCPDF {
        public function Header() {
            $this->SetFont('helvetica', 'B', 16);
            $this->SetTextColor(0, 0, 0);
            $this->Cell(0, 15, 'Curriculum Vitae Europass', 0, false, 'C', 0, '', 0, false, 'M', 'M');
            $this->Ln(20);
        }
        
        public function Footer() {
            $this->SetY(-15);
            $this->SetFont('helvetica', 'I', 8);
            $this->SetTextColor(128, 128, 128);
            $this->Cell(0, 10, 'Page ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
        }
    }
    
    $pdf = new MYPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
      $pdf->SetCreator(PDF_CREATOR);
    $pdf->SetAuthor('CV Generator');
    
    // Construire le nom complet à partir de la structure XML correcte
    $fullName = '';
    if (isset($xml->personalInfo->firstname) && isset($xml->personalInfo->lastname)) {
        $fullName = trim((string)$xml->personalInfo->firstname . ' ' . (string)$xml->personalInfo->lastname);
    }
    $pdf->SetTitle('CV Europass - ' . ($fullName ?: 'CV'));
    $pdf->SetSubject('Curriculum Vitae');
    
    $pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);
    $pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
    $pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
    $pdf->SetFooterMargin(PDF_MARGIN_FOOTER);
    $pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);
    $pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);
    
    $pdf->AddPage();
    $pdf->SetFont('helvetica', '', 11);
      // Informations personnelles
    $html = '<h2 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">INFORMATIONS PERSONNELLES</h2>';
    
    if (isset($xml->personalInfo->firstname) && isset($xml->personalInfo->lastname)) {
        $fullName = trim((string)$xml->personalInfo->firstname . ' ' . (string)$xml->personalInfo->lastname);
        if (!empty($fullName)) {
            $html .= '<p><strong>Nom:</strong> ' . htmlspecialchars($fullName) . '</p>';
        }
    }
    
    if (isset($xml->personalInfo->email) && !empty($xml->personalInfo->email)) {
        $html .= '<p><strong>Email:</strong> ' . htmlspecialchars((string)$xml->personalInfo->email) . '</p>';
    }
    
    if (isset($xml->personalInfo->phone) && !empty($xml->personalInfo->phone)) {
        $html .= '<p><strong>Téléphone:</strong> ' . htmlspecialchars((string)$xml->personalInfo->phone) . '</p>';
    }
    
    if (isset($xml->personalInfo->address) && !empty($xml->personalInfo->address)) {
        $html .= '<p><strong>Adresse:</strong> ' . htmlspecialchars((string)$xml->personalInfo->address) . '</p>';
    }
    
    if (isset($xml->personalInfo->birthDate) && !empty($xml->personalInfo->birthDate)) {
        $html .= '<p><strong>Date de naissance:</strong> ' . htmlspecialchars((string)$xml->personalInfo->birthDate) . '</p>';
    }
    
    if (isset($xml->personalInfo->nationality) && !empty($xml->personalInfo->nationality)) {
        $html .= '<p><strong>Nationalité:</strong> ' . htmlspecialchars((string)$xml->personalInfo->nationality) . '</p>';
    }
    
    if (isset($xml->personalInfo->linkedin) && !empty($xml->personalInfo->linkedin)) {
        $html .= '<p><strong>LinkedIn:</strong> ' . htmlspecialchars((string)$xml->personalInfo->linkedin) . '</p>';
    }
    
    if (isset($xml->personalInfo->jobTitle) && !empty($xml->personalInfo->jobTitle)) {
        $html .= '<p><strong>Emploi recherché:</strong> ' . htmlspecialchars((string)$xml->personalInfo->jobTitle) . '</p>';
    }
    
    if (isset($xml->personalInfo->jobDescription) && !empty($xml->personalInfo->jobDescription)) {
        $html .= '<p><strong>Description emploi:</strong> ' . htmlspecialchars((string)$xml->personalInfo->jobDescription) . '</p>';
    }
    
    if (isset($xml->personalInfo->profileDescription) && !empty($xml->personalInfo->profileDescription)) {
        $html .= '<p><strong>Profil:</strong> ' . htmlspecialchars((string)$xml->personalInfo->profileDescription) . '</p>';
    }
      // Expérience professionnelle
    if (isset($xml->experiences->experience) && count($xml->experiences->experience) > 0) {
        $html .= '<h2 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px; margin-top: 20px;">EXPÉRIENCE PROFESSIONNELLE</h2>';
        
        foreach ($xml->experiences->experience as $job) {
            $html .= '<div style="margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #2c5aa0;">';
            
            if (isset($job->position) && !empty($job->position)) {
                $html .= '<h3 style="color: #2c5aa0; margin-bottom: 5px;">' . htmlspecialchars((string)$job->position) . '</h3>';
            }
            
            if (isset($job->employer) && !empty($job->employer)) {
                $html .= '<p><strong>Employeur:</strong> ' . htmlspecialchars((string)$job->employer) . '</p>';
            }
            
            if (isset($job->period) && !empty($job->period)) {
                $html .= '<p><strong>Période:</strong> ' . htmlspecialchars((string)$job->period) . '</p>';
            }
            
            if (isset($job->description) && !empty($job->description)) {
                $html .= '<p><strong>Description:</strong> ' . htmlspecialchars((string)$job->description) . '</p>';
            }
            
            $html .= '</div>';
        }    }
    
    // Formation
    if (isset($xml->education->degree) && count($xml->education->degree) > 0) {
        $html .= '<h2 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px; margin-top: 20px;">FORMATION</h2>';
        
        foreach ($xml->education->degree as $degree) {
            $html .= '<div style="margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border-left: 4px solid #2c5aa0;">';
            
            if (isset($degree->title) && !empty($degree->title)) {
                $html .= '<h3 style="color: #2c5aa0; margin-bottom: 5px;">' . htmlspecialchars((string)$degree->title) . '</h3>';
            }
            
            if (isset($degree->institution) && !empty($degree->institution)) {
                $html .= '<p><strong>Institution:</strong> ' . htmlspecialchars((string)$degree->institution) . '</p>';
            }
            
            if (isset($degree->period) && !empty($degree->period)) {
                $html .= '<p><strong>Période:</strong> ' . htmlspecialchars((string)$degree->period) . '</p>';
            }
            
            if (isset($degree->description) && !empty($degree->description)) {
                $html .= '<p><strong>Description:</strong> ' . htmlspecialchars((string)$degree->description) . '</p>';
            }
            
            $html .= '</div>';
        }
    }
    
    // Compétences
    if (isset($xml->skills)) {
        $html .= '<h2 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px; margin-top: 20px;">COMPÉTENCES</h2>';
        
        if (isset($xml->skills->digitalSkills) && !empty($xml->skills->digitalSkills)) {
            $html .= '<h3 style="color: #2c5aa0; margin-bottom: 10px;">Compétences numériques</h3>';
            $html .= '<p>' . htmlspecialchars((string)$xml->skills->digitalSkills) . '</p>';
        }
        
        if (isset($xml->skills->otherSkills) && !empty($xml->skills->otherSkills)) {
            $html .= '<h3 style="color: #2c5aa0; margin-bottom: 10px; margin-top: 15px;">Autres compétences</h3>';
            $html .= '<p>' . htmlspecialchars((string)$xml->skills->otherSkills) . '</p>';
        }
    }
    
    // Langues
    if (isset($xml->languages->language) && count($xml->languages->language) > 0) {
        $html .= '<h2 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px; margin-top: 20px;">LANGUES</h2>';
        
        foreach ($xml->languages->language as $language) {
            $html .= '<div style="margin-bottom: 10px; padding: 8px; background-color: #f8f9fa;">';
            
            $langText = '';
            if (isset($language->name) && !empty($language->name)) {
                $langText .= '<strong>' . htmlspecialchars((string)$language->name) . '</strong>';
            }
            if (isset($language->level) && !empty($language->level)) {
                $langText .= ' - Niveau ' . htmlspecialchars((string)$language->level);
            }
            if (!empty($langText)) {
                $html .= '<p>' . $langText . '</p>';
            }
            
            if (isset($language->description) && !empty($language->description)) {
                $html .= '<p style="margin-top: 5px; font-style: italic;">' . htmlspecialchars((string)$language->description) . '</p>';
            }
            
            $html .= '</div>';
        }
    }
    
    $pdf->writeHTML($html, true, false, true, false, '');
    
    // Sauvegarder le PDF
    $pdf->Output($tempPdfFile, 'F');
    
    // Nettoyer le fichier XML temporaire
    unlink($tempXmlFile);
    
    // Vérifier que le PDF a été créé
    if (!file_exists($tempPdfFile)) {
        http_response_code(500);
        exit('Failed to generate PDF');
    }
    
    // Envoyer le PDF
    header('Content-Type: application/pdf');
    header('Content-Length: ' . filesize($tempPdfFile));
    header('Content-Disposition: inline; filename="cv_preview.pdf"');
    
    readfile($tempPdfFile);
    
    // Nettoyer le fichier PDF temporaire
    unlink($tempPdfFile);
    
} catch (Exception $e) {
    error_log("Erreur generate_preview.php: " . $e->getMessage());
    http_response_code(500);
    exit('Server error');
}
exit();
?>
