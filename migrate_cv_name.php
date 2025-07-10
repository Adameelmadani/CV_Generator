<?php
// Test script to add cv_name column to the database
// Run this script once to add the new column

require_once __DIR__ . '/core/bootstrap.php';

try {
    $db = Database::getInstance();
    $conn = $db->getConnection();
    
    // Check if the column already exists
    $checkSQL = "SHOW COLUMNS FROM cvs LIKE 'cv_name'";
    $checkStmt = $conn->prepare($checkSQL);
    $checkStmt->execute();
    $columnExists = $checkStmt->fetch();
    
    if ($columnExists) {
        echo "Column 'cv_name' already exists in the 'cvs' table.\n";
    } else {
        // Add the column
        $alterSQL = "ALTER TABLE cvs ADD COLUMN cv_name VARCHAR(255) NULL AFTER lien_pdf";
        $alterStmt = $conn->prepare($alterSQL);
        $result = $alterStmt->execute();
        
        if ($result) {
            echo "Successfully added 'cv_name' column to the 'cvs' table.\n";
            
            // Optional: Update existing records with default names
            echo "Updating existing CV records with default names...\n";
            $updateSQL = "UPDATE cvs c 
                         LEFT JOIN informations_personnelles p ON c.id = p.id_cv 
                         SET c.cv_name = CONCAT('CV_', COALESCE(p.prenom, 'Unknown'), '_', COALESCE(p.nom, 'User'), '_', c.id)
                         WHERE c.cv_name IS NULL";
            
            $updateStmt = $conn->prepare($updateSQL);
            $updateResult = $updateStmt->execute();
            
            if ($updateResult) {
                $affectedRows = $updateStmt->rowCount();
                echo "Updated $affectedRows existing CV records with default names.\n";
            } else {
                echo "Warning: Could not update existing CV records.\n";
            }
            
        } else {
            echo "Error adding 'cv_name' column to the 'cvs' table.\n";
        }
    }
    
} catch (Exception $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
?>
