<?php

require_once __DIR__ . '/../../core/Model.php';

class CVLanguages extends Model {
    protected $table = 'cv_languages';
    
    public function getLanguages($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE cv_id = :cv_id AND user_id = :user_id 
                ORDER BY sort_order ASC, id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveLanguages($cvId, $userId, $languagesData) {
        // First, delete existing language entries for this CV
        $this->deleteLanguages($cvId, $userId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($languagesData as $index => $language) {
            if (!empty($language['language_name']) && !empty($language['language_level'])) {
                $insertedIds[] = $this->createLanguageEntry($cvId, $userId, $language, $index);
            }
        }
        
        return $insertedIds;
    }
    
    private function createLanguageEntry($cvId, $userId, $data, $sortOrder) {
        $sql = "INSERT INTO {$this->table} (
            user_id, cv_id, language_name, language_level, sort_order
        ) VALUES (
            :user_id, :cv_id, :language_name, :language_level, :sort_order
        )";
        
        $this->execute($sql, [
            ':user_id' => $userId,
            ':cv_id' => $cvId,
            ':language_name' => $data['language_name'] ?? '',
            ':language_level' => $data['language_level'] ?? '',
            ':sort_order' => $sortOrder
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteLanguages($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
    }
    
    public function updateLanguagesOrder($cvId, $userId, $languageIds) {
        foreach ($languageIds as $index => $languageId) {
            $sql = "UPDATE {$this->table} SET sort_order = :sort_order 
                    WHERE id = :id AND cv_id = :cv_id AND user_id = :user_id";
            $this->execute($sql, [
                ':sort_order' => $index,
                ':id' => $languageId,
                ':cv_id' => $cvId,
                ':user_id' => $userId
            ]);
        }
    }
    
    public function getValidLanguageLevels() {
        return ['Native', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
    }
}
