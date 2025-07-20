<?php
/**
 * Système de recherche de CV adapté à la base de données cv_craft existante
 * Compatible avec la structure de tables actuelle
 */

require_once 'cv_search_config.php';

class CVSearchSystemAdapted {
    private $pdo;
    private $debug_mode;
    
    public function __construct() {
        $this->debug_mode = defined('DEBUG_MODE') ? DEBUG_MODE : false;
        $this->initializeDatabase();
    }
    
    private function initializeDatabase() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            throw new Exception("Erreur de connexion à la base de données : " . $e->getMessage());
        }
    }
    
    /**
     * Recherche des CVs par mot-clé(s) avec calcul de fréquence
     * Supporte la recherche avec plusieurs mots-clés entre guillemets
     * Exemple: "java" "machine learning" "php"
     * @param string $keywords Le(s) mot(s)-clé(s) à rechercher
     * @param int $limit Nombre maximum de résultats
     * @param array $filters Filtres supplémentaires
     * @return array Résultats de la recherche
     */
    public function searchByKeyword($keywords, $limit = 25, $filters = []) {
        if (empty($keywords) || strlen(trim($keywords)) < MIN_KEYWORD_LENGTH) {
            throw new Exception("La recherche doit contenir au moins " . MIN_KEYWORD_LENGTH . " caractères");
        }
        
        if (strlen($keywords) > MAX_KEYWORD_LENGTH) {
            throw new Exception("La recherche ne peut pas dépasser " . MAX_KEYWORD_LENGTH . " caractères");
        }
        
        $start_time = microtime(true);
        
        // Extraction des mots-clés entre guillemets
        $parsed_keywords = $this->parseKeywords($keywords);
        if (empty($parsed_keywords)) {
            throw new Exception("Aucun mot-clé valide trouvé. Utilisez des guillemets pour entourer chaque terme: \"java\" \"php\"");
        }
        
        // Recherche dans toutes les sections du CV
        $cvs_with_frequency = $this->searchInAllSections($parsed_keywords, $filters);
        
        // Tri par fréquence décroissante
        usort($cvs_with_frequency, function($a, $b) {
            return $b['frequency'] - $a['frequency'];
        });
        
        // Limitation des résultats
        $cvs_with_frequency = array_slice($cvs_with_frequency, 0, $limit);
        
        // Enrichissement des données - Informations essentielles seulement
        $results = [];
        foreach ($cvs_with_frequency as $cv_data) {
            $basic_cv = $this->getBasicCVInfo($cv_data['cv_id'], $cv_data['frequency']);
            if ($basic_cv) {
                $results[] = $basic_cv;
            }
        }
        
        $end_time = microtime(true);
        $execution_time = $end_time - $start_time;
        
        if ($this->debug_mode) {
            error_log("Recherche de '" . implode(' ', $parsed_keywords) . "' - " . count($results) . " résultats en " . number_format($execution_time, 3) . "s");
        }
        
        return [
            'results' => $results,
            'statistics' => $this->calculateStatistics($results),
            'execution_time' => $execution_time,
            'keywords' => $parsed_keywords,
            'search_query' => $keywords
        ];
    }
    
    /**
     * Obtient les informations essentielles d'un CV pour la liste des résultats
     */
    private function getBasicCVInfo($cv_id, $frequency) {
        try {
            // Informations personnelles essentielles
            $stmt = $this->pdo->prepare("SELECT nom, prenom, email, localisation FROM informations_personnelles WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $personal_info = $stmt->fetch() ?: [];
            
            // Informations du CV
            $stmt = $this->pdo->prepare("SELECT cv_name, date_creation FROM cvs WHERE id = ?");
            $stmt->execute([$cv_id]);
            $cv_info = $stmt->fetch() ?: [];
            
            // Première compétence principale (pour donner une idée du profil)
            $stmt = $this->pdo->prepare("SELECT competences FROM competences WHERE id_cv = ? LIMIT 1");
            $stmt->execute([$cv_id]);
            $competence = $stmt->fetch();
            
            return [
                'cv_id' => $cv_id,
                'frequency' => $frequency,
                'nom_cv' => $cv_info['cv_name'] ?? 'CV Sans Nom',
                'nom_complet' => trim(($personal_info['nom'] ?? '') . ' ' . ($personal_info['prenom'] ?? '')),
                'email' => $personal_info['email'] ?? '',
                'localisation' => $personal_info['localisation'] ?? '',
                'date_creation' => $cv_info['date_creation'] ?? '',
                'competence_principale' => $competence['competences'] ?? ''
            ];
        } catch (Exception $e) {
            if ($this->debug_mode) {
                error_log("Erreur lors de l'obtention des infos basiques du CV $cv_id: " . $e->getMessage());
            }
            return null;
        }
    }

    /**
     * Obtient les détails complets d'un CV spécifique
     */
    public function getCVDetails($cv_id) {
        try {
            $enriched_cv = $this->enrichCVData($cv_id, 0);
            if ($enriched_cv) {
                return [
                    'success' => true,
                    'cv_details' => $enriched_cv
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'CV non trouvé'
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Calcule le score total pour une liste de mots-clés dans un texte
     * @param string $text Le texte à analyser
     * @param array $keywords Liste des mots-clés à rechercher
     * @return int Score total (somme des occurrences de tous les mots-clés)
     */
    private function calculateKeywordsScore($text, $keywords) {
        $total_score = 0;
        
        foreach ($keywords as $keyword) {
            $keyword_lower = strtolower($keyword);
            $occurrences = $this->countWordOccurrences($text, $keyword_lower);
            $total_score += $occurrences;
        }
        
        return $total_score;
    }

    /**
     * Parse les mots-clés entre guillemets
     * Exemple: "java" "machine learning" "php" -> ['java', 'machine learning', 'php']
     * @param string $input La chaîne contenant les mots-clés entre guillemets
     * @return array Liste des mots-clés extraits
     */
    private function parseKeywords($input) {
        $keywords = [];
        
        // Pattern pour capturer les mots-clés entre guillemets (simples ou doubles)
        $pattern = '/["\'](.*?)["\']|(\S+)/';
        
        if (preg_match_all($pattern, $input, $matches)) {
            foreach ($matches[0] as $match) {
                // Nettoyer le mot-clé (enlever les guillemets)
                $keyword = trim($match, '"\'');
                $keyword = trim($keyword);
                
                // Vérifier que le mot-clé n'est pas vide et respecte les contraintes
                if (!empty($keyword) && strlen($keyword) >= MIN_KEYWORD_LENGTH) {
                    $keywords[] = $keyword;
                }
            }
        }
        
        // Si aucun mot-clé entre guillemets n'est trouvé, traiter comme un seul mot-clé
        if (empty($keywords)) {
            $keyword = trim($input);
            if (!empty($keyword) && strlen($keyword) >= MIN_KEYWORD_LENGTH) {
                $keywords[] = $keyword;
            }
        }
        
        return array_unique($keywords);
    }

    /**
     * Compte les occurrences d'un mot entier dans un texte
     */
    private function countWordOccurrences($text, $keyword) {
        // Utilise des regex pour chercher le mot entier seulement
        $pattern = '/\b' . preg_quote($keyword, '/') . '\b/i';
        return preg_match_all($pattern, $text);
    }

    /**
     * Recherche dans toutes les sections du CV avec calcul précis des occurrences
     * Supporte maintenant la recherche avec plusieurs mots-clés
     */
    private function searchInAllSections($keywords, $filters = []) {
        $cvs_frequency = [];
        
        // Recherche dans les informations personnelles
        $sql = "SELECT ip.id_cv, 
                       CONCAT(COALESCE(ip.nom, ''), ' ', COALESCE(ip.prenom, ''), ' ', 
                              COALESCE(ip.localisation, ''), ' ', COALESCE(ip.email, ''), ' ', 
                              COALESCE(ip.site_web, ''), ' ', COALESCE(ip.linkedin, ''), ' ', 
                              COALESCE(ip.github, '')) as text_content
                FROM informations_personnelles ip
                JOIN cvs c ON ip.id_cv = c.id
                WHERE c.est_publie = 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        foreach ($results as $result) {
            $cv_id = $result['id_cv'];
            $text = strtolower($result['text_content']);
            
            // Calculer le score total pour tous les mots-clés
            $total_score = $this->calculateKeywordsScore($text, $keywords);
            if ($total_score > 0) {
                $cvs_frequency[$cv_id] = ($cvs_frequency[$cv_id] ?? 0) + $total_score;
            }
        }
        
        // Recherche dans les compétences
        $sql = "SELECT comp.id_cv, 
                       CONCAT(COALESCE(comp.categorie, ''), ' ', COALESCE(comp.competences, '')) as text_content
                FROM competences comp
                JOIN cvs c ON comp.id_cv = c.id
                WHERE c.est_publie = 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        foreach ($results as $result) {
            $cv_id = $result['id_cv'];
            $text = strtolower($result['text_content']);
            $total_score = $this->calculateKeywordsScore($text, $keywords);
            if ($total_score > 0) {
                $cvs_frequency[$cv_id] = ($cvs_frequency[$cv_id] ?? 0) + $total_score;
            }
        }
        
        // Recherche dans les expériences
        $sql = "SELECT exp.id_cv, 
                       CONCAT(COALESCE(exp.lieu, ''), ' ', COALESCE(exp.entreprise, ''), ' ', 
                              COALESCE(exp.poste, ''), ' ', COALESCE(exp.description, '')) as text_content
                FROM experiences exp
                JOIN cvs c ON exp.id_cv = c.id
                WHERE c.est_publie = 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        foreach ($results as $result) {
            $cv_id = $result['id_cv'];
            $text = strtolower($result['text_content']);
            $total_score = $this->calculateKeywordsScore($text, $keywords);
            if ($total_score > 0) {
                $cvs_frequency[$cv_id] = ($cvs_frequency[$cv_id] ?? 0) + $total_score;
            }
        }
        
        // Recherche dans les formations
        $sql = "SELECT form.id_cv, 
                       CONCAT(COALESCE(form.diplome, ''), ' ', COALESCE(form.universite, ''), ' ', 
                              COALESCE(form.specialite, ''), ' ', COALESCE(form.description, '')) as text_content
                FROM formations form
                JOIN cvs c ON form.id_cv = c.id
                WHERE c.est_publie = 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        foreach ($results as $result) {
            $cv_id = $result['id_cv'];
            $text = strtolower($result['text_content']);
            $total_score = $this->calculateKeywordsScore($text, $keywords);
            if ($total_score > 0) {
                $cvs_frequency[$cv_id] = ($cvs_frequency[$cv_id] ?? 0) + $total_score;
            }
        }
        
        // Recherche dans les projets
        $sql = "SELECT proj.id_cv, 
                       CONCAT(COALESCE(proj.nom_projet, ''), ' ', COALESCE(proj.lien_projet, ''), ' ', 
                              COALESCE(proj.description, '')) as text_content
                FROM projets proj
                JOIN cvs c ON proj.id_cv = c.id
                WHERE c.est_publie = 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        foreach ($results as $result) {
            $cv_id = $result['id_cv'];
            $text = strtolower($result['text_content']);
            $total_score = $this->calculateKeywordsScore($text, $keywords);
            if ($total_score > 0) {
                $cvs_frequency[$cv_id] = ($cvs_frequency[$cv_id] ?? 0) + $total_score;
            }
        }
        
        // Recherche dans les certificats
        $sql = "SELECT cert.id_cv, 
                       CONCAT(COALESCE(cert.nom_certificat, ''), ' ', COALESCE(cert.organisme, ''), ' ', 
                              COALESCE(cert.lieu, ''), ' ', COALESCE(cert.description, '')) as text_content
                FROM certificats cert
                JOIN cvs c ON cert.id_cv = c.id
                WHERE c.est_publie = 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        foreach ($results as $result) {
            $cv_id = $result['id_cv'];
            $text = strtolower($result['text_content']);
            $total_score = $this->calculateKeywordsScore($text, $keywords);
            if ($total_score > 0) {
                $cvs_frequency[$cv_id] = ($cvs_frequency[$cv_id] ?? 0) + $total_score;
            }
        }
        
        // Recherche dans les profils
        $sql = "SELECT prof.id_cv, 
                       COALESCE(prof.description, '') as text_content
                FROM profils prof
                JOIN cvs c ON prof.id_cv = c.id
                WHERE c.est_publie = 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        foreach ($results as $result) {
            $cv_id = $result['id_cv'];
            $text = strtolower($result['text_content']);
            $total_score = $this->calculateKeywordsScore($text, $keywords);
            if ($total_score > 0) {
                $cvs_frequency[$cv_id] = ($cvs_frequency[$cv_id] ?? 0) + $total_score;
            }
        }
        
        // Recherche dans les langues
        $sql = "SELECT lang.id_cv, 
                       CONCAT(COALESCE(lang.nom_langue, ''), ' ', COALESCE(lang.niveau, '')) as text_content
                FROM langues lang
                JOIN cvs c ON lang.id_cv = c.id
                WHERE c.est_publie = 1";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        $results = $stmt->fetchAll();
        
        foreach ($results as $result) {
            $cv_id = $result['id_cv'];
            $text = strtolower($result['text_content']);
            $total_score = $this->calculateKeywordsScore($text, $keywords);
            if ($total_score > 0) {
                $cvs_frequency[$cv_id] = ($cvs_frequency[$cv_id] ?? 0) + $total_score;
            }
        }
        
        // Application des filtres
        $cvs_frequency = $this->applyFilters($cvs_frequency, $filters);
        
        // Conversion en tableau avec structure appropriée
        $result = [];
        foreach ($cvs_frequency as $cv_id => $frequency) {
            $result[] = [
                'cv_id' => $cv_id,
                'frequency' => round($frequency, 0)
            ];
        }
        
        return $result;
    }
    
    /**
     * Application des filtres
     */
    private function applyFilters($cvs_frequency, $filters) {
        if (empty($filters)) {
            return $cvs_frequency;
        }
        
        $cv_ids = array_keys($cvs_frequency);
        if (empty($cv_ids)) {
            return $cvs_frequency;
        }
        
        $placeholders = str_repeat('?,', count($cv_ids) - 1) . '?';
        $conditions = [];
        $params = $cv_ids;
        
        // Filtre par localisation
        if (!empty($filters['ville'])) {
            $conditions[] = "LOWER(ip.localisation) LIKE ?";
            $params[] = '%' . strtolower($filters['ville']) . '%';
        }
        
        // Filtre par compétences requises
        if (!empty($filters['competences_requises']) && is_array($filters['competences_requises'])) {
            $competences_conditions = [];
            foreach ($filters['competences_requises'] as $competence) {
                $competences_conditions[] = "LOWER(comp.competences) LIKE ?";
                $params[] = '%' . strtolower($competence) . '%';
            }
            if (!empty($competences_conditions)) {
                $conditions[] = "(" . implode(' OR ', $competences_conditions) . ")";
            }
        }
        
        if (!empty($conditions)) {
            $sql = "SELECT DISTINCT c.id
                    FROM cvs c
                    JOIN informations_personnelles ip ON c.id = ip.id_cv
                    LEFT JOIN competences comp ON c.id = comp.id_cv
                    WHERE c.id IN ($placeholders) AND " . implode(' AND ', $conditions);
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $filtered_cv_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Garder seulement les CVs qui passent les filtres
            $cvs_frequency = array_intersect_key($cvs_frequency, array_flip($filtered_cv_ids));
        }
        
        return $cvs_frequency;
    }
    
    /**
     * Enrichissement des données du CV
     */
    private function enrichCVData($cv_id, $frequency) {
        try {
            // Informations personnelles
            $stmt = $this->pdo->prepare("SELECT * FROM informations_personnelles WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $personal_info = $stmt->fetch() ?: [];
            
            // Compétences
            $stmt = $this->pdo->prepare("SELECT * FROM competences WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $competences = $stmt->fetchAll();
            
            // Expériences
            $stmt = $this->pdo->prepare("SELECT * FROM experiences WHERE id_cv = ? ORDER BY dates DESC");
            $stmt->execute([$cv_id]);
            $experiences = $stmt->fetchAll();
            
            // Formations
            $stmt = $this->pdo->prepare("SELECT * FROM formations WHERE id_cv = ? ORDER BY dates DESC");
            $stmt->execute([$cv_id]);
            $formations = $stmt->fetchAll();
            
            // Projets
            $stmt = $this->pdo->prepare("SELECT * FROM projets WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $projets = $stmt->fetchAll();
            
            // Langues
            $stmt = $this->pdo->prepare("SELECT * FROM langues WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $langues = $stmt->fetchAll();
            
            // Certificats
            $stmt = $this->pdo->prepare("SELECT * FROM certificats WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $certificats = $stmt->fetchAll();
            
            // Profil
            $stmt = $this->pdo->prepare("SELECT * FROM profils WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $profil = $stmt->fetch() ?: [];
            
            // Informations du CV
            $stmt = $this->pdo->prepare("SELECT * FROM cvs WHERE id = ?");
            $stmt->execute([$cv_id]);
            $cv_info = $stmt->fetch() ?: [];
            
            return [
                'cv_id' => $cv_id,
                'frequency' => $frequency,
                'informations_personnelles' => $personal_info,
                'competences' => $competences,
                'experiences' => $experiences,
                'formations' => $formations,
                'projets' => $projets,
                'langues' => $langues,
                'certificats' => $certificats,
                'profil' => $profil,
                'cv_info' => $cv_info
            ];
        } catch (Exception $e) {
            if ($this->debug_mode) {
                error_log("Erreur lors de l'enrichissement du CV $cv_id: " . $e->getMessage());
            }
            return null;
        }
    }
    
    /**
     * Calcul des statistiques
     */
    private function calculateStatistics($results) {
        if (empty($results)) {
            return [
                'total_cvs' => 0,
                'avg_frequency' => 0,
                'max_frequency' => 0,
                'min_frequency' => 0
            ];
        }
        
        $frequencies = array_column($results, 'frequency');
        
        return [
            'total_cvs' => count($results),
            'avg_frequency' => round(array_sum($frequencies) / count($frequencies), 2),
            'max_frequency' => max($frequencies),
            'min_frequency' => min($frequencies)
        ];
    }
    
    /**
     * Obtenir les statistiques générales
     */
    public function getGeneralStats() {
        try {
            $stats = [];
            
            // Nombre total de CVs publiés
            $stmt = $this->pdo->prepare("SELECT COUNT(*) as total_cvs FROM cvs WHERE est_publie = 1");
            $stmt->execute();
            $stats['total_cvs'] = $stmt->fetchColumn();
            
            // Nombre total d'utilisateurs
            $stmt = $this->pdo->prepare("SELECT COUNT(*) as total_users FROM utilisateurs");
            $stmt->execute();
            $stats['total_users'] = $stmt->fetchColumn();
            
            // Nombre de CVs par mois (derniers 12 mois)
            $stmt = $this->pdo->prepare("
                SELECT DATE_FORMAT(date_creation, '%Y-%m') as month, COUNT(*) as count
                FROM cvs 
                WHERE date_creation >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(date_creation, '%Y-%m')
                ORDER BY month DESC
            ");
            $stmt->execute();
            $stats['cvs_by_month'] = $stmt->fetchAll();
            
            // Top 10 des compétences les plus mentionnées
            $stmt = $this->pdo->prepare("
                SELECT competences, COUNT(*) as count
                FROM competences c
                JOIN cvs cv ON c.id_cv = cv.id
                WHERE cv.est_publie = 1 AND competences IS NOT NULL AND competences != ''
                GROUP BY competences
                ORDER BY count DESC
                LIMIT 10
            ");
            $stmt->execute();
            $stats['top_skills'] = $stmt->fetchAll();
            
            // Répartition par localisation
            $stmt = $this->pdo->prepare("
                SELECT localisation, COUNT(*) as count
                FROM informations_personnelles ip
                JOIN cvs cv ON ip.id_cv = cv.id
                WHERE cv.est_publie = 1 AND localisation IS NOT NULL AND localisation != ''
                GROUP BY localisation
                ORDER BY count DESC
                LIMIT 10
            ");
            $stmt->execute();
            $stats['top_locations'] = $stmt->fetchAll();
            
            return $stats;
        } catch (Exception $e) {
            if ($this->debug_mode) {
                error_log("Erreur lors du calcul des statistiques: " . $e->getMessage());
            }
            return [];
        }
    }
}

/**
 * API JSON pour le système de recherche
 */
class CVSearchAPIAdapted {
    private $search_system;
    
    public function __construct() {
        $this->search_system = new CVSearchSystemAdapted();
    }
    
    /**
     * Point d'entrée principal de l'API
     */
    public function handleRequest() {
        header('Content-Type: application/json');
        
        if (CORS_ENABLED) {
            header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
            header('Access-Control-Allow-Methods: ' . CORS_METHODS);
            header('Access-Control-Allow-Headers: ' . CORS_HEADERS);
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
        
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['keyword'])) {
                throw new Exception("Paramètre 'keyword' manquant");
            }
            
            $keyword = trim($input['keyword']);
            $limit = isset($input['limit']) ? intval($input['limit']) : DEFAULT_LIMIT;
            $filters = isset($input['filters']) ? $input['filters'] : [];
            
            // Validation des limites
            if ($limit > MAX_LIMIT) {
                $limit = MAX_LIMIT;
            }
            
            $results = $this->search_system->searchByKeyword($keyword, $limit, $filters);
            
            $response = [
                'success' => true,
                'results' => $results['results'],
                'statistics' => $results['statistics'],
                'execution_time' => $results['execution_time'],
                'keyword' => $keyword,
                'filters_applied' => $filters,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'error' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            http_response_code(400);
            echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }
    }
    
    /**
     * Endpoint pour les statistiques générales
     */
    public function getStats() {
        header('Content-Type: application/json');
        
        try {
            $stats = $this->search_system->getGeneralStats();
            
            $response = [
                'success' => true,
                'statistics' => $stats,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'error' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            http_response_code(500);
            echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }
    }
    /**
     * Endpoint pour obtenir les détails complets d'un CV
     */
    public function getCVDetails() {
        header('Content-Type: application/json');
        
        try {
            $cv_id = $_GET['cv_id'] ?? null;
            
            if (!$cv_id) {
                throw new Exception("ID du CV requis");
            }
            
            $result = $this->search_system->getCVDetails($cv_id);
            
            if ($result['success']) {
                echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            }
            
        } catch (Exception $e) {
            $response = [
                'success' => false,
                'error' => $e->getMessage(),
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            http_response_code(500);
            echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }
    }
}

// Gestion des requêtes API
if (isset($_SERVER['REQUEST_METHOD'])) {
    $api = new CVSearchAPIAdapted();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'cv_details') {
        $api->getCVDetails();
    } elseif (($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'OPTIONS')) {
        if (isset($_GET['action']) && $_GET['action'] === 'stats') {
            $api->getStats();
        } else {
            $api->handleRequest();
        }
    }
}
?>
