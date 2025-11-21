// src/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem("user")));

  const [activeTab, setActiveTab] = useState("home");
  const [stats, setStats] = useState({ users: 0, courses: 0, revenue: 0 });
  const [allUsers, setAllUsers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  // NEW: Messages State
  const [messages, setMessages] = useState([]);

  // Filters
  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [sortUser, setSortUser] = useState("newest");
  const [searchCourse, setSearchCourse] = useState("");
  const [sortCourse, setSortCourse] = useState("revenue");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });

  useEffect(() => {
    if (!user || (user.role !== "Admin" && user.role !== "Super Admin")) {
      navigate("/login");
    } else {
      fetchStats();
    }
  }, [user, navigate]);

  const fetchStats = () =>
    axios
      .get("http://localhost:3001/admin/stats")
      .then((res) => setStats(res.data));
  const fetchUsers = () =>
    axios
      .get("http://localhost:3001/users")
      .then((res) => setAllUsers(res.data));
  const fetchCourses = () =>
    axios
      .get("http://localhost:3001/courses")
      .then((res) => setAllCourses(res.data));
  // NEW: Fetch Messages
  const fetchMessages = () =>
    axios
      .get("http://localhost:3001/admin/messages")
      .then((res) => setMessages(res.data));

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    if (activeTab === "courses") fetchCourses();
    if (activeTab === "inbox") fetchMessages(); // Fetch on tab switch
  }, [activeTab]);

  // ... (Filtering Logic same as before) ...
  const filteredUsers = allUsers
    .filter((u) => {
      const term = searchUser.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u._id.toLowerCase().includes(term)
      );
    })
    .filter((u) => filterRole === "All" || u.role === filterRole)
    .sort((a, b) => {
      if (sortUser === "newest")
        return new Date(b.joinDate) - new Date(a.joinDate);
      if (sortUser === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const filteredCourses = allCourses
    .filter((c) => {
      const term = searchCourse.toLowerCase();
      return (
        c.title.toLowerCase().includes(term) ||
        c.instructorName.toLowerCase().includes(term) ||
        c._id.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortCourse === "revenue") return b.revenue - a.revenue;
      if (sortCourse === "views") return b.views - a.views;
      if (sortCourse === "newest")
        return new Date(b.dateCreated) - new Date(a.dateCreated);
      return 0;
    });

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({ name: "", email: "", password: "", role: "Student" });
    setShowModal(true);
  };
  const openEditModal = (u) => {
    setIsEditing(true);
    setCurrentUserId(u._id);
    setFormData({ name: u.name, email: u.email, password: "", role: u.role });
    setShowModal(true);
  };
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (isEditing)
        await axios.put(
          `http://localhost:3001/admin/user/${currentUserId}`,
          formData
        );
      else await axios.post("http://localhost:3001/register", formData);
      setShowModal(false);
      fetchUsers();
      fetchStats();
      alert(isEditing ? "User updated!" : "User created!");
    } catch (err) {
      console.log(err);
      alert("Operation failed.");
    }
  };
  const handleDeleteUser = (id) => {
    if (window.confirm("Delete user?"))
      axios.delete(`http://localhost:3001/user/${id}`).then(() => {
        fetchUsers();
        fetchStats();
      });
  };
  const handleDeleteCourse = (id) => {
    if (window.confirm("Delete course?"))
      axios.delete(`http://localhost:3001/course/${id}`).then(() => {
        fetchCourses();
        fetchStats();
      });
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div
          className="sidebar-info"
          style={{ border: "none", textAlign: "center" }}
        >
          <div
            className="profile-img-placeholder"
            style={{ margin: "0 auto 1rem" }}
          >
            A
          </div>
          <h3>Admin Panel</h3>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            className={`hero-btn ${
              activeTab === "home" ? "" : "btn-primary-outline"
            }`}
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => setActiveTab("home")}
          >
            📊 Overview
          </button>
          <button
            className={`hero-btn ${
              activeTab === "users" ? "" : "btn-primary-outline"
            }`}
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => setActiveTab("users")}
          >
            👥 Manage Users
          </button>
          <button
            className={`hero-btn ${
              activeTab === "courses" ? "" : "btn-primary-outline"
            }`}
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => setActiveTab("courses")}
          >
            📚 Manage Courses
          </button>
          {/* NEW INBOX BUTTON */}
          <button
            className={`hero-btn ${
              activeTab === "inbox" ? "" : "btn-primary-outline"
            }`}
            style={{ width: "100%", textAlign: "left" }}
            onClick={() => setActiveTab("inbox")}
          >
            📩 Inbox
          </button>
        </div>
      </aside>

      <main className="main-content">
        {activeTab === "home" && (
          <div>
            <h1 style={{ color: "var(--color-text-primary)" }}>
              System Overview
            </h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginTop: "30px",
              }}
            >
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.users}</p>
              </div>
              <div className="stat-card">
                <h3>Total Courses</h3>
                <p className="stat-number">{stats.courses}</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p className="stat-number stat-number-money">
                  ${stats.revenue}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h1>User Management</h1>
              <button className="hero-btn" onClick={openCreateModal}>
                + New User
              </button>
            </div>
            <div className="dashboard-header">
              <input
                className="search-input"
                placeholder="Search..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
              <select
                className="filter-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Student">Student</option>
                <option value="Instructor">Instructor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="admin-table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <span
                          style={{
                            background: "var(--color-bg-tertiary)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          #{u._id.slice(-5).toUpperCase()}
                        </span>
                      </td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className="role-badge"
                          style={{
                            color:
                              u.role === "Super Admin"
                                ? "#d8b4fe"
                                : u.role === "Admin"
                                ? "#fca5a5"
                                : u.role === "Instructor"
                                ? "#fcd34d"
                                : "#93c5fd",
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                          }}
                        >
                          {/* EDIT BUTTON (Green) */}
                          <button
                            className="dashboard-btn btn-glow-green"
                            onClick={() => openEditModal(u)}
                          >
                            Edit
                          </button>

                          {/* DELETE BUTTON (Red) - Hidden for Super Admin */}
                          {u.role !== "Super Admin" && (
                            <button
                              className="dashboard-btn btn-glow-red"
                              onClick={() => handleDeleteUser(u._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div>
            <h1>Course Management</h1>
            <div className="dashboard-header">
              <input
                className="search-input"
                placeholder="Search..."
                value={searchCourse}
                onChange={(e) => setSearchCourse(e.target.value)}
              />
              <select
                className="filter-select"
                value={sortCourse}
                onChange={(e) => setSortCourse(e.target.value)}
              >
                <option value="revenue">Highest Revenue</option>
                <option value="views">Most Views</option>
              </select>
            </div>
            <div className="admin-table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Instructor</th>
                    <th>Price</th>
                    <th>Views</th>
                    <th>Revenue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <span
                          style={{
                            background: "var(--color-bg-tertiary)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          #{c._id.slice(-5).toUpperCase()}
                        </span>
                      </td>
                      <td>{c.title}</td>
                      <td>{c.instructorName}</td>
                      <td className="price">${c.price}</td>
                      <td>{c.views}</td>
                      <td className="price">${c.revenue}</td>
                      <td style={{ padding: "10px" }}>
                        <div style={{ display: "flex", gap: "10px" }}>
                          {/* PREVIEW BUTTON (Blue) */}
                          <button
                            className="dashboard-btn btn-glow-blue"
                            onClick={() =>
                              navigate(`/instructor-course-view/${c._id}`)
                            }
                          >
                            Preview
                          </button>

                          {/* DELETE BUTTON (Red) */}
                          <button
                            className="dashboard-btn btn-glow-red"
                            onClick={() => handleDeleteCourse(c._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEW: INBOX TAB */}
        {activeTab === "inbox" && (
          <div>
            <h1>Inbox (Contact Messages)</h1>
            <div className="admin-table-container">
              {messages.length === 0 ? (
                <p
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                  }}
                >
                  No messages yet.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((m) => (
                      <tr key={m._id}>
                        <td
                          style={{
                            fontSize: "12px",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {new Date(m.date).toLocaleDateString()}
                        </td>
                        <td>{m.name}</td>
                        <td>{m.email}</td>
                        <td style={{ fontWeight: "bold" }}>{m.subject}</td>
                        <td style={{ maxWidth: "300px" }}>{m.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? "Edit User" : "Create New User"}</h2>
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  className="form-control"
                  value={formData.name}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>{isEditing ? "New Password" : "Password"}</label>
                <input
                  className="form-control"
                  value={formData.password}
                  required={!isEditing}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  disabled={formData.role === "Super Admin"}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button
                  type="button"
                  className="btn-primary-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="hero-btn">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
