<?php
// Debug version of live preview to identify the issue

session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Debug: Starting live preview debug...\n";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "Error: Method not allowed. Received: " . $_SERVER['REQUEST_METHOD'] . "\n";
    exit;
}

echo "Debug: POST method confirmed\n";

// Check if pdflatex is available
$pdflatexPath = shell_exec('where pdflatex 2>nul');
if (empty($pdflatexPath)) {
    echo "Error: pdflatex not found in PATH\n";
    echo "Please install LaTeX (MiKTeX or TeX Live)\n";
    exit;
}

echo "Debug: pdflatex found at: " . trim($pdflatexPath) . "\n";

// Check working directory
$workingDir = __DIR__ . '/';
echo "Debug: Working directory: " . $workingDir . "\n";
echo "Debug: Directory exists: " . (is_dir($workingDir) ? 'YES' : 'NO') . "\n";
echo "Debug: Directory writable: " . (is_writable($workingDir) ? 'YES' : 'NO') . "\n";

// Check template directory
$templateDir = $workingDir . 'templates/';
echo "Debug: Template directory: " . $templateDir . "\n";
echo "Debug: Template directory exists: " . (is_dir($templateDir) ? 'YES' : 'NO') . "\n";
echo "Debug: modern.cls exists: " . (file_exists($templateDir . 'modern.cls') ? 'YES' : 'NO') . "\n";

// Check form data
echo "Debug: POST data keys: " . implode(', ', array_keys($_POST)) . "\n";

// Test basic LaTeX compilation
$testLatex = "\\documentclass{article}
\\begin{document}
Hello World!
\\end{document}";

$testFile = $workingDir . 'test.tex';
file_put_contents($testFile, $testLatex);

echo "Debug: Test LaTeX file created\n";

// Try to compile
$oldDir = getcwd();
chdir($workingDir);

echo "Debug: Changed to working directory\n";

$output = shell_exec("pdflatex -interaction=nonstopmode test.tex 2>&1");
echo "Debug: LaTeX compilation output:\n" . $output . "\n";

chdir($oldDir);

$testPdf = $workingDir . 'test.pdf';
if (file_exists($testPdf)) {
    echo "Debug: Test PDF created successfully\n";
    unlink($testPdf);
    unlink($testFile);
    @unlink($workingDir . 'test.aux');
    @unlink($workingDir . 'test.log');
} else {
    echo "Error: Test PDF creation failed\n";
}

echo "Debug: Live preview debug completed\n";
