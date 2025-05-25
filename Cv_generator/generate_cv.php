<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
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
    file_put_contents($latexFile, $latexContent);

    $output = shell_exec("pdflatex -interaction=nonstopmode cv.tex 2>&1");

    if (!file_exists("cv.pdf")) {
        die("Erreur lors de la génération du PDF. Vérifiez 'log.txt' pour les détails.");
    }

    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="CV_'.$nom.'_'.$prenom.'.pdf"');
    readfile("cv.pdf");

    @unlink("cv.aux");
    @unlink("cv.log");
    @unlink("cv.pdf");
    @unlink("cv.tex");
    @unlink("cv.out");

    exit();
}
?>
