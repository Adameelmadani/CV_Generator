<?php
// Setup verification script for CV Generator LaTeX preview feature
echo "<!DOCTYPE html><html><head>";
echo "<title>CV Generator Setup Verification</title>";
echo "<style>
body { font-family: Arial, sans-serif; margin: 20px; }
.check { color: green; font-weight: bold; }
.error { color: red; font-weight: bold; }
.warning { color: orange; font-weight: bold; }
.section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
.code { background: #f5f5f5; padding: 10px; border-radius: 3px; font-family: monospace; }
</style></head><body>";

echo "<h1>CV Generator - Setup Verification</h1>";
echo "<p>This script checks if all components are properly set up for LaTeX preview functionality.</p>";

// Check 1: Required files
echo "<div class='section'>";
echo "<h2>1. Required Files Check</h2>";

$requiredFiles = [
    'preview_cv.php' => 'LaTeX preview endpoint',
    'download_cv.php' => 'CV download with LaTeX generation',
    'user_home.js' => 'Frontend JavaScript',
    'user_home.html' => 'Dashboard HTML',
    'user_home.css' => 'Dashboard CSS',
    '../Login_Signup/db_connection.php' => 'Database connection'
];

foreach ($requiredFiles as $file => $description) {
    if (file_exists($file)) {
        echo "<p class='check'>✓ $file - $description</p>";
    } else {
        echo "<p class='error'>✗ $file - $description (MISSING)</p>";
    }
}
echo "</div>";

// Check 2: Database connection
echo "<div class='section'>";
echo "<h2>2. Database Connection</h2>";
try {
    include('../Login_Signup/db_connection.php');
    $testQuery = $pdo->query("SELECT COUNT(*) FROM user_cvs");
    $cvCount = $testQuery->fetchColumn();
    echo "<p class='check'>✓ Database connected successfully</p>";
    echo "<p>Total CVs in database: $cvCount</p>";
} catch (Exception $e) {
    echo "<p class='error'>✗ Database connection failed: " . $e->getMessage() . "</p>";
}
echo "</div>";

// Check 3: LaTeX installation
echo "<div class='section'>";
echo "<h2>3. LaTeX Installation</h2>";
$latexOutput = shell_exec('pdflatex --version 2>&1');
if ($latexOutput && strpos($latexOutput, 'pdfTeX') !== false) {
    echo "<p class='check'>✓ pdflatex is installed and accessible</p>";
    $firstLine = strtok($latexOutput, "\n");
    echo "<p class='code'>$firstLine</p>";
} else {
    echo "<p class='error'>✗ pdflatex not found in PATH</p>";
    echo "<div class='code'>";
    echo "<strong>To fix this on Windows with MiKTeX:</strong><br>";
    echo "1. Download and install MiKTeX from https://miktex.org/<br>";
    echo "2. Add MiKTeX bin directory to your PATH environment variable<br>";
    echo "3. Restart your web server (Apache/XAMPP)<br><br>";
    echo "<strong>To fix this on Windows with TeX Live:</strong><br>";
    echo "1. Download and install TeX Live from https://www.tug.org/texlive/<br>";
    echo "2. Add TeX Live bin directory to your PATH environment variable<br>";
    echo "3. Restart your web server";
    echo "</div>";
}
echo "</div>";

// Check 4: Directory permissions
echo "<div class='section'>";
echo "<h2>4. Directory Permissions</h2>";

$tempDir = sys_get_temp_dir();
if (is_writable($tempDir)) {
    echo "<p class='check'>✓ Temp directory is writable: $tempDir</p>";
} else {
    echo "<p class='error'>✗ Temp directory is not writable: $tempDir</p>";
}

if (is_dir('uploads')) {
    if (is_writable('uploads')) {
        echo "<p class='check'>✓ Uploads directory is writable</p>";
    } else {
        echo "<p class='warning'>⚠ Uploads directory exists but is not writable</p>";
    }
} else {
    echo "<p class='warning'>⚠ Uploads directory does not exist</p>";
}

if (is_dir('templates') && file_exists('templates/modern.cls')) {
    echo "<p class='check'>✓ LaTeX template (modern.cls) exists</p>";
} else {
    echo "<p class='error'>✗ LaTeX template (templates/modern.cls) missing</p>";
}
echo "</div>";

// Check 5: JavaScript verification
echo "<div class='section'>";
echo "<h2>5. JavaScript Configuration</h2>";
if (file_exists('user_home.js')) {
    $jsContent = file_get_contents('user_home.js');
    if (strpos($jsContent, "fetch('preview_cv.php'") !== false) {
        echo "<p class='check'>✓ JavaScript is configured to use preview_cv.php</p>";
    } elseif (strpos($jsContent, "generate_preview.php") !== false) {
        echo "<p class='error'>✗ JavaScript is still using old generate_preview.php</p>";
        echo "<p>Need to update user_home.js to use preview_cv.php instead</p>";
    } else {
        echo "<p class='warning'>⚠ Cannot determine preview endpoint in JavaScript</p>";
    }
} else {
    echo "<p class='error'>✗ user_home.js file missing</p>";
}
echo "</div>";

// Check 6: Session status
echo "<div class='section'>";
echo "<h2>6. Session Status</h2>";
session_start();
if (isset($_SESSION['userId'])) {
    echo "<p class='check'>✓ User session active (User ID: " . $_SESSION['userId'] . ")</p>";
} else {
    echo "<p class='warning'>⚠ No active user session (login required to test preview)</p>";
}
echo "</div>";

// Final recommendations
echo "<div class='section'>";
echo "<h2>Recommendations</h2>";
echo "<ul>";
echo "<li>If any items show ✗, fix those issues first</li>";
echo "<li>Clear browser cache after making changes</li>";
echo "<li>Check browser console for JavaScript errors</li>";
echo "<li>Check server error logs for PHP errors</li>";
echo "<li>Test with debug_preview.php for detailed diagnostics</li>";
echo "</ul>";
echo "</div>";

echo "<p><em>Generated at " . date('Y-m-d H:i:s') . "</em></p>";
echo "</body></html>";
?>
