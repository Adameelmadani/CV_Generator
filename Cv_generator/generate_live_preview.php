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

// Lire les données JSON depuis le body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    exit('Invalid JSON data');
}

// Function to convert hex color to RGB array for LaTeX (identique à generate_cv.php)
function hexToRgb($hex) {
    // Remove # if present
    $hex = str_replace('#', '', $hex);
    
    // Convert hex to RGB
    if (strlen($hex) == 6) {
        return [
            'r' => hexdec(substr($hex, 0, 2)),
            'g' => hexdec(substr($hex, 2, 2)),
            'b' => hexdec(substr($hex, 4, 2))
        ];
    }
    
    // Default to blue if invalid hex
    return ['r' => 102, 'g' => 126, 'b' => 234];
}

try {
    // Extraire les données du formulaire depuis le JSON (même logique que generate_cv.php)
    $nom = htmlspecialchars($input['nom'] ?? '');
    $prenom = htmlspecialchars($input['prenom'] ?? '');
    $location = htmlspecialchars($input['location'] ?? '');
    $email = htmlspecialchars($input['email'] ?? '');
    $telephone = htmlspecialchars($input['telephone'] ?? '');
    $website = htmlspecialchars($input['website'] ?? '');
    $linkedin = htmlspecialchars($input['linkedin'] ?? '');
    $github = htmlspecialchars($input['github'] ?? '');
    $profil = $input['profil_description'] ?? '';
    
    // Education arrays
    $education_degree = $input['education_degree'] ?? [];
    $education_dates = $input['education_dates'] ?? [];
    $education_university = $input['education_university'] ?? [];
    $education_field = $input['education_field'] ?? [];
    $education_details = $input['education_details'] ?? [];
    
    // Experience arrays
    $experience_location = $input['experience_location'] ?? [];
    $experience_dates = $input['experience_dates'] ?? [];
    $experience_company = $input['experience_company'] ?? [];
    $experience_position = $input['experience_position'] ?? [];
    $experience_description = $input['experience_description'] ?? [];
    
    // Projects arrays
    $project_name = $input['project_name'] ?? [];
    $project_link = $input['project_link'] ?? [];
    $project_description = $input['project_description'] ?? [];
    
    // Skills arrays
    $skill_category = $input['skill_category'] ?? [];
    $skill_items = $input['skill_items'] ?? [];
    
    // Languages arrays
    $language_name = $input['language_name'] ?? [];
    $language_level = $input['language_level'] ?? [];
    
    // Certificates arrays
    $certificate_name = $input['certificate_name'] ?? [];
    $certificate_date = $input['certificate_date'] ?? [];
    $certificate_issuer = $input['certificate_issuer'] ?? [];
    $certificate_location = $input['certificate_location'] ?? [];
    $certificate_description = $input['certificate_description'] ?? [];

    $format = $input['format'] ?? 'pdf';
    
    // Extract customization options
    $primaryColor = $input['primary_color'] ?? '#667eea';

    // === GÉNÉRATION LATEX IDENTIQUE À generate_cv.php ===
    
    $latexClass = "templates/modern";

    $sectionHeader = "\\documentclass{" . $latexClass . "}\n";
    $sectionHeader .= "\\hypersetup{\n";
    $sectionHeader .= "    pdftitle={" . $nom . "'s CV},\n";
    $sectionHeader .= "    pdfauthor={" . $nom . "},\n";
    $sectionHeader .= "    pdfcreator={" . $nom . "}\n";
    $sectionHeader .= "}\n\n";

    // Color definitions
    // Convert hex color to RGB for LaTeX
    $primaryColorRGB = hexToRgb($primaryColor);
    $sectionHeader .= "\\definecolor{primaryColor}{RGB}{" . $primaryColorRGB['r'] . ", " . $primaryColorRGB['g'] . ", " . $primaryColorRGB['b'] . "}\n\n";

    $sectionHeader .= "\\begin{document}\n";
    $sectionHeader .= "    \\begin{header}\n";
    
    // Photo handling simplified for preview (no actual photo upload in live preview)
    $photoForLatex = '';
    // For preview, we skip photo handling to avoid file operations
    
    $sectionHeader .= "        \\begin{minipage}{0.95\\textwidth}\n";
    
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

    $sectionProfil = "     \\section{Profil}\n";
    $sectionProfil .= "        \\begin{onecolentry}\n";
    $sectionProfil .= "        " . $profil;
    $sectionProfil .= "        \\end{onecolentry}\n";

    // Formation Section (identique à generate_cv.php)
    $sectionEducation = "    \\section{Formation}\n";
    for ($i = 0; $i < count($education_degree); $i++) {
        $degree = htmlspecialchars($education_degree[$i]);
        $dates = htmlspecialchars($education_dates[$i]);
        $university = htmlspecialchars($education_university[$i]);
        $field = htmlspecialchars($education_field[$i]);
        $detail = $education_details[$i];

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

    // Certificat Section (identique à generate_cv.php)
    $sectionCertificat = "    \\section{Certificats}\n";
    for ($i = 0; $i < count($certificate_name); $i++) {
        $name = htmlspecialchars($certificate_name[$i]);
        $dates = htmlspecialchars($certificate_date[$i]);
        $orga = htmlspecialchars($certificate_issuer[$i]);
        $certLocation = htmlspecialchars($certificate_location[$i]);
        $description = $certificate_description[$i];

        $sectionCertificat .= "    \\begin{onecolentry}\n";
        $sectionCertificat .= "        \\textbf{" . $name . "} \\hfill " . $dates . " \\\\\n";
        if (!empty($orga)) {
            $sectionCertificat .= "        \\textit{" . $orga . "}";
            if (!empty($certLocation)) {
                $sectionCertificat .= " \\hfill " . $certLocation;
            }
            $sectionCertificat .= " \\\\\n";
        }
        if (!empty($description)) {
            $sectionCertificat .= "        " . $description . "\n";
        }
        $sectionCertificat .= "    \\end{onecolentry}\n\n";
        $sectionCertificat .= "    \\vspace{0.05 cm}\n\n";
    }
    
    // Experience Section (identique à generate_cv.php)
    $sectionExperience = "    \\section{Expérience}\n";
    for ($i = 0; $i < count($experience_location); $i++) {
        $place = htmlspecialchars($experience_location[$i]);
        $dates = htmlspecialchars($experience_dates[$i]);
        $company = htmlspecialchars($experience_company[$i]);
        $position = htmlspecialchars($experience_position[$i]);
        $description = $experience_description[$i];

        $sectionExperience .= "    \\begin{onecolentry}\n";
        $sectionExperience .= "        \\textbf{" . $place . "} \\hfill " . $dates . " \\\\\n";
        if (!empty($company)) {
            $sectionExperience .= "        \\textit{" . $company . "}";
            if (!empty($position)) {
                $sectionExperience .= " \\hfill " . $position;
            }
            $sectionExperience .= " \\\\\n";
        }
        if (!empty($description)) {
            // Séparer la description par les sauts de ligne et créer une liste
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
    $sectionExperience .= "\n";

    // Project Section (identique à generate_cv.php)
    $sectionProjects = "    \\section{Projets}\n";
    for ($i = 0; $i < count($project_name); $i++) {
        $title = htmlspecialchars($project_name[$i]);
        $description = $project_description[$i];
        $github = htmlspecialchars($project_link[$i]);

        $sectionProjects .= "    \\textbf{" . $title . "}";
        $sectionProjects .= "\n    \n";
        
        if (!empty($description) || !empty($github)) {
            $sectionProjects .= "    \\begin{itemize}\n";
            if (!empty($description)) {
                $sectionProjects .= "        \\item \\textbf{Description}: " . $description . "\n";
            }
            if (!empty($github)) {
                $sectionProjects .= "        \\item \\textbf{GitHub Link}: \\hrefWithoutArrow{" . $github . "}{\\footnotesize\\faGithub\\hspace*{0.1cm}" . $title . "}\n";
            }
            $sectionProjects .= "    \\end{itemize}\n";
        }
    }

    // Skills Section (identique à generate_cv.php)
    $sectionSkills = "    \\section{Compétences}\n";
    for ($i = 0; $i < count($skill_category); $i++) {
        $category = htmlspecialchars($skill_category[$i]);
        $items = htmlspecialchars($skill_items[$i]);

        $sectionSkills .= "    \\begin{onecolentry}\n";
        $sectionSkills .= "        \\textbf{" . $category . ":} " . $items . "\n";
        $sectionSkills .= "    \\end{onecolentry}\n\n";
        $sectionSkills .= "    \\vspace{0.05 cm}\n\n";
    }

    // Languages Section (identique à generate_cv.php)
    $sectionLanguages = "    \\section{Langues}\n";
    $sectionLanguages .= "    \\begin{onecolentry}\n";
    
    $lang_items = [];
    for ($i = 0; $i < count($language_name); $i++) {
        $name = htmlspecialchars($language_name[$i]);
        $level = htmlspecialchars($language_level[$i]);
        if ($name && $level) {
            $lang_items[] = "\\textbf{" . $name . ":} " . $level;
        }
    }
    $sectionLanguages .= "        " . implode(" \\hfill\n        ", $lang_items) . "\n";
    $sectionLanguages .= "    \\end{onecolentry}\n\n";
    $sectionLanguages .= "    \\vspace{0.05 cm}\n\n";

    $sectionFooter = "\\end{document}";

    $latexContent = $sectionHeader . $sectionProfil . $sectionEducation . $sectionCertificat . $sectionExperience . $sectionProjects . $sectionSkills . $sectionLanguages . $sectionFooter;

    // Write LaTeX file with unique name for preview
    $uniqueId = uniqid('preview_');
    $texFile = $uniqueId . ".tex";
    $pdfFile = $uniqueId . ".pdf";
    
    file_put_contents($texFile, $latexContent);

    // First compilation (creates .aux file with references)
    $output = shell_exec("pdflatex -interaction=nonstopmode " . escapeshellarg($texFile) . " 2>&1");

    // Second compilation (resolves references like LastPage for correct page numbering)
    $output2 = shell_exec("pdflatex -interaction=nonstopmode " . escapeshellarg($texFile) . " 2>&1");

    // Combine outputs for debugging if needed
    $output = $output . "\n\n=== Second compilation ===\n" . $output2;

    if (!file_exists($pdfFile)) {
        // Cleanup on error
        @unlink($texFile);
        @unlink(str_replace('.tex', '.aux', $texFile));
        @unlink(str_replace('.tex', '.log', $texFile));
        @unlink(str_replace('.tex', '.out', $texFile));
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to compile LaTeX to PDF',
            'latex_output' => $output
        ]);
        exit();
    }

    // Read PDF content and encode as base64
    $pdfContent = file_get_contents($pdfFile);
    $pdfBase64 = base64_encode($pdfContent);

    // Cleanup temporary files
    @unlink($texFile);
    @unlink($pdfFile);
    @unlink(str_replace('.tex', '.aux', $texFile));
    @unlink(str_replace('.tex', '.log', $texFile));
    @unlink(str_replace('.tex', '.out', $texFile));

    // Return PDF as base64 in JSON response
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'pdf_base64' => $pdfBase64,
        'filename' => "CV_preview_{$prenom}_{$nom}.pdf"
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
