<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect personal information
    $nom = htmlspecialchars($_POST['nom']);
    $prenom = htmlspecialchars($_POST['prenom']);
    $email = htmlspecialchars($_POST['email']);
    $telephone = htmlspecialchars($_POST['telephone']);
    $linkedin = isset($_POST['linkedin']) ? htmlspecialchars($_POST['linkedin']) : "";
    $emploi = htmlspecialchars($_POST['emploi_recherche']);

    // Collect skills
    $competencesNumeriques = htmlspecialchars($_POST['competences_numeriques']);
    $competencesAutres = htmlspecialchars($_POST['competences_autres']);

    // Collect Work Experiences (as arrays)
    $experience_dates = $_POST['experience_dates'];
    $experience_poste = $_POST['experience_poste'];
    $experience_employeur = $_POST['experience_employeur'];
    $experience_description = $_POST['experience_description'];

    // Collect Education (as arrays)
    $education_dates = $_POST['education_dates'];
    $education_diplome = $_POST['education_diplome'];
    $education_etablissement = $_POST['education_etablissement'];

    // Collect Languages (as arrays)
    $langues = $_POST['langue'];
    $niveaux = $_POST['niveau'];

    $latexContent = "";
    $latexContent .= "\\documentclass[a4paper,10pt]{article}\n";
    $latexContent .= "\\usepackage[a4paper,margin=1in]{geometry}\n";
    $latexContent .= "\\usepackage{titlesec}\n";
    $latexContent .= "\\usepackage{graphicx}\n";
    $latexContent .= "\\usepackage{enumitem}\n";
    $latexContent .= "\\usepackage{hyperref}\n";
    $latexContent .= "\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]\n";
    $latexContent .= "\\begin{document}\n";

    // Header
    $latexContent .= "\\begin{center}\n";
    $latexContent .= "{\\LARGE \\textbf{" . $prenom . " " . $nom . "}} \\\\\n";
    $latexContent .= "{\\large " . $emploi . "} \\\\\n";
    $latexContent .= "\\vspace{0.2cm}\n";
    $latexContent .= "\\textbf{Email:} $email | \\textbf{Téléphone:} $telephone \\\\\n";
    if($linkedin != ""){
        $latexContent .= "\\textbf{LinkedIn:} \\href{" . $linkedin . "}{" . $linkedin . "} \n";
    }
    $latexContent .= "\\end{center}\n";

    // Work Experience Section
    $latexContent .= "\\section{Expérience Professionnelle}\n";
    for ($i = 0; $i < count($experience_dates); $i++) {
        $date = htmlspecialchars($experience_dates[$i]);
        $poste = htmlspecialchars($experience_poste[$i]);
        $employeur = htmlspecialchars($experience_employeur[$i]);
        $description = htmlspecialchars($experience_description[$i]);
        $latexContent .= "\\textbf{" . $poste . "}, " . $employeur . " (" . $date . ")\\\\\n";
        $latexContent .= $description . "\n \\\\ \n";
    }

    // Education Section
    $latexContent .= "\\section{Formation}\n";
    for ($i = 0; $i < count($education_dates); $i++) {
        $date = htmlspecialchars($education_dates[$i]);
        $diplome = htmlspecialchars($education_diplome[$i]);
        $etablissement = htmlspecialchars($education_etablissement[$i]);
        $latexContent .= "$diplome, " . $etablissement . " (" . $date . ")\\\\\n";
    }

    // Languages Section
    $latexContent .= "\\section{Langues}\n";
    $latexContent .= "\\begin{itemize}\n";
    for ($i = 0; $i < count($langues); $i++) {
        $langue = htmlspecialchars($langues[$i]);
        $niveau = htmlspecialchars($niveaux[$i]);
        $latexContent .= "\\item " . $langue . " - " . $niveau . "\n";
    }
    $latexContent .= "\\end{itemize}\n";

    // Skills Section
    $latexContent .= "\\section{Compétences}\n";
    $latexContent .= "\\subsection*{Compétences numériques}\n";
    $latexContent .= $competencesNumeriques . "\n";
    $latexContent .= "\\subsection*{Autres compétences}\n";
    $latexContent .= $competencesAutres . "\n";

    $latexContent .= "\\end{document}\n";

    // Save the .tex file
    $latexFile = "cv.tex";
    file_put_contents($latexFile, $latexContent);

    // Execute pdflatex
    $output = shell_exec("pdflatex -interaction=nonstopmode cv.tex 2>&1");

    // Check if PDF was generated
    if (!file_exists("cv.pdf")) {
        die("Erreur lors de la génération du PDF. Vérifiez 'log.txt' pour les détails.");
    }

    // Send the PDF for download
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="CV_'.$nom.'_'.$prenom.'.pdf"');
    readfile("cv.pdf");

    // Remove auxiliary files
    // ...existing code for file cleanup...
    @unlink("cv.aux");
    @unlink("cv.log");
    @unlink("cv.pdf");
    @unlink("cv.tex");
    @unlink("cv.out");

    exit();
}
?>
