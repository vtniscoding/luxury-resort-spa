  document.addEventListener('DOMContentLoaded', function () {
            
            // 1. LẤY DỮ LIỆU TỪ TRANG ROOM.HTML TRUYỀN SANG
            const roomName = localStorage.getItem('selectedRoomName') || 'Phòng Deluxe Hướng Biển';
            const pricePerNight = parseInt(localStorage.getItem('selectedRoomPrice')) || 1500000;
            const roomImg = localStorage.getItem('selectedRoomImg') || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80';
            
            let finalTotalAmountForAPI = 0; // Biến lưu số tiền thực (số nguyên) để gửi API

            document.getElementById('summaryName').innerText = roomName;
            document.getElementById('summaryImg').src = roomImg;

            // 2. DOM Elements
            const checkinInput = document.getElementById('checkinInput');
            const checkoutInput = document.getElementById('checkoutInput');
            const payButton = document.getElementById('payButton');
            const ccDetails = document.getElementById('cardDetails');
            const checkoutForm = document.getElementById('checkoutForm');
            
            const qrModal = new bootstrap.Modal(document.getElementById('momoQrModal'));
            const successModal = new bootstrap.Modal(document.getElementById('paymentSuccessModal'));

            // Format tiền & ngày
            const formatVND = (number) => number.toLocaleString('vi-VN') + '₫';
            const formatDateForInput = (date) => {
                let d = new Date(date), month = '' + (d.getMonth() + 1), day = '' + d.getDate();
                if (month.length < 2) month = '0' + month;
                if (day.length < 2) day = '0' + day;
                return [d.getFullYear(), month, day].join('-');
            };
            const formatDateForDisplay = (dateStr) => {
                const [year, month, day] = dateStr.split('-');
                return `${day}/${month}/${year}`;
            };

            // Set ngày mặc định (Hôm nay & Ngày mai)
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            checkinInput.value = formatDateForInput(today);
            checkinInput.min = formatDateForInput(today);
            checkoutInput.value = formatDateForInput(tomorrow);
            checkoutInput.min = formatDateForInput(tomorrow);

            // 3. HÀM TÍNH TOÁN HÓA ĐƠN AUTO
            const updateCalculation = () => {
                const start = new Date(checkinInput.value);
                const end = new Date(checkoutInput.value);

                let nights = Math.ceil((end - start) / (1000 * 3600 * 24));
                if (nights <= 0) nights = 1;

                const roomTotal = pricePerNight * nights;
                const tax = roomTotal * 0.1;
                finalTotalAmountForAPI = roomTotal + tax;

                document.getElementById('summaryCheckin').innerText = formatDateForDisplay(checkinInput.value);
                document.getElementById('summaryCheckout').innerText = formatDateForDisplay(checkoutInput.value);
                document.getElementById('summaryNightsText').innerText = `(${nights} đêm)`;
                document.getElementById('summaryPrice').innerText = formatVND(roomTotal);
                document.getElementById('summaryTax').innerText = formatVND(tax);
                document.getElementById('summaryTotal').innerText = formatVND(finalTotalAmountForAPI);
                document.getElementById('momoTotalAmount').innerText = formatVND(finalTotalAmountForAPI);
            };

            // Lắng nghe sự thay đổi ngày tháng
            checkinInput.addEventListener('change', function () {
                if (checkinInput.value >= checkoutInput.value) {
                    let nextDay = new Date(checkinInput.value);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkoutInput.value = formatDateForInput(nextDay);
                }
                updateCalculation();
            });
            checkoutInput.addEventListener('change', updateCalculation);
            updateCalculation(); // Khởi chạy tính toán lần đầu

            // 4. LẮNG NGHE CHỌN PHƯƠNG THỨC THANH TOÁN (Ẩn/hiện Form Thẻ)
            document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'card') {
                        ccDetails.style.display = 'flex';
                        // Bật Required cho thẻ CC
                        document.getElementById('ccNumber').required = true;
                        document.getElementById('ccExpiry').required = true;
                        document.getElementById('ccCVV').required = true;
                    } else if (this.value === 'momo') {
                        ccDetails.style.display = 'none';
                        // Tắt Required cho thẻ CC để Form Validation đi qua được
                        document.getElementById('ccNumber').required = false;
                        document.getElementById('ccExpiry').required = false;
                        document.getElementById('ccCVV').required = false;
                    }
                });
            });

            // Hàm xử lý gọi API Đặt phòng chung
            const processBookingToDatabase = (methodName) => {
                const orderData = {
                    fullName: document.getElementById('fullName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    checkIn: checkinInput.value,
                    checkOut: checkoutInput.value,
                    roomName: roomName,
                    totalPrice: finalTotalAmountForAPI,
                    paymentMethod: methodName
                };

                fetch('api_checkout.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        qrModal.hide();
                        document.getElementById('bookingCodeDisplay').innerText = data.booking_code;
                        successModal.show();
                    } else {
                        alert("Lỗi từ hệ thống: " + data.message);
                        payButton.innerHTML = '<i class="bi bi-lock-fill me-2"></i> Xác Nhận & Thanh Toán';
                        payButton.disabled = false;
                        qrModal.hide();
                    }
                })
                .catch(error => {
                    console.error('Lỗi API:', error);
                    // Dành cho lúc bạn đang test file HTML tĩnh (Không chạy XAMPP)
                    qrModal.hide();
                    document.getElementById('bookingCodeDisplay').innerText = "DEMO-" + Math.floor(Math.random() * 100000);
                    successModal.show();
                    payButton.innerHTML = '<i class="bi bi-lock-fill me-2"></i> Xác Nhận & Thanh Toán';
                    payButton.disabled = false;
                });
            };

            // 5. XỬ LÝ SUBMIT FORM
            let isMomoProcessing = false;

            checkoutForm.addEventListener('submit', function (event) {
                event.preventDefault();

                // Validation HTML5 Bootstrap
                if (!checkoutForm.checkValidity()) {
                    event.stopPropagation();
                    checkoutForm.classList.add('was-validated');
                    return;
                }

                const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
                const paymentString = selectedMethod === 'card' ? 'Thẻ tín dụng' : 'Ví MoMo';

                if (selectedMethod === 'momo') {
                    // Nếu là MoMo -> Mở Pop-up QR
                    qrModal.show();
                    
                    // Giả lập khách hàng quét mã xong sau 4.5 giây (Tự động tắt Popup và gửi API)
                    if(!isMomoProcessing) {
                        isMomoProcessing = true;
                        setTimeout(() => {
                            if(document.getElementById('momoQrModal').classList.contains('show')) {
                                processBookingToDatabase(paymentString);
                            }
                            isMomoProcessing = false;
                        }, 4500);
                    }
                } else {
                    // Nếu là Thẻ tín dụng -> Đổi hiệu ứng nút bấm và gọi API ngay
                    payButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Đang xử lý giao dịch...';
                    payButton.disabled = true;
                    setTimeout(() => {
                        processBookingToDatabase(paymentString);
                    }, 1500); // Giả lập độ trễ khi connect cổng thanh toán thẻ
                }
            });
        });