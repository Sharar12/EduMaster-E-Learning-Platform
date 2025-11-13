// src/InstructorDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function InstructorDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Tab State
  const [activeTab, setActiveTab] = useState("teaching");

  // Course Data
  const [createdCourses, setCreatedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Refresh User (For Profile Pic / Enrolled Courses)
    axios.get(`http://localhost:3001/user/${user._id}`).then((res) => {
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    });

    // Fetch Instructor's Created Courses
    axios
      .get(`http://localhost:3001/instructor-courses/${user._id}`)
      .then((res) => {
        setCreatedCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  // --- HANDLERS ---

  // 2. Profile Picture Upload
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

  // 3. Delete Account
  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      "WARNING: Deleting your account? \n\nNote: Your courses will remain on the platform but will no longer be linked to you. This cannot be undone."
    );

    if (confirmDelete) {
      axios.delete(`http://localhost:3001/user/${user._id}`).then((res) => {
        if (res.data.status === "Success") {
          alert("Account Deleted.");
          localStorage.removeItem("user");
          navigate("/");
          window.location.reload();
        }
      });
    }
  };

  // 4. Delete Course
  const handleDeleteCourse = (courseId) => {
    if (window.confirm("Delete this course permanently?")) {
      axios
        .delete(`http://localhost:3001/course/${courseId}`)
        .then((res) => {
          if (res.data.status === "Success") {
            alert("Course Deleted");
            setCreatedCourses(createdCourses.filter((c) => c._id !== courseId));
          }
        })
        .catch((err) => console.log(err));
    }
  };

  if (!user) return null;

  // Calc Stats
  const totalRevenue = createdCourses.reduce((acc, c) => acc + c.revenue, 0);
  const totalStudents = createdCourses.reduce((acc, c) => acc + c.enrolled, 0);
  const joinDate = user.joinDate
    ? new Date(user.joinDate).toLocaleDateString()
    : "N/A";

  // Filter Logic
  const filteredCreated = createdCourses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredEnrolled = (user.enrolledCourses || []).filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        {/* PROFILE PIC UPLOAD */}
        <div
          className="profile-upload-container"
          onClick={() => document.getElementById("instFileInput").click()}
        >
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
              className="profile-img-real"
              style={{ borderColor: "orange" }}
            />
          ) : (
            <div
              className="profile-img-placeholder"
              style={{ borderColor: "orange", color: "orange" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <input
            type="file"
            id="instFileInput"
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        <div className="sidebar-info">
          <p>
            <strong>Instructor ID</strong>
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
            <strong>Name</strong> {user.name}
          </p>
          <p>
            <strong>Role</strong>{" "}
            <span style={{ color: "orange", fontWeight: "bold" }}>
              Instructor
            </span>
          </p>
          <p>
            <strong>Date of Join</strong> {joinDate}
          </p>
        </div>

        <nav
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            className={`hero-btn ${
              activeTab === "teaching" ? "" : "btn-primary-outline"
            }`}
            style={{ width: "100%", textAlign: "left", borderRadius: "8px" }}
            onClick={() => setActiveTab("teaching")}
          >
            🎓 Teaching
          </button>
          <button
            className={`hero-btn ${
              activeTab === "learning" ? "" : "btn-primary-outline"
            }`}
            style={{ width: "100%", textAlign: "left", borderRadius: "8px" }}
            onClick={() => setActiveTab("learning")}
          >
            📚 Learning
          </button>
        </nav>

        {/* DELETE ACCOUNT */}
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

      {/* --- MAIN CONTENT --- */}
      <main className="main-content">
        {/* TAB 1: TEACHING */}
        {activeTab === "teaching" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ color: "var(--color-text-primary)" }}>
                Instructor Panel
              </h2>
              <button
                className="create-course-btn"
                onClick={() => navigate("/create-course")}
              >
                + Create New Course
              </button>
            </div>

            <div className="dashboard-header">
              <input
                className="search-input"
                placeholder="Search your courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div
                style={{
                  padding: "10px",
                  color: "var(--color-text-secondary)",
                }}
              >
                Total Revenue:{" "}
                <span className="price">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div>
              {loading ? (
                <p style={{ color: "white" }}>Loading data...</p>
              ) : createdCourses.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "80px",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <div style={{ fontSize: "50px", marginBottom: "10px" }}>
                    📂
                  </div>
                  <h3>No Courses Created Yet</h3>
                  <p>You haven't created any courses yet.</p>
                  <p>Click the button above to get started.</p>
                </div>
              ) : (
                filteredCreated.map((course) => (
                  <div
                    key={course._id}
                    className="enrolled-card"
                    style={{ alignItems: "flex-start" }}
                  >
                    <img
                      src={course.thumbnail || "/assets/course-placeholder.jpg"}
                      alt={course.title}
                      style={{ height: "160px", backgroundColor: "#eee" }}
                    />

                    <div className="enrolled-details">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <h3 style={{ margin: 0 }}>{course.title}</h3>
                        <span className="price">${course.revenue} Earned</span>
                      </div>

                      <p
                        style={{
                          color: "var(--color-text-muted)",
                          fontSize: "13px",
                          margin: "5px 0",
                        }}
                      >
                        Created on:{" "}
                        {new Date(course.dateCreated).toLocaleDateString()}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          gap: "20px",
                          margin: "15px 0",
                          fontSize: "14px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        <span>📹 {course.videoCount} Videos</span>
                        <span>👁️ {course.views} Views</span>
                        <span>👥 {course.enrolled} Students</span>
                      </div>

                      {/* GLOWING BUTTONS */}
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          className="dashboard-btn btn-glow-blue"
                          onClick={() =>
                            navigate(`/instructor-course-view/${course._id}`)
                          }
                        >
                          Preview
                        </button>
                        <button
                          className="dashboard-btn btn-glow-green"
                          onClick={() => navigate(`/edit-course/${course._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="dashboard-btn btn-glow-red"
                          onClick={() => handleDeleteCourse(course._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LEARNING (Student View) */}
        {activeTab === "learning" && (
          <div>
            <h2
              style={{
                color: "var(--color-text-primary)",
                marginBottom: "20px",
              }}
            >
              My Learning
            </h2>
            <input
              className="search-input"
              placeholder="Search enrolled courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: "20px" }}
            />

            {filteredEnrolled.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "50px",
                  color: "var(--color-text-muted)",
                }}
              >
                <h3>You haven't enrolled in any courses yet.</h3>
                <button
                  className="btn-primary-outline"
                  style={{ marginTop: "10px" }}
                  onClick={() => navigate("/")}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              filteredEnrolled.map((course, index) => (
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
                      onClick={() =>
                        navigate(`/course-learn/${course.courseId}`)
                      }
                    >
                      {course.progress === 100
                        ? "Review / Certificate"
                        : "Continue Learning"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default InstructorDashboard;
