// Địa chỉ API Backend Java
const API_URL = "https://safejob-85eu.onrender.com/api/jobs";
const SESSION_API = "https://safejob-85eu.onrender.com/api/session";
const LOGOUT_API = "https://safejob-85eu.onrender.com/logout";

let allJobs = [];

// Chuẩn hóa chữ để tìm kiếm dễ hơn
function normalizeText(text) {
    return (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();
}

// Kiểm tra trạng thái đăng nhập
async function checkLoginSession() {
    const authGuest = document.getElementById("authGuest");
    const authUser = document.getElementById("authUser");
    const userName = document.getElementById("userName");

    try {
        const response = await fetch(SESSION_API, {
            method: "GET",
            credentials: "include",
            cache: "no-store"
        });

        const result = await response.json();

        if (response.ok && result.success && result.loggedIn) {

            // Hiển thị tên người dùng
            if (userName) {
                userName.textContent =
                    result.user.fullName || "Người dùng";
            }

            // Ẩn nút đăng nhập và đăng ký
            if (authGuest) {
                authGuest.classList.add("d-none");
            }

            // Hiện khu vực tài khoản
            if (authUser) {
                authUser.classList.remove("d-none");
                authUser.classList.add("d-flex");
            }

        } else {
            showGuestMenu();
        }

    } catch (error) {
        console.error("Lỗi kiểm tra đăng nhập:", error);
        showGuestMenu();
    }
}

// Hiển thị menu khi chưa đăng nhập
function showGuestMenu() {
    const authGuest = document.getElementById("authGuest");
    const authUser = document.getElementById("authUser");

    if (authGuest) {
        authGuest.classList.remove("d-none");
    }

    if (authUser) {
        authUser.classList.remove("d-flex");
        authUser.classList.add("d-none");
    }
}

// Đăng xuất
async function logout() {
    const logoutBtn = document.getElementById("logoutBtn");

    try {
        if (logoutBtn) {
            logoutBtn.disabled = true;
            logoutBtn.textContent = "Đang đăng xuất...";
        }

        const response = await fetch(LOGOUT_API, {
            method: "GET",
            credentials: "include"
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert("Đăng xuất thành công!");

            // Cập nhật giao diện
            showGuestMenu();

            // Xóa tên người dùng đang hiển thị
            const userName = document.getElementById("userName");

            if (userName) {
                userName.textContent = "Người dùng";
            }

        } else {
            alert(result.message || "Đăng xuất không thành công.");
        }

    } catch (error) {
        console.error("Lỗi đăng xuất:", error);
        alert("Không thể kết nối Backend để đăng xuất.");

    } finally {
        if (logoutBtn) {
            logoutBtn.disabled = false;
            logoutBtn.textContent = "Đăng xuất";
        }
    }
}

// Lấy dữ liệu việc làm từ Backend
async function loadJobs() {
    const jobList = document.getElementById("jobList");
    const jobMessage = document.getElementById("jobMessage");

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Không thể kết nối Backend");
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error("Không lấy được dữ liệu");
        }

        allJobs = result.data || [];
        displayJobs(allJobs);

    } catch (error) {
        console.error("Lỗi:", error);
        jobList.innerHTML = "";
        jobMessage.textContent =
            "Không thể tải danh sách việc làm. Vui lòng kiểm tra Backend.";
    }
}

// Hiển thị việc làm
function displayJobs(jobs) {
    const jobList = document.getElementById("jobList");
    const jobMessage = document.getElementById("jobMessage");

    jobList.innerHTML = "";
    jobMessage.textContent = "";

    if (jobs.length === 0) {
        jobMessage.textContent = "Không tìm thấy việc làm phù hợp.";
        return;
    }

    jobs.forEach(job => {
        const col = document.createElement("div");
        col.className = "col-lg-4 col-md-6";

        const card = document.createElement("div");
        card.className = "job-card";

        const title = document.createElement("h5");
        title.textContent = job.title || "Chưa có tiêu đề";

        const company = document.createElement("p");
        company.className = "job-company";
        company.textContent = job.companyname || "Chưa cập nhật công ty";

        const location = document.createElement("p");
        location.textContent = "📍 " + (job.location || "Chưa cập nhật");

        const salary = document.createElement("p");
        salary.textContent = "💰 " + (job.salary || "Thỏa thuận");

        const type = document.createElement("span");
        type.className = "job-type";
        type.textContent = job.jobtype || "Chưa cập nhật";

        card.append(title, company, location, salary, type);
        col.appendChild(card);
        jobList.appendChild(col);
    });
}

// Tìm kiếm việc làm gần đúng
function searchJobs() {
    const keyword = normalizeText(
        document.getElementById("keyword").value
    );

    const location = normalizeText(
        document.getElementById("location").value
    );

    const filteredJobs = allJobs.filter(job => {
        const title = normalizeText(job.title);
        const company = normalizeText(job.companyname);
        const jobLocation = normalizeText(job.location);
        const jobType = normalizeText(job.jobtype);

        const matchKeyword =
            !keyword ||
            title.includes(keyword) ||
            company.includes(keyword) ||
            jobType.includes(keyword);

        const matchLocation =
            !location ||
            jobLocation.includes(location);

        return matchKeyword && matchLocation;
    });

    displayJobs(filteredJobs);

    document.getElementById("jobs").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Khởi chạy khi trang được tải
document.addEventListener("DOMContentLoaded", function() {

    // Tải danh sách việc làm
    loadJobs();

    // Kiểm tra tài khoản đăng nhập
    checkLoginSession();

    // Gắn sự kiện đăng xuất
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    // Nhấn Enter ở ô từ khóa để tìm kiếm
    document.getElementById("keyword").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            searchJobs();
        }
    });

    // Nhấn Enter ở ô địa điểm để tìm kiếm
    document.getElementById("location").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            searchJobs();
        }
    });
});
