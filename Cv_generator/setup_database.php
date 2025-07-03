<?php
// Database setup script
try {
    $pdo = new PDO("mysql:host=localhost;dbname=cv_generator;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "✅ Connected to database<br>";
    
    // Check if user_cvs table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'user_cvs'");
    if ($stmt->rowCount() == 0) {
        echo "❌ Table 'user_cvs' does not exist. Creating it...<br>";
        
        // Create the table
        $createTableSQL = "
        CREATE TABLE user_cvs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            cv_name VARCHAR(255) NOT NULL,
            xml_content LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $pdo->exec($createTableSQL);
        echo "✅ Table 'user_cvs' created successfully<br>";
    } else {
        echo "✅ Table 'user_cvs' already exists<br>";
    }
    
    // Check if users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() == 0) {
        echo "❌ Table 'users' does not exist. Creating it...<br>";
        
        // Create users table
        $createUsersSQL = "
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            phone_number VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $pdo->exec($createUsersSQL);
        echo "✅ Table 'users' created successfully<br>";
    } else {
        echo "✅ Table 'users' already exists<br>";
    }
    
    // Show table structure
    echo "<h3>Table Structure for user_cvs:</h3>";
    $stmt = $pdo->query("DESCRIBE user_cvs");
    echo "<table border='1'>";
    echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    while ($row = $stmt->fetch()) {
        echo "<tr>";
        echo "<td>" . $row['Field'] . "</td>";
        echo "<td>" . $row['Type'] . "</td>";
        echo "<td>" . $row['Null'] . "</td>";
        echo "<td>" . $row['Key'] . "</td>";
        echo "<td>" . $row['Default'] . "</td>";
        echo "<td>" . $row['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
