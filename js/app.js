
// Địa chỉ API Backend Java
const API_URL = "https://safejob-85eu.onrender.com/api/jobs";

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

// Nhấn Enter cũng tìm kiếm được
document.addEventListener("DOMContentLoaded", function() {
    loadJobs();

    document.getElementById("keyword").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            searchJobs();
        }
    });

    document.getElementById("location").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            searchJobs();
        }
    });
});
