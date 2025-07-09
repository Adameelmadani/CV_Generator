<?php

abstract class Controller {
    protected $session;
    
    public function __construct() {
        // Configure session settings only if session hasn't started yet
        if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
            // Set session cookie parameters
            $sessionConfig = defined('APP_CONFIG') ? APP_CONFIG['session'] : [
                'name' => 'CV_CRAFT_SESSION',
                'lifetime' => 3600 * 24 * 7, // 7 days
                'secure' => false,
                'httponly' => true
            ];
            
            session_name($sessionConfig['name']);
            session_set_cookie_params([
                'lifetime' => $sessionConfig['lifetime'],
                'path' => '/',
                'domain' => '',
                'secure' => $sessionConfig['secure'],
                'httponly' => $sessionConfig['httponly'],
                'samesite' => 'Lax'
            ]);
            
            // Start session
            session_start();
        } elseif (session_status() === PHP_SESSION_NONE) {
            // If headers are sent but session not started, just start it
            session_start();
        }
        
        $this->session = &$_SESSION;
    }
    
    protected function requireAuth() {
        if (!isset($this->session['userId']) || empty($this->session['userId'])) {
            error_log("Authentication failed - no user ID in session. Session data: " . print_r($this->session, true));
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Authentication required'
            ], 401);
            exit();
        }
        
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
