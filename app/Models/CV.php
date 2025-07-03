<?php

require_once __DIR__ . '/../../core/bootstrap.php';

class CV extends Model {
    protected $table = 'user_cvs';
    
    public function getUserCVs($userId) {
        $sql = "SELECT id, cv_name, xml_content, created_at, updated_at 
                FROM {$this->table} 
                WHERE user_id = :user_id 
                ORDER BY updated_at DESC";
        
        $stmt = $this->execute($sql, [':user_id' => $userId]);
        return $stmt->fetchAll();
    }
    
    public function getUserCV($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE id = :cv_id AND user_id = :user_id";
        
        $stmt = $this->execute($sql, [
            ':cv_id' => $cvId,
            ':user_id' => $userId
        ]);
        
        return $stmt->fetch();
    }
    
    public function createCV($userId, $cvName, $xmlContent) {
        $data = [
            ':user_id' => $userId,
            ':cv_name' => $cvName,
            ':xml_content' => $xmlContent,
            ':created_at' => date('Y-m-d H:i:s'),
            ':updated_at' => date('Y-m-d H:i:s')
        ];
        
        $sql = "INSERT INTO {$this->table} (user_id, cv_name, xml_content, created_at, updated_at) 
                VALUES (:user_id, :cv_name, :xml_content, :created_at, :updated_at)";
        
        $this->execute($sql, $data);
        return $this->db->lastInsertId();
    }
    
    public function updateCV($cvId, $userId, $cvName, $xmlContent) {
        $data = [
            ':cv_id' => $cvId,
            ':user_id' => $userId,
            ':cv_name' => $cvName,
            ':xml_content' => $xmlContent,
            ':updated_at' => date('Y-m-d H:i:s')
        ];
        
        $sql = "UPDATE {$this->table} 
                SET cv_name = :cv_name, xml_content = :xml_content, updated_at = :updated_at 
                WHERE id = :cv_id AND user_id = :user_id";
        
        return $this->execute($sql, $data);
    }
    
    public function deleteUserCV($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [
            ':cv_id' => $cvId,
            ':user_id' => $userId
        ]);
    }
    
    public function deleteAllUserCVs($userId) {
        $sql = "DELETE FROM {$this->table} WHERE user_id = :user_id";
        return $this->execute($sql, [
            ':user_id' => $userId
        ]);
    }
    
    public function getCVData($cvId, $userId) {
        $sql = "SELECT xml_content FROM {$this->table} 
                WHERE id = :cv_id AND user_id = :user_id";
        
        $stmt = $this->execute($sql, [
            ':cv_id' => $cvId,
            ':user_id' => $userId
        ]);
        
        $result = $stmt->fetch();
        return $result ? $result['xml_content'] : null;
    }
}
