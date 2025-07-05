<?php

require_once __DIR__ . '/../../core/Model.php';

class CVProfile extends Model {
    protected $table = 'cv_profile';
    
    public function getProfile($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        $stmt = $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function saveProfile($data) {
        // Check if record exists
        $existing = $this->getProfile($data['cv_id'], $data['user_id']);
        
        if ($existing) {
            return $this->updateProfile($data);
        } else {
            return $this->createProfile($data);
        }
    }
    
    private function createProfile($data) {
        $sql = "INSERT INTO {$this->table} (user_id, cv_id, profil_description) 
                VALUES (:user_id, :cv_id, :profil_description)";
        
        $this->execute($sql, [
            ':user_id' => $data['user_id'],
            ':cv_id' => $data['cv_id'],
            ':profil_description' => $data['profil_description']
        ]);
        
        return $this->db->lastInsertId();
    }
    
    private function updateProfile($data) {
        $sql = "UPDATE {$this->table} SET 
                profil_description = :profil_description, 
                updated_at = CURRENT_TIMESTAMP
                WHERE cv_id = :cv_id AND user_id = :user_id";
        
        return $this->execute($sql, [
            ':user_id' => $data['user_id'],
            ':cv_id' => $data['cv_id'],
            ':profil_description' => $data['profil_description']
        ]);
    }
    
    public function deleteProfile($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
    }
}
