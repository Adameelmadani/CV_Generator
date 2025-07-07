<?php

require_once __DIR__ . '/../../core/Controller.php';
require_once __DIR__ . '/../Models/Filiere.php';

class FiliereController extends Controller {
    private $filiereModel;
    
    public function __construct() {
        parent::__construct();
        $this->filiereModel = new Filiere();
    }
    
    public function getAllFilieres() {
        try {
            $filieres = $this->filiereModel->getAllFilieres();
            
            $this->jsonResponse([
                'status' => 'success',
                'filieres' => $filieres
            ]);
            
        } catch (Exception $e) {
            error_log("Error in getAllFilieres: " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error retrieving filieres: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function getFiliereById() {
        if (!isset($_GET['id'])) {
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Filiere ID is required'
            ], 400);
            return;
        }
        
        $id = intval($_GET['id']);
        
        try {
            $filiere = $this->filiereModel->getFiliereById($id);
            
            if (!$filiere) {
                $this->jsonResponse([
                    'status' => 'error',
                    'message' => 'Filiere not found'
                ], 404);
                return;
            }
            
            $this->jsonResponse([
                'status' => 'success',
                'filiere' => $filiere
            ]);
            
        } catch (Exception $e) {
            error_log("Error in getFiliereById: " . $e->getMessage());
            $this->jsonResponse([
                'status' => 'error',
                'message' => 'Error retrieving filiere: ' . $e->getMessage()
            ], 500);
        }
    }
}
