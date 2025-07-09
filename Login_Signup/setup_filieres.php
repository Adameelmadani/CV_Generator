<?php
// Setup basic filieres for the database
require_once __DIR__ . '/../core/bootstrap.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Check if filieres table exists and is empty
    $stmt = $db->query("SELECT COUNT(*) as count FROM filieres");
    $result = $stmt->fetch();
    
    if ($result['count'] == 0) {
        echo "Inserting basic filieres...\n";
        
        $filieres = [
            [1, 'Informatique', 'Sciences informatiques et technologies de l\'information'],
            [2, 'Génie Logiciel', 'Développement et maintenance de logiciels'],
            [3, 'Réseaux et Télécommunications', 'Administration et sécurité des réseaux'],
            [4, 'Cybersécurité', 'Sécurité informatique et protection des données'],
            [5, 'Intelligence Artificielle', 'Machine learning et intelligence artificielle'],
            [6, 'Sciences des Données', 'Analyse et traitement des données'],
            [7, 'Développement Web', 'Création d\'applications web et mobiles'],
            [8, 'Administration Système', 'Gestion des systèmes et infrastructure IT']
        ];
        
        $sql = "INSERT INTO filieres (id, nom, description) VALUES (?, ?, ?)";
        $stmt = $db->prepare($sql);
        
        foreach ($filieres as $filiere) {
            $stmt->execute($filiere);
        }
        
        echo "Successfully inserted " . count($filieres) . " filieres.\n";
    } else {
        echo "Filieres table already contains " . $result['count'] . " entries.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
