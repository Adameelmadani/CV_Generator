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

$baseFileName = "CV_" . $prenom . "_" . $nom;

// Add error logging for debugging
error_log("download_cv.php: Starting download process for CV ID: " . $cvId . ", Format: " . $format);

// Debug: Check if we can reach this point
error_log("download_cv.php: CV data retrieved: " . ($cv ? 'yes' : 'no'));
if ($cv) {
    error_log("download_cv.php: CV name: " . $cv['cv_name']);
    error_log("download_cv.php: XML content length: " . strlen($cv['xml_content']));
}

if ($format === 'xml') {
    // Télécharger le XML
    header('Content-Type: application/xml');
    header('Content-Disposition: attachment; filename="' . $baseFileName . '.xml"');
    echo $cv['xml_content'];
    
} elseif ($format === 'pdf') {
    // Générer le PDF à partir du XML
    error_log("download_cv.php: Starting PDF generation");
    error_log("download_cv.php: Current working directory: " . getcwd());
    
    $pdfContent = generatePdfFromXml($cv['xml_content']);
    
    if ($pdfContent !== false && !empty($pdfContent)) {
        error_log("download_cv.php: PDF generated successfully, size: " . strlen($pdfContent) . " bytes");
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $baseFileName . '.pdf"');
        echo $pdfContent;
    } else {
        error_log("download_cv.php: PDF generation failed");
        header('HTTP/1.0 500 Internal Server Error');
        exit('Erreur lors de la génération du PDF - Vérifiez que LaTeX est installé et accessible');
    }
    
} elseif ($format === 'latex') {
    // Générer et télécharger le LaTeX
    $latexContent = generateLatexFromXml($cv['xml_content']);
    
    if ($latexContent) {
        header('Content-Type: text/plain');
        header('Content-Disposition: attachment; filename="' . $baseFileName . '.tex"');
        echo $latexContent;
    } else {
        header('HTTP/1.0 500 Internal Server Error');
        exit('Erreur lors de la génération du LaTeX');
    }
    
} elseif ($format === 'all') {
    // Créer un ZIP avec les trois formats (PDF, XML, LaTeX)
    $xmlFile = tempnam(sys_get_temp_dir(), 'cv_xml_') . '.xml';
    $pdfFile = tempnam(sys_get_temp_dir(), 'cv_pdf_') . '.pdf';
    $latexFile = tempnam(sys_get_temp_dir(), 'cv_latex_') . '.tex';
    $zipFile = tempnam(sys_get_temp_dir(), 'cv_zip_') . '.zip';
    
    // Sauvegarder le XML
    file_put_contents($xmlFile, $cv['xml_content']);
    
    // Générer et sauvegarder le PDF
    $pdfContent = generatePdfFromXml($cv['xml_content']);
    // Générer et sauvegarder le LaTeX
    $latexContent = generateLatexFromXml($cv['xml_content']);
    
    if ($pdfContent && $latexContent) {
        file_put_contents($pdfFile, $pdfContent);
        file_put_contents($latexFile, $latexContent);
        
        // Créer le ZIP
        $zip = new ZipArchive();
        if ($zip->open($zipFile, ZipArchive::CREATE) === TRUE) {
            $zip->addFile($xmlFile, $baseFileName . '.xml');
            $zip->addFile($pdfFile, $baseFileName . '.pdf');
            $zip->addFile($latexFile, $baseFileName . '.tex');
            $zip->close();
            
            // Envoyer le ZIP
            header('Content-Type: application/zip');
            header('Content-Disposition: attachment; filename="' . $baseFileName . '.zip"');
            readfile($zipFile);
            
            // Nettoyer les fichiers temporaires
            @unlink($xmlFile);
            @unlink($pdfFile);
            @unlink($latexFile);
            @unlink($zipFile);
        } else {
            header('HTTP/1.0 500 Internal Server Error');
            exit('Erreur lors de la création du ZIP');
        }
    } else {
        header('HTTP/1.0 500 Internal Server Error');
        exit('Erreur lors de la génération des fichiers');
    }
    
} else {
    header('HTTP/1.0 400 Bad Request');
    exit('Format non supporté');
}

// Function to convert hex color to RGB array
function hexToRgb($hex) {
    // Remove # if present
    $hex = ltrim($hex, '#');
    
    // Handle 3-character hex codes
    if (strlen($hex) == 3) {
        $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
    }
    
    // Convert to RGB
    return [
        'r' => hexdec(substr($hex, 0, 2)),
        'g' => hexdec(substr($hex, 2, 2)),
        'b' => hexdec(substr($hex, 4, 2))
    ];
}

function generatePdfFromXml($xmlContent) {
    error_log("generatePdfFromXml: Starting PDF generation");
    
    // Parser le XML pour extraire les données
    $xmlDoc = new DOMDocument();
    if (!$xmlDoc->loadXML($xmlContent)) {
        error_log("generatePdfFromXml: Failed to parse XML content");
        return false;
    }
    
    error_log("generatePdfFromXml: XML parsed successfully");
    
    // Extraire les informations personnelles
    $personalInfo = $xmlDoc->getElementsByTagName('personalInfo')->item(0);
    if (!$personalInfo) {
        error_log("generatePdfFromXml: No personalInfo found in XML");
        return false;
    }
    
    $prenom = $personalInfo->getElementsByTagName('firstname')->item(0)->nodeValue ?? '';
    $nom = $personalInfo->getElementsByTagName('lastname')->item(0)->nodeValue ?? '';
    
    error_log("generatePdfFromXml: Processing CV for " . $prenom . " " . $nom);
    
    $location = $personalInfo->getElementsByTagName('location')->item(0)->nodeValue ?? '';
    $email = $personalInfo->getElementsByTagName('email')->item(0)->nodeValue ?? '';
    $telephone = $personalInfo->getElementsByTagName('phone')->item(0)->nodeValue ?? '';
    $website = $personalInfo->getElementsByTagName('website')->item(0)->nodeValue ?? '';
    $linkedin = $personalInfo->getElementsByTagName('linkedin')->item(0)->nodeValue ?? '';
    $github = $personalInfo->getElementsByTagName('github')->item(0)->nodeValue ?? '';
    $photoPath = $personalInfo->getElementsByTagName('photo')->item(0)->nodeValue ?? '';
    
    // Profil
    $profil = $xmlDoc->getElementsByTagName('profil')->item(0);
    $profilDescription = $profil ? $profil->getElementsByTagName('description')->item(0)->nodeValue ?? '' : '';
    
    // Personnalisation
    $personalization = $xmlDoc->getElementsByTagName('personalization')->item(0);
    $primaryColor = $personalization ? $personalization->getElementsByTagName('primaryColor')->item(0)->nodeValue ?? '#667eea' : '#667eea';
    
    // Create temporary directory and files first
    $tempDir = sys_get_temp_dir();
    $uniqueId = uniqid();
    $latexFile = $tempDir . DIRECTORY_SEPARATOR . 'cv_' . $uniqueId . '.tex';
    $pdfFile = str_replace('.tex', '.pdf', $latexFile);
    
    // Handle photo copying to temp directory BEFORE LaTeX generation
    $photoForLatex = '';
    $photoForLatexInTemp = '';
    if (!empty($photoPath)) {
        // Handle both absolute and relative photo paths
        $fullPhotoPath = '';
        
        // Check if it's already an absolute path
        if (file_exists($photoPath)) {
            $fullPhotoPath = $photoPath;
        } 
        // Try relative to current directory
        elseif (file_exists('./' . $photoPath)) {
            $fullPhotoPath = './' . $photoPath;
        }
        // Try relative to uploads directory
        elseif (file_exists('./uploads/photos/' . basename($photoPath))) {
            $fullPhotoPath = './uploads/photos/' . basename($photoPath);
        }
        // Try the uploads directory with full path
        elseif (file_exists('uploads/photos/' . basename($photoPath))) {
            $fullPhotoPath = 'uploads/photos/' . basename($photoPath);
        }
        
        error_log("Photo path from XML: " . $photoPath);
        error_log("Full photo path resolved: " . $fullPhotoPath);
        error_log("Photo exists: " . (file_exists($fullPhotoPath) ? 'yes' : 'no'));
        
        if (!empty($fullPhotoPath) && file_exists($fullPhotoPath)) {
            // Copy photo to temp directory with simple name for LaTeX
            $photoExtension = pathinfo($fullPhotoPath, PATHINFO_EXTENSION);
            $photoForLatexInTemp = $tempDir . DIRECTORY_SEPARATOR . "cv_photo." . $photoExtension;
            
            if (copy($fullPhotoPath, $photoForLatexInTemp)) {
                error_log("Photo copied successfully to temp dir: " . $fullPhotoPath . " -> " . $photoForLatexInTemp);
                // Use simple name for LaTeX reference (since LaTeX will run in temp dir)
                $photoForLatex = "cv_photo." . $photoExtension;
            } else {
                error_log("Failed to copy photo to temp dir: " . $fullPhotoPath . " -> " . $photoForLatexInTemp);
                $photoForLatex = '';
                $photoForLatexInTemp = '';
            }
        } else {
            error_log("Photo file not found at any expected location. Original path: " . $photoPath);
            $photoForLatex = '';
        }
    }
    
    // Generate LaTeX content using the same structure as generate_cv.php
    $latexClass = "modern"; // Use just the class name, we'll copy the file
    $sectionHeader = "\\documentclass{" . $latexClass . "}\n";
    $sectionHeader .= "\\hypersetup{\n";
    $sectionHeader .= "    pdftitle={" . $nom . "'s CV},\n";
    $sectionHeader .= "    pdfauthor={" . $nom . "},\n";
    $sectionHeader .= "    pdfcreator={" . $nom . "}\n";
    $sectionHeader .= "}\n\n";

    // Color definitions - Convert hex color to RGB for LaTeX
    $primaryColorRGB = hexToRgb($primaryColor);
    $sectionHeader .= "\\definecolor{primaryColor}{RGB}{" . $primaryColorRGB['r'] . ", " . $primaryColorRGB['g'] . ", " . $primaryColorRGB['b'] . "}\n\n";

    $sectionHeader .= "\\begin{document}\n";
    $sectionHeader .= "    \\begin{header}\n";
    
    if (!empty($photoForLatex)) {
        error_log("Using photo for LaTeX: " . $photoForLatex);
        $sectionHeader .= "        % Photo and name in a minipage\n";
        $sectionHeader .= "        \\begin{minipage}{0.2\\textwidth}\n";
        $sectionHeader .= "            \\begin{tikzpicture}\n";
        $sectionHeader .= "                \\clip (0,0) circle (1.25cm);\n";
        $sectionHeader .= "                \\node[anchor=center] at (0,0) {\\includegraphics[width=2.5cm, height=2.5cm]{" . $photoForLatex . "}};\n";
        $sectionHeader .= "            \\end{tikzpicture}\n";
        $sectionHeader .= "        \\end{minipage}%\n";
        $sectionHeader .= "        \\begin{minipage}{0.75\\textwidth}\n";
    } else {
        $sectionHeader .= "        \\begin{minipage}{0.95\\textwidth}\n";
    }
    
    $sectionHeader .= "            \\raggedright\n";
    $sectionHeader .= "            \\fontsize{22 pt}{22 pt}\n";
    $sectionHeader .= "            \\textbf{" . $prenom . " " . $nom . "}\n\n";
    $sectionHeader .= "            \\vspace{0.1 cm}\n\n";
    $sectionHeader .= "            \\normalsize\n";
    $sectionHeader .= "            \\mbox{{\\footnotesize\\faMapMarker*}\\hspace*{0.1cm}" . $location . "}%\n";
    $sectionHeader .= "            \\kern 0.1 cm%\n";
    $sectionHeader .= "            \\AND%\n";
    $sectionHeader .= "            \\kern 0.1cm\n";
    $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{mailto:" . $email . "}{{\\footnotesize\\faEnvelope[regular]}\\hspace*{0.1cm}" . $email . "}}%\n";
    $sectionHeader .= "            \\kern 0.1 cm%\n";
    $sectionHeader .= "            \\AND%\n";
    $sectionHeader .= "            \\kern 0.1 cm%\n";
    $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{tel:" . $telephone . "}{{\\footnotesize\\faPhone*}\\hspace*{0.1cm}" . $telephone . "}}%\n";
    if (!empty($linkedin)) {
        $sectionHeader .= "            \\kern 0.1 cm%\n";
        $sectionHeader .= "            \\AND%\n";
        $sectionHeader .= "            \\kern 0.1 cm%\n";
        $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{" . $linkedin . "}{{\\footnotesize\\faLinkedinIn}\\hspace*{0.1cm} Linkedin}}%\n";
    }
    if (!empty($github)) {
        $sectionHeader .= "            \\kern 0.1 cm%\n";
        $sectionHeader .= "            \\AND%\n";
        $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{" . $github. "}{\\footnotesize\\faGithub\\hspace*{0.1cm} Github}}%\n";
    }
    $sectionHeader .= "            \\kern 0.1cm\n";
    $sectionHeader .= "        \\end{minipage}\n";
    $sectionHeader .= "    \\end{header}\n\n";
    $sectionHeader .= "    \\vspace{0.1 cm}\n\n";

    $sectionProfil = "";
    if (!empty($profilDescription)) {
        $sectionProfil = "     \\section{Profil}\n";
        $sectionProfil .= "        \\begin{onecolentry}\n";
        $sectionProfil .= "        " . $profilDescription;
        $sectionProfil .= "        \\end{onecolentry}\n";
    }

    // Formation Section - Parse from XML
    $sectionEducation = "";
    $degrees = $xmlDoc->getElementsByTagName('degree');
    if ($degrees->length > 0) {
        $sectionEducation = "    \\section{Formation}\n";
        foreach ($degrees as $degree) {
            $title = $degree->getElementsByTagName('title')->item(0)->nodeValue ?? '';
            $period = $degree->getElementsByTagName('period')->item(0)->nodeValue ?? '';
            $institution = $degree->getElementsByTagName('institution')->item(0)->nodeValue ?? '';
            $field = $degree->getElementsByTagName('field')->item(0)->nodeValue ?? '';
            $description = $degree->getElementsByTagName('description')->item(0)->nodeValue ?? '';

            $sectionEducation .= "    \\begin{onecolentry}\n";
            $sectionEducation .= "        \\textbf{" . htmlspecialchars($title) . "} \\hfill " . htmlspecialchars($period) . " \\\\\n";
            if (!empty($institution)) {
                $sectionEducation .= "        \\textit{" . htmlspecialchars($institution) . "}";
                if (!empty($field)) {
                    $sectionEducation .= " \\hfill " . htmlspecialchars($field);
                }
                $sectionEducation .= " \\\\\n";
            }
            if (!empty($description)) {
                $sectionEducation .= "        " . $description . "\n";
            }
            $sectionEducation .= "    \\end{onecolentry}\n\n";
            $sectionEducation .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Certificat Section
    $sectionCertificat = "";
    $certificates = $xmlDoc->getElementsByTagName('certificate');
    if ($certificates->length > 0) {
        $sectionCertificat = "    \\section{Certificats}\n";
        foreach ($certificates as $certificate) {
            $name = $certificate->getElementsByTagName('name')->item(0)->nodeValue ?? '';
            $period = $certificate->getElementsByTagName('period')->item(0)->nodeValue ?? '';
            $issuer = $certificate->getElementsByTagName('issuer')->item(0)->nodeValue ?? '';
            $certLocation = $certificate->getElementsByTagName('location')->item(0)->nodeValue ?? '';
            $description = $certificate->getElementsByTagName('description')->item(0)->nodeValue ?? '';

            $sectionCertificat .= "    \\begin{onecolentry}\n";
            $sectionCertificat .= "        \\textbf{" . htmlspecialchars($name) . "} \\hfill " . htmlspecialchars($period) . " \\\\\n";
            if (!empty($issuer)) {
                $sectionCertificat .= "        \\textit{" . htmlspecialchars($issuer) . "}";
                if (!empty($certLocation)) {
                    $sectionCertificat .= " \\hfill " . htmlspecialchars($certLocation);
                }
                $sectionCertificat .= " \\\\\n";
            }
            if (!empty($description)) {
                $sectionCertificat .= "        " . $description . "\n";
            }
            $sectionCertificat .= "    \\end{onecolentry}\n\n";
            $sectionCertificat .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Experience Section
    $sectionExperience = "";
    $experiences = $xmlDoc->getElementsByTagName('experience');
    if ($experiences->length > 0) {
        $sectionExperience = "    \\section{Expérience}\n";
        foreach ($experiences as $exp) {
            $location = $exp->getElementsByTagName('location')->item(0)->nodeValue ?? '';
            $period = $exp->getElementsByTagName('period')->item(0)->nodeValue ?? '';
            $company = $exp->getElementsByTagName('company')->item(0)->nodeValue ?? '';
            $position = $exp->getElementsByTagName('position')->item(0)->nodeValue ?? '';
            $description = $exp->getElementsByTagName('description')->item(0)->nodeValue ?? '';

            $sectionExperience .= "    \\begin{onecolentry}\n";
            $sectionExperience .= "        \\textbf{" . htmlspecialchars($location) . "} \\hfill " . htmlspecialchars($period) . " \\\\\n";
            if (!empty($company)) {
                $sectionExperience .= "        \\textit{" . htmlspecialchars($company) . "}";
                if (!empty($position)) {
                    $sectionExperience .= " \\hfill " . htmlspecialchars($position);
                }
                $sectionExperience .= " \\\\\n";
            }
            if (!empty($description)) {
                $descriptionLines = array_filter(array_map('trim', explode("\n", $description)));
                if (!empty($descriptionLines)) {
                    $sectionExperience .= "        \\begin{itemize}\n";
                    foreach ($descriptionLines as $line) {
                        if (!empty($line)) {
                            $sectionExperience .= "            \\item " . $line . "\n";
                        }
                    }
                    $sectionExperience .= "        \\end{itemize}\n";
                }
            }
            $sectionExperience .= "    \\end{onecolentry}\n\n";
            $sectionExperience .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Projects Section
    $sectionProjects = "";
    $projects = $xmlDoc->getElementsByTagName('project');
    if ($projects->length > 0) {
        $sectionProjects = "    \\section{Projets}\n";
        foreach ($projects as $project) {
            $name = $project->getElementsByTagName('name')->item(0)->nodeValue ?? '';
            $link = $project->getElementsByTagName('link')->item(0)->nodeValue ?? '';
            $description = $project->getElementsByTagName('description')->item(0)->nodeValue ?? '';

            $sectionProjects .= "    \\textbf{" . htmlspecialchars($name) . "}";
            $sectionProjects .= "\n    \n";
            
            if (!empty($description) || !empty($link)) {
                $sectionProjects .= "    \\begin{itemize}\n";
                if (!empty($description)) {
                    $sectionProjects .= "        \\item \\textbf{Description}: " . $description . "\n";
                }
                if (!empty($link)) {
                    $sectionProjects .= "        \\item \\textbf{GitHub Link}: \\hrefWithoutArrow{" . htmlspecialchars($link) . "}{\\footnotesize\\faGithub\\hspace*{0.1cm}" . htmlspecialchars($name) . "}\n";
                }
                $sectionProjects .= "    \\end{itemize}\n";
            }
            
            $sectionProjects .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Skills Section
    $sectionSkills = "";
    $skills = $xmlDoc->getElementsByTagName('skill');
    if ($skills->length > 0) {
        $sectionSkills = "    \\section{Compétences}\n";
        foreach ($skills as $skill) {
            $category = $skill->getElementsByTagName('category')->item(0)->nodeValue ?? '';
            $item = $skill->getElementsByTagName('item')->item(0)->nodeValue ?? '';

            $sectionSkills .= "    \\begin{onecolentry}\n";
            $sectionSkills .= "        \\textbf{" . htmlspecialchars($category) . ":} " . $item . "\n";
            $sectionSkills .= "    \\end{onecolentry}\n\n";
            $sectionSkills .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Languages Section
    $sectionLanguages = "";
    $languages = $xmlDoc->getElementsByTagName('language');
    if ($languages->length > 0) {
        $sectionLanguages = "    \\section{Langues}\n";
        $sectionLanguages .= "    \\begin{onecolentry}\n";
        $lang_items = [];
        foreach ($languages as $lang) {
            $name = $lang->getElementsByTagName('name')->item(0)->nodeValue ?? '';
            $level = $lang->getElementsByTagName('level')->item(0)->nodeValue ?? '';
            $lang_items[] = "\\textbf{" . htmlspecialchars($name) . ":} " . htmlspecialchars($level);
        }
        $sectionLanguages .= "        " . implode(" \\hfill\n        ", $lang_items) . "\n";
        $sectionLanguages .= "    \\end{onecolentry}\n\n";
        $sectionLanguages .= "    \\vspace{0.05 cm}\n\n";
    }

    $sectionFooter = "\\end{document}";

    $latexContent = $sectionHeader . $sectionProfil . $sectionEducation . $sectionCertificat . $sectionExperience . $sectionProjects . $sectionSkills . $sectionLanguages . $sectionFooter;

    // Create temporary files
    $tempDir = sys_get_temp_dir();
    $uniqueId = uniqid();
    $latexFile = $tempDir . DIRECTORY_SEPARATOR . 'cv_' . $uniqueId . '.tex';
    $pdfFile = str_replace('.tex', '.pdf', $latexFile);
    
    // Handle photo copying to temp directory BEFORE LaTeX generation
    $photoForLatexInTemp = '';
    if (!empty($photoPath)) {
        // Handle both absolute and relative photo paths
        $fullPhotoPath = '';
        
        // Check if it's already an absolute path
        if (file_exists($photoPath)) {
            $fullPhotoPath = $photoPath;
        } 
        // Try relative to current directory
        elseif (file_exists('./' . $photoPath)) {
            $fullPhotoPath = './' . $photoPath;
        }
        // Try relative to uploads directory
        elseif (file_exists('./uploads/photos/' . basename($photoPath))) {
            $fullPhotoPath = './uploads/photos/' . basename($photoPath);
        }
        // Try the uploads directory with full path
        elseif (file_exists('uploads/photos/' . basename($photoPath))) {
            $fullPhotoPath = 'uploads/photos/' . basename($photoPath);
        }
        
        error_log("Photo path from XML: " . $photoPath);
        error_log("Full photo path resolved: " . $fullPhotoPath);
        error_log("Photo exists: " . (file_exists($fullPhotoPath) ? 'yes' : 'no'));
        
        if (!empty($fullPhotoPath) && file_exists($fullPhotoPath)) {
            // Copy photo to temp directory with simple name for LaTeX
            $photoExtension = pathinfo($fullPhotoPath, PATHINFO_EXTENSION);
            $photoForLatexInTemp = $tempDir . DIRECTORY_SEPARATOR . "cv_photo." . $photoExtension;
            
            if (copy($fullPhotoPath, $photoForLatexInTemp)) {
                error_log("Photo copied successfully to temp dir: " . $fullPhotoPath . " -> " . $photoForLatexInTemp);
                // Use simple name for LaTeX reference (since LaTeX will run in temp dir)
                $photoForLatex = "cv_photo." . $photoExtension;
            } else {
                error_log("Failed to copy photo to temp dir: " . $fullPhotoPath . " -> " . $photoForLatexInTemp);
                $photoForLatex = '';
                $photoForLatexInTemp = '';
            }
        } else {
            error_log("Photo file not found at any expected location. Original path: " . $photoPath);
            $photoForLatex = '';
        }
    }
    
    // Copy the LaTeX class file to temp directory
    $templateSource = 'templates/modern.cls';
    $templateDest = $tempDir . DIRECTORY_SEPARATOR . 'modern.cls';
    if (file_exists($templateSource)) {
        if (copy($templateSource, $templateDest)) {
            error_log("generatePdfFromXml: Copied template from " . $templateSource . " to " . $templateDest);
        } else {
            error_log("generatePdfFromXml: Failed to copy template from " . $templateSource . " to " . $templateDest);
        }
    } else {
        error_log("generatePdfFromXml: Template file not found: " . $templateSource);
        error_log("generatePdfFromXml: Current working directory: " . getcwd());
        error_log("generatePdfFromXml: Checking absolute path: " . realpath($templateSource));
    }
    
    // Save LaTeX file
    file_put_contents($latexFile, $latexContent);
    
    // Change to temp directory and compile with pdflatex
    $oldDir = getcwd();
    chdir($tempDir);
    
    // Run pdflatex twice for proper cross-references
    $output = shell_exec("pdflatex -interaction=nonstopmode " . basename($latexFile) . " 2>&1");
    $output2 = shell_exec("pdflatex -interaction=nonstopmode " . basename($latexFile) . " 2>&1");
    
    error_log("generatePdfFromXml: pdflatex first run output: " . $output);
    error_log("generatePdfFromXml: pdflatex second run output: " . $output2);
    
    chdir($oldDir);
    
    // Read PDF content
    $pdfContent = false;
    if (file_exists($pdfFile)) {
        $pdfContent = file_get_contents($pdfFile);
        error_log("generatePdfFromXml: PDF generated successfully, size: " . strlen($pdfContent) . " bytes");
        
        // Clean up temporary files
        @unlink($latexFile);
        @unlink($pdfFile);
        @unlink($templateDest);
        @unlink(str_replace('.tex', '.aux', $latexFile));
        @unlink(str_replace('.tex', '.log', $latexFile));
        @unlink(str_replace('.tex', '.out', $latexFile));
        @unlink(str_replace('.tex', '.fls', $latexFile));
        @unlink(str_replace('.tex', '.fdb_latexmk', $latexFile));
        
        // Clean up photo if it was copied to temp directory
        if (!empty($photoForLatexInTemp) && file_exists($photoForLatexInTemp)) {
            @unlink($photoForLatexInTemp);
            error_log("Cleaned up temp photo file: " . $photoForLatexInTemp);
        }
    } else {
        error_log("generatePdfFromXml: PDF file not created. LaTeX file: " . $latexFile);
        error_log("generatePdfFromXml: Expected PDF file: " . $pdfFile);
        error_log("generatePdfFromXml: Current working directory: " . getcwd());
        error_log("generatePdfFromXml: Temp directory: " . $tempDir);
    }
    
    return $pdfContent;
}

function generateLatexFromXml($xmlContent) {
    // Parser le XML pour extraire les données
    $xmlDoc = new DOMDocument();
    $xmlDoc->loadXML($xmlContent);
    
    // Extraire les informations personnelles
    $personalInfo = $xmlDoc->getElementsByTagName('personalInfo')->item(0);
    $prenom = $personalInfo->getElementsByTagName('firstname')->item(0)->nodeValue ?? '';
    $nom = $personalInfo->getElementsByTagName('lastname')->item(0)->nodeValue ?? '';
    $location = $personalInfo->getElementsByTagName('location')->item(0)->nodeValue ?? '';
    $email = $personalInfo->getElementsByTagName('email')->item(0)->nodeValue ?? '';
    $telephone = $personalInfo->getElementsByTagName('phone')->item(0)->nodeValue ?? '';
    $website = $personalInfo->getElementsByTagName('website')->item(0)->nodeValue ?? '';
    $linkedin = $personalInfo->getElementsByTagName('linkedin')->item(0)->nodeValue ?? '';
    $github = $personalInfo->getElementsByTagName('github')->item(0)->nodeValue ?? '';
    $photoPath = $personalInfo->getElementsByTagName('photo')->item(0)->nodeValue ?? '';
    
    // Profil
    $profil = $xmlDoc->getElementsByTagName('profil')->item(0);
    $profilDescription = $profil ? $profil->getElementsByTagName('description')->item(0)->nodeValue ?? '' : '';
    
    // Personnalisation
    $personalization = $xmlDoc->getElementsByTagName('personalization')->item(0);
    $primaryColor = $personalization ? $personalization->getElementsByTagName('primaryColor')->item(0)->nodeValue ?? '#667eea' : '#667eea';
    
    // Générer le contenu LaTeX (similaire à generate_cv.php)
    $latexClass = "modern"; // Use just the class name
    $sectionHeader = "\\documentclass{" . $latexClass . "}\n";
    $sectionHeader .= "\\hypersetup{\n";
    $sectionHeader .= "    pdftitle={" . $nom . "'s CV},\n";
    $sectionHeader .= "    pdfauthor={" . $nom . "},\n";
    $sectionHeader .= "    pdfcreator={" . $nom . "}\n";
    $sectionHeader .= "}\n\n";

    // Color definitions
    $primaryColorRGB = hexToRgb($primaryColor);
    $sectionHeader .= "\\definecolor{primaryColor}{RGB}{" . $primaryColorRGB['r'] . ", " . $primaryColorRGB['g'] . ", " . $primaryColorRGB['b'] . "}\n\n";

    $sectionHeader .= "\\begin{document}\n";
    $sectionHeader .= "    \\begin{header}\n";
    
    // Add photo section if photo exists  
    $photoForLatex = '';
    if (!empty($photoPath)) {
        // Handle both absolute and relative photo paths
        $fullPhotoPath = '';
        
        // Check if it's already an absolute path
        if (file_exists($photoPath)) {
            $fullPhotoPath = $photoPath;
        } 
        // Try relative to current directory
        elseif (file_exists('./' . $photoPath)) {
            $fullPhotoPath = './' . $photoPath;
        }
        // Try relative to uploads directory
        elseif (file_exists('./uploads/photos/' . basename($photoPath))) {
            $fullPhotoPath = './uploads/photos/' . basename($photoPath);
        }
        // Try the uploads directory with full path
        elseif (file_exists('uploads/photos/' . basename($photoPath))) {
            $fullPhotoPath = 'uploads/photos/' . basename($photoPath);
        }
        
        if (!empty($fullPhotoPath) && file_exists($fullPhotoPath)) {
            // Use a simple reference for LaTeX generation only
            $photoForLatex = "cv_photo." . pathinfo($fullPhotoPath, PATHINFO_EXTENSION);
        }
    }
    
    if (!empty($photoForLatex)) {
        $sectionHeader .= "        % Photo and name in a minipage\n";
        $sectionHeader .= "        \\begin{minipage}{0.2\\textwidth}\n";
        $sectionHeader .= "            \\begin{tikzpicture}\n";
        $sectionHeader .= "                \\clip (0,0) circle (1.25cm);\n";
        $sectionHeader .= "                \\node[anchor=center] at (0,0) {\\includegraphics[width=2.5cm, height=2.5cm]{" . $photoForLatex . "}};\n";
        $sectionHeader .= "            \\end{tikzpicture}\n";
        $sectionHeader .= "        \\end{minipage}%\n";
        $sectionHeader .= "        \\begin{minipage}{0.75\\textwidth}\n";
    } else {
        $sectionHeader .= "        \\begin{minipage}{0.95\\textwidth}\n";
    }
    
    $sectionHeader .= "            \\raggedright\n";
    $sectionHeader .= "            \\fontsize{22 pt}{22 pt}\n";
    $sectionHeader .= "            \\textbf{" . $prenom . " " . $nom . "}\n\n";
    $sectionHeader .= "            \\vspace{0.1 cm}\n\n";
    $sectionHeader .= "            \\normalsize\n";
    $sectionHeader .= "            \\mbox{{\\footnotesize\\faMapMarker*}\\hspace*{0.1cm}" . $location . "}%\n";
    $sectionHeader .= "            \\kern 0.1 cm%\n";
    $sectionHeader .= "            \\AND%\n";
    $sectionHeader .= "            \\kern 0.1cm\n";
    $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{mailto:" . $email . "}{{\\footnotesize\\faEnvelope[regular]}\\hspace*{0.1cm}" . $email . "}}%\n";
    $sectionHeader .= "            \\kern 0.1 cm%\n";
    $sectionHeader .= "            \\AND%\n";
    $sectionHeader .= "            \\kern 0.1 cm%\n";
    $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{tel:" . $telephone . "}{{\\footnotesize\\faPhone*}\\hspace*{0.1cm}" . $telephone . "}}%\n";
    if (!empty($linkedin)) {
        $sectionHeader .= "            \\kern 0.1 cm%\n";
        $sectionHeader .= "            \\AND%\n";
        $sectionHeader .= "            \\kern 0.1 cm%\n";
        $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{" . $linkedin . "}{{\\footnotesize\\faLinkedinIn}\\hspace*{0.1cm} Linkedin}}%\n";
    }
    if (!empty($github)) {
        $sectionHeader .= "            \\kern 0.1 cm%\n";
        $sectionHeader .= "            \\AND%\n";
        $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{" . $github. "}{\\footnotesize\\faGithub\\hspace*{0.1cm} Github}}%\n";
    }
    $sectionHeader .= "            \\kern 0.1cm\n";
    $sectionHeader .= "        \\end{minipage}\n";
    $sectionHeader .= "    \\end{header}\n\n";
    $sectionHeader .= "    \\vspace{0.1 cm}\n\n";

    $sectionProfil = "";
    if (!empty($profilDescription)) {
        $sectionProfil = "     \\section{Profil}\n";
        $sectionProfil .= "        \\begin{onecolentry}\n";
        $sectionProfil .= "        " . $profilDescription;
        $sectionProfil .= "        \\end{onecolentry}\n";
    }

    // Formation Section
    $sectionEducation = "";
    $degrees = $xmlDoc->getElementsByTagName('degree');
    if ($degrees->length > 0) {
        $sectionEducation = "    \\section{Formation}\n";
        foreach ($degrees as $degree) {
            $title = $degree->getElementsByTagName('title')->item(0)->nodeValue ?? '';
            $period = $degree->getElementsByTagName('period')->item(0)->nodeValue ?? '';
            $institution = $degree->getElementsByTagName('institution')->item(0)->nodeValue ?? '';
            $field = $degree->getElementsByTagName('field')->item(0)->nodeValue ?? '';
            $description = $degree->getElementsByTagName('description')->item(0)->nodeValue ?? '';

            $sectionEducation .= "    \\begin{onecolentry}\n";
            $sectionEducation .= "        \\textbf{" . htmlspecialchars($title) . "} \\hfill " . htmlspecialchars($period) . " \\\\\n";
            if (!empty($institution)) {
                $sectionEducation .= "        \\textit{" . htmlspecialchars($institution) . "}";
                if (!empty($field)) {
                    $sectionEducation .= " \\hfill " . htmlspecialchars($field);
                }
                $sectionEducation .= " \\\\\n";
            }
            if (!empty($description)) {
                $sectionEducation .= "        " . $description . "\n";
            }
            $sectionEducation .= "    \\end{onecolentry}\n\n";
            $sectionEducation .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Certificat Section
    $sectionCertificat = "";
    $certificates = $xmlDoc->getElementsByTagName('certificate');
    if ($certificates->length > 0) {
        $sectionCertificat = "    \\section{Certificats}\n";
        foreach ($certificates as $certificate) {
            $name = $certificate->getElementsByTagName('name')->item(0)->nodeValue ?? '';
            $period = $certificate->getElementsByTagName('period')->item(0)->nodeValue ?? '';
            $issuer = $certificate->getElementsByTagName('issuer')->item(0)->nodeValue ?? '';
            $certLocation = $certificate->getElementsByTagName('location')->item(0)->nodeValue ?? '';
            $description = $certificate->getElementsByTagName('description')->item(0)->nodeValue ?? '';

            $sectionCertificat .= "    \\begin{onecolentry}\n";
            $sectionCertificat .= "        \\textbf{" . htmlspecialchars($name) . "} \\hfill " . htmlspecialchars($period) . " \\\\\n";
            if (!empty($issuer)) {
                $sectionCertificat .= "        \\textit{" . htmlspecialchars($issuer) . "}";
                if (!empty($certLocation)) {
                    $sectionCertificat .= " \\hfill " . htmlspecialchars($certLocation);
                }
                $sectionCertificat .= " \\\\\n";
            }
            if (!empty($description)) {
                $sectionCertificat .= "        " . $description . "\n";
            }
            $sectionCertificat .= "    \\end{onecolentry}\n\n";
            $sectionCertificat .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Experience Section
    $sectionExperience = "";
    $experiences = $xmlDoc->getElementsByTagName('experience');
    if ($experiences->length > 0) {
        $sectionExperience = "    \\section{Expérience}\n";
        foreach ($experiences as $exp) {
            $location = $exp->getElementsByTagName('location')->item(0)->nodeValue ?? '';
            $period = $exp->getElementsByTagName('period')->item(0)->nodeValue ?? '';
            $company = $exp->getElementsByTagName('company')->item(0)->nodeValue ?? '';
            $position = $exp->getElementsByTagName('position')->item(0)->nodeValue ?? '';
            $description = $exp->getElementsByTagName('description')->item(0)->nodeValue ?? '';

            $sectionExperience .= "    \\begin{onecolentry}\n";
            $sectionExperience .= "        \\textbf{" . htmlspecialchars($location) . "} \\hfill " . htmlspecialchars($period) . " \\\\\n";
            if (!empty($company)) {
                $sectionExperience .= "        \\textit{" . htmlspecialchars($company) . "}";
                if (!empty($position)) {
                    $sectionExperience .= " \\hfill " . htmlspecialchars($position);
                }
                $sectionExperience .= " \\\\\n";
            }
            if (!empty($description)) {
                $descriptionLines = array_filter(array_map('trim', explode("\n", $description)));
                if (!empty($descriptionLines)) {
                    $sectionExperience .= "        \\begin{itemize}\n";
                    foreach ($descriptionLines as $line) {
                        if (!empty($line)) {
                            $sectionExperience .= "            \\item " . $line . "\n";
                        }
                    }
                    $sectionExperience .= "        \\end{itemize}\n";
                }
            }
            $sectionExperience .= "    \\end{onecolentry}\n\n";
            $sectionExperience .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Projects Section
    $sectionProjects = "";
    $projects = $xmlDoc->getElementsByTagName('project');
    if ($projects->length > 0) {
        $sectionProjects = "    \\section{Projets}\n";
        foreach ($projects as $project) {
            $name = $project->getElementsByTagName('name')->item(0)->nodeValue ?? '';
            $link = $project->getElementsByTagName('link')->item(0)->nodeValue ?? '';
            $description = $project->getElementsByTagName('description')->item(0)->nodeValue ?? '';

            $sectionProjects .= "    \\textbf{" . htmlspecialchars($name) . "}";
            $sectionProjects .= "\n    \n";
            
            if (!empty($description) || !empty($link)) {
                $sectionProjects .= "    \\begin{itemize}\n";
                if (!empty($description)) {
                    $sectionProjects .= "        \\item \\textbf{Description}: " . $description . "\n";
                }
                if (!empty($link)) {
                    $sectionProjects .= "        \\item \\textbf{GitHub Link}: \\hrefWithoutArrow{" . htmlspecialchars($link) . "}{\\footnotesize\\faGithub\\hspace*{0.1cm}" . htmlspecialchars($name) . "}\n";
                }
                $sectionProjects .= "    \\end{itemize}\n";
            }
            
            $sectionProjects .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Skills Section
    $sectionSkills = "";
    $skills = $xmlDoc->getElementsByTagName('skill');
    if ($skills->length > 0) {
        $sectionSkills = "    \\section{Compétences}\n";
        foreach ($skills as $skill) {
            $category = $skill->getElementsByTagName('category')->item(0)->nodeValue ?? '';
            $item = $skill->getElementsByTagName('item')->item(0)->nodeValue ?? '';

            $sectionSkills .= "    \\begin{onecolentry}\n";
            $sectionSkills .= "        \\textbf{" . htmlspecialchars($category) . ":} " . $item . "\n";
            $sectionSkills .= "    \\end{onecolentry}\n\n";
            $sectionSkills .= "    \\vspace{0.05 cm}\n\n";
        }
    }

    // Languages Section
    $sectionLanguages = "";
    $languages = $xmlDoc->getElementsByTagName('language');
    if ($languages->length > 0) {
        $sectionLanguages = "    \\section{Langues}\n";
        $sectionLanguages .= "    \\begin{onecolentry}\n";
        $lang_items = [];
        foreach ($languages as $lang) {
            $name = $lang->getElementsByTagName('name')->item(0)->nodeValue ?? '';
            $level = $lang->getElementsByTagName('level')->item(0)->nodeValue ?? '';
            $lang_items[] = "\\textbf{" . htmlspecialchars($name) . ":} " . htmlspecialchars($level);
        }
        $sectionLanguages .= "        " . implode(" \\hfill\n        ", $lang_items) . "\n";
        $sectionLanguages .= "    \\end{onecolentry}\n\n";
        $sectionLanguages .= "    \\vspace{0.05 cm}\n\n";
    }

    $sectionFooter = "\\end{document}";

    return $sectionHeader . $sectionProfil . $sectionEducation . $sectionCertificat . $sectionExperience . $sectionProjects . $sectionSkills . $sectionLanguages . $sectionFooter;
}
?>
