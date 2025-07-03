<?php
/**    public static function redirectToMVC($oldFile, $newEndpoint = null) {
        $migrations = [
            'get_user_cvs.php' => 'get_user_cvs_simple.php',
            'get_cv_data.php' => 'get_cv_data_simple.php',
            'get_cv_for_edit.php' => 'get_cv_for_edit_simple.php',
            'delete_cv.php' => 'delete_cv_simple.php',
            'generate_cv.php' => 'generate_cv_simple.php',
            'import_cv.php' => 'import_cv_simple.php',
            'download_cv.php' => 'download_cv_mvc.php',
            'generate_preview.php' => 'generate_preview_mvc.php',
            'generate_live_preview.php' => 'generate_live_preview_mvc.php'
        ];n helper to transition from procedural PHP files to MVC structure
 * This file provides backward compatibility while encouraging use of the new MVC pattern
 */

class MVCMigrationHelper {
    
    /**
     * Redirect old file requests to new MVC endpoints
     */
    public static function redirectToMVC($oldFile, $newEndpoint = null) {
        $migrations = [
            'get_user_cvs.php' => 'get_user_cvs_simple.php',
            'get_cv_data.php' => 'get_cv_data_simple.php',
            'get_cv_for_edit.php' => 'get_cv_for_edit_simple.php',
            'delete_cv.php' => 'delete_cv_simple.php',
            'generate_cv.php' => 'generate_cv_simple.php',
            'import_cv.php' => 'import_cv_mvc.php',
            'download_cv.php' => 'download_cv_mvc.php',
            'generate_preview.php' => 'generate_preview_mvc.php',
            'generate_live_preview.php' => 'generate_live_preview_mvc.php'
        ];
        
        $newFile = $newEndpoint ?: ($migrations[$oldFile] ?? null);
        
        if ($newFile) {
            // Log the migration for monitoring
            error_log("MVC Migration: Redirecting {$oldFile} to {$newFile}");
            
            // Include the new MVC file
            include_once $newFile;
            exit();
        }
        
        return false;
    }
    
    /**
     * Check if the old file should be migrated
     */
    public static function shouldMigrate($filename) {
        $migrateFiles = [
            'get_user_cvs.php',
            'get_cv_data.php', 
            'get_cv_for_edit.php',
            'delete_cv.php',
            'generate_cv.php',
            'import_cv.php',
            'download_cv.php',
            'generate_preview.php',
            'generate_live_preview.php'
        ];
        
        return in_array($filename, $migrateFiles);
    }
}

// Auto-migrate if called directly
$currentFile = basename($_SERVER['SCRIPT_NAME']);
if (MVCMigrationHelper::shouldMigrate($currentFile)) {
    MVCMigrationHelper::redirectToMVC($currentFile);
}
