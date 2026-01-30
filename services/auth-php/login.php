<?php
// login.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow CORS for demo
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing credentials']);
    exit;
}

$email = $data['email'];
$password = $data['password'];

// In a real app, you would fetch the user and verify the password hash
// $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
// $stmt->execute([$email]);
// $user = $stmt->fetch();

// Mock Authentication Logic
if ($email === 'demo@example.com' && $password === 'password123') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'token' => 'mock_jwt_token_' . time(),
        'user' => ['id' => 1, 'name' => 'Demo User', 'email' => $email]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
}
?>
