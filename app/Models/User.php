<?php

require_once __DIR__ . '/../../core/Model.php';

class User extends Model {
    protected $table = 'users';
    
    public function findByEmail($email) {
        $sql = "SELECT * FROM {$this->table} WHERE email = :email";
        $stmt = $this->execute($sql, [':email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByUsername($username) {
        $sql = "SELECT * FROM {$this->table} WHERE username = :username";
        $stmt = $this->execute($sql, [':username' => $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByEmailOrUsername($email, $username) {
        $sql = "SELECT * FROM {$this->table} WHERE email = :email OR username = :username";
        $stmt = $this->execute($sql, [':email' => $email, ':username' => $username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function createUser($username, $email, $hashedPassword, $phoneNumber) {
        $sql = "INSERT INTO {$this->table} (username, email, hashed_password, phone_number) VALUES (:username, :email, :password, :phone_number)";
        $this->execute($sql, [
            ':username' => $username,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':phone_number' => $phoneNumber
        ]);
        return $this->db->lastInsertId();
    }
    
    public function verifyPassword($password, $hashedPassword) {
        return password_verify($password, $hashedPassword);
    }
    
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }
    
    public function validateUsername($username) {
        $errors = [];
        
        if (empty($username)) {
            $errors[] = 'Le nom d\'utilisateur est requis.';
        } elseif (strlen($username) < 3) {
            $errors[] = 'Le nom d\'utilisateur doit contenir au moins 3 caractères.';
        } elseif (strlen($username) > 30) {
            $errors[] = 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères.';
        } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            $errors[] = 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores.';
        }
        
        return $errors;
    }
    
    public function validateEmail($email) {
        $errors = [];
        
        if (empty($email)) {
            $errors[] = 'L\'email est requis.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Format d\'email invalide.';
        }
        
        return $errors;
    }
    
    public function validatePassword($password) {
        $errors = [];
        
        if (empty($password)) {
            $errors[] = 'Le mot de passe est requis.';
        } elseif (strlen($password) < 6) {
            $errors[] = 'Le mot de passe doit contenir au moins 6 caractères.';
        }
        
        return $errors;
    }
    
    public function getUserById($id) {
        $sql = "SELECT id, username, email, phone_number, created_at FROM {$this->table} WHERE id = :id";
        $stmt = $this->execute($sql, [':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function deleteUserByEmail($email) {
        $sql = "DELETE FROM {$this->table} WHERE email = :email";
        $stmt = $this->execute($sql, [':email' => $email]);
        return $stmt->rowCount() > 0;
    }
    
    public function findUserForPasswordReset($email, $phone) {
        // Vérifier que l'utilisateur existe avec l'email et le téléphone fournis
        $sql = "SELECT id, username, email FROM {$this->table} WHERE email = :email AND phone_number = :phone";
        $stmt = $this->execute($sql, [':email' => $email, ':phone' => $phone]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
