<?php
session_start();
include('../Login_Signup/db_connection.php');

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['userId']) || empty($_SESSION['userId'])) {
    header('HTTP/1.0 403 Forbidden');
    exit('Accès non autorisé');
}

// Gestion des requêtes POST avec JSON (depuis le dashboard)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['cv_id'])) {
        header('HTTP/1.0 400 Bad Request');
        exit('CV ID requis');
    }
    
    $cvId = $input['cv_id'];
    $format = isset($input['format']) ? $input['format'] : 'pdf'; // Support du format depuis la modale
} else {
    // Gestion des requêtes GET (compatibilité avec l'ancien système)
    if (!isset($_GET['id']) || !isset($_GET['format'])) {
        header('HTTP/1.0 400 Bad Request');
        exit('Paramètres manquants');
    }
    
    $cvId = intval($_GET['id']);
    $format = $_GET['format'];
}

// Récupérer le CV de la base de données
try {
    $sql = "SELECT cv_name, xml_content FROM user_cvs WHERE id = :cv_id AND user_id = :user_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':cv_id' => $cvId,
        ':user_id' => $_SESSION['userId']
    ]);
    $cv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cv) {
        header('HTTP/1.0 404 Not Found');
        exit('CV non trouvé');
    }
    
} catch (Exception $e) {
    error_log("Erreur lors de la récupération du CV : " . $e->getMessage());
    header('HTTP/1.0 500 Internal Server Error');
    exit('Erreur serveur');
}

// Extraire les informations du XML pour générer le nom du fichier
$xmlDoc = new DOMDocument();
$xmlDoc->loadXML($cv['xml_content']);

$prenom = $xmlDoc->getElementsByTagName('firstname')->item(0)->nodeValue ?? 'Inconnu';
$nom = $xmlDoc->getElementsByTagName('lastname')->item(0)->nodeValue ?? 'Inconnu';

$baseFileName = "CV_" . $nom . "_" . $prenom;

if ($format === 'xml') {
    // Télécharger le XML
    header('Content-Type: application/xml');
    header('Content-Disposition: attachment; filename="' . $baseFileName . '.xml"');
    echo $cv['xml_content'];
    
} elseif ($format === 'pdf') {
    // Générer le PDF à partir du XML
    $pdfContent = generatePdfFromXml($cv['xml_content']);
    
    if ($pdfContent) {
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $baseFileName . '.pdf"');
        echo $pdfContent;
    } else {
        header('HTTP/1.0 500 Internal Server Error');
        exit('Erreur lors de la génération du PDF');
    }
    
} elseif ($format === 'both') {
    // Créer un ZIP avec les deux formats
    $xmlFile = tempnam(sys_get_temp_dir(), 'cv_xml_') . '.xml';
    $pdfFile = tempnam(sys_get_temp_dir(), 'cv_pdf_') . '.pdf';
    $zipFile = tempnam(sys_get_temp_dir(), 'cv_zip_') . '.zip';
    
    // Sauvegarder le XML
    file_put_contents($xmlFile, $cv['xml_content']);
    
    // Générer et sauvegarder le PDF
    $pdfContent = generatePdfFromXml($cv['xml_content']);
    if ($pdfContent) {
        file_put_contents($pdfFile, $pdfContent);
        
        // Créer le ZIP
        $zip = new ZipArchive();
        if ($zip->open($zipFile, ZipArchive::CREATE) === TRUE) {
            $zip->addFile($xmlFile, $baseFileName . '.xml');
            $zip->addFile($pdfFile, $baseFileName . '.pdf');
            $zip->close();
            
            // Envoyer le ZIP
            header('Content-Type: application/zip');
            header('Content-Disposition: attachment; filename="' . $baseFileName . '.zip"');
            readfile($zipFile);
            
            // Nettoyer les fichiers temporaires
            @unlink($xmlFile);
            @unlink($pdfFile);
            @unlink($zipFile);
        } else {
            header('HTTP/1.0 500 Internal Server Error');
            exit('Erreur lors de la création du ZIP');
        }
    } else {
        header('HTTP/1.0 500 Internal Server Error');
        exit('Erreur lors de la génération du PDF');
    }
    
} else {
    header('HTTP/1.0 400 Bad Request');
    exit('Format non supporté');
}

function generatePdfFromXml($xmlContent) {
    // Parser le XML pour extraire les données
    $xmlDoc = new DOMDocument();
    $xmlDoc->loadXML($xmlContent);
    
    // Extraire les informations personnelles
    $personalInfo = $xmlDoc->getElementsByTagName('personalInfo')->item(0);
    $prenom = $personalInfo->getElementsByTagName('firstname')->item(0)->nodeValue ?? '';
    $nom = $personalInfo->getElementsByTagName('lastname')->item(0)->nodeValue ?? '';
    $email = $personalInfo->getElementsByTagName('email')->item(0)->nodeValue ?? '';
    $telephone = $personalInfo->getElementsByTagName('phone')->item(0)->nodeValue ?? '';
    $linkedin = $personalInfo->getElementsByTagName('linkedin')->item(0)->nodeValue ?? '';
    $emploi = $personalInfo->getElementsByTagName('jobTitle')->item(0)->nodeValue ?? '';
    $emploiDescription = $personalInfo->getElementsByTagName('jobDescription')->item(0)->nodeValue ?? '';
    $profil = $personalInfo->getElementsByTagName('profileDescription')->item(0)->nodeValue ?? '';
    
    // Générer le contenu LaTeX
    $latexContent = "\\documentclass[a4paper,10pt]{article}\n";
    $latexContent .= "\\usepackage[a4paper,margin=1in]{geometry}\n";
    $latexContent .= "\\usepackage{titlesec}\n";
    $latexContent .= "\\usepackage{graphicx}\n";
    $latexContent .= "\\usepackage{enumitem}\n";
    $latexContent .= "\\usepackage{hyperref}\n";
    $latexContent .= "\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]\n";
    $latexContent .= "\\begin{document}\n";

    $latexContent .= "\\begin{center}\n";
    $latexContent .= "{\\LARGE \\textbf{" . $prenom . " " . $nom . "}} \\\\\n";
    $latexContent .= "{\\large " . $emploi . "} \\\\\n";
    if($emploiDescription != ""){
        $latexContent .= "{\\small " . $emploiDescription . "} \\\\\n";
    }
    $latexContent .= "\\vspace{0.2cm}\n";
    $latexContent .= "\\textbf{Email:} $email | \\textbf{Téléphone:} $telephone \\\\\n";
    if($linkedin != ""){
        $latexContent .= "\\textbf{LinkedIn:} \\href{" . $linkedin . "}{" . $linkedin . "} \n";
    }
    $latexContent .= "\\end{center}\n";

    if($profil != ""){
        $latexContent .= "\\section*{Profil}\n";
        $latexContent .= $profil . "\n";
    }

    // Experiences
    $experiences = $xmlDoc->getElementsByTagName('experience');
    if ($experiences->length > 0) {
        $latexContent .= "\\section{Expérience Professionnelle}\n";
        foreach ($experiences as $exp) {
            $date = $exp->getElementsByTagName('period')->item(0)->nodeValue ?? '';
            $poste = $exp->getElementsByTagName('position')->item(0)->nodeValue ?? '';
            $employeur = $exp->getElementsByTagName('employer')->item(0)->nodeValue ?? '';
            $description = $exp->getElementsByTagName('description')->item(0)->nodeValue ?? '';
            $latexContent .= "\\textbf{" . $poste . "}, " . $employeur . " (" . $date . ")\\\\\n";
            $latexContent .= $description . "\n\\\\[0.3em]\n";
        }
    }

    // Formation
    $degrees = $xmlDoc->getElementsByTagName('degree');
    if ($degrees->length > 0) {
        $latexContent .= "\\section{Formation}\n";
        foreach ($degrees as $degree) {
            $date = $degree->getElementsByTagName('period')->item(0)->nodeValue ?? '';
            $diplome = $degree->getElementsByTagName('title')->item(0)->nodeValue ?? '';
            $etablissement = $degree->getElementsByTagName('institution')->item(0)->nodeValue ?? '';
            $description = $degree->getElementsByTagName('description')->item(0)->nodeValue ?? '';
            $latexContent .= "\\textbf{" . $diplome . "}, " . $etablissement . " (" . $date . ")\\\\\n";
            if($description != ""){
                $latexContent .= $description . "\n";
            }
            $latexContent .= "\\\\[0.3em]\n";
        }
    }

    // Langues
    $languages = $xmlDoc->getElementsByTagName('language');
    if ($languages->length > 0) {
        $latexContent .= "\\section{Langues}\n";
        $latexContent .= "\\begin{itemize}\n";
        foreach ($languages as $lang) {
            $langue = $lang->getElementsByTagName('name')->item(0)->nodeValue ?? '';
            $niveau = $lang->getElementsByTagName('level')->item(0)->nodeValue ?? '';
            $description = $lang->getElementsByTagName('description')->item(0)->nodeValue ?? '';
            $latexContent .= "\\item " . $langue . " - " . $niveau;
            if($description != ""){
                $latexContent .= " (" . $description . ")";
            }
            $latexContent .= "\n";
        }
        $latexContent .= "\\end{itemize}\n";
    }

    // Compétences
    $skills = $xmlDoc->getElementsByTagName('skills')->item(0);
    if ($skills) {
        $competencesNumeriques = $skills->getElementsByTagName('digitalSkills')->item(0)->nodeValue ?? '';
        $competencesAutres = $skills->getElementsByTagName('otherSkills')->item(0)->nodeValue ?? '';
        
        $latexContent .= "\\section{Compétences}\n";
        $latexContent .= "\\subsection*{Compétences numériques}\n";
        $latexContent .= $competencesNumeriques . "\n";
        $latexContent .= "\\subsection*{Autres compétences}\n";
        $latexContent .= $competencesAutres . "\n";
    }

    $latexContent .= "\\end{document}\n";

    // Créer des fichiers temporaires
    $tempDir = sys_get_temp_dir();
    $latexFile = tempnam($tempDir, 'cv_') . '.tex';
    $pdfFile = str_replace('.tex', '.pdf', $latexFile);
    
    // Sauvegarder le fichier LaTeX
    file_put_contents($latexFile, $latexContent);
    
    // Compiler avec pdflatex
    $oldDir = getcwd();
    chdir($tempDir);
    $output = shell_exec("pdflatex -interaction=nonstopmode " . basename($latexFile) . " 2>&1");
    chdir($oldDir);
    
    // Lire le contenu du PDF
    $pdfContent = false;
    if (file_exists($pdfFile)) {
        $pdfContent = file_get_contents($pdfFile);
        
        // Nettoyer les fichiers temporaires
        @unlink($latexFile);
        @unlink($pdfFile);
        @unlink(str_replace('.tex', '.aux', $latexFile));
        @unlink(str_replace('.tex', '.log', $latexFile));
        @unlink(str_replace('.tex', '.out', $latexFile));
    }
    
    return $pdfContent;
}
?>
