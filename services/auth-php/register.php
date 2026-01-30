<?php
// register.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
    exit;
}

// Mock Registration Logic
// $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
// $hash = password_hash($data['password'], PASSWORD_DEFAULT);
// $stmt->execute([$data['name'], $data['email'], $hash]);

echo json_encode([
    'status' => 'success', 
    'message' => 'User registered successfully',
    'id' => rand(10, 1000)
]);
?>
