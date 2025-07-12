<?php

require_once __DIR__ . '/../../core/Model.php';

class CVProfile extends Model {
    protected $table = 'profils';
    
    public function getProfile($cvId) {
        $sql = "SELECT * FROM {$this->table} WHERE id_cv = :cv_id";
        $stmt = $this->execute($sql, [':cv_id' => $cvId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function saveProfile($data) {
        // Check if record exists
        $existing = $this->getProfile($data['cv_id']);
        
        if ($existing) {
            return $this->updateProfile($data);
        } else {
            return $this->createProfile($data);
        }
    }
    
    private function createProfile($data) {
        $sql = "INSERT INTO {$this->table} (id_cv, description) 
                VALUES (:cv_id, :description)";
        
        $this->execute($sql, [
            ':cv_id' => $data['cv_id'],
            ':description' => $data['description']
        ]);
        
        return $this->db->lastInsertId();
    }
    
    private function updateProfile($data) {
        $sql = "UPDATE {$this->table} SET 
                description = :description
                WHERE id_cv = :cv_id";
        
        return $this->execute($sql, [
            ':cv_id' => $data['cv_id'],
            ':description' => $data['description']
        ]);
    }
    
    public function deleteProfile($cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id_cv = :cv_id";
        return $this->execute($sql, [':cv_id' => $cvId]);
    }

    public function getProfileSuggestions($term, $limit = 10) {
        $sql = "SELECT DISTINCT description FROM {$this->table} WHERE description LIKE :term AND description IS NOT NULL AND description != '' LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $likeTerm = "%$term%";
        $stmt->bindParam(':term', $likeTerm, PDO::PARAM_STR);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
