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
    
    // Profil
    $profil = $xmlDoc->getElementsByTagName('profil')->item(0);
    $profilDescription = $profil ? $profil->getElementsByTagName('description')->item(0)->nodeValue ?? '' : '';
    
    // Générer le contenu LaTeX (similaire à generate_cv.php)
    $latexClass = "templates/modern";
    $sectionHeader = "\\documentclass{" . $latexClass . "}\n";
    $sectionHeader .= "\\hypersetup{\n";
    $sectionHeader .= "    pdftitle={" . $nom . "'s CV},\n";
    $sectionHeader .= "    pdfauthor={" . $nom . "},\n";
    $sectionHeader .= "    pdfcreator={" . $nom . "}\n";
    $sectionHeader .= "}\n\n";
    $sectionHeader .= "\\definecolor{primaryColor}{RGB}{255, 0, 0}\n";
    $sectionHeader .= "\\begin{document}\n";
    $sectionHeader .= "    \\begin{header}\n";
    $sectionHeader .= "        \\begin{minipage}{0.8\\textwidth}\n";
    $sectionHeader .= "            \\raggedright\n";
    $sectionHeader .= "            \\fontsize{22 pt}{22 pt}\n";
    $sectionHeader .= "            \\textbf{" . $nom . "}\n\n";
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
    if ($linkedin) {
        $sectionHeader .= "            \\kern 0.1 cm%\n";
        $sectionHeader .= "            \\AND%\n";
        $sectionHeader .= "            \\kern 0.1 cm%\n";
        $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{" . $linkedin . "}{{\\footnotesize\\faLinkedinIn}\\hspace*{0.1cm} Linkedin}}%\n";
    }
    if ($github) {
        $sectionHeader .= "            \\kern 0.1 cm%\n";
        $sectionHeader .= "            \\AND%\n";
        $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{" . $github. "}{\\footnotesize\\faGithub\\hspace*{0.1cm} Github}}%\n";
    }
    $sectionHeader .= "            \\kern 0.1cm\n";
    $sectionHeader .= "        \\end{minipage}\n";
    $sectionHeader .= "    \\end{header}\n\n";
    $sectionHeader .= "    \\vspace{0.1 cm}\n\n";

    $sectionProfil = "";
    if ($profilDescription) {
        $sectionProfil = "     \\section{Profil}\n";
        $sectionProfil .= "        \\begin{onecolentry}\n";
        $sectionProfil .= "        " . $profilDescription;
        $sectionProfil .= "        \\end{onecolentry}\n";
    }

    // Education Section
    $sectionEducation = "";
    $degrees = $xmlDoc->getElementsByTagName('degree');
    if ($degrees->length > 0) {
        $sectionEducation = "    \\section{Education}\n";
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

    // Experience Section
    $sectionExperience = "";
    $experiences = $xmlDoc->getElementsByTagName('experience');
    if ($experiences->length > 0) {
        $sectionExperience = "    \\section{Experience}\n";
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
        $sectionProjects = "    \\section{Projects}\n";
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
        $sectionSkills = "    \\section{Skills}\n";
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
        $sectionLanguages = "    \\section{Languages}\n";
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

    return $sectionHeader . $sectionProfil . $sectionEducation . $sectionExperience . $sectionProjects . $sectionSkills . $sectionLanguages . $sectionFooter;
}
?>
