<?php
// Test database connection and tables
require_once __DIR__ . '/core/bootstrap.php';

try {
    // Test basic database connection
    require_once __DIR__ . '/core/Database.php';
    $db = Database::getInstance()->getConnection();
    echo "✓ Database connection successful\n";
    
    // Test required tables exist
    $tables = [
        'informations_personnelles',
        'profils',
        'formations',
        'experiences',
        'projets',
        'certificats',
        'competences',
        'langues',
        'personnalisations'
    ];
    
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) FROM `$table`");
            $count = $stmt->fetchColumn();
            echo "✓ Table '$table' exists (rows: $count)\n";
        } catch (Exception $e) {
            echo "❌ Table '$table' error: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n✅ Database test completed\n";
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
