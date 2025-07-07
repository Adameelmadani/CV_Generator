<?php

require_once __DIR__ . '/../../core/Model.php';

class CVLanguages extends Model {
    protected $table = 'langues';
    
    public function getLanguages($cvId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE id_cv = :cv_id 
                ORDER BY id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveLanguages($cvId, $languagesData) {
        // First, delete existing language entries for this CV
        $this->deleteLanguages($cvId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($languagesData as $index => $language) {
            if (!empty($language['nom_langue']) && !empty($language['niveau'])) {
                $insertedIds[] = $this->createLanguageEntry($cvId, $language);
            }
        }
        
        return $insertedIds;
    }
    
    private function createLanguageEntry($cvId, $data) {
        $sql = "INSERT INTO {$this->table} (
            id_cv, nom_langue, niveau
        ) VALUES (
            :cv_id, :nom_langue, :niveau
        )";
        
        $this->execute($sql, [
            ':cv_id' => $cvId,
            ':nom_langue' => $data['nom_langue'] ?? '',
            ':niveau' => $data['niveau'] ?? ''
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteLanguages($cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id_cv = :cv_id";
        return $this->execute($sql, [':cv_id' => $cvId]);
    }
    
    public function deleteLanguageEntry($id, $cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id = :id AND id_cv = :cv_id";
        return $this->execute($sql, [':id' => $id, ':cv_id' => $cvId]);
    }
    
    public function getValidLanguageLevels() {
        return ['Native', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
    }
}
