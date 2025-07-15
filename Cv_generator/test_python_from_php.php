<?php
// Test script to check if Python works from PHP

echo "<h1>Testing Python from PHP</h1>";

$pythonPaths = [
    'C:\\Users\\Idea\\anaconda3\\envs\\TensorFlow\\python.exe',
    'python',
    'python3',
    'py'
];

foreach ($pythonPaths as $pythonPath) {
    echo "<h3>Testing: $pythonPath</h3>";
    
    // Test basic Python
    $testCmd = escapeshellcmd("$pythonPath -c \"import sys; print('Python version:', sys.version); print('Executable:', sys.executable)\"") . " 2>&1";
    exec($testCmd, $output, $ret);
    
    echo "<p><strong>Command:</strong> $testCmd</p>";
    echo "<p><strong>Return code:</strong> $ret</p>";
    echo "<p><strong>Output:</strong></p><pre>" . implode("\n", $output) . "</pre>";
    
    if ($ret === 0) {
        echo "<p style='color: green;'>✅ This Python executable works!</p>";
        
        // Test required modules
        echo "<h4>Testing required modules:</h4>";
        $modules = ['pdfplumber', 'pytesseract', 'lxml', 'PIL'];
        
        foreach ($modules as $module) {
            $moduleCmd = escapeshellcmd("$pythonPath -c \"import $module; print('$module OK')\"") . " 2>&1";
            exec($moduleCmd, $moduleOutput, $moduleRet);
            
            if ($moduleRet === 0) {
                echo "<p style='color: green;'>✅ $module: OK</p>";
            } else {
                echo "<p style='color: red;'>❌ $module: " . implode(' ', $moduleOutput) . "</p>";
            }
            $moduleOutput = []; // Reset for next iteration
        }
        
        break; // Use the first working Python
    } else {
        echo "<p style='color: red;'>❌ This Python executable failed</p>";
    }
    
    $output = []; // Reset for next iteration
    echo "<hr>";
}
?>
