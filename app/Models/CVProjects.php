<?php

require_once __DIR__ . '/../../core/Model.php';

class CVProjects extends Model {
    protected $table = 'cv_projects';
    
    public function getProjects($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE cv_id = :cv_id AND user_id = :user_id 
                ORDER BY sort_order ASC, id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveProjects($cvId, $userId, $projectsData) {
        // First, delete existing project entries for this CV
        $this->deleteProjects($cvId, $userId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($projectsData as $index => $project) {
            if (!empty($project['project_name'])) {
                $insertedIds[] = $this->createProjectEntry($cvId, $userId, $project, $index);
            }
        }
        
        return $insertedIds;
    }
    
    private function createProjectEntry($cvId, $userId, $data, $sortOrder) {
        $sql = "INSERT INTO {$this->table} (
            user_id, cv_id, project_name, project_link, 
            project_description, sort_order
        ) VALUES (
            :user_id, :cv_id, :project_name, :project_link,
            :project_description, :sort_order
        )";
        
        $this->execute($sql, [
            ':user_id' => $userId,
            ':cv_id' => $cvId,
            ':project_name' => $data['project_name'] ?? '',
            ':project_link' => $data['project_link'] ?? '',
            ':project_description' => $data['project_description'] ?? '',
            ':sort_order' => $sortOrder
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteProjects($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
    }
    
    public function updateProjectsOrder($cvId, $userId, $projectIds) {
        foreach ($projectIds as $index => $projectId) {
            $sql = "UPDATE {$this->table} SET sort_order = :sort_order 
                    WHERE id = :id AND cv_id = :cv_id AND user_id = :user_id";
            $this->execute($sql, [
                ':sort_order' => $index,
                ':id' => $projectId,
                ':cv_id' => $cvId,
                ':user_id' => $userId
            ]);
        }
    }
}
