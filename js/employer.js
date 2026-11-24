
const API_URL = "https://safejob-85eu.onrender.com";
const SESSION_API = API_URL + "/api/session";
const JOB_API = API_URL + "/api/admin/jobs";
const LOGOUT_API = API_URL + "/logout";

const jobForm = document.getElementById("jobForm");
const jobTableBody = document.getElementById("jobTableBody");

// Hien thi thong bao
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);

    element.innerHTML = "";

    const alert = document.createElement("div");
    alert.className = "alert alert-" + type;
    alert.textContent = message;

    element.appendChild(alert);
}

// Chuyen du lieu thanh chu an toan
function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];
    });
}

// Kiem tra tai khoan Employer
async function checkEmployer() {
    try {
        const response = await fetch(SESSION_API, {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        const result = await response.json();

        if (!response.ok || !result.loggedIn ||
            !result.user || result.user.role !== "employer") {

            window.location.href = "login.html";
            return false;
        }

        const name = result.user.fullName || "Nhà tuyển dụng";

        document.getElementById("employerName").textContent = name;
        document.getElementById("welcomeName").textContent = name;

        return true;

    } catch (error) {
        console.error("Loi kiem tra tai khoan:", error);
        showMessage("jobMessage",
            "Không thể kiểm tra phiên đăng nhập. Vui lòng thử lại!",
            "danger");
        return false;
    }
}

// Tai danh sach tin tuyen dung
async function loadJobs() {
    jobTableBody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">Đang tải dữ liệu...</td>
        </tr>
    `;

    try {
        const response = await fetch(JOB_API, {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Không tải được danh sách tin!");
        }

        const jobs = result.jobs || [];

        updateStatistics(jobs);
        renderJobs(jobs);

    } catch (error) {
        console.error("Loi tai danh sach:", error);

        jobTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Không thể tải danh sách tin tuyển dụng.
                </td>
            </tr>
        `;
    }
}

// Cap nhat thong ke
function updateStatistics(jobs) {
    document.getElementById("totalJobs").textContent = jobs.length;

    document.getElementById("pendingJobs").textContent =
        jobs.filter(job => job.status === "Pending").length;

    document.getElementById("approvedJobs").textContent =
        jobs.filter(job => job.status === "Approved").length;

    document.getElementById("rejectedJobs").textContent =
        jobs.filter(job => job.status === "Rejected").length;
}

// Hien thi danh sach tin
function renderJobs(jobs) {
    if (jobs.length === 0) {
        jobTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Bạn chưa đăng tin tuyển dụng nào.
                </td>
            </tr>
        `;
        return;
    }

    jobTableBody.innerHTML = jobs.map(job => {
        let statusClass = "secondary";
        let statusText = job.status;

        if (job.status === "Pending") {
            statusClass = "warning";
            statusText = "Chờ duyệt";
        } else if (job.status === "Approved") {
            statusClass = "success";
            statusText = "Đã duyệt";
        } else if (job.status === "Rejected") {
            statusClass = "danger";
            statusText = "Bị từ chối";
        }

        return `
            <tr>
                <td>${escapeHTML(job.title)}</td>
                <td>${escapeHTML(job.companyname || job.companyName)}</td>
                <td>${escapeHTML(job.location)}</td>
                <td>
                    <span class="badge text-bg-${statusClass}">
                        ${escapeHTML(statusText)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1"
                        onclick="editJob(${Number(job.jobid || job.jobId)})">
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button class="btn btn-sm btn-outline-danger"
                        onclick="deleteJob(${Number(job.jobid || job.jobId)})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// Dang tin hoac cap nhat tin
jobForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const jobId = document.getElementById("jobId").value;

    const formData = new URLSearchParams();

    formData.append("title",
        document.getElementById("title").value.trim());

    formData.append("companyName",
        document.getElementById("companyName").value.trim());

    formData.append("location",
        document.getElementById("location").value.trim());

    formData.append("salary",
        document.getElementById("salary").value.trim());

    formData.append("jobType",
        document.getElementById("jobType").value);

    formData.append("contactEmail",
        document.getElementById("contactEmail").value.trim());

    formData.append("description",
        document.getElementById("description").value.trim());

    formData.append("requirements",
        document.getElementById("requirements").value.trim());

    if (jobId) {
        formData.append("jobid", jobId);
    }

    const submitButton = document.getElementById("submitJobBtn");

    submitButton.disabled = true;
    submitButton.textContent = "Đang xử lý...";

    try {
        const response = await fetch(JOB_API, {
            method: jobId ? "PUT" : "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showMessage(
                "formMessage",
                jobId
                    ? "Cập nhật tin thành công! Tin đang chờ Admin duyệt."
                    : "Đăng tin thành công! Tin đang chờ Admin duyệt.",
                "success"
            );

            resetForm();
            loadJobs();

        } else {
            showMessage(
                "formMessage",
                result.message || "Không thể lưu tin tuyển dụng!",
                "danger"
            );
        }

    } catch (error) {
        console.error("Loi luu tin:", error);

        showMessage(
            "formMessage",
            "Không thể kết nối máy chủ!",
            "danger"
        );

    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML =
            '<i class="bi bi-send"></i> Đăng tin tuyển dụng';
    }
});

// Chinh sua tin
async function editJob(jobId) {
    try {
        const response = await fetch(JOB_API, {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error("Không tải được dữ liệu!");
        }

        const job = (result.jobs || []).find(item =>
            Number(item.jobid || item.jobId) === Number(jobId)
        );

        if (!job) {
            showMessage("jobMessage", "Không tìm thấy tin tuyển dụng!", "danger");
            return;
        }

        document.getElementById("jobId").value = job.jobid || job.jobId;
        document.getElementById("title").value = job.title || "";
        document.getElementById("companyName").value =
            job.companyname || job.companyName || "";
        document.getElementById("location").value = job.location || "";
        document.getElementById("salary").value = job.salary || "";
        document.getElementById("jobType").value = job.jobtype || job.jobType || "";
        document.getElementById("contactEmail").value = job.contactemail || job.contactEmail || "";
        document.getElementById("description").value = job.description || "";
        document.getElementById("requirements").value = job.requirements || "";

        document.getElementById("formTitle").textContent = "Chỉnh sửa tin tuyển dụng";
        document.getElementById("submitJobBtn").innerHTML =
            '<i class="bi bi-save"></i> Lưu thay đổi';

        document.getElementById("cancelEditBtn").style.display = "inline-block";

        document.getElementById("jobFormSection").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        console.error(error);
        showMessage("jobMessage", "Không thể tải tin tuyển dụng!", "danger");
    }
}

// Xoa tin
async function deleteJob(jobId) {
    if (!confirm("Bạn có chắc chắn muốn xóa tin tuyển dụng này?")) {
        return;
    }

    const formData = new URLSearchParams();
    formData.append("jobid", jobId);

    try {
        const response = await fetch(JOB_API, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showMessage("jobMessage", "Đã xóa tin tuyển dụng!", "success");
            loadJobs();
        } else {
            showMessage(
                "jobMessage",
                result.message || "Xóa tin thất bại!",
                "danger"
            );
        }

    } catch (error) {
        console.error(error);
        showMessage("jobMessage", "Không thể kết nối máy chủ!", "danger");
    }
}

// Huy chinh sua
function resetForm() {
    jobForm.reset();

    document.getElementById("jobId").value = "";
    document.getElementById("formTitle").textContent =
        "Đăng tin tuyển dụng mới";

    document.getElementById("submitJobBtn").innerHTML =
        '<i class="bi bi-send"></i> Đăng tin tuyển dụng';

    document.getElementById("cancelEditBtn").style.display = "none";
}

// Dang xuat
async function logout() {
    try {
        await fetch(LOGOUT_API, {
            method: "GET",
            credentials: "include"
        });
    } catch (error) {
        console.error("Loi dang xuat:", error);
    }

    window.location.href = "login.html";
}

// Khoi tao trang
document.addEventListener("DOMContentLoaded", async function () {
    const isEmployer = await checkEmployer();

    if (!isEmployer) {
        return;
    }

    await loadJobs();

    document.getElementById("logoutBtn").addEventListener("click", logout);

    document.getElementById("refreshBtn").addEventListener("click", loadJobs);

    document.getElementById("cancelEditBtn").addEventListener("click", resetForm);
});
