<?php

require_once __DIR__ . '/../../core/Model.php';

class CVCertificates extends Model {
    protected $table = 'cv_certificates';
    
    public function getCertificates($cvId, $userId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE cv_id = :cv_id AND user_id = :user_id 
                ORDER BY sort_order ASC, id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveCertificates($cvId, $userId, $certificatesData) {
        // First, delete existing certificate entries for this CV
        $this->deleteCertificates($cvId, $userId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($certificatesData as $index => $certificate) {
            if (!empty($certificate['certificate_name'])) {
                $insertedIds[] = $this->createCertificateEntry($cvId, $userId, $certificate, $index);
            }
        }
        
        return $insertedIds;
    }
    
    private function createCertificateEntry($cvId, $userId, $data, $sortOrder) {
        $sql = "INSERT INTO {$this->table} (
            user_id, cv_id, certificate_name, certificate_date, 
            certificate_issuer, certificate_location, certificate_description, sort_order
        ) VALUES (
            :user_id, :cv_id, :certificate_name, :certificate_date,
            :certificate_issuer, :certificate_location, :certificate_description, :sort_order
        )";
        
        $this->execute($sql, [
            ':user_id' => $userId,
            ':cv_id' => $cvId,
            ':certificate_name' => $data['certificate_name'] ?? '',
            ':certificate_date' => $data['certificate_date'] ?? '',
            ':certificate_issuer' => $data['certificate_issuer'] ?? '',
            ':certificate_location' => $data['certificate_location'] ?? '',
            ':certificate_description' => $data['certificate_description'] ?? '',
            ':sort_order' => $sortOrder
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteCertificates($cvId, $userId) {
        $sql = "DELETE FROM {$this->table} WHERE cv_id = :cv_id AND user_id = :user_id";
        return $this->execute($sql, [':cv_id' => $cvId, ':user_id' => $userId]);
    }
    
    public function updateCertificatesOrder($cvId, $userId, $certificateIds) {
        foreach ($certificateIds as $index => $certificateId) {
            $sql = "UPDATE {$this->table} SET sort_order = :sort_order 
                    WHERE id = :id AND cv_id = :cv_id AND user_id = :user_id";
            $this->execute($sql, [
                ':sort_order' => $index,
                ':id' => $certificateId,
                ':cv_id' => $cvId,
                ':user_id' => $userId
            ]);
        }
    }
}
