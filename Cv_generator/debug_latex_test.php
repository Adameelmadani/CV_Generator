<?php
// Test LaTeX/pdflatex availability

header('Content-Type: text/plain');

echo "=== TESTING LATEX AVAILABILITY ===\n\n";

// Test if pdflatex is available
echo "Testing pdflatex command...\n";
$output = shell_exec("pdflatex --version 2>&1");
echo "pdflatex output: " . ($output ? $output : "No output or command not found") . "\n\n";

// Test basic shell_exec functionality
echo "Testing basic shell_exec with 'dir' command...\n";
$dirOutput = shell_exec("dir 2>&1");
echo "dir output: " . ($dirOutput ? substr($dirOutput, 0, 200) . "..." : "No output") . "\n\n";

// Check current working directory
echo "Current working directory: " . getcwd() . "\n\n";

// Test if we can create and compile a minimal LaTeX document
echo "Creating minimal LaTeX test...\n";
$minimalLatex = "\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}";
$testFile = __DIR__ . '/test_minimal.tex';

file_put_contents($testFile, $minimalLatex);
echo "Created test file: " . $testFile . "\n";

if (file_exists($testFile)) {
    echo "Test file exists, attempting compilation...\n";
    
    // Change to the directory containing the test file
    $originalDir = getcwd();
    chdir(__DIR__);
    
    // Try to compile
    $compileOutput = shell_exec("pdflatex -interaction=nonstopmode test_minimal.tex 2>&1");
    echo "Compilation output: " . ($compileOutput ? $compileOutput : "No compilation output") . "\n";
    
    // Check if PDF was created
    $pdfFile = __DIR__ . '/test_minimal.pdf';
    if (file_exists($pdfFile)) {
        echo "✅ PDF successfully created!\n";
        unlink($pdfFile); // Clean up
    } else {
        echo "❌ PDF was not created.\n";
    }
    
    // Clean up
    chdir($originalDir);
    unlink($testFile);
    
    // Also clean up auxiliary files
    $auxFiles = ['test_minimal.aux', 'test_minimal.log'];
    foreach ($auxFiles as $auxFile) {
        $auxPath = __DIR__ . '/' . $auxFile;
        if (file_exists($auxPath)) {
            unlink($auxPath);
        }
    }
    
} else {
    echo "❌ Could not create test file\n";
}

echo "\n=== TEST COMPLETE ===\n";
?>
