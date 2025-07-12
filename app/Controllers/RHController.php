<?php
require_once __DIR__ . '/../../core/Controller.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Models/CV.php';
require_once __DIR__ . '/../Models/Filiere.php';

class RHController extends Controller {
    private $db;
    
    public function __construct() {
        parent::__construct();
        $this->db = Database::getInstance()->getConnection();
    }
    
    /**
     * Recherche avancée de CV avec scoring
     */
    public function advancedSearch() {
        $description = $_GET['description'] ?? '';
        $tasks = $_GET['tasks'] ?? '';
        $skills = $_GET['skills'] ?? '';
        
        $descriptionWeight = floatval($_GET['description_weight'] ?? 0.3);
        $tasksWeight = floatval($_GET['tasks_weight'] ?? 0.4);
        $skillsWeight = floatval($_GET['skills_weight'] ?? 0.3);
        
        $filiere = $_GET['filiere'] ?? '';
        $experienceLevel = $_GET['experience_level'] ?? '';
        $dateRange = $_GET['date_range'] ?? '';
        
        // Requête de base
        $sql = "SELECT DISTINCT 
                    c.id,
                    c.cv_name,
                    c.date_creation,
                    c.est_publie,
                    ip.nom,
                    ip.prenom,
                    ip.email,
                    ip.localisation,
                    f.nom as filiere_nom,
                    p.description as profil,
                    GROUP_CONCAT(DISTINCT comp.competences SEPARATOR ', ') as competences_list,
                    GROUP_CONCAT(DISTINCT exp.poste SEPARATOR ', ') as experiences_list,
                    GROUP_CONCAT(DISTINCT exp.description SEPARATOR ', ') as experiences_desc,
                    GROUP_CONCAT(DISTINCT form.diplome SEPARATOR ', ') as formations_list,
                    GROUP_CONCAT(DISTINCT form.description SEPARATOR ', ') as formations_desc,
                    GROUP_CONCAT(DISTINCT l.nom_langue SEPARATOR ', ') as langues_list
                FROM cvs c
                LEFT JOIN informations_personnelles ip ON c.id = ip.id_cv
                LEFT JOIN filieres f ON c.id_filiere = f.id
                LEFT JOIN profils p ON c.id = p.id_cv
                LEFT JOIN competences comp ON c.id = comp.id_cv
                LEFT JOIN experiences exp ON c.id = exp.id_cv
                LEFT JOIN formations form ON c.id = form.id_cv
                LEFT JOIN langues l ON c.id = l.id_cv
                WHERE c.est_publie = 1";
        
        $params = [];
        
        // Filtres de base
        if (!empty($filiere)) {
            $sql .= " AND f.id = ?";
            $params[] = $filiere;
        }
        
        if (!empty($dateRange)) {
            $sql .= " AND c.date_creation >= DATE_SUB(CURDATE(), INTERVAL ? DAY)";
            $params[] = $dateRange;
        }
        
        $sql .= " GROUP BY c.id";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculer les scores de pertinence
        $scoredResults = [];
        foreach ($results as $cv) {
            $score = $this->calculateRelevanceScore($cv, $description, $tasks, $skills, $descriptionWeight, $tasksWeight, $skillsWeight);
            
            if ($score > 0) {
                $cv['relevance_score'] = $score;
                $cv['matched_terms'] = $this->getMatchedTerms($cv, $description, $tasks, $skills);
                $scoredResults[] = $cv;
            }
        }
        
        // Trier par score de pertinence décroissant
        usort($scoredResults, function($a, $b) {
            return $b['relevance_score'] <=> $a['relevance_score'];
        });
        
        echo json_encode(['success' => true, 'data' => $scoredResults]);
    }
    
    /**
     * Calculer le score de pertinence
     */
    private function calculateRelevanceScore($cv, $description, $tasks, $skills, $descriptionWeight, $tasksWeight, $skillsWeight) {
        $totalScore = 0;
        
        // Score pour la description/profil
        if (!empty($description)) {
            $descriptionScore = $this->calculateFieldScore($cv['profil'], $description);
            $totalScore += $descriptionScore * $descriptionWeight;
        }
        
        // Score pour les tâches/expériences/formations
        if (!empty($tasks)) {
            $tasksText = $cv['experiences_desc'] . ' ' . $cv['formations_desc'] . ' ' . $cv['experiences_list'];
            $tasksScore = $this->calculateFieldScore($tasksText, $tasks);
            $totalScore += $tasksScore * $tasksWeight;
        }
        
        // Score pour les compétences/langues
        if (!empty($skills)) {
            $skillsText = $cv['competences_list'] . ' ' . $cv['langues_list'];
            $skillsScore = $this->calculateFieldScore($skillsText, $skills);
            $totalScore += $skillsScore * $skillsWeight;
        }
        
        return $totalScore;
    }
    
    /**
     * Calculer le score pour un champ spécifique
     */
    private function calculateFieldScore($fieldText, $searchTerms) {
        if (empty($fieldText) || empty($searchTerms)) {
            return 0;
        }
        
        $fieldText = strtolower($fieldText);
        $searchTerms = strtolower($searchTerms);
        
        // Diviser les termes de recherche
        $terms = array_filter(array_map('trim', explode(' ', $searchTerms)));
        
        $score = 0;
        $totalTerms = count($terms);
        
        foreach ($terms as $term) {
            if (strlen($term) < 2) continue;
            
            // Vérifier les correspondances exactes
            if (strpos($fieldText, $term) !== false) {
                $score += 1.0;
            }
            // Vérifier les correspondances partielles
            elseif (similar_text($fieldText, $term) > strlen($term) * 0.7) {
                $score += 0.5;
            }
        }
        
        return $totalTerms > 0 ? $score / $totalTerms : 0;
    }
    
    /**
     * Obtenir les termes correspondants
     */
    private function getMatchedTerms($cv, $description, $tasks, $skills) {
        $matchedTerms = [];
        $allText = strtolower($cv['profil'] . ' ' . $cv['experiences_desc'] . ' ' . $cv['formations_desc'] . ' ' . $cv['competences_list'] . ' ' . $cv['langues_list']);
        
        $searchTerms = array_merge(
            explode(' ', strtolower($description)),
            explode(' ', strtolower($tasks)),
            explode(' ', strtolower($skills))
        );
        
        foreach ($searchTerms as $term) {
            $term = trim($term);
            if (strlen($term) >= 2 && strpos($allText, $term) !== false) {
                $matchedTerms[] = $term;
            }
        }
        
        return array_unique($matchedTerms);
    }
    
    /**
     * Recherche de CV avec filtres (ancienne méthode)
     */
    public function searchCVs() {
        $query = $_GET['query'] ?? '';
        $filiere = $_GET['filiere'] ?? '';
        $experience = $_GET['experience'] ?? '';
        $competences = $_GET['competences'] ?? '';
        
        $sql = "SELECT DISTINCT 
                    c.id,
                    c.cv_name,
                    c.date_creation,
                    c.est_publie,
                    ip.nom,
                    ip.prenom,
                    ip.email,
                    ip.localisation,
                    f.nom as filiere_nom,
                    p.description as profil,
                    GROUP_CONCAT(DISTINCT comp.competences SEPARATOR ', ') as competences_list,
                    GROUP_CONCAT(DISTINCT exp.poste SEPARATOR ', ') as experiences_list
                FROM cvs c
                LEFT JOIN informations_personnelles ip ON c.id = ip.id_cv
                LEFT JOIN filieres f ON c.id_filiere = f.id
                LEFT JOIN profils p ON c.id = p.id_cv
                LEFT JOIN competences comp ON c.id = comp.id_cv
                LEFT JOIN experiences exp ON c.id = exp.id_cv
                WHERE c.est_publie = 1";
        
        $params = [];
        
        if (!empty($query)) {
            $sql .= " AND (ip.nom LIKE ? OR ip.prenom LIKE ? OR ip.email LIKE ? OR p.description LIKE ?)";
            $searchTerm = "%$query%";
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }
        
        if (!empty($filiere)) {
            $sql .= " AND f.id = ?";
            $params[] = $filiere;
        }
        
        $sql .= " GROUP BY c.id ORDER BY c.date_creation DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $results]);
    }
    
    /**
     * Obtenir les détails d'un CV
     */
    public function getCVDetails() {
        $cvId = $_GET['id'] ?? 0;
        
        if (!$cvId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID CV requis']);
            return;
        }
        
        // Informations personnelles
        $sql = "SELECT * FROM informations_personnelles WHERE id_cv = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cvId]);
        $personalInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Profil
        $sql = "SELECT * FROM profils WHERE id_cv = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cvId]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Expériences
        $sql = "SELECT * FROM experiences WHERE id_cv = ? ORDER BY dates DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cvId]);
        $experiences = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formations
        $sql = "SELECT * FROM formations WHERE id_cv = ? ORDER BY dates DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cvId]);
        $formations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Compétences
        $sql = "SELECT * FROM competences WHERE id_cv = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cvId]);
        $competences = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Langues
        $sql = "SELECT * FROM langues WHERE id_cv = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cvId]);
        $langues = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Projets
        $sql = "SELECT * FROM projets WHERE id_cv = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cvId]);
        $projets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Certificats
        $sql = "SELECT * FROM certificats WHERE id_cv = ? ORDER BY date_certificat DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cvId]);
        $certificats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Filière
        $sql = "SELECT f.* FROM filieres f 
                INNER JOIN cvs c ON c.id_filiere = f.id 
                WHERE c.id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cvId]);
        $filiere = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $cvDetails = [
            'personal_info' => $personalInfo,
            'profile' => $profile,
            'experiences' => $experiences,
            'formations' => $formations,
            'competences' => $competences,
            'langues' => $langues,
            'projets' => $projets,
            'certificats' => $certificats,
            'filiere' => $filiere
        ];
        
        echo json_encode(['success' => true, 'data' => $cvDetails]);
    }
    
    /**
     * Obtenir toutes les filières
     */
    public function getFilieres() {
        $sql = "SELECT * FROM filieres ORDER BY nom";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $filieres = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $filieres]);
    }
    
    /**
     * Obtenir les statistiques RH
     */
    public function getStats() {
        // Total CV publiés
        $sql = "SELECT COUNT(*) as total FROM cvs WHERE est_publie = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $totalCVs = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // CV par filière
        $sql = "SELECT f.nom, COUNT(c.id) as count 
                FROM filieres f 
                LEFT JOIN cvs c ON f.id = c.id_filiere AND c.est_publie = 1
                GROUP BY f.id, f.nom 
                ORDER BY count DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $cvByFiliere = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // CV récents (7 derniers jours)
        $sql = "SELECT COUNT(*) as recent FROM cvs 
                WHERE est_publie = 1 
                AND date_creation >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $recentCVs = $stmt->fetch(PDO::FETCH_ASSOC)['recent'];
        
        $stats = [
            'total_cvs' => $totalCVs,
            'cv_by_filiere' => $cvByFiliere,
            'recent_cvs' => $recentCVs
        ];
        
        echo json_encode(['success' => true, 'data' => $stats]);
    }
}
?> 