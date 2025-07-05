<?php

require_once __DIR__ . '/../../core/Model.php';

class CVEducation extends Model {
    protected $table = 'cv_education';
    
    public function getEducation($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE cv_id = :cv_id AND user_id = :user_id 
                ORDER BY sort_order ASC, id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveEducation($cvId, $userId, $educationData) {
        // First, delete existing education entries for this CV
        $this->deleteEducation($cvId, $userId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($educationData as $index => $education) {
            if (!empty($education['education_degree']) || !empty($education['education_university'])) {
                $insertedIds[] = $this->createEducationEntry($cvId, $userId, $education, $index);
            }
        }
        
        return $insertedIds;
    }
    
    private function createEducationEntry($cvId, $userId, $data, $sortOrder) {
        $sql = "INSERT INTO {$this->table} (
            user_id, cv_id, education_degree, education_dates, 
            education_university, education_field, education_details, sort_order
        ) VALUES (
            :user_id, :cv_id, :education_degree, :education_dates,
            :education_university, :education_field, :education_details, :sort_order
        )";
        
        $this->execute($sql, [
            ':user_id' => $userId,
            ':cv_id' => $cvId,
            ':education_degree' => $data['education_degree'] ?? '',
            ':education_dates' => $data['education_dates'] ?? '',
            ':education_university' => $data['education_university'] ?? '',
            ':education_field' => $data['education_field'] ?? '',
            ':education_details' => $data['education_details'] ?? '',
            ':sort_order' => $sortOrder
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteEducation($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
    }
    
    public function updateEducationOrder($cvId, $userId, $educationIds) {
        foreach ($educationIds as $index => $educationId) {
            $sql = "UPDATE {$this->table} SET sort_order = :sort_order 
                    WHERE id = :id AND cv_id = :cv_id AND user_id = :user_id";
            $this->execute($sql, [
                ':sort_order' => $index,
                ':id' => $educationId,
                ':cv_id' => $cvId,
                ':user_id' => $userId
            ]);
        }
    }
}
