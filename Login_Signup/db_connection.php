<?php
require_once __DIR__ . '/../core/bootstrap.php';

try {
    $database = Database::getInstance();
    $pdo = $database->getConnection();
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage();
    exit();
}
