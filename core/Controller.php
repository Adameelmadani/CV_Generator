<?php

abstract class Controller {
    protected $session;
    
    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->session = &$_SESSION;
    }
    
    protected function requireAuth() {
        error_log("=== Auth Check ===");
        error_log("Session status: " . session_status());
        error_log("Session ID: " . session_id());
        error_log("Session data: " . print_r($_SESSION, true));
        error_log("UserId in session: " . ($_SESSION['userId'] ?? 'NOT SET'));
        
        if (!isset($this->session['userId']) || empty($this->session['userId'])) {
            error_log("Authentication failed - no valid userId");
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Authentication required'
            ], 401);
            exit();
        }
        
        error_log("Authentication successful - userId: " . $this->session['userId']);
        return $this->session['userId'];
    }
    
    protected function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
    }
    
    protected function redirect($url) {
        header("Location: {$url}");
        exit();
    }
    
    protected function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }
    
    protected function validateInput($data, $required = []) {
        $errors = [];
        
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $errors[] = "Field '{$field}' is required";
            }
        }
        
        return $errors;
    }
    
    protected function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([$this, 'sanitizeInput'], $data);
        }
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }
}
