// 1. GIAO DIỆN HTML CỦA 3 POPUP (Gói trong dấu backtick ` `)
const authModalsHTML = `
    <!-- Tự động chèn thư viện Bootstrap Icons cho mọi trang -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
    <style>
        /* Ẩn con mắt mặc định của trình duyệt để không bị đè lên icon tùy chỉnh */
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
            display: none !important;
        }
    </style>
    <!-- 1. POPUP ĐĂNG NHẬP -->
    <div class="modal fade" id="loginModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow-lg p-3">
                <div class="modal-header border-0 pb-0">
                    <h4 class="fw-bold mb-0" style="color: var(--secondary-color);">Đăng nhập</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="mb-3">
                            <label class="form-label text-muted fw-semibold">Email</label>
                            <input type="email" name="email" class="form-control form-input-theme" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted fw-semibold">Mật khẩu</label>
                            <div style="position: relative;">
                                <input type="password" id="loginPass" name="password" class="form-control form-input-theme" style="padding-right: 40px;" required>
                                <span style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6c757d; z-index: 10;" onclick="togglePassword('loginPass', this)">
                                    <i class="bi bi-eye-slash"></i>
                                </span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="rememberMe">
                                <label class="form-check-label text-muted small" for="rememberMe">Ghi nhớ tôi</label>
                            </div>
                            <a href="#" class="text-decoration-none small" style="color: var(--primary-color);" onclick="switchModal('loginModal', 'forgotModal')">Quên mật khẩu?</a>
                        </div>
                        <button type="submit" class="btn-custom btn-primary-theme w-100">Đăng nhập</button>
                    </form>
                    <div class="text-center mt-4 small">
                        Bạn chưa có tài khoản? <a href="#" class="text-decoration-none fw-bold" style="color: var(--primary-color);" onclick="switchModal('loginModal', 'registerModal')">Đăng ký ngay</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 2. POPUP ĐĂNG KÝ -->
    <div class="modal fade" id="registerModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow-lg p-3">
                <div class="modal-header border-0 pb-0">
                    <h4 class="fw-bold mb-0" style="color: var(--secondary-color);">Tạo tài khoản</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="registerForm">
                        <div class="mb-3">
                            <label class="form-label text-muted fw-semibold">Họ và tên</label>
                            <input type="text" name="full_name" class="form-control form-input-theme" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted fw-semibold">Số điện thoại</label>
                            <input type="tel" name="phone" class="form-control form-input-theme" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted fw-semibold">Email</label>
                            <input type="email" name="email" class="form-control form-input-theme" required>
                        </div>
                        <div class="mb-4">
                            <label class="form-label text-muted fw-semibold">Mật khẩu</label>
                            <div style="position: relative;">
                                <input type="password" id="regPass" name="password" class="form-control form-input-theme" style="padding-right: 40px;" required minlength="6">
                                <span style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #6c757d; z-index: 10;" onclick="togglePassword('regPass', this)">
                                    <i class="bi bi-eye-slash"></i>
                                </span>
                            </div>
                        </div>
                        <button type="submit" class="btn-custom btn-primary-theme w-100">Đăng ký</button>
                    </form>
                    <div class="text-center mt-4 small">
                        Đã có tài khoản? <a href="#" class="text-decoration-none fw-bold" style="color: var(--primary-color);" onclick="switchModal('registerModal', 'loginModal')">Đăng nhập</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 3. POPUP QUÊN MẬT KHẨU -->
    <div class="modal fade" id="forgotModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow-lg p-3">
                <div class="modal-header border-0 pb-0">
                    <h4 class="fw-bold mb-0" style="color: var(--secondary-color);">Khôi phục mật khẩu</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted small mb-4">Vui lòng nhập email của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
                    <form id="forgotForm">
                        <div class="mb-4">
                            <input type="email" class="form-control form-input-theme" placeholder="Nhập email đăng ký..." required>
                        </div>
                        <button type="submit" class="btn-custom btn-primary-theme w-100 mb-3">Gửi yêu cầu</button>
                    </form>
                    <div class="text-center small">
                        <a href="#" class="text-decoration-none fw-bold text-muted" onclick="switchModal('forgotModal', 'loginModal')"><i class="bi bi-arrow-left"></i> Quay lại đăng nhập</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

// 2. CÁC HÀM XỬ LÝ GIAO DIỆN
function switchModal(hideId, showId) {
    let hideModal = bootstrap.Modal.getInstance(document.getElementById(hideId));
    if (hideModal) hideModal.hide();
    let showModal = new bootstrap.Modal(document.getElementById(showId));
    showModal.show();
}

function togglePassword(inputId, iconSpan) {
    const input = document.getElementById(inputId);
    const icon = iconSpan.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('bi-eye-slash');
        icon.classList.add('bi-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('bi-eye');
        icon.classList.add('bi-eye-slash');
    }
}

function logoutUser() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    
    let formData = new FormData();
    formData.append('action', 'logout');
    fetch('api_auth.php', { method: 'POST', body: formData })
    .then(() => window.location.reload());
}

// 3. KHỞI CHẠY KHI TRANG TẢI XONG
document.addEventListener("DOMContentLoaded", function() {
    // 3.1. Chèn HTML của Modals vào cuối thẻ body
    document.body.insertAdjacentHTML('beforeend', authModalsHTML);

    // 3.2. Cập nhật Navbar nếu đã đăng nhập
    const authSection = document.getElementById('authSection');
    if (authSection && localStorage.getItem('isLoggedIn') === 'true') {
        const userName = localStorage.getItem('userName');
        authSection.innerHTML = `
            <span class="text-muted me-3">Chào, <strong style="color: var(--primary-color);">${userName}</strong></span>
            <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="logoutUser()">Đăng xuất</button>
        `;
    }

    // 3.3. Lắng nghe sự kiện Đăng ký
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let formData = new FormData(this);
        formData.append('action', 'register');
        fetch('api_auth.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                switchModal('registerModal', 'loginModal');
            } else alert('Lỗi: ' + data.message);
        });
    });

    // 3.4. Lắng nghe sự kiện Đăng nhập
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let formData = new FormData(this);
        formData.append('action', 'login');
        fetch('api_auth.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', data.full_name);
                localStorage.setItem('userRole', data.role);

                if(data.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.reload(); 
                }
            } else alert('Đăng nhập thất bại: ' + data.message);
        });
    });

    // 3.5. Lắng nghe sự kiện Quên mật khẩu
    document.getElementById('forgotForm').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Nếu email tồn tại, hệ thống đã gửi liên kết khôi phục!');
        switchModal('forgotModal', 'loginModal');
    });
});