const API_URL = "https://safejob-85eu.onrender.com";

let allJobs = [];

// Kiểm tra quyền Admin
async function checkAdmin() {
    try {
        const response = await fetch(API_URL + "/api/session", {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        if (!response.ok) {
            alert("Vui lòng đăng nhập bằng tài khoản Admin!");
            window.location.href = "login.html";
            return false;
        }

        const data = await response.json();

        if (!data.success || data.user.role !== "admin") {
            alert("Bạn không có quyền truy cập trang Admin!");
            window.location.href = "index.html";
            return false;
        }

        document.getElementById("adminName").textContent =
            data.user.fullName;

        return true;

    } catch (error) {
        alert("Không thể kiểm tra phiên đăng nhập!");
        return false;
    }
}

// Tải danh sách tin tuyển dụng
async function loadJobs() {
    const table = document.getElementById("jobTable");

    table.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">Đang tải dữ liệu...</td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL + "/api/admin/jobs", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Không tải được dữ liệu");
        }

        allJobs = data.jobs || [];

        updateStatistics();
        renderJobs();

    } catch (error) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
    }
}

// Cập nhật thống kê
function updateStatistics() {
    document.getElementById("totalJobs").textContent = allJobs.length;

    document.getElementById("pendingJobs").textContent =
        allJobs.filter(job => job.status === "Pending").length;

    document.getElementById("approvedJobs").textContent =
        allJobs.filter(job => job.status === "Approved").length;
}

// Hiển thị danh sách tin
function renderJobs() {
    const table = document.getElementById("jobTable");

    const keyword = document.getElementById("searchInput")
        .value.toLowerCase();

    const status = document.getElementById("statusFilter").value;

    const filteredJobs = allJobs.filter(job => {
        const matchesKeyword =
            (job.title || "").toLowerCase().includes(keyword) ||
            (job.companyname || "").toLowerCase().includes(keyword);

        const matchesStatus = !status || job.status === status;

        return matchesKeyword && matchesStatus;
    });

    if (filteredJobs.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-secondary">
                    Không có tin tuyển dụng nào.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filteredJobs.map(job => {
        let statusBadge = "secondary";
        let statusText = job.status;

        if (job.status === "Pending") {
            statusBadge = "warning";
            statusText = "Chờ duyệt";
        } else if (job.status === "Approved") {
            statusBadge = "success";
            statusText = "Đã duyệt";
        } else if (job.status === "Rejected") {
            statusBadge = "danger";
            statusText = "Từ chối";
        }

        return `
            <tr>
                <td>${escapeHTML(job.jobid)}</td>
                <td class="fw-semibold">${escapeHTML(job.title)}</td>
                <td>${escapeHTML(job.companyname)}</td>
                <td>${escapeHTML(job.location)}</td>
                <td>
                    <span class="badge bg-${statusBadge}">
                        ${escapeHTML(statusText)}
                    </span>
                </td>
                <td>
                    ${job.status === "Pending" ? `
                        <button class="btn btn-success btn-sm mb-1"
                            onclick="updateJob(${Number(job.jobid)}, 'approve')">
                            Duyệt
                        </button>

                        <button class="btn btn-danger btn-sm mb-1"
                            onclick="updateJob(${Number(job.jobid)}, 'reject')">
                            Từ chối
                        </button>
                    ` : `
                        <span class="text-secondary small">Không có thao tác</span>
                    `}
                </td>
            </tr>
        `;
    }).join("");
}

// Duyệt hoặc từ chối tin tuyển dụng
async function updateJob(jobId, action) {
    let message = "";

    if (action === "approve") {
        message = "Bạn có chắc muốn duyệt tin tuyển dụng này?";
    } else {
        message = "Bạn có chắc muốn từ chối tin tuyển dụng này?";
    }

    if (!confirm(message)) return;

    try {
        const params = new URLSearchParams();
        params.append("jobid", jobId);
        params.append("action", action);

        const response = await fetch(API_URL + "/api/admin/jobs", {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: params.toString()
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Không thể cập nhật tin");
        }

        document.getElementById("message").innerHTML =
            `<div class="alert alert-success">Cập nhật thành công!</div>`;

        await loadJobs();

    } catch (error) {
        document.getElementById("message").innerHTML =
            `<div class="alert alert-danger">${escapeHTML(error.message)}</div>`;
    }
}

// Đăng xuất
async function logout() {
    try {
        await fetch(API_URL + "/logout", {
            method: "GET",
            credentials: "include"
        });
    } catch (error) {
        console.log(error);
    }

    window.location.href = "login.html";
}

// Làm sạch dữ liệu trước khi hiển thị
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Khởi chạy trang Admin
document.addEventListener("DOMContentLoaded", async function() {
    document.getElementById("searchInput")
        .addEventListener("input", renderJobs);

    document.getElementById("statusFilter")
        .addEventListener("change", renderJobs);

    document.getElementById("logoutBtn")
        .addEventListener("click", logout);

    const isAdmin = await checkAdmin();

    if (isAdmin) {
        loadJobs();
    }
});
