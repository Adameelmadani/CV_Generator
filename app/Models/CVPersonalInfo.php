<?php

require_once __DIR__ . '/../../core/Model.php';

class CVPersonalInfo extends Model {
    protected $table = 'cv_personal_info';
    
    public function getPersonalInfo($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        $stmt = $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function savePersonalInfo($data) {
        // Check if record exists
        $existing = $this->getPersonalInfo($data['cv_id'], $data['user_id']);
        
        if ($existing) {
            return $this->updatePersonalInfo($data);
        } else {
            return $this->createPersonalInfo($data);
        }
    }
    
    private function createPersonalInfo($data) {
        $sql = "INSERT INTO {$this->table} (
            user_id, cv_id, nom, prenom, location, email, telephone, 
            website, linkedin, github, photo_path
        ) VALUES (
            :user_id, :cv_id, :nom, :prenom, :location, :email, :telephone,
            :website, :linkedin, :github, :photo_path
        )";
        
        $this->execute($sql, [
            ':user_id' => $data['user_id'],
            ':cv_id' => $data['cv_id'],
            ':nom' => $data['nom'],
            ':prenom' => $data['prenom'],
            ':location' => $data['location'],
            ':email' => $data['email'],
            ':telephone' => $data['telephone'],
            ':website' => $data['website'] ?? null,
            ':linkedin' => $data['linkedin'] ?? null,
            ':github' => $data['github'] ?? null,
            ':photo_path' => $data['photo_path'] ?? null
        ]);
        
        return $this->db->lastInsertId();
    }
    
    private function updatePersonalInfo($data) {
        $sql = "UPDATE {$this->table} SET 
            nom = :nom, prenom = :prenom, location = :location, email = :email,
            telephone = :telephone, website = :website, linkedin = :linkedin,
            github = :github, photo_path = :photo_path, updated_at = CURRENT_TIMESTAMP
            WHERE cv_id = :cv_id AND user_id = :user_id";
        
        return $this->execute($sql, [
            ':user_id' => $data['user_id'],
            ':cv_id' => $data['cv_id'],
            ':nom' => $data['nom'],
            ':prenom' => $data['prenom'],
            ':location' => $data['location'],
            ':email' => $data['email'],
            ':telephone' => $data['telephone'],
            ':website' => $data['website'] ?? null,
            ':linkedin' => $data['linkedin'] ?? null,
            ':github' => $data['github'] ?? null,
            ':photo_path' => $data['photo_path'] ?? null
        ]);
    }
    
    public function deletePersonalInfo($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
    }
}
