<?php

require_once __DIR__ . '/../../core/Model.php';

class CVSkills extends Model {
    protected $table = 'cv_skills';
    
    public function getSkills($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE cv_id = :cv_id AND user_id = :user_id 
                ORDER BY sort_order ASC, id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveSkills($cvId, $userId, $skillsData) {
        // First, delete existing skill entries for this CV
        $this->deleteSkills($cvId, $userId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($skillsData as $index => $skill) {
            if (!empty($skill['skill_category']) || !empty($skill['skill_items'])) {
                $insertedIds[] = $this->createSkillEntry($cvId, $userId, $skill, $index);
            }
        }
        
        return $insertedIds;
    }
    
    private function createSkillEntry($cvId, $userId, $data, $sortOrder) {
        $sql = "INSERT INTO {$this->table} (
            user_id, cv_id, skill_category, skill_items, sort_order
        ) VALUES (
            :user_id, :cv_id, :skill_category, :skill_items, :sort_order
        )";
        
        $this->execute($sql, [
            ':user_id' => $userId,
            ':cv_id' => $cvId,
            ':skill_category' => $data['skill_category'] ?? '',
            ':skill_items' => $data['skill_items'] ?? '',
            ':sort_order' => $sortOrder
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteSkills($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
    }
    
    public function updateSkillsOrder($cvId, $userId, $skillIds) {
        foreach ($skillIds as $index => $skillId) {
            $sql = "UPDATE {$this->table} SET sort_order = :sort_order 
                    WHERE id = :id AND cv_id = :cv_id AND user_id = :user_id";
            $this->execute($sql, [
                ':sort_order' => $index,
                ':id' => $skillId,
                ':cv_id' => $cvId,
                ':user_id' => $userId
            ]);
        }
    }
}
