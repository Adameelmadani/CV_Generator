<?php
// Simple test to check if CV models are working
require_once __DIR__ . '/core/bootstrap.php';

try {
    // Test CVSectionsManager instantiation
    require_once __DIR__ . '/app/Models/CVSectionsManager.php';
    $sectionsManager = new CVSectionsManager();
    echo "✓ CVSectionsManager created successfully\n";
    
    // Test all individual model classes
    $models = [
        'CVPersonalInfo',
        'CVProfile', 
        'CVEducation',
        'CVExperience',
        'CVProjects',
        'CVCertificates',
        'CVSkills',
        'CVLanguages',
        'CVCustomization'
    ];
    
    foreach ($models as $modelClass) {
        require_once __DIR__ . "/app/Models/{$modelClass}.php";
        $model = new $modelClass();
        echo "✓ {$modelClass} created successfully\n";
    }
    
    echo "\n✅ All CV models loaded successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "❌ Fatal Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
