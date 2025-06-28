<?php
session_start();
include('../Login_Signup/db_connection.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $editingCVId = isset($_POST['editing_cv_id']) ? intval($_POST['editing_cv_id']) : null;
     // Extract form data
    $nom = htmlspecialchars($_POST['nom'] ?? '');
    $prenom = htmlspecialchars($_POST['prenom'] ?? '');
    $location = htmlspecialchars($_POST['location'] ?? '');
    $email = htmlspecialchars($_POST['email'] ?? '');
    $telephone = htmlspecialchars($_POST['telephone'] ?? '');
    $website = htmlspecialchars($_POST['website'] ?? '');
    $linkedin = htmlspecialchars($_POST['linkedin'] ?? '');
    $github = htmlspecialchars($_POST['github'] ?? '');
    $profil = htmlspecialchars($_POST['profil_description'] ?? '');
    
    // Education arrays
    $education_degree = $_POST['education_degree'] ?? [];
    $education_dates = $_POST['education_dates'] ?? [];
    $education_university = $_POST['education_university'] ?? [];
    $education_field = $_POST['education_field'] ?? [];
    $education_details = $_POST['education_details'] ?? [];
    
    // Experience arrays
    $experience_location = $_POST['experience_location'] ?? [];
    $experience_dates = $_POST['experience_dates'] ?? [];
    $experience_company = $_POST['experience_company'] ?? [];
    $experience_position = $_POST['experience_position'] ?? [];
    $experience_description = $_POST['experience_description'] ?? [];
    
    // Projects arrays
    $project_name = $_POST['project_name'] ?? [];
    $project_link = $_POST['project_link'] ?? [];
    $project_description = $_POST['project_description'] ?? [];
    
    // Skills arrays
    $skill_category = $_POST['skill_category'] ?? [];
    $skill_items = $_POST['skill_items'] ?? [];
    
    // Languages arrays
    $language_name = $_POST['language_name'] ?? [];
    $language_level = $_POST['language_level'] ?? [];
    
    // Certificates arrays
    $certificate_name = $_POST['certificate_name'] ?? [];
    $certificate_date = $_POST['certificate_date'] ?? [];
    $certificate_issuer = $_POST['certificate_issuer'] ?? [];
    $certificate_location = $_POST['certificate_location'] ?? [];
    $certificate_description = $_POST['certificate_description'] ?? [];
    
    $format = $_POST['format'] ?? 'pdf';


// Generate XML content
$xmlContent  = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
$xmlContent .= "<cv>\n";

// ── Personal Information ──
$xmlContent .= "  <personalInfo>\n";
$xmlContent .= "    <firstname>"   . $prenom    . "</firstname>\n";
$xmlContent .= "    <lastname>"    . $nom       . "</lastname>\n";
$xmlContent .= "    <email>"       . $email     . "</email>\n";
$xmlContent .= "    <phone>"       . $telephone . "</phone>\n";
if ($website)  $xmlContent .= "    <website>"   . $website   . "</website>\n";
if ($linkedin) $xmlContent .= "    <linkedin>"  . $linkedin  . "</linkedin>\n";
if ($profil)   $xmlContent .= "    <profileDescription>" . $profil . "</profileDescription>\n";
$xmlContent .= "  </personalInfo>\n\n";

// ── Education ──
$xmlContent .= "  <education>\n";
for ($i = 0; $i < count($education_dates); $i++) {
    $xmlContent .= "    <degree>\n"
                 . "      <title>"      . htmlspecialchars($education_degree[$i])    . "</title>\n"
                 . "      <period>"     . htmlspecialchars($education_dates[$i])     . "</period>\n"
                 . "      <institution>". htmlspecialchars($education_university[$i]) . "</institution>\n"
                 . "      <field>"      . htmlspecialchars($education_field[$i])      . "</field>\n";
    if (trim($education_details[$i]) !== "") {
        $xmlContent .= "      <description>" . htmlspecialchars($education_details[$i]) . "</description>\n";
    }
    $xmlContent .= "    </degree>\n";
}
$xmlContent .= "  </education>\n\n";

// ── Experiences ──
$xmlContent .= "  <experiences>\n";
for ($i = 0; $i < count($experience_dates); $i++) {
    $xmlContent .= "    <experience>\n"
                 . "      <location>"   . htmlspecialchars($experience_location[$i])    . "</location>\n"
                 . "      <period>"     . htmlspecialchars($experience_dates[$i])       . "</period>\n"
                 . "      <position>"   . htmlspecialchars($experience_position[$i])    . "</position>\n"
                 . "      <company>"    . htmlspecialchars($experience_company[$i])     . "</company>\n"
                 . "      <description>". htmlspecialchars($experience_description[$i]) . "</description>\n"
                 . "    </experience>\n";
}
$xmlContent .= "  </experiences>\n\n";

// ── Projects ──
$xmlContent .= "  <projects>\n";
for ($i = 0; $i < count($project_name); $i++) {
    $xmlContent .= "    <project>\n"
                 . "      <name>"       . htmlspecialchars($project_name[$i])        . "</name>\n";
    if (trim($project_link[$i]) !== "") {
        $xmlContent .= "      <link>"     . htmlspecialchars($project_link[$i])        . "</link>\n";
    }
    if (trim($project_description[$i]) !== "") {
        $xmlContent .= "      <description>" . htmlspecialchars($project_description[$i]) . "</description>\n";
    }
    $xmlContent .= "    </project>\n";
}
$xmlContent .= "  </projects>\n\n";

// ── Skills ──
$xmlContent .= "  <skills>\n";
for ($i = 0; $i < count($skill_items); $i++) {
    $xmlContent .= "    <skill>\n"
                 . "      <category>" . htmlspecialchars($skill_category[$i]) . "</category>\n"
                 . "      <item>"     . htmlspecialchars($skill_items[$i])    . "</item>\n"
                 . "    </skill>\n";
}
$xmlContent .= "  </skills>\n\n";

// ── Languages ──
$xmlContent .= "  <languages>\n";
for ($i = 0; $i < count($language_name); $i++) {
    $xmlContent .= "    <language>\n"
                 . "      <name>"  . htmlspecialchars($language_name[$i])  . "</name>\n"
                 . "      <level>" . htmlspecialchars($language_level[$i]) . "</level>\n"
                 . "    </language>\n";
}
$xmlContent .= "  </languages>\n\n";

// ── Certificates ──
$xmlContent .= "  <certificates>\n";
for ($i = 0; $i < count($certificate_name); $i++) {
    $xmlContent .= "    <certificate>\n"
                 . "      <name>"    . htmlspecialchars($certificate_name[$i])    . "</name>\n"
                 . "      <date>"    . htmlspecialchars($certificate_date[$i])    . "</date>\n"
                 . "      <issuer>"  . htmlspecialchars($certificate_issuer[$i])  . "</issuer>\n"
                 . "      <location>". htmlspecialchars($certificate_location[$i]). "</location>\n";
    if (trim($certificate_description[$i]) !== "") {
        $xmlContent .= "      <description>" . htmlspecialchars($certificate_description[$i]) . "</description>\n";
    }
    $xmlContent .= "    </certificate>\n";
}
$xmlContent .= "  </certificates>\n\n";

// ── Close root element ──
$xmlContent .= "</cv>";

    
    // Save XML file locally
    $xmlFile = "cv_" . $nom . "_" . $prenom . ".xml";
    file_put_contents($xmlFile, $xmlContent);    // Save CV to database if user is logged in
    if (isset($_SESSION['userId']) && !empty($_SESSION['userId'])) {
        try {
            // Prepare all form data for database storage
            $formData = [
                'nom' => $nom,
                'prenom' => $prenom,
                'location' => $location,
                'email' => $email,
                'telephone' => $telephone,
                'website' => $website,
                'linkedin' => $linkedin,
                'github' => $github,
                'profil_description' => $profil,
                'education_degree' => $education_degree,
                'education_dates' => $education_dates,
                'education_university' => $education_university,
                'education_field' => $education_field,
                'education_details' => $education_details,
                'experience_location' => $experience_location,
                'experience_dates' => $experience_dates,
                'experience_company' => $experience_company,
                'experience_position' => $experience_position,
                'experience_description' => $experience_description,
                'project_name' => $project_name,
                'project_link' => $project_link,
                'project_description' => $project_description,
                'skill_category' => $skill_category,
                'skill_items' => $skill_items,
                'language_name' => $language_name,
                'language_level' => $language_level,
                'certificate_name' => $certificate_name,
                'certificate_date' => $certificate_date,
                'certificate_issuer' => $certificate_issuer,
                'certificate_location' => $certificate_location,
                'certificate_description' => $certificate_description,
                'format' => $format
            ];
            
            $formDataJson = json_encode($formData);
            
            if ($editingCVId) {
                // Mode édition : mettre à jour le CV existant
                $updateSql = "UPDATE user_cvs SET xml_content = :xml_content, form_data = :form_data, updated_at = CURRENT_TIMESTAMP WHERE id = :cv_id AND user_id = :user_id";
                $updateStmt = $pdo->prepare($updateSql);
                $updateStmt->execute([
                    ':xml_content' => $xmlContent,
                    ':form_data' => $formDataJson,
                    ':cv_id' => $editingCVId,
                    ':user_id' => $_SESSION['userId']
                ]);
            } else {
                // Mode création : créer un nouveau CV
                $cvName = "CV_" . $nom . "_" . $prenom . "_" . date('Y-m-d_H-i-s');
                // Insert new CV
                $insertSql = "INSERT INTO user_cvs (user_id, cv_name, xml_content, form_data) VALUES (:user_id, :cv_name, :xml_content, :form_data)";
                $insertStmt = $pdo->prepare($insertSql);
                $insertStmt->execute([
                    ':user_id' => $_SESSION['userId'],
                    ':cv_name' => $cvName,
                    ':xml_content' => $xmlContent,
                    ':form_data' => $formDataJson
                ]);
            }
        } catch (Exception $e) {
            // Log error but continue with file generation
            error_log("Erreur lors de la sauvegarde du CV en base : " . $e->getMessage());
        }
    }
    $latexClass = "modern1";
    $srcCls     = __DIR__ . "/templates/{$latexClass}.cls";
    $dstCls     = __DIR__ . "/{$latexClass}.cls";

    if (!file_exists($srcCls)) {
        echo "<p style='color: red;'>❌ Template class file not found: templates/{$latexClass}.cls</p>";
        echo "<p>Available files in templates directory:</p>";
        if (is_dir(__DIR__ . "/templates")) {
            $files = scandir(__DIR__ . "/templates");
            echo "<ul>";
            foreach ($files as $file) {
                if ($file != '.' && $file != '..') {
                    echo "<li>$file</li>";
                }
            }
            echo "</ul>";
        } else {
            echo "<p>Templates directory not found!</p>";
        }
        echo "<br><a href='home.html'>← Back to Form</a>";
        echo "</body></html>";
        exit();
    }
    copy($srcCls, $dstCls);
    // $sectionHeader = "\\documentclass{templates/" . $template . "}\n";
    $sectionHeader = "\\documentclass{modern1}\n";
    $sectionHeader .= "\\hypersetup{\n";
    $sectionHeader .= "    pdftitle={" . $nom . "'s CV},\n";
    $sectionHeader .= "    pdfauthor={" . $nom . "},\n";
    $sectionHeader .= "    pdfcreator={" . $nom . "}\n";
    $sectionHeader .= "}\n\n"; 
    $sectionHeader .= "\\begin{document}\n";
    $sectionHeader .= "    \\placelastupdatedtext\n";
    $sectionHeader .= "    \\begin{header}\n";
    /* $sectionHeader .= "        % Photo and name in a minipage\n";
    $sectionHeader .= "        \\begin{minipage}{0.2\\textwidth}\n";
    $sectionHeader .= "            \\includegraphics[width=2.5cm, height=2.5cm]{" . $photo . "}\n";
    $sectionHeader .= "        \\end{minipage}%\n";
    */
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
    $sectionHeader .= "            \\kern 0.1 cm%\n";
    $sectionHeader .= "            \\AND%\n";
    $sectionHeader .= "            \\kern 0.1 cm%\n";
    $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{" . $linkedin . "}{{\\footnotesize\\faLinkedinIn}\\hspace*{0.1cm} Linkedin}}%\n";
    $sectionHeader .= "            \\kern 0.1 cm%\n";
    $sectionHeader .= "            \\AND%\n";
    $sectionHeader .= "            \\mbox{\\hrefWithoutArrow{" . $github. "}{\\footnotesize\\faGithub\\hspace*{0.1cm} Github}}%\n";
    $sectionHeader .= "            \\kern 0.1cm\n";
    $sectionHeader .= "        \\end{minipage}\n";
    $sectionHeader .= "    \\end{header}\n\n";
    $sectionHeader .= "    \\vspace{0.1 cm}\n\n";

    $sectionProfil = "\\section{Profil}\n";
    $sectionProfil .= "    \\begin{onecolentry}\n";
    $sectionProfil .= "        " . $profil;
    $sectionProfil .= "    \\end{onecolentry}\n";

    // Education Section
    $sectionEducation = "    \\section{Education}\n";
    for ($i = 0; $i < count($education_degree); $i++) {
        $degree = htmlspecialchars($education_degree[$i]);
        $dates = htmlspecialchars($education_dates[$i]);
        $university = htmlspecialchars($education_university[$i]);
        $field = htmlspecialchars($education_field[$i]);
        $detail = htmlspecialchars($education_details[$i]);

        $sectionEducation .= "    \\begin{onecolentry}\n";
        $sectionEducation .= "        \\textbf{" . $degree . "} \\hfill " . $dates . " \\\\\n";
        if (!empty($university)) {
            $sectionEducation .= "        \\textit{" . $university . "}";
            if (!empty($field)) {
                $sectionEducation .= " \\hfill " . $field;
            }
            $sectionEducation .= " \\\\\n";
        }
        if (!empty($detail)) {
            $sectionEducation .= "        " . $detail . "\n";
        }
        $sectionEducation .= "    \\end{onecolentry}\n\n";
        $sectionEducation .= "    \\vspace{0.05 cm}\n\n";
    }
    // Experience Section
    $sectionExperience = "    \\section{Experience}\n";
    for ($i = 0; $i < count($experience_location); $i++) {
        $place = htmlspecialchars($experience_location[$i]);
        $dates = htmlspecialchars($experience_dates[$i]);
        $company = htmlspecialchars($experience_company[$i]);
        $position = htmlspecialchars($experience_position[$i]);
        $description = htmlspecialchars($experience_description[$i]);

        $sectionExperience .= "    \\begin{onecolentry}\n";
        $sectionExperience .= "        \\textbf{" . $place . "} \\hfill " . $dates . " \\\\\n";
        if (!empty($university)) {
            $sectionExperience .= "        \\textit{" . $company . "}";
            if (!empty($field)) {
                $sectionExperience .= " \\hfill " . $position;
            }
            $sectionExperience .= " \\\\\n";
        }
        if (!empty($description)) {
            $sectionExperience .= "        " . $description . "\n";
        }
        $sectionExperience .= "    \\end{onecolentry}\n\n";
        $sectionExperience .= "    \\vspace{0.05 cm}\n\n";
    }
    $sectionExperience .= "\n";

    // Project Section
    $sectionProjects = "    \\section{Projects}\n";
    for ($i = 0; $i < count($project_name); $i++) {
        $title = htmlspecialchars($project_name[$i]);
        // $technologies = $projects_technologies[$i];
        $description = htmlspecialchars($project_description[$i]);
        $github = htmlspecialchars($project_link[$i]);
        // $github_display = htmlspecialchars($projects_github_display[$i]);

        $sectionProjects .= "    \\textbf{" . $title . "}";
        $sectionProjects .= "\n    \n";
        
        /* if (!empty($technologies)) {
            $sectionProjects .= "    \\begin{itemize}\n";
            $sectionProjects .= "        \\item \\textbf{Technologies Used}: " . implode(', ', array_map('htmlspecialchars', $technologies)) . "\n";
            $sectionProjects .= "    \\end{itemize}\n\n";
        }
        */

        if (!empty($description) || !empty($github)) {
            $sectionProjects .= "    \\begin{itemize}\n";
            if (!empty($description)) {
                $sectionProjects .= "        \\item \\textbf{Description}: " . $description . "\n";
            }
            if (!empty($github)) {
                $sectionProjects .= "        \\item \\textbf{GitHub Link}: \\hrefWithoutArrow{" . $github . "}{\\footnotesize\\faGithub\\hspace*{0.1cm} ba3 }\n";
            }
            $sectionProjects .= "    \\end{itemize}\n";
        }
        
        $sectionProjects .= "    \\vspace{0.05 cm}\n\n";
    }

    // Skills Section
    $sectionSkills = "    \\section{Skills}\n";
    for ($i = 0; $i < count($skill_category); $i++) {
        $category = htmlspecialchars($skill_category[$i]);
        $item = htmlspecialchars($skill_items[$i]);

        $sectionSkills .= "    \\begin{onecolentry}\n";
        $sectionSkills .= "        \\textbf{" . $category . ":} " . $item . "\n";
        $sectionSkills .= "    \\end{onecolentry}\n\n";
        $sectionSkills .= "    \\vspace{0.05 cm}\n\n";
    }

    // Languages Section
    $sectionLanguages = "    \\section{Languages}\n";
    $sectionLanguages .= "    \\begin{onecolentry}\n";
    $lang_items = [];
    for ($i = 0; $i < count($language_name); $i++) {
        $name = htmlspecialchars($language_name[$i]);
        $level = htmlspecialchars($language_level[$i]);
        $lang_items[] = "\\textbf{" . $name . ":} " . $level;
    }
    $sectionLanguages .= "        " . implode(" \\hfill\n        ", $lang_items) . "\n";
    $sectionLanguages .= "    \\end{onecolentry}\n\n";
    $sectionLanguages .= "    \\vspace{0.05 cm}\n\n";

    $sectionFooter = "\\end{document}";

    $latexContent = $sectionHeader . $sectionEducation . $sectionProjects . $sectionExperience . $sectionSkills . $sectionLanguages . $sectionFooter;

// Write LaTeX file
$texFile = "CV_" . $nom . "_" . $prenom . ".tex";
file_put_contents($texFile, $latexContent);
$output = shell_exec("pdflatex -interaction=nonstopmode " . escapeshellarg($texFile) . " 2>&1");

// Fix: Check for the actual PDF filename (same as tex file but .pdf)
$pdfFile = str_replace('.tex', '.pdf', $texFile);

if (!file_exists($pdfFile)) {
    echo "<h2>❌ Error generating PDF</h2>";
    echo "<h3>LaTeX Output:</h3><pre>" . htmlspecialchars($output) . "</pre>";
    echo "<br><a href='home.html'>← Back to Form</a>";
    exit();
}
    
    // Check if user wants XML, PDF, or both
    $format = isset($_POST['format']) ? $_POST['format'] : 'pdf';
    
    if ($format === 'xml') {
        // Send XML file with Save As dialog
        header('Content-Type: application/xml');
        header('Content-Disposition: attachment; filename="CV_'.$nom.'_'.$prenom.'.xml"');
        header('Content-Length: ' . filesize($xmlFile));
        header('Cache-Control: no-cache, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        readfile($xmlFile);
        
        // Clean up files
        @unlink($texFile);
        @unlink($pdfFile);
        @unlink($xmlFile);
        @unlink(str_replace('.tex', '.aux', $texFile));
        @unlink(str_replace('.tex', '.log', $texFile));
        @unlink(str_replace('.tex', '.out', $texFile));
        @unlink("modern1.cls");
        
    } elseif ($format === 'both') {
        // Create ZIP file with both formats
        $zipFileName = "CV_" . $nom . "_" . $prenom . ".zip";
        
        if (class_exists('ZipArchive')) {
            $zip = new ZipArchive();
            if ($zip->open($zipFileName, ZipArchive::CREATE) === TRUE) {
                // Add PDF file to ZIP (use correct filename)
                $zip->addFile($pdfFile, "CV_" . $nom . "_" . $prenom . ".pdf");
                // Add XML file to ZIP  
                $zip->addFile($xmlFile, "CV_" . $nom . "_" . $prenom . ".xml");
                $zip->close();
                
                // Send ZIP file with Save As dialog
                header('Content-Type: application/zip');
                header('Content-Disposition: attachment; filename="' . $zipFileName . '"');
                header('Content-Length: ' . filesize($zipFileName));
                header('Cache-Control: no-cache, must-revalidate');
                header('Pragma: no-cache');
                header('Expires: 0');
                readfile($zipFileName);
                
                // Clean up files
                @unlink($texFile);
                @unlink($pdfFile);
                @unlink($xmlFile);
                @unlink($zipFileName);
                @unlink(str_replace('.tex', '.aux', $texFile));
                @unlink(str_replace('.tex', '.log', $texFile));
                @unlink(str_replace('.tex', '.out', $texFile));
                @unlink("modern1.cls");
            } else {
                die("Erreur lors de la création du fichier ZIP.");
            }
        } else {
            die("Extension ZIP non disponible sur ce serveur.");
        }
    } else {
        // Send PDF file with Save As dialog (default behavior)
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="CV_'.$nom.'_'.$prenom.'.pdf"');
        header('Content-Length: ' . filesize($pdfFile));
        header('Cache-Control: no-cache, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        // Read and output the PDF file
        readfile($pdfFile);
        
        // Clean up files
        @unlink($texFile);
        @unlink($pdfFile);
        @unlink($xmlFile);
        @unlink(str_replace('.tex', '.aux', $texFile));
        @unlink(str_replace('.tex', '.log', $texFile));
        @unlink(str_replace('.tex', '.out', $texFile));
        @unlink("modern1.cls");
    }

    exit();
}
?>