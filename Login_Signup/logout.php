<?php
session_start();

header('Content-Type: application/json');

// Vérifier si la méthode est POST et si le champ logout est défini
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['logout'])) {
        try {
            // Détruire toutes les variables de session
            session_unset();
            // Détruire la session
            session_destroy();

            // Réponse JSON de succès
            echo json_encode([
                'status' => 'success',
                'message' => 'Déconnexion réussie !',
                'redirect' => 'main_page.html'
            ]);
        } catch (Exception $e) {
            // Réponse JSON en cas d'erreur serveur
            echo json_encode([
                'status' => 'error',
                'message' => 'Erreur lors de la déconnexion : ' . $e->getMessage(),
                'redirect' => 'main_page.html'
            ]);
        }
    } else {
        // Réponse JSON si le champ logout est manquant
        echo json_encode([
            'status' => 'error',
            'message' => 'Le champ logout est manquant.',
            'redirect' => 'main_page.html'
        ]);
    }
} else {
    // Réponse JSON si la méthode n'est pas POST
    echo json_encode([
        'status' => 'error',
        'message' => 'Requête non valide. Utilisez la méthode POST.',
        'redirect' => 'main_page.html'
    ]);
}
exit();
