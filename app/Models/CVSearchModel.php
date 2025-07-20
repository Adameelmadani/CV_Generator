<?php

require_once __DIR__ . '/../../core/bootstrap.php';
require_once __DIR__ . '/../../cv_search_system/cv_search_config.php';

class CVSearchModel extends Model {
    private $debug_mode;
    
    public function __construct() {
        parent::__construct();
        $this->debug_mode = defined('DEBUG_MODE') ? DEBUG_MODE : false;
    }
    
    /**
     * Recherche des CVs par mot-clé(s) avec calcul de fréquence
     * Supporte la recherche avec plusieurs mots-clés entre guillemets
     */
    public function searchByKeywords($keywords, $limit = 25, $filters = []) {
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
            $basic_cv = $this->getBasicCVInfo($cv_data['cv_id'], $cv_data['frequency'], $cv_data['keyword_details'] ?? []);
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
     * Parse les mots-clés entre guillemets
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
     * Calcule le score total pour une liste de mots-clés dans un texte
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
     * Calcule les occurrences détaillées pour chaque mot-clé dans un texte
     * Retourne un tableau associatif [mot-clé => nombre d'occurrences]
     */
    private function calculateKeywordsDetailedScore($text, $keywords) {
        $detailed_scores = [];
        
        foreach ($keywords as $keyword) {
            $keyword_lower = strtolower($keyword);
            $occurrences = $this->countWordOccurrences($text, $keyword_lower);
            $detailed_scores[$keyword] = $occurrences;
        }
        
        return $detailed_scores;
    }
    
    /**
     * Compte les occurrences d'un mot entier dans un texte
     */
    private function countWordOccurrences($text, $keyword) {
        $pattern = '/\b' . preg_quote($keyword, '/') . '\b/i';
        return preg_match_all($pattern, $text);
    }
    
    /**
     * Recherche dans toutes les sections du CV
     */
    private function searchInAllSections($keywords, $filters = []) {
        $cvs_data = []; // Stocker les données détaillées par CV
        
        // Liste des sections à rechercher
        $sections = [
            'informations_personnelles' => [
                'table' => 'informations_personnelles',
                'alias' => 'ip',
                'fields' => "CONCAT(COALESCE(ip.nom, ''), ' ', COALESCE(ip.prenom, ''), ' ', 
                            COALESCE(ip.localisation, ''), ' ', COALESCE(ip.email, ''), ' ', 
                            COALESCE(ip.site_web, ''), ' ', COALESCE(ip.linkedin, ''), ' ', 
                            COALESCE(ip.github, ''))"
            ],
            'competences' => [
                'table' => 'competences',
                'alias' => 'comp',
                'fields' => "CONCAT(COALESCE(comp.categorie, ''), ' ', COALESCE(comp.competences, ''))"
            ],
            'experiences' => [
                'table' => 'experiences',
                'alias' => 'exp',
                'fields' => "CONCAT(COALESCE(exp.lieu, ''), ' ', COALESCE(exp.entreprise, ''), ' ', 
                            COALESCE(exp.poste, ''), ' ', COALESCE(exp.description, ''))"
            ],
            'formations' => [
                'table' => 'formations',
                'alias' => 'form',
                'fields' => "CONCAT(COALESCE(form.diplome, ''), ' ', COALESCE(form.universite, ''), ' ', 
                            COALESCE(form.specialite, ''), ' ', COALESCE(form.description, ''))"
            ],
            'projets' => [
                'table' => 'projets',
                'alias' => 'proj',
                'fields' => "CONCAT(COALESCE(proj.nom_projet, ''), ' ', COALESCE(proj.lien_projet, ''), ' ', 
                            COALESCE(proj.description, ''))"
            ],
            'certificats' => [
                'table' => 'certificats',
                'alias' => 'cert',
                'fields' => "CONCAT(COALESCE(cert.nom_certificat, ''), ' ', COALESCE(cert.organisme, ''), ' ', 
                            COALESCE(cert.lieu, ''), ' ', COALESCE(cert.description, ''))"
            ],
            'profils' => [
                'table' => 'profils',
                'alias' => 'prof',
                'fields' => "COALESCE(prof.description, '')"
            ],
            'langues' => [
                'table' => 'langues',
                'alias' => 'lang',
                'fields' => "CONCAT(COALESCE(lang.nom_langue, ''), ' ', COALESCE(lang.niveau, ''))"
            ]
        ];
        
        foreach ($sections as $section_name => $section_config) {
            $sql = "SELECT {$section_config['alias']}.id_cv, 
                           {$section_config['fields']} as text_content
                    FROM {$section_config['table']} {$section_config['alias']}
                    JOIN cvs c ON {$section_config['alias']}.id_cv = c.id
                    WHERE c.est_publie = 1";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $results = $stmt->fetchAll();
            
            foreach ($results as $result) {
                $cv_id = $result['id_cv'];
                $text = strtolower($result['text_content']);
                
                // Calcul des scores détaillés pour chaque mot-clé
                $detailed_scores = $this->calculateKeywordsDetailedScore($text, $keywords);
                
                // Initialiser les données du CV si nécessaire
                if (!isset($cvs_data[$cv_id])) {
                    $cvs_data[$cv_id] = [
                        'frequency' => 0,
                        'keyword_details' => []
                    ];
                    // Initialiser chaque mot-clé à 0
                    foreach ($keywords as $keyword) {
                        $cvs_data[$cv_id]['keyword_details'][$keyword] = 0;
                    }
                }
                
                // Ajouter les scores détaillés
                foreach ($detailed_scores as $keyword => $score) {
                    if ($score > 0) {
                        $cvs_data[$cv_id]['keyword_details'][$keyword] += $score;
                        $cvs_data[$cv_id]['frequency'] += $score;
                    }
                }
            }
        }
        
        // Application des filtres (adapter pour la nouvelle structure)
        $cvs_frequency = [];
        foreach ($cvs_data as $cv_id => $data) {
            if ($data['frequency'] > 0) {
                $cvs_frequency[$cv_id] = $data['frequency'];
            }
        }
        $cvs_frequency = $this->applyFilters($cvs_frequency, $filters);
        
        // Conversion en tableau avec structure appropriée incluant les détails
        $result = [];
        foreach ($cvs_frequency as $cv_id => $frequency) {
            $result[] = [
                'cv_id' => $cv_id,
                'frequency' => round($frequency, 0),
                'keyword_details' => $cvs_data[$cv_id]['keyword_details'] ?? []
            ];
        }
        
        return $result;
    }
    
    /**
     * Application des filtres
     */
    private function applyFilters($cvs_frequency, $filters) {
        if (empty($filters) || empty($cvs_frequency)) {
            return $cvs_frequency;
        }
        
        $cv_ids = array_keys($cvs_frequency);
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
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $filtered_cv_ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            // Garder seulement les CVs qui passent les filtres
            $cvs_frequency = array_intersect_key($cvs_frequency, array_flip($filtered_cv_ids));
        }
        
        return $cvs_frequency;
    }
    
    /**
     * Obtient les informations essentielles d'un CV
     */
    private function getBasicCVInfo($cv_id, $frequency, $keyword_details = []) {
        try {
            // Informations personnelles essentielles
            $stmt = $this->db->prepare("SELECT nom, prenom, email, localisation FROM informations_personnelles WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $personal_info = $stmt->fetch() ?: [];
            
            // Informations du CV
            $stmt = $this->db->prepare("SELECT cv_name, date_creation FROM cvs WHERE id = ?");
            $stmt->execute([$cv_id]);
            $cv_info = $stmt->fetch() ?: [];
            
            // Première compétence principale
            $stmt = $this->db->prepare("SELECT competences FROM competences WHERE id_cv = ? LIMIT 1");
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
                'competence_principale' => $competence['competences'] ?? '',
                'keyword_details' => $keyword_details
            ];
        } catch (Exception $e) {
            if ($this->debug_mode) {
                error_log("Erreur lors de l'obtention des infos basiques du CV $cv_id: " . $e->getMessage());
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
     * Obtenir les détails complets d'un CV
     */
    public function getCVDetails($cv_id) {
        try {
            // Informations personnelles
            $stmt = $this->db->prepare("SELECT * FROM informations_personnelles WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $personal_info = $stmt->fetch() ?: [];
            
            // Compétences
            $stmt = $this->db->prepare("SELECT * FROM competences WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $competences = $stmt->fetchAll();
            
            // Expériences
            $stmt = $this->db->prepare("SELECT * FROM experiences WHERE id_cv = ? ORDER BY dates DESC");
            $stmt->execute([$cv_id]);
            $experiences = $stmt->fetchAll();
            
            // Formations
            $stmt = $this->db->prepare("SELECT * FROM formations WHERE id_cv = ? ORDER BY dates DESC");
            $stmt->execute([$cv_id]);
            $formations = $stmt->fetchAll();
            
            // Projets
            $stmt = $this->db->prepare("SELECT * FROM projets WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $projets = $stmt->fetchAll();
            
            // Langues
            $stmt = $this->db->prepare("SELECT * FROM langues WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $langues = $stmt->fetchAll();
            
            // Certificats
            $stmt = $this->db->prepare("SELECT * FROM certificats WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $certificats = $stmt->fetchAll();
            
            // Profil
            $stmt = $this->db->prepare("SELECT * FROM profils WHERE id_cv = ?");
            $stmt->execute([$cv_id]);
            $profil = $stmt->fetch() ?: [];
            
            // Informations du CV
            $stmt = $this->db->prepare("SELECT * FROM cvs WHERE id = ?");
            $stmt->execute([$cv_id]);
            $cv_info = $stmt->fetch() ?: [];
            
            return [
                'cv_id' => $cv_id,
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
     * Statistiques générales du système
     */
    public function getGeneralStatistics() {
        try {
            // Nombre total de CVs publiés
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM cvs WHERE est_publie = 1");
            $stmt->execute();
            $total_cvs = $stmt->fetch()['total'];
            
            return [
                'total_published_cvs' => $total_cvs,
                'last_updated' => date('Y-m-d H:i:s')
            ];
        } catch (Exception $e) {
            error_log("Erreur lors des statistiques: " . $e->getMessage());
            return ['total_published_cvs' => 0, 'last_updated' => date('Y-m-d H:i:s')];
        }
    }
}
