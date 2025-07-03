<?php

require_once __DIR__ . '/bootstrap.php';

class Router {
    private static $routes = [];
    
    public static function get($path, $controller, $action) {
        self::$routes['GET'][$path] = ['controller' => $controller, 'action' => $action];
    }
    
    public static function post($path, $controller, $action) {
        self::$routes['POST'][$path] = ['controller' => $controller, 'action' => $action];
    }
    
    public static function dispatch($method, $path) {
        if (isset(self::$routes[$method][$path])) {
            $route = self::$routes[$method][$path];
            $controllerName = $route['controller'];
            $action = $route['action'];
            
            $controller = new $controllerName();
            $controller->$action();
        } else {
            http_response_code(404);
            echo "Route not found";
        }
    }
    
    public static function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove base path if present
        $basePath = '/Projets/CV_Generator';
        if (strpos($path, $basePath) === 0) {
            $path = substr($path, strlen($basePath));
        }
        
        self::dispatch($method, $path);
    }
}
