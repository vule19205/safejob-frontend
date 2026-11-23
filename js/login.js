const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

// An hien mat khau
togglePassword.addEventListener("click", function () {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";

    this.innerHTML = isPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
});

// Kiem tra thong tin dang nhap
loginForm.addEventListener("submit", function (event) {
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
        '<div class="alert alert-info">Giao diện đã sẵn sàng. Chức năng kết nối Backend sẽ được thực hiện ở bước tiếp theo.</div>';
});
