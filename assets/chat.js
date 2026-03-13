const chatWindow = document.getElementById('chatWindow');
const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const typingIndicator = document.getElementById('typingIndicator');

// Bật/tắt Chatbox
function toggleChat() {
    if (chatWindow.style.display === 'flex') {
        chatWindow.style.display = 'none';
    } else {
        chatWindow.style.display = 'flex';
        chatInput.focus();
    }
}

// Bắt sự kiện ấn phím Enter
function handleEnter(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

// Xử lý gửi tin nhắn
function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;

    // 1. In tin nhắn của người dùng ra màn hình
    appendMessage(message, 'user');
    chatInput.value = '';

    // 2. Hiện hiệu ứng "Bot đang gõ..."
    chatBody.appendChild(typingIndicator); // Đưa typing xuống cuối cùng
    typingIndicator.style.display = 'flex';
    scrollToBottom();

    // 3. Xử lý phản hồi tự động sau 1 giây (để trông có vẻ thật hơn)
    setTimeout(() => {
        typingIndicator.style.display = 'none';
        const botResponse = getBotResponse(message.toLowerCase());
        appendMessage(botResponse, 'bot');
    }, 1000);
}

// Hàm tạo cục tin nhắn HTML
function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', sender);
    msgDiv.innerHTML = text;

    // Chèn tin nhắn vào trước cái typing indicator
    chatBody.insertBefore(msgDiv, typingIndicator);
    scrollToBottom();
}

// Hàm cuộn xuống tin nhắn mới nhất
function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
}

// BỘ NÃO CỦA CHATBOT (Nhận diện từ khóa)
function getBotResponse(text) {
    if (text.includes('giá') || text.includes('phòng') || text.includes('bao nhiêu')) {
        return "Dạ, hệ thống phòng bên em bắt đầu từ <strong>900.000đ/đêm</strong> đối với phòng Standard. Quý khách có thể truy cập mục <a href='room.html'>Phòng & Giá</a> ở thanh menu để xem chi tiết hình ảnh và giá từng loại phòng nhé!";
    }
    if (text.includes('địa chỉ') || text.includes('ở đâu')) {
        return "Dạ, Luxury Hotel nằm tại địa chỉ: <strong>123 Đường Biển, Thành phố Nghỉ Dưỡng, Việt Nam</strong>. Khách sạn cách sân bay chỉ 15 phút di chuyển ạ.";
    }
    if (text.includes('dịch vụ') || text.includes('tiện ích') || text.includes('ăn sáng')) {
        return "Khách sạn cung cấp đầy đủ dịch vụ chuẩn 5 sao bao gồm: Hồ bơi vô cực, Spa & Massage, Nhà hàng sao Michelin và Buffet sáng miễn phí cho mọi hạng phòng cao cấp ạ.";
    }
    if (text.includes('chào') || text.includes('hello') || text.includes('hi')) {
        return "Dạ em chào quý khách! Em có thể giúp gì cho kỳ nghỉ sắp tới của quý khách ạ?";
    }
    // Mặc định nếu bot không hiểu
    return "Dạ em chưa hiểu ý của quý khách lắm. Quý khách vui lòng để lại Số Điện Thoại, lễ tân bên em sẽ gọi lại tư vấn trực tiếp, hoặc quý khách có thể gọi Hotline <strong>1900 1234</strong> nhé!";
}