<?php

require_once __DIR__ . '/../../core/Model.php';

class CVProjects extends Model {
    protected $table = 'projets';
    
    public function getProjects($cvId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE id_cv = :cv_id 
                ORDER BY id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveProjects($cvId, $projectsData) {
        // First, delete existing project entries for this CV
        $this->deleteProjects($cvId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($projectsData as $index => $project) {
            if (!empty($project['nom_projet'])) {
                $insertedIds[] = $this->createProjectEntry($cvId, $project);
            }
        }
        
        return $insertedIds;
    }
    
    private function createProjectEntry($cvId, $data) {
        $sql = "INSERT INTO {$this->table} (
            id_cv, nom_projet, lien_projet, description
        ) VALUES (
            :cv_id, :nom_projet, :lien_projet, :description
        )";
        
        $this->execute($sql, [
            ':cv_id' => $cvId,
            ':nom_projet' => $data['nom_projet'] ?? '',
            ':lien_projet' => $data['lien_projet'] ?? '',
            ':description' => $data['description'] ?? ''
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteProjects($cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id_cv = :cv_id";
        return $this->execute($sql, [':cv_id' => $cvId]);
    }
    
    public function deleteProjectEntry($id, $cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id = :id AND id_cv = :cv_id";
        return $this->execute($sql, [':id' => $id, ':cv_id' => $cvId]);
    }
}
