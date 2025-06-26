<?php
session_start();
include('../Login_Signup/db_connection.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Vérifier si on est en mode édition
    $editingCVId = isset($_POST['editing_cv_id']) ? intval($_POST['editing_cv_id']) : null;
    
    $nom = htmlspecialchars($_POST['nom']);
    $prenom = htmlspecialchars($_POST['prenom']);
    $email = htmlspecialchars($_POST['email']);
    $telephone = htmlspecialchars($_POST['telephone']);
    $linkedin = isset($_POST['linkedin']) ? htmlspecialchars($_POST['linkedin']) : "";
    $emploi = htmlspecialchars($_POST['emploi_recherche']);
    $profil = isset($_POST['profil_description']) ? htmlspecialchars($_POST['profil_description']) : "";
    $emploiDescription = isset($_POST['emploi_description']) ? htmlspecialchars($_POST['emploi_description']) : "";

    $competencesNumeriques = htmlspecialchars($_POST['competences_numeriques']);
    $competencesAutres = htmlspecialchars($_POST['competences_autres']);

    $experience_dates = $_POST['experience_dates'];
    $experience_poste = $_POST['experience_poste'];
    $experience_employeur = $_POST['experience_employeur'];
    $experience_description = $_POST['experience_description'];

    $education_dates = $_POST['education_dates'];
    $education_diplome = $_POST['education_diplome'];
    $education_etablissement = $_POST['education_etablissement'];
    $education_description = isset($_POST['education_description']) ? $_POST['education_description'] : [];

    $langues = $_POST['langue'];
    $niveaux = $_POST['niveau'];
    $language_description = isset($_POST['language_description']) ? $_POST['language_description'] : [];

    // Generate XML content
    $xmlContent = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    $xmlContent .= "<cv>\n";
      // Personal Information
    $xmlContent .= "  <personalInfo>\n";
    $xmlContent .= "    <firstname>" . $prenom . "</firstname>\n";
    $xmlContent .= "    <lastname>" . $nom . "</lastname>\n";
    $xmlContent .= "    <email>" . $email . "</email>\n";
    $xmlContent .= "    <phone>" . $telephone . "</phone>\n";
    $xmlContent .= "    <address>" . htmlspecialchars($_POST['adresse']) . "</address>\n";
    $xmlContent .= "    <birthDate>" . htmlspecialchars($_POST['date_naissance']) . "</birthDate>\n";
    $xmlContent .= "    <nationality>" . htmlspecialchars($_POST['nationalite']) . "</nationality>\n";
    if ($linkedin != "") {
        $xmlContent .= "    <linkedin>" . $linkedin . "</linkedin>\n";
    }
    $xmlContent .= "    <jobTitle>" . $emploi . "</jobTitle>\n";
    if ($emploiDescription != "") {
        $xmlContent .= "    <jobDescription>" . $emploiDescription . "</jobDescription>\n";
    }
    if ($profil != "") {
        $xmlContent .= "    <profileDescription>" . $profil . "</profileDescription>\n";
    }
    $xmlContent .= "  </personalInfo>\n";
    
    // Experiences
    $xmlContent .= "  <experiences>\n";
    for ($i = 0; $i < count($experience_dates); $i++) {
        $date = htmlspecialchars($experience_dates[$i]);
        $poste = htmlspecialchars($experience_poste[$i]);
        $employeur = htmlspecialchars($experience_employeur[$i]);
        $description = htmlspecialchars($experience_description[$i]);
        
        $xmlContent .= "    <experience>\n";
        $xmlContent .= "      <period>" . $date . "</period>\n";
        $xmlContent .= "      <position>" . $poste . "</position>\n";
        $xmlContent .= "      <employer>" . $employeur . "</employer>\n";
        $xmlContent .= "      <description>" . $description . "</description>\n";
        $xmlContent .= "    </experience>\n";
    }
    $xmlContent .= "  </experiences>\n";
    
    // Education
    $xmlContent .= "  <education>\n";
    for ($i = 0; $i < count($education_dates); $i++) {
        $date = htmlspecialchars($education_dates[$i]);
        $diplome = htmlspecialchars($education_diplome[$i]);
        $etablissement = htmlspecialchars($education_etablissement[$i]);
        
        $xmlContent .= "    <degree>\n";
        $xmlContent .= "      <period>" . $date . "</period>\n";
        $xmlContent .= "      <title>" . $diplome . "</title>\n";
        $xmlContent .= "      <institution>" . $etablissement . "</institution>\n";
        if (isset($education_description[$i]) && trim($education_description[$i]) !== "") {
            $xmlContent .= "      <description>" . htmlspecialchars($education_description[$i]) . "</description>\n";
        }
        $xmlContent .= "    </degree>\n";
    }
    $xmlContent .= "  </education>\n";
    
    // Languages
    $xmlContent .= "  <languages>\n";
    for ($i = 0; $i < count($langues); $i++) {
        $langue = htmlspecialchars($langues[$i]);
        $niveau = htmlspecialchars($niveaux[$i]);
        
        $xmlContent .= "    <language>\n";
        $xmlContent .= "      <name>" . $langue . "</name>\n";
        $xmlContent .= "      <level>" . $niveau . "</level>\n";
        if (isset($language_description[$i]) && trim($language_description[$i]) !== "") {
            $xmlContent .= "      <description>" . htmlspecialchars($language_description[$i]) . "</description>\n";
        }
        $xmlContent .= "    </language>\n";
    }
    $xmlContent .= "  </languages>\n";
    
    // Skills
    $xmlContent .= "  <skills>\n";
    $xmlContent .= "    <digitalSkills>" . $competencesNumeriques . "</digitalSkills>\n";
    $xmlContent .= "    <otherSkills>" . $competencesAutres . "</otherSkills>\n";
    $xmlContent .= "  </skills>\n";
      $xmlContent .= "</cv>";
    
    // Save XML file locally
    $xmlFile = "cv_" . $nom . "_" . $prenom . ".xml";
    file_put_contents($xmlFile, $xmlContent);    // Save CV to database if user is logged in
    if (isset($_SESSION['userId']) && !empty($_SESSION['userId'])) {
        try {
            if ($editingCVId) {
                // Mode édition : mettre à jour le CV existant
                $updateSql = "UPDATE user_cvs SET xml_content = :xml_content, updated_at = CURRENT_TIMESTAMP WHERE id = :cv_id AND user_id = :user_id";
                $updateStmt = $pdo->prepare($updateSql);
                $updateStmt->execute([
                    ':xml_content' => $xmlContent,
                    ':cv_id' => $editingCVId,
                    ':user_id' => $_SESSION['userId']
                ]);
            } else {
                // Mode création : créer un nouveau CV
                $cvName = "CV_" . $nom . "_" . $prenom . "_" . date('Y-m-d_H-i-s');
                // Insert new CV
                $insertSql = "INSERT INTO user_cvs (user_id, cv_name, xml_content) VALUES (:user_id, :cv_name, :xml_content)";
                $insertStmt = $pdo->prepare($insertSql);
                $insertStmt->execute([
                    ':user_id' => $_SESSION['userId'],
                    ':cv_name' => $cvName,
                    ':xml_content' => $xmlContent
                ]);
            }
        } catch (Exception $e) {
            // Log error but continue with file generation
            error_log("Erreur lors de la sauvegarde du CV en base : " . $e->getMessage());
        }
    }

    $latexContent = "";
    $latexContent .= "\\documentclass[a4paper,10pt]{article}\n";
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

    $latexContent .= "\\section{Expérience Professionnelle}\n";
    for ($i = 0; $i < count($experience_dates); $i++) {
        $date = htmlspecialchars($experience_dates[$i]);
        $poste = htmlspecialchars($experience_poste[$i]);
        $employeur = htmlspecialchars($experience_employeur[$i]);
        $description = htmlspecialchars($experience_description[$i]);
        $latexContent .= "\\textbf{" . $poste . "}, " . $employeur . " (" . $date . ")\\\\\n";
        $latexContent .= $description . "\n\\\\[0.3em]\n";
    }

    $latexContent .= "\\section{Formation}\n";
    for ($i = 0; $i < count($education_dates); $i++) {
        $date = htmlspecialchars($education_dates[$i]);
        $diplome = htmlspecialchars($education_diplome[$i]);
        $etablissement = htmlspecialchars($education_etablissement[$i]);
        $latexContent .= "\\textbf{" . $diplome . "}, " . $etablissement . " (" . $date . ")\\\\\n";
        if(isset($education_description[$i]) && trim($education_description[$i]) !== ""){
            $latexContent .= htmlspecialchars($education_description[$i]) . "\n";
        }
        $latexContent .= "\\\\[0.3em]\n";
    }

    $latexContent .= "\\section{Langues}\n";
    $latexContent .= "\\begin{itemize}\n";
    for ($i = 0; $i < count($langues); $i++) {
        $langue = htmlspecialchars($langues[$i]);
        $niveau = htmlspecialchars($niveaux[$i]);
        $latexContent .= "\\item " . $langue . " - " . $niveau;
        if(isset($language_description[$i]) && trim($language_description[$i]) !== ""){
            $latexContent .= " (" . htmlspecialchars($language_description[$i]) . ")";
        }
        $latexContent .= "\n";
    }
    $latexContent .= "\\end{itemize}\n";

    $latexContent .= "\\section{Compétences}\n";
    $latexContent .= "\\subsection*{Compétences numériques}\n";
    $latexContent .= $competencesNumeriques . "\n";
    $latexContent .= "\\subsection*{Autres compétences}\n";
    $latexContent .= $competencesAutres . "\n";

    $latexContent .= "\\end{document}\n";

    $latexFile = "cv.tex";
    file_put_contents($latexFile, $latexContent);    $output = shell_exec("pdflatex -interaction=nonstopmode cv.tex 2>&1");
    
    if (!file_exists("cv.pdf")) {
        die("Erreur lors de la génération du PDF. Vérifiez 'log.txt' pour les détails.");
    }
    
    // Check if user wants XML, PDF, or both
    $format = isset($_POST['format']) ? $_POST['format'] : 'pdf';
    
    if ($format === 'xml') {
        // Send XML file only
        header('Content-Type: application/xml');
        header('Content-Disposition: attachment; filename="CV_'.$nom.'_'.$prenom.'.xml"');
        header('Content-Length: ' . filesize($xmlFile));
        readfile($xmlFile);
        
        // Clean up files
        @unlink("cv.aux");
        @unlink("cv.log");
        @unlink("cv.pdf");
        @unlink("cv.tex");
        @unlink("cv.out");
        @unlink($xmlFile);
    } elseif ($format === 'both') {
        // Create ZIP file with both formats
        $zipFileName = "CV_" . $nom . "_" . $prenom . ".zip";
        
        if (class_exists('ZipArchive')) {
            $zip = new ZipArchive();
            if ($zip->open($zipFileName, ZipArchive::CREATE) === TRUE) {
                // Add PDF file to ZIP
                $zip->addFile("cv.pdf", "CV_" . $nom . "_" . $prenom . ".pdf");
                // Add XML file to ZIP  
                $zip->addFile($xmlFile, "CV_" . $nom . "_" . $prenom . ".xml");
                $zip->close();
                
                // Send ZIP file
                header('Content-Type: application/zip');
                header('Content-Disposition: attachment; filename="' . $zipFileName . '"');
                header('Content-Length: ' . filesize($zipFileName));
                readfile($zipFileName);
                
                // Clean up files
                @unlink("cv.aux");
                @unlink("cv.log");
                @unlink("cv.pdf");
                @unlink("cv.tex");
                @unlink("cv.out");
                @unlink($xmlFile);
                @unlink($zipFileName);
            } else {
                die("Erreur lors de la création du fichier ZIP.");
            }
        } else {
            die("Extension ZIP non disponible sur ce serveur.");
        }
    } else {
        // Send PDF file only (default behavior)
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="CV_'.$nom.'_'.$prenom.'.pdf"');
        readfile("cv.pdf");
        
        // Clean up files
        @unlink("cv.aux");
        @unlink("cv.log");
        @unlink("cv.pdf");
        @unlink("cv.tex");
        @unlink("cv.out");
        @unlink($xmlFile);
    }

    exit();
}
?>
