<?php

require_once __DIR__ . '/../../core/Model.php';

class CVCustomization extends Model {
    protected $table = 'cv_customization';
    
    public function getCustomization($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        $stmt = $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function saveCustomization($data) {
        // Check if record exists
        $existing = $this->getCustomization($data['cv_id'], $data['user_id']);
        
        if ($existing) {
            return $this->updateCustomization($data);
        } else {
            return $this->createCustomization($data);
        }
    }
    
    private function createCustomization($data) {
        $sql = "INSERT INTO {$this->table} (
            user_id, cv_id, primary_color, download_format
        ) VALUES (
            :user_id, :cv_id, :primary_color, :download_format
        )";
        
        $this->execute($sql, [
            ':user_id' => $data['user_id'],
            ':cv_id' => $data['cv_id'],
            ':primary_color' => $data['primary_color'] ?? '#667eea',
            ':download_format' => $data['download_format'] ?? 'pdf'
        ]);
        
        return $this->db->lastInsertId();
    }
    
    private function updateCustomization($data) {
        $sql = "UPDATE {$this->table} SET 
                primary_color = :primary_color, 
                download_format = :download_format,
                updated_at = CURRENT_TIMESTAMP
                WHERE cv_id = :cv_id AND user_id = :user_id";
        
        return $this->execute($sql, [
            ':user_id' => $data['user_id'],
            ':cv_id' => $data['cv_id'],
            ':primary_color' => $data['primary_color'] ?? '#667eea',
            ':download_format' => $data['download_format'] ?? 'pdf'
        ]);
    }
    
    public function deleteCustomization($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
    }
    
    public function getValidDownloadFormats() {
        return ['pdf', 'xml', 'latex', 'all'];
    }
}
