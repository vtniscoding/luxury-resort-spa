<?php
// Cho phép kết nối từ form HTML và nhận dữ liệu JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// THÔNG TIN KẾT NỐI (Giống với file api_admin.php của bạn)
$host = 'localhost';
$db   = 'luxury_hotel_db'; 
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Lỗi kết nối CSDL: ' . $e->getMessage()]);
    exit;
}

// Lấy dữ liệu JSON từ JavaScript (fetch) gửi lên
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    try {
        // Bắt đầu Transaction (Đảm bảo lưu đồng bộ cả User, Booking và Payment)
        $pdo->beginTransaction();

        // --- 1. XỬ LÝ KHÁCH HÀNG (Bảng users) ---
        // Do bảng users thiết lập email là UNIQUE, ta cần kiểm tra xem khách đã có tài khoản chưa
        $stmtCheckUser = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmtCheckUser->execute([$data['email']]);
        $userRow = $stmtCheckUser->fetch(PDO::FETCH_ASSOC);

        if ($userRow) {
            $user_id = $userRow['id']; // Khách cũ
        } else {
            // Khách mới -> Thêm vào DB
            $stmtUser = $pdo->prepare("INSERT INTO users (full_name, email, phone) VALUES (?, ?, ?)");
            $stmtUser->execute([$data['fullName'], $data['email'], $data['phone']]);
            $user_id = $pdo->lastInsertId();
        }

        // --- 2. TÌM PHÒNG TRỐNG (Bảng room_types & rooms) ---
        // Tìm ID của hạng phòng dựa vào tên phòng khách chọn
        $stmtType = $pdo->prepare("SELECT id FROM room_types WHERE name = ? LIMIT 1");
        $stmtType->execute([$data['roomName']]);
        $typeRow = $stmtType->fetch(PDO::FETCH_ASSOC);
        
        if (!$typeRow) throw new Exception("Lỗi: Không tìm thấy Hạng phòng này trong CSDL.");
        $room_type_id = $typeRow['id'];

        // Lấy ra 1 phòng cụ thể đang ở trạng thái 'Available' thuộc hạng phòng đó
        $stmtRoom = $pdo->prepare("SELECT id FROM rooms WHERE room_type_id = ? AND status = 'Available' LIMIT 1");
        $stmtRoom->execute([$room_type_id]);
        $roomRow = $stmtRoom->fetch(PDO::FETCH_ASSOC);

        if (!$roomRow) throw new Exception("Rất tiếc, loại phòng này hiện đã hết phòng trống.");
        $room_id = $roomRow['id'];

        // --- 3. LƯU ĐƠN ĐẶT PHÒNG (Bảng bookings) ---
        $booking_code = 'LUX-' . strtoupper(substr(md5(uniqid()), 0, 6)); // Tạo mã random
        // Lọc bỏ ký tự "₫" và dấu chấm để lấy đúng số tiền lưu vào DB
        $total_price = preg_replace('/[^0-9]/', '', $data['totalPrice']);

        $stmtBooking = $pdo->prepare("INSERT INTO bookings (booking_code, user_id, room_id, check_in_date, check_out_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')");
        $stmtBooking->execute([
            $booking_code,
            $user_id,
            $room_id,
            $data['checkIn'],
            $data['checkOut'],
            $total_price
        ]);
        $booking_id = $pdo->lastInsertId();

        // --- 4. LƯU LỊCH SỬ THANH TOÁN (Bảng payments) ---
        $stmtPayment = $pdo->prepare("INSERT INTO payments (booking_id, payment_method, amount, payment_status) VALUES (?, ?, ?, 'Success')");
        $stmtPayment->execute([
            $booking_id,
            $data['paymentMethod'],
            $total_price
        ]);

        // (Tùy chọn) Cập nhật trạng thái phòng thành Occupied (Đã có người)
        // $pdo->exec("UPDATE rooms SET status = 'Occupied' WHERE id = $room_id");

        // Hoàn tất lưu dữ liệu
        $pdo->commit();
        echo json_encode(['status' => 'success', 'booking_code' => $booking_code]);

    } catch (Exception $e) {
        $pdo->rollBack(); // Hủy bỏ thao tác nếu có lỗi xảy ra
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Không nhận được dữ liệu từ Frontend.']);
}
?>