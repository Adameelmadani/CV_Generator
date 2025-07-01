<?php
session_start();
include('../Login_Signup/db_connection.php');

echo "<!DOCTYPE html><html><head><title>CV Preview Debug</title></head><body>";
echo "<h2>CV Preview Debug Information</h2>";

// Check if user is logged in
echo "<p><strong>User Session:</strong> ";
if (isset($_SESSION['userId'])) {
    echo "✓ User logged in (ID: " . $_SESSION['userId'] . ")";
} else {
    echo "✗ User not logged in";
}
echo "</p>";

// Check if preview_cv.php exists
echo "<p><strong>preview_cv.php:</strong> ";
if (file_exists('preview_cv.php')) {
    echo "✓ File exists";
} else {
    echo "✗ File missing";
}
echo "</p>";

// Check if download_cv.php exists
echo "<p><strong>download_cv.php:</strong> ";
if (file_exists('download_cv.php')) {
    echo "✓ File exists";
} else {
    echo "✗ File missing";
}
echo "</p>";

// Check database connection
echo "<p><strong>Database:</strong> ";
try {
    $testQuery = $pdo->query("SELECT COUNT(*) FROM user_cvs");
    echo "✓ Connected (CVs in database: " . $testQuery->fetchColumn() . ")";
} catch (Exception $e) {
    echo "✗ Connection error: " . $e->getMessage();
}
echo "</p>";

// Check if pdflatex is available
echo "<p><strong>LaTeX (pdflatex):</strong> ";
$output = shell_exec('pdflatex --version 2>&1');
if ($output && strpos($output, 'pdfTeX') !== false) {
    echo "✓ Available";
    echo "<br><small>" . substr($output, 0, 100) . "...</small>";
} else {
    echo "✗ Not available or not in PATH";
    echo "<br><small>Output: " . htmlspecialchars(substr($output, 0, 200)) . "</small>";
}
echo "</p>";

// Check temp directory
echo "<p><strong>Temp Directory:</strong> ";
$tempDir = sys_get_temp_dir();
if (is_writable($tempDir)) {
    echo "✓ Writable (" . $tempDir . ")";
} else {
    echo "✗ Not writable (" . $tempDir . ")";
}
echo "</p>";

// Check uploads directory
echo "<p><strong>Uploads Directory:</strong> ";
if (is_dir('uploads') && is_writable('uploads')) {
    echo "✓ Writable uploads directory exists";
} else {
    echo "⚠ Uploads directory missing or not writable";
}
echo "</p>";

// Check templates directory
echo "<p><strong>Templates Directory:</strong> ";
if (is_dir('templates') && file_exists('templates/modern.cls')) {
    echo "✓ Templates directory with modern.cls exists";
} else {
    echo "⚠ Templates directory or modern.cls missing";
}
echo "</p>";

// Test a simple CV generation if user is logged in
if (isset($_SESSION['userId'])) {
    echo "<h3>Test CV Generation</h3>";
    try {
        $sql = "SELECT id, cv_name, xml_content FROM user_cvs WHERE user_id = :user_id LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $_SESSION['userId']]);
        $testCV = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($testCV) {
            echo "<p><strong>Test CV Found:</strong> " . $testCV['cv_name'] . " (ID: " . $testCV['id'] . ")</p>";
            echo "<p><a href='preview_cv.php' onclick='testPreview(" . $testCV['id'] . "); return false;'>Test Preview Generation</a></p>";
        } else {
            echo "<p><strong>No CVs found for testing</strong></p>";
        }
    } catch (Exception $e) {
        echo "<p><strong>Error testing CV:</strong> " . $e->getMessage() . "</p>";
    }
}

echo "<hr><p><em>If any items show ✗, that could be the cause of the preview issue.</em></p>";

echo "<script>
function testPreview(cvId) {
    fetch('preview_cv.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cv_id: cvId })
    })
    .then(response => {
        if (response.ok) {
            alert('✓ Preview generation successful! Check the Network tab for details.');
        } else {
            alert('✗ Preview generation failed: ' + response.status + ' ' + response.statusText);
        }
    })
    .catch(error => {
        alert('✗ Error: ' + error.message);
    });
}
</script>";

echo "</body></html>";
?>
