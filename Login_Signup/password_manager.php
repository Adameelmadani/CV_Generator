<?php
/**
 * FICHIER LEGACY - Gestion de réinitialisation de mot de passe
 * 
 * Ce fichier est maintenant obsolète.
 * Utilisez password_manager_mvc.php qui suit la structure MVC du projet.
 */

// Redirection vers la version MVC pour compatibilité
require_once __DIR__ . '/../core/bootstrap.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';

$authController = new AuthController();
$authController->resetPassword();
?>
