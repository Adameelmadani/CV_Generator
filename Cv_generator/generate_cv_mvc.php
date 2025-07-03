<?php

require_once __DIR__ . '/../core/bootstrap.php';

// Enhanced AJAX detection
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
          strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

// Check for Accept header containing application/json
$acceptsJson = isset($_SERVER['HTTP_ACCEPT']) && 
               strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

// Check for fetch requests (modern browsers)
$isFetch = isset($_SERVER['HTTP_SEC_FETCH_MODE']) && 
           $_SERVER['HTTP_SEC_FETCH_MODE'] === 'cors';

// Additional check: if it's a POST request and not from a form submission
$isPostNotForm = $_SERVER['REQUEST_METHOD'] === 'POST' && 
                 (!isset($_SERVER['HTTP_REFERER']) || 
                  strpos($_SERVER['HTTP_REFERER'], 'home.html') !== false);

// Log the request for debugging
error_log("CV Generation Request - AJAX: " . ($isAjax ? 'true' : 'false') . 
          ", JSON Accept: " . ($acceptsJson ? 'true' : 'false') . 
          ", Fetch: " . ($isFetch ? 'true' : 'false') .
          ", POST not form: " . ($isPostNotForm ? 'true' : 'false') .
          ", User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'));

// If this is NOT an AJAX/Fetch request, redirect back to the form
// Re-enable this check now that we've fixed the frontend
if (!$isAjax && !$acceptsJson && !$isFetch) {
    error_log("Non-AJAX request detected, redirecting to home.html");
    header('Location: home.html?error=invalid_submission');
    exit();
}

$controller = new CVController();
$controller->generateCV();
