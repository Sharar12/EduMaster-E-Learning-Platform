// src/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/login", { email, password, role })
      .then((result) => {
        if (result.data.status === "Success") {
          // 1. Save to Storage
          localStorage.setItem("user", JSON.stringify(result.data.user));
          const user = result.data.user;

          // 2. Smart Redirect
          if (user.role === "Admin" || user.role === "Super Admin") {
            navigate("/dashboard/admin");
          } else if (user.role === "Instructor") {
            navigate("/dashboard/instructor");
          } else {
            navigate("/dashboard/student");
          }

          window.location.reload();
        } else {
          alert(result.data.status);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role">Login As</label>
            <select
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
              <option value="Admin">Admin</option>
              {/* NEW OPTION ADDED HERE */}
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-auth">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
