// src/StudentDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function StudentDashboard() {
  const navigate = useNavigate();

  // 1. Initial State
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Local states for Search/Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // 2. Fetch Latest Data from DB on Mount
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch fresh user data (Progress, Profile Pic, Enrolled Courses)
    axios
      .get(`http://localhost:3001/user/${user._id}`)
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch((err) => console.log("Error refreshing user data", err));
  }, []);

  // --- HANDLERS ---

  // 3. Profile Picture Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);
    formData.append("userId", user._id);

    axios
      .post("http://localhost:3001/user/upload-pic", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        if (res.data.status === "Success") {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          alert("Profile Picture Updated!");
        }
      })
      .catch((err) => console.log(err));
  };

  // 4. Delete Account
  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "ARE YOU SURE? \n\nThis will permanently delete your account and progress. This action cannot be undone."
    );

    if (confirmDelete) {
      axios
        .delete(`http://localhost:3001/user/${user._id}`)
        .then((res) => {
          if (res.data.status === "Success") {
            alert("Account Deleted. Goodbye!");
            localStorage.removeItem("user");
            localStorage.removeItem("cart");
            navigate("/");
            window.location.reload();
          } else {
            alert(res.data.status);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  if (!user) return null;

  const joinDate = user.joinDate
    ? new Date(user.joinDate).toLocaleDateString()
    : "Not recorded";
  const courses = user.enrolledCourses || [];

  const filteredCourses = courses
    .filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((course) => {
      if (filterStatus === "All") return true;
      if (filterStatus === "Completed") return course.progress === 100;
      if (filterStatus === "Active") return course.progress < 100;
      return true;
    });

  return (
    <div className="dashboard-container">
      {/* --- LEFT PANEL (Sidebar) --- */}
      <aside className="sidebar">
        {/* PROFILE PIC UPLOAD */}
        <div
          className="profile-upload-container"
          onClick={() => document.getElementById("fileInput").click()}
        >
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
              className="profile-img-real"
            />
          ) : (
            <div className="profile-img-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <div className="sidebar-info">
          <p>
            <strong>Student ID</strong>
            <span
              style={{
                background: "var(--color-bg-tertiary)",
                padding: "3px 8px",
                borderRadius: "4px",
                fontWeight: "bold",
                fontSize: "12px",
                color: "var(--color-text-secondary)",
                marginLeft: "5px",
              }}
            >
              #{user._id.slice(-5).toUpperCase()}
            </span>
          </p>
          <p>
            <strong>Full Name</strong> {user.name}
          </p>
          <p>
            <strong>Email</strong> {user.email}
          </p>
          <p>
            <strong>Role</strong>{" "}
            <span style={{ color: "var(--color-accent)", fontWeight: "bold" }}>
              {user.role}
            </span>
          </p>
          <p>
            <strong>Enrolled Courses</strong> {courses.length}
          </p>
          <p>
            <strong>Date of Join</strong> {joinDate}
          </p>
        </div>

        {/* DELETE BUTTON */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "20px",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <button className="btn-danger-outline" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </aside>

      {/* --- RIGHT PANEL (Main Content) --- */}
      <main className="main-content">
        <div className="dashboard-header">
          <input
            type="text"
            className="search-input"
            placeholder="Search your courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select className="filter-select">
            <option>Sort by: Recent</option>
            <option>Sort by: Name</option>
          </select>
        </div>

        <div>
          <h2
            style={{ color: "var(--color-text-primary)", marginBottom: "20px" }}
          >
            My Enrolled Courses
          </h2>

          {courses.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                marginTop: "50px",
                color: "var(--color-text-muted)",
              }}
            >
              <p>You have not enrolled in any courses yet.</p>
              <p style={{ fontSize: "14px" }}>
                Go to the Course Catalog to start learning.
              </p>
            </div>
          ) : (
            filteredCourses.map((course, index) => (
              <div key={index} className="enrolled-card">
                <img src={course.thumbnail} alt={course.title} />
                <div className="enrolled-details">
                  <h3>{course.title}</h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginTop: "10px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="progress-container">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <button
                    className="hero-btn"
                    style={{ padding: "8px 20px", fontSize: "14px" }}
                    onClick={() => navigate(`/course-learn/${course.courseId}`)}
                  >
                    {course.progress === 100
                      ? "Review / Certificate"
                      : "Enter Course"}
                  </button>
                </div>
              </div>
            ))
          )}
          {filteredCourses.length === 0 && courses.length > 0 && (
            <p style={{ color: "gray" }}>No courses match.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
