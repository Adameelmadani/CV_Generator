<?php

require_once __DIR__ . '/../../core/Model.php';

class CVSkills extends Model {
    protected $table = 'competences';
    
    public function getSkills($cvId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE id_cv = :cv_id 
                ORDER BY id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveSkills($cvId, $skillsData) {
        // Validate input parameters
        if (!is_array($skillsData)) {
            error_log("CVSkills::saveSkills - skillsData is not an array: " . gettype($skillsData));
            return [];
        }
        
        // First, delete existing skill entries for this CV
        $this->deleteSkills($cvId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($skillsData as $index => $skill) {
            if (!is_array($skill)) {
                error_log("CVSkills::saveSkills - skill entry at index $index is not an array: " . gettype($skill));
                continue;
            }
            if (!empty($skill['categorie']) || !empty($skill['competences'])) {
                $insertedIds[] = $this->createSkillEntry($cvId, $skill);
            }
        }
        
        return $insertedIds;
    }
    
    private function createSkillEntry($cvId, $data) {
        $sql = "INSERT INTO {$this->table} (
            id_cv, categorie, competences
        ) VALUES (
            :cv_id, :categorie, :competences
        )";
        
        $this->execute($sql, [
            ':cv_id' => $cvId,
            ':categorie' => $data['categorie'] ?? '',
            ':competences' => $data['competences'] ?? ''
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteSkills($cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id_cv = :cv_id";
        return $this->execute($sql, [':cv_id' => $cvId]);
    }
    
    public function deleteSkillEntry($id, $cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id = :id AND id_cv = :cv_id";
        return $this->execute($sql, [':id' => $id, ':cv_id' => $cvId]);
    }

    public function getSkillSuggestions($term, $limit = 10) {
        $sql = "SELECT DISTINCT competences FROM {$this->table} WHERE competences LIKE :term AND competences IS NOT NULL AND competences != '' LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $likeTerm = "%$term%";
        $stmt->bindParam(':term', $likeTerm, PDO::PARAM_STR);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_COLUMN);
        // Flatten comma-separated skills into individual suggestions
        $suggestions = [];
        foreach ($results as $row) {
            foreach (explode(',', $row) as $skill) {
                $skill = trim($skill);
                if ($skill && stripos($skill, $term) !== false) {
                    $suggestions[] = $skill;
                }
            }
        }
        return array_values(array_unique($suggestions));
    }
}
