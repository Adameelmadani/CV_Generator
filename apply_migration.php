<?php
require_once __DIR__ . '/core/bootstrap.php';

try {
    $database = Database::getInstance();
    $pdo = $database->getConnection();
    
    echo "Applying migration: create_cv_customization_table.sql\n";
    
    // Read the migration file
    $sql = file_get_contents(__DIR__ . '/migrations/create_cv_customization_table.sql');
    
    // Execute the migration
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute();
    
    if ($result) {
        echo "✓ Migration applied successfully!\n";
        echo "cv_customization table created.\n";
    } else {
        echo "✗ Migration failed!\n";
        print_r($stmt->errorInfo());
    }
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
