<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Test Guest CV Generation</h2>";

// Test working directory
$workingDir = __DIR__ . '/Cv_generator/';
echo "<p><strong>Working Directory:</strong> " . $workingDir . "</p>";
echo "<p><strong>Directory exists:</strong> " . (is_dir($workingDir) ? 'YES' : 'NO') . "</p>";
echo "<p><strong>Directory writable:</strong> " . (is_writable($workingDir) ? 'YES' : 'NO') . "</p>";

// List files in directory
if (is_dir($workingDir)) {
    $files = scandir($workingDir);
    echo "<h3>Files in directory:</h3>";
    echo "<ul>";
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            echo "<li>" . $file . "</li>";
        }
    }
    echo "</ul>";
}

// Test creating a temporary file
$testFile = $workingDir . 'test_' . time() . '.txt';
$success = file_put_contents($testFile, 'test content');
if ($success) {
    echo "<p><strong>Test file creation:</strong> SUCCESS</p>";
    if (file_exists($testFile)) {
        echo "<p><strong>Test file exists after creation:</strong> YES</p>";
        unlink($testFile);
        echo "<p><strong>Test file deleted:</strong> YES</p>";
    }
} else {
    echo "<p><strong>Test file creation:</strong> FAILED</p>";
}

// Test pdflatex availability
$pdflatexTest = shell_exec('pdflatex --version 2>&1');
echo "<h3>PDFLaTeX Test:</h3>";
echo "<pre>" . htmlspecialchars($pdflatexTest) . "</pre>";

?>
