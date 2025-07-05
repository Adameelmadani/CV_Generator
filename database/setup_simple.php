<?php
/**
 * Simple script to set up the CV sections database tables
 * Run this once to create all the required tables
 */

// Simple database connection (adjust these values for your setup)
$host = 'localhost';
$dbname = 'cv_generator';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database successfully.\n";
    
    // Read the SQL file
    $sqlFile = __DIR__ . '/cv_sections_tables.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Execute the SQL
    $pdo->exec($sql);
    
    echo "Database tables created successfully!\n";
    echo "You can now fill the form and the data will be saved to the new tables.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
