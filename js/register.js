
const REGISTER_API = "https://safejob-85eu.onrender.com/api/register";

const registerForm = document.getElementById("registerForm");
const messageBox = document.getElementById("message");
const registerButton = document.getElementById("registerButton");

// Hien thi thong bao
function showMessage(message, type) {
    messageBox.innerHTML = "";

    const alert = document.createElement("div");
    alert.className = "alert alert-" + type;
    alert.textContent = message;

    messageBox.appendChild(alert);
}

// An hien mat khau
document.querySelectorAll(".toggle-password").forEach(function(icon) {
    icon.addEventListener("click", function() {
        const input = document.getElementById(this.dataset.target);

        if (input.type === "password") {
            input.type = "text";
            this.classList.replace("bi-eye", "bi-eye-slash");
        } else {
            input.type = "password";
            this.classList.replace("bi-eye-slash", "bi-eye");
        }
    });
});

// Xu ly dang ky
registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;

    // Kiem tra du lieu
    if (!fullName || !email || !password || !confirmPassword) {
        showMessage("Vui long nhap day du thong tin!", "warning");
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Mat khau xac nhan khong khop!", "warning");
        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Đang đăng ký...";

    try {
        const formData = new URLSearchParams();

        formData.append("fullName", fullName);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("confirmPassword", confirmPassword);
        formData.append("role", role);

        const response = await fetch(REGISTER_API, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showMessage(
                "Đăng ký thành công! Đang chuyển đến trang đăng nhập...",
                "success"
            );

            registerForm.reset();

            setTimeout(function() {
                window.location.href = "login.html";
            }, 1500);

        } else {
            showMessage(
                result.message || "Đăng ký thất bại!",
                "danger"
            );
        }

    } catch (error) {
        console.error("Loi dang ky:", error);

        showMessage(
            "Không thể kết nối máy chủ. Vui lòng thử lại!",
            "danger"
        );

    } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Đăng ký tài khoản";
    }
});
