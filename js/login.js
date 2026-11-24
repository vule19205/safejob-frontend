
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

const API_URL = "https://safejob-85eu.onrender.com/api/login";

// An hien mat khau
togglePassword.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";

    this.innerHTML = isPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
});

// Dang nhap
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;
    const message = document.getElementById("loginMessage");

    message.innerHTML = "";

    if (!email || !password) {
        message.innerHTML =
            '<div class="alert alert-warning">Vui lòng nhập đầy đủ thông tin!</div>';
        return;
    }

    message.innerHTML =
        '<div class="alert alert-info">Đang kiểm tra tài khoản...</div>';

    try {
        const formData = new URLSearchParams();

        formData.append("email", email);
        formData.append("password", password);

        const response = await fetch(API_URL, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            message.innerHTML =
                '<div class="alert alert-success">Đăng nhập thành công! Đang chuyển trang...</div>';

            const role = result.user.role;

            setTimeout(function () {
                if (role === "admin") {
                    window.location.href = "admin.html";
                } else if (role === "employer") {
                    window.location.href = "employer.html";
                } else {
                    window.location.href = "index.html";
                }
            }, 1000);

        } else {
            message.innerHTML =
                '<div class="alert alert-danger">' +
                (result.message || "Email hoặc mật khẩu không chính xác!") +
                '</div>';
        }

    } catch (error) {
        console.error("Loi dang nhap:", error);

        message.innerHTML =
            '<div class="alert alert-danger">Không thể kết nối máy chủ. Vui lòng thử lại!</div>';
    }
});
