<?php

require_once __DIR__ . '/../../core/Model.php';

class CVPersonalInfo extends Model {
    protected $table = 'informations_personnelles';
    
    public function getPersonalInfo($cvId) {
        $sql = "SELECT * FROM {$this->table} WHERE id_cv = :cv_id";
        $stmt = $this->execute($sql, [':cv_id' => $cvId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function savePersonalInfo($data) {
        // Check if record exists
        $existing = $this->getPersonalInfo($data['cv_id']);
        
        if ($existing) {
            return $this->updatePersonalInfo($data);
        } else {
            return $this->createPersonalInfo($data);
        }
    }
    
    private function createPersonalInfo($data) {
        $sql = "INSERT INTO {$this->table} (
            id_cv, nom, prenom, localisation, email, telephone, 
            site_web, linkedin, github, chemin_photo
        ) VALUES (
            :cv_id, :nom, :prenom, :localisation, :email, :telephone,
            :site_web, :linkedin, :github, :chemin_photo
        )";
        
        $this->execute($sql, [
            ':cv_id' => $data['cv_id'],
            ':nom' => $data['nom'],
            ':prenom' => $data['prenom'],
            ':localisation' => $data['localisation'],
            ':email' => $data['email'],
            ':telephone' => $data['telephone'],
            ':site_web' => $data['site_web'] ?? null,
            ':linkedin' => $data['linkedin'] ?? null,
            ':github' => $data['github'] ?? null,
            ':chemin_photo' => $data['chemin_photo'] ?? null
        ]);
        
        return $this->db->lastInsertId();
    }
    
    private function updatePersonalInfo($data) {
        $sql = "UPDATE {$this->table} SET 
            nom = :nom, prenom = :prenom, localisation = :localisation, email = :email,
            telephone = :telephone, site_web = :site_web, linkedin = :linkedin,
            github = :github, chemin_photo = :chemin_photo
            WHERE id_cv = :cv_id";
        
        return $this->execute($sql, [
            ':cv_id' => $data['cv_id'],
            ':nom' => $data['nom'],
            ':prenom' => $data['prenom'],
            ':localisation' => $data['localisation'],
            ':email' => $data['email'],
            ':telephone' => $data['telephone'],
            ':site_web' => $data['site_web'] ?? null,
            ':linkedin' => $data['linkedin'] ?? null,
            ':github' => $data['github'] ?? null,
            ':chemin_photo' => $data['chemin_photo'] ?? null
        ]);
    }
    
    public function deletePersonalInfo($cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id_cv = :cv_id";
        return $this->execute($sql, [':cv_id' => $cvId]);
    }
}
