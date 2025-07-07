<?php

require_once __DIR__ . '/../../core/Model.php';

class CVCertificates extends Model {
    protected $table = 'certificats';
    
    public function getCertificates($cvId) {
        $sql = "SELECT * FROM {$this->table} 
                WHERE id_cv = :cv_id 
                ORDER BY id ASC";
        $stmt = $this->execute($sql, [':cv_id' => $cvId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function saveCertificates($cvId, $certificatesData) {
        // First, delete existing certificate entries for this CV
        $this->deleteCertificates($cvId);
        
        // Then insert new entries
        $insertedIds = [];
        foreach ($certificatesData as $index => $certificate) {
            if (!empty($certificate['nom_certificat'])) {
                $insertedIds[] = $this->createCertificateEntry($cvId, $certificate);
            }
        }
        
        return $insertedIds;
    }
    
    private function createCertificateEntry($cvId, $data) {
        $sql = "INSERT INTO {$this->table} (
            id_cv, nom_certificat, date_certificat, organisme, lieu, description
        ) VALUES (
            :cv_id, :nom_certificat, :date_certificat, :organisme, :lieu, :description
        )";
        
        $this->execute($sql, [
            ':cv_id' => $cvId,
            ':nom_certificat' => $data['nom_certificat'] ?? '',
            ':date_certificat' => $data['date_certificat'] ?? '',
            ':organisme' => $data['organisme'] ?? '',
            ':lieu' => $data['lieu'] ?? '',
            ':description' => $data['description'] ?? ''
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function deleteCertificates($cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id_cv = :cv_id";
        return $this->execute($sql, [':cv_id' => $cvId]);
    }
    
    public function deleteCertificateEntry($id, $cvId) {
        $sql = "DELETE FROM {$this->table} WHERE id = :id AND id_cv = :cv_id";
        return $this->execute($sql, [':id' => $id, ':cv_id' => $cvId]);
    }
}
