<?php

require_once __DIR__ . '/../../core/Model.php';

class CVEducation extends Model {
    protected $table = 'formations';
    
    public function getEducation($cvId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE id_cv = :cv_id 
                ORDER BY id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveEducation($cvId, $educationData) {
        // First, delete existing education entries for this CV
        $this->deleteEducation($cvId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($educationData as $index => $education) {
            if (!empty($education['diplome']) || !empty($education['universite'])) {
                $insertedIds[] = $this->createEducationEntry($cvId, $education);
            }
        }
        
        return $insertedIds;
    }
    
    private function createEducationEntry($cvId, $data) {
        $sql = "INSERT INTO {$this->table} (
            id_cv, diplome, dates, universite, specialite, description
        ) VALUES (
            :cv_id, :diplome, :dates, :universite, :specialite, :description
        )";
        
        $this->execute($sql, [
            ':cv_id' => $cvId,
            ':diplome' => $data['diplome'] ?? '',
            ':dates' => $data['dates'] ?? '',
            ':universite' => $data['universite'] ?? '',
            ':specialite' => $data['specialite'] ?? '',
            ':description' => $data['description'] ?? ''
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteEducation($cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id_cv = :cv_id";
        return $this->execute($sql, [':cv_id' => $cvId]);
    }
    
    public function deleteEducationEntry($id, $cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id = :id AND id_cv = :cv_id";
        return $this->execute($sql, [':id' => $id, ':cv_id' => $cvId]);
    }
}
