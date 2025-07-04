<?php

require_once __DIR__ . '/../core/bootstrap.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';

$authController = new AuthController();
$authController->logout();

?>
