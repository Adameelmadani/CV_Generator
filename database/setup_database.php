<?php

/**
 * Database Setup Script for CV Generator
 * This script creates all the required tables for the CV sections
 */

require_once __DIR__ . '/../core/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Read and execute the SQL file
    $sqlFile = __DIR__ . '/cv_sections_tables.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL file not found: " . $sqlFile);
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Split the SQL into individual statements
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
        }
    );
    
    echo "Starting database setup...\n";
    
    // Execute each statement
    foreach ($statements as $statement) {
        if (!empty(trim($statement))) {
            try {
                $db->exec($statement);
                // Extract table name for better feedback
                if (preg_match('/CREATE TABLE.*?`?(\w+)`?/i', $statement, $matches)) {
                    echo "✓ Created table: " . $matches[1] . "\n";
                }
            } catch (PDOException $e) {
                echo "✗ Error executing statement: " . $e->getMessage() . "\n";
                echo "Statement: " . substr($statement, 0, 100) . "...\n";
            }
        }
    }
    
    echo "\nDatabase setup completed successfully!\n";
    
    // Verify tables were created
    echo "\nVerifying created tables:\n";
    $tables = [
        'cv_personal_info',
        'cv_profile', 
        'cv_education',
        'cv_experience',
        'cv_projects',
        'cv_certificates',
        'cv_skills',
        'cv_languages',
        'cv_customization'
    ];
    
    foreach ($tables as $table) {
        $stmt = $db->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        if ($stmt->fetch()) {
            echo "✓ Table '$table' exists\n";
        } else {
            echo "✗ Table '$table' not found\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
