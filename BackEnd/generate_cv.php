<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = htmlspecialchars($_POST['nom']);
    $prenom = htmlspecialchars($_POST['prenom']);
    $email = htmlspecialchars($_POST['email']);
    $telephone = htmlspecialchars($_POST['telephone']);
    $profil = htmlspecialchars($_POST['profil']);
    $education = htmlspecialchars($_POST['education']);
    $competences = htmlspecialchars($_POST['competences']);
    $experience = htmlspecialchars($_POST['experiences']);
    $certifications = htmlspecialchars($_POST['certifications']);
    $interets = htmlspecialchars($_POST['interets']);
    $linkedin = isset($_POST['linkedin']) ? htmlspecialchars($_POST['linkedin']) : "";

    $latexContent = "";
    $latexContent .= "\\documentclass[a4paper,10pt]{article}\n";
    $latexContent .= "\\usepackage[a4paper,margin=1in]{geometry}\n";
    $latexContent .= "\\usepackage{titlesec}\n";
    $latexContent .= "\\usepackage{graphicx}\n";
    $latexContent .= "\\usepackage{enumitem}\n";
    $latexContent .= "\\usepackage{hyperref}\n";
    $latexContent .= "\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]\n";
    $latexContent .= "\\begin{document}\n";

    // En-tête
    $latexContent .= "\\begin{center}\n";
    $latexContent .= "{\\LARGE \\textbf{" . $prenom . " " . $nom . "}} \\\\\n";
    $latexContent .= "{\\large Étudiant en Intelligence Artificielle et Technologies des Données} \\\\\n";
    $latexContent .= "\\vspace{0.2cm}\n";
    $latexContent .= "\\textbf{Email:} $email | \\textbf{Téléphone:} $telephone\\\\\n";
    if($linkedin != ""){
        $latexContent .= "\\textbf{LinkedIn:} \\href{$linkedin}\n";
        $latexContent .= "\\end{center}\n";
    }
    // Sections
    $latexContent .= "\\section{Profil}\n";
    $latexContent .= $profil . "\n";

    $latexContent .= "\\section{Education}\n";
    $latexContent .= $education . "\n";

    $latexContent .= "\\section{Compétences}\n";
    $latexContent .= "\\begin{itemize}\n";
    foreach (explode("\n", $competences) as $skill) {
        $latexContent .= "\\item " . trim($skill) . "\n";
    }
    $latexContent .= "\\end{itemize}\n";

    $latexContent .= "\\section{Expérience}\n";
    $latexContent .= $experience . "\n";

    $latexContent .= "\\section{Certifications}\n";
    $latexContent .= "\\begin{itemize}\n";
    foreach (explode("\n", $certifications) as $certification) {
        $latexContent .= "\\item " . trim($certification) . "\n";
    }
    $latexContent .= "\\end{itemize}\n";

    $latexContent .= "\\section{Centres d'intérêt}\n";
    $latexContent .= "\\begin{itemize}\n";
    foreach (explode("\n", $interets) as $interet) {
        $latexContent .= "\\item " . trim($interet) . "\n";
    }
    $latexContent .= "\\end{itemize}\n";

    $latexContent .= "\\end{document}\n";

    // Sauvegarde du fichier .tex
    $latexFile = "cv.tex";
    file_put_contents($latexFile, $latexContent);

    // Exécuter pdflatex
    $output = shell_exec("pdflatex -interaction=nonstopmode cv.tex 2>&1");

    // Vérifier si le fichier PDF a été généré
    if (!file_exists("cv.pdf")) {
        die("Erreur lors de la génération du PDF. Vérifiez 'log.txt' pour les détails.");
    }

    // Envoyer le PDF au téléchargement
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="CV_'.$nom.'_'.$prenom.'.pdf"');
    readfile("cv.pdf");

    // Supprimer les fichiers auxiliaires
    unlink("cv.aux");
    unlink("cv.log");
    unlink("cv.pdf");
    unlink("cv.tex");
    unlink("cv.out");



    exit();
}
?>
