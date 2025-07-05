<?php

require_once __DIR__ . '/../../core/Model.php';

class CVExperience extends Model {
    protected $table = 'cv_experience';
    
    public function getExperience($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE cv_id = :cv_id AND user_id = :user_id 
                ORDER BY sort_order ASC, id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveExperience($cvId, $userId, $experienceData) {
        // First, delete existing experience entries for this CV
        $this->deleteExperience($cvId, $userId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($experienceData as $index => $experience) {
            if (!empty($experience['experience_company']) || !empty($experience['experience_position'])) {
                $insertedIds[] = $this->createExperienceEntry($cvId, $userId, $experience, $index);
            }
        }
        
        return $insertedIds;
    }
    
    private function createExperienceEntry($cvId, $userId, $data, $sortOrder) {
        $sql = "INSERT INTO {$this->table} (
            user_id, cv_id, experience_location, experience_dates, 
            experience_company, experience_position, experience_description, sort_order
        ) VALUES (
            :user_id, :cv_id, :experience_location, :experience_dates,
            :experience_company, :experience_position, :experience_description, :sort_order
        )";
        
        $this->execute($sql, [
            ':user_id' => $userId,
            ':cv_id' => $cvId,
            ':experience_location' => $data['experience_location'] ?? '',
            ':experience_dates' => $data['experience_dates'] ?? '',
            ':experience_company' => $data['experience_company'] ?? '',
            ':experience_position' => $data['experience_position'] ?? '',
            ':experience_description' => $data['experience_description'] ?? '',
            ':sort_order' => $sortOrder
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteExperience($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
    }
    
    public function updateExperienceOrder($cvId, $userId, $experienceIds) {
        foreach ($experienceIds as $index => $experienceId) {
            $sql = "UPDATE {$this->table} SET sort_order = :sort_order 
                    WHERE id = :id AND cv_id = :cv_id AND user_id = :user_id";
            $this->execute($sql, [
                ':sort_order' => $index,
                ':id' => $experienceId,
                ':cv_id' => $cvId,
                ':user_id' => $userId
            ]);
        }
    }
}
