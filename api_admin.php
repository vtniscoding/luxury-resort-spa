<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// Cấu hình CSDL (Thay đổi nếu dùng mật khẩu khác)
$host = 'localhost';
$db   = 'luxury_hotel_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Lỗi DB: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    // 1. DASHBOARD: Các con số tổng quát
    case 'dashboard_stats':
        $stats = [];
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM bookings");
        $stats['total_bookings'] = $stmt->fetch()['total'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as available FROM rooms WHERE status = 'Available'");
        $stats['available_rooms'] = $stmt->fetch()['available'];
        
        $stmt = $pdo->query("SELECT SUM(total_price) as revenue FROM bookings WHERE status != 'Cancelled'");
        $stats['total_revenue'] = $stmt->fetch()['revenue'] ?? 0;
        
        echo json_encode($stats);
        break;

    // 2. DASHBOARD: Danh sách đặt phòng (Có chi tiết Trạng thái, Phòng, Tên)
    case 'get_recent_bookings':
        $stmt = $pdo->query("
            SELECT b.booking_code, u.full_name as customer_name, r.room_number, rt.name as room_type, 
                   DATE_FORMAT(b.check_in_date, '%d/%m/%Y') as check_in_date, 
                   DATE_FORMAT(b.check_out_date, '%d/%m/%Y') as check_out_date, 
                   COALESCE(p.payment_status, 'Pending') as payment_status
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            LEFT JOIN payments p ON b.id = p.booking_id
            ORDER BY b.created_at DESC LIMIT 20
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // 3. QUẢN LÝ PHÒNG: Lấy toàn bộ phòng
    case 'get_rooms':
        $stmt = $pdo->query("
            SELECT r.room_number, r.status, rt.name as type_name 
            FROM rooms r 
            JOIN room_types rt ON r.room_type_id = rt.id 
            ORDER BY r.room_number ASC
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // 4. ĐẶT PHÒNG: Lấy danh sách phòng TRỐNG để cho vào thẻ Select
    case 'get_available_rooms':
        $stmt = $pdo->query("
            SELECT r.id, r.room_number, rt.name, rt.base_price 
            FROM rooms r 
            JOIN room_types rt ON r.room_type_id = rt.id 
            WHERE r.status = 'Available'
            ORDER BY r.room_number ASC
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // 5. ĐẶT PHÒNG: Xử lý lưu đơn mới từ Admin
    case 'create_booking':
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            try {
                $pdo->beginTransaction();

                // Kiểm tra hoặc tạo User
                $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = ?");
                $stmtCheck->execute([$data['email']]);
                $user = $stmtCheck->fetch();

                if ($user) {
                    $user_id = $user['id'];
                } else {
                    $stmtUser = $pdo->prepare("INSERT INTO users (full_name, email, phone) VALUES (?, ?, ?)");
                    $stmtUser->execute([$data['name'], $data['email'], $data['phone']]);
                    $user_id = $pdo->lastInsertId();
                }

                // Tạo Booking
                $booking_code = 'LUX-' . strtoupper(substr(md5(uniqid()), 0, 6));
                $stmtBook = $pdo->prepare("INSERT INTO bookings (booking_code, user_id, room_id, check_in_date, check_out_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')");
                $stmtBook->execute([$booking_code, $user_id, $data['room_id'], $data['check_in'], $data['check_out'], $data['total']]);
                $booking_id = $pdo->lastInsertId();

                // Tạo Payment
                $stmtPay = $pdo->prepare("INSERT INTO payments (booking_id, payment_method, amount, payment_status) VALUES (?, 'Tại quầy', ?, ?)");
                $stmtPay->execute([$booking_id, $data['total'], $data['payment_status']]);

                // Đổi trạng thái phòng thành Occupied
                $pdo->exec("UPDATE rooms SET status = 'Occupied' WHERE id = " . intval($data['room_id']));

                $pdo->commit();
                echo json_encode(['status' => 'success', 'booking_code' => $booking_code]);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        }
        break;

    // 6. KHÁCH HÀNG: Lấy danh sách tài khoản
    case 'get_customers':
        $stmt = $pdo->query("
            SELECT id, full_name, email, phone, DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as created_at 
            FROM users 
            ORDER BY created_at DESC
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    default:
        echo json_encode(['error' => 'Hành động không hợp lệ']);
        break;
}
?>