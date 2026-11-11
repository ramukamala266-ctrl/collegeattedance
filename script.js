
let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

const dateInput = document.getElementById("date");

function getToday() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000)
        .toISOString().split("T")[0];
}

dateInput.value = getToday();

function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("attendance", JSON.stringify(attendance));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Add student
function addStudent() {
    const roll = document.getElementById("roll").value.trim();
    const name = document.getElementById("name").value.trim();
    const course = document.getElementById("course").value.trim();

    if (!roll || !name || !course) {
        alert("Please fill all student details!");
        return;
    }

    if (students.some(s => s.roll.toLowerCase() === roll.toLowerCase())) {
        alert("Roll number already exists!");
        return;
    }

    students.push({ roll, name, course });

    saveData();

    document.getElementById("roll").value = "";
    document.getElementById("name").value = "";
    document.getElementById("course").value = "";

    renderStudents();
    alert("Student added successfully!");
}

// Mark attendance
function markAttendance(roll, status) {
    const date = dateInput.value;

    if (!date) {
        alert("Please select a date!");
        return;
    }

    if (!attendance[date]) {
        attendance[date] = {};
    }

    attendance[date][roll] = status;

    saveData();
    renderStudents();
}

// Calculate attendance percentage
function getPercentage(roll) {
    let present = 0;
    let total = 0;

    Object.values(attendance).forEach(day => {
        if (day[roll]) {
            total++;
            if (day[roll] === "Present") {
                present++;
            }
        }
    });

    return total ? Math.round((present / total) * 100) : 0;
}

// Display students
function renderStudents() {
    const list = document.getElementById("studentList");
    const search = document.getElementById("search").value.toLowerCase();
    const date = dateInput.value;

    const todayAttendance = attendance[date] || {};

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.roll.toLowerCase().includes(search) ||
        s.course.toLowerCase().includes(search)
    );

    list.innerHTML = filtered.map(s => {
        const status = todayAttendance[s.roll] || "Not Marked";

        return `
        <tr>
            <td>${escapeHTML(s.roll)}</td>
            <td>${escapeHTML(s.name)}</td>
            <td>${escapeHTML(s.course)}</td>
            <td>
                <button class="present"
                    onclick="markAttendance('${encodeURIComponent(s.roll)}','Present')">
                    Present
                </button>
                <button class="absent"
                    onclick="markAttendance('${encodeURIComponent(s.roll)}','Absent')">
                    Absent
                </button>
                <p>${escapeHTML(status)}</p>
            </td>
            <td>${getPercentage(s.roll)}%</td>
        </tr>
        `;
    }).join("");

    updateDashboard();
}

// Dashboard statistics
function updateDashboard() {
    const date = dateInput.value;
    const today = attendance[date] || {};

    const present = Object.values(today).filter(
        value => value === "Present"
    ).length;

    const absent = Object.values(today).filter(
        value => value === "Absent"
    ).length;

    document.getElementById("total").textContent = students.length;
    document.getElementById("presentCount").textContent = present;
    document.getElementById("absentCount").textContent = absent;
}

// Generate report
function showReport() {
    const report = document.getElementById("report");

    if (students.length === 0) {
        report.innerHTML = "<p>No students available.</p>";
        return;
    }

    report.innerHTML = `
        <h3>Attendance Report</h3>
        <div class="table-wrap">
        <table>
            <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Attendance %</th>
            </tr>
            ${students.map(s => `
                <tr>
                    <td>${escapeHTML(s.roll)}</td>
                    <td>${escapeHTML(s.name)}</td>
                    <td>${getPercentage(s.roll)}%</td>
                </tr>
            `).join("")}
        </table>
        </div>
    `;
}

// Change date
dateInput.addEventListener("change", renderStudents);

// Decode roll number before marking
const originalMarkAttendance = markAttendance;
markAttendance = function(roll, status) {
    originalMarkAttendance(decodeURIComponent(roll), status);
};

// Initial display
renderStudents();
