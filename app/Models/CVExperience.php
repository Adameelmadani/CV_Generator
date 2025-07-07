<?php

require_once __DIR__ . '/../../core/Model.php';

class CVExperience extends Model {
    protected $table = 'experiences';
    
    public function getExperience($cvId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE id_cv = :cv_id 
                ORDER BY id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveExperience($cvId, $experienceData) {
        // First, delete existing experience entries for this CV
        $this->deleteExperience($cvId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($experienceData as $index => $experience) {
            if (!empty($experience['entreprise']) || !empty($experience['poste'])) {
                $insertedIds[] = $this->createExperienceEntry($cvId, $experience);
            }
        }
        
        return $insertedIds;
    }
    
    private function createExperienceEntry($cvId, $data) {
        $sql = "INSERT INTO {$this->table} (
            id_cv, lieu, dates, entreprise, poste, description
        ) VALUES (
            :cv_id, :lieu, :dates, :entreprise, :poste, :description
        )";
        
        $this->execute($sql, [
            ':cv_id' => $cvId,
            ':lieu' => $data['lieu'] ?? '',
            ':dates' => $data['dates'] ?? '',
            ':entreprise' => $data['entreprise'] ?? '',
            ':poste' => $data['poste'] ?? '',
            ':description' => $data['description'] ?? ''
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteExperience($cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id_cv = :cv_id";
        return $this->execute($sql, [':cv_id' => $cvId]);
    }
    
    public function deleteExperienceEntry($id, $cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id = :id AND id_cv = :cv_id";
        return $this->execute($sql, [':id' => $id, ':cv_id' => $cvId]);
    }
}
