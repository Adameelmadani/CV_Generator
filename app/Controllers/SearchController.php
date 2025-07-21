<?php

require_once __DIR__ . '/../../core/bootstrap.php';

class SearchController extends Controller {
    private $searchModel;
    
    public function __construct() {
        parent::__construct();
        $this->searchModel = new CVSearchModel();
    }
    
    /**
     * Helper pour créer une réponse JSON standardisée
     */
    private function createJsonResponse($success, $message, $data = null, $statusCode = null) {
        $response = [
            'success' => $success,
            'message' => $message
        ];
        
        if ($data !== null) {
            $response = array_merge($response, $data);
        }
        
        if ($statusCode === null) {
            $statusCode = $success ? 200 : 400;
        }
        
        return $this->jsonResponse($response, $statusCode);
    }
    
    /**
     * Recherche de CV avec support multi-mots-clés et pondération
     */
    public function search() {
        try {
            $input = $this->getRequestData();
            
            if (!$input || !isset($input['keyword'])) {
                return $this->createJsonResponse(false, "Paramètre 'keyword' manquant");
            }
            
            $keywords = trim($input['keyword']);
            $limit = isset($input['limit']) ? intval($input['limit']) : 25;
            $filters = isset($input['filters']) ? $input['filters'] : [];
            $weighting = isset($input['weighting']) ? $input['weighting'] : [];
            
            // Validation des limites
            if ($limit > 100) {
                $limit = 100;
            }
            
            // Validation et normalisation de la pondération
            $defaultWeights = [
                'experience' => 3.0,
                'education' => 2.0,
                'skills' => 4.0,
                'projects' => 2.5,
                'certificates' => 1.5,
                'languages' => 1.0,
                'profils' => 2.0,
                'informations_personnelles' => 1.0
            ];
            
            $weighting = array_merge($defaultWeights, $weighting);
            
            // Debug: Log des pondérations reçues et appliquées
            error_log("Pondération reçue: " . json_encode($input['weighting'] ?? []));
            error_log("Pondération finale appliquée: " . json_encode($weighting));
            
            $results = $this->searchModel->searchByKeywordsWithWeighting($keywords, $limit, $filters, $weighting);
            
            return $this->createJsonResponse(true, 'Recherche effectuée avec succès', $results);
            
        } catch (Exception $e) {
            error_log("Erreur lors de la recherche: " . $e->getMessage());
            return $this->createJsonResponse(false, $e->getMessage());
        }
    }
    
    /**
     * Obtenir les détails d'un CV spécifique
     */
    public function getCVDetails() {
        try {
            $cvId = isset($_GET['cv_id']) ? intval($_GET['cv_id']) : 0;
            
            if ($cvId <= 0) {
                return $this->createJsonResponse(false, "ID du CV invalide");
            }
            
            $cvDetails = $this->searchModel->getCVDetails($cvId);
            
            if ($cvDetails) {
                return $this->createJsonResponse(true, 'Détails du CV récupérés', ['cv_details' => $cvDetails]);
            } else {
                return $this->createJsonResponse(false, 'CV non trouvé');
            }
            
        } catch (Exception $e) {
            error_log("Erreur lors de la récupération du CV: " . $e->getMessage());
            return $this->createJsonResponse(false, $e->getMessage());
        }
    }
    
    /**
     * Statistiques générales du système de recherche
     */
    public function getStatistics() {
        try {
            $stats = $this->searchModel->getGeneralStatistics();
            return $this->createJsonResponse(true, 'Statistiques récupérées', ['statistics' => $stats]);
            
        } catch (Exception $e) {
            error_log("Erreur lors de la récupération des statistiques: " . $e->getMessage());
            return $this->createJsonResponse(false, $e->getMessage());
        }
    }
    
    /**
     * Obtenir les données de la requête (POST JSON ou GET)
     */
    private function getRequestData() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $inputData = file_get_contents('php://input');
            if (!empty($inputData)) {
                $decoded = json_decode($inputData, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    return $decoded;
                }
            }
            // Si le JSON est invalide ou vide, essayer $_POST
            return $_POST;
        }
        return $_GET;
    }
}
