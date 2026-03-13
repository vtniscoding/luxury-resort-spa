<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
session_start();

$host = 'localhost';
$db   = 'luxury_hotel_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi DB: ' . $e->getMessage()]);
    exit;
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'register':
        $full_name = $_POST['full_name'];
        $phone = $_POST['phone'];
        $email = $_POST['email'];
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT); // Mã hóa mật khẩu bảo mật

        // Kiểm tra email trùng
        $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmtCheck->execute([$email]);
        if ($stmtCheck->rowCount() > 0) {
            echo json_encode(['status' => 'error', 'message' => 'Email này đã được sử dụng!']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, 'customer')");
            $stmt->execute([$full_name, $email, $phone, $password]);
            echo json_encode(['status' => 'success']);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Lỗi hệ thống khi tạo tài khoản.']);
        }
        break;

    case 'login':
        $email = $_POST['email'];
        $password = $_POST['password'];

        $stmt = $pdo->prepare("SELECT id, full_name, password, role FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Kiểm tra mật khẩu (hỗ trợ cả mk mã hóa và mk thuần để bạn dễ test Admin)
        if ($user && (password_verify($password, $user['password']) || $password === $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            
            echo json_encode([
                'status' => 'success', 
                'role' => $user['role'], 
                'full_name' => $user['full_name']
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Email hoặc mật khẩu không chính xác!']);
        }
        break;

    case 'logout':
        session_destroy(); // Xóa sạch session
        echo json_encode(['status' => 'success']);
        break;
        
    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
}
?>