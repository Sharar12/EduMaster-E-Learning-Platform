// src/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function LandingPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    averageRating: 0,
    reviews: [],
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    axios.get("http://localhost:3001/courses").then((res) => {
      setCourses(res.data);
      setFilteredCourses(res.data);
    });
    axios
      .get("http://localhost:3001/home/stats")
      .then((res) => setStats(res.data));
  }, []);

  useEffect(() => {
    let result = [...courses];
    if (searchTerm)
      result = result.filter((c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (sortOption === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortOption === "price-high")
      result.sort((a, b) => b.price - a.price);
    else
      result.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
    setFilteredCourses(result);
  }, [searchTerm, sortOption, courses]);

  const getHeroLink = () => {
    if (!user) return "/register";
    if (user.role === "Admin" || user.role === "Super Admin")
      return "/dashboard/admin";
    if (user.role === "Instructor") return "/dashboard/instructor";
    return "/dashboard/student";
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3001/contact", contactForm)
      .then((res) => {
        if (res.data.status === "Success") {
          alert("Message sent to Admin!");
          setContactForm({ name: "", email: "", subject: "", message: "" });
        }
      })
      .catch((err) => alert("Failed to send message"));
  };

  return (
    <div className="landing-container">
      <header className="hero">
        <div className="hero-text">
          <h1>
            Master New Skills with{" "}
            <span style={{ color: "var(--color-accent)" }}>EduMaster</span>
          </h1>
          <p>
            Join {stats.students} learners on our platform. Access real-world
            knowledge from expert instructors.
          </p>
          <button className="hero-btn" onClick={() => navigate(getHeroLink())}>
            {user ? "Go to Dashboard" : "Get Started"}
          </button>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
            alt="Students"
          />
        </div>
      </header>

      {/* REAL STATS */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <h3>{stats.students}</h3>
            <p>Active Students</p>
          </div>
          <div className="stat-item">
            <h3>{stats.courses}</h3>
            <p>Quality Courses</p>
          </div>
          <div className="stat-item">
            <h3>{stats.averageRating}/5</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section id="courses" className="courses-section">
        <h2>Explore Our Courses</h2>
        <p style={{ marginBottom: "30px", color: "var(--color-text-muted)" }}>
          Browse our catalog.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            maxWidth: "800px",
            margin: "0 auto 40px auto",
            flexWrap: "wrap",
          }}
        >
          <input
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            style={{ width: "200px" }}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low</option>
            <option value="price-high">Price: High</option>
          </select>
        </div>
        <div className="course-grid">
          {filteredCourses.map((course) => (
            <div key={course._id} className="course-card">
              <img
                src={course.thumbnail || "/assets/placeholder.jpg"}
                alt={course.title}
              />
              <div className="course-info">
                <span
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    textTransform: "uppercase",
                  }}
                >
                  {course.instructorName}
                </span>
                <h3 style={{ margin: "10px 0", fontSize: "18px" }}>
                  {course.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ color: "#fbbf24" }}>★</span>
                  <span
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "13px",
                      marginLeft: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    {course.averageRating || "New"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "auto",
                  }}
                >
                  <span className="price">${course.price}</span>
                  <Link
                    to={`/course-details/${course._id}`}
                    className="btn-primary-outline"
                    style={{ fontSize: "14px", padding: "5px 15px" }}
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REAL REVIEWS (Replaces Fake Testimonials) */}
      {stats.reviews.length > 0 && (
        <section className="testimonials-section">
          <h2>What Students Say</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "3rem" }}>
            Real reviews from our courses.
          </p>
          <div className="testimonial-grid">
            {stats.reviews.map((rev, i) => (
              <div className="testimonial-card">
                <div className="user-profile">
                  {/* FEATURED REVIEW IMAGE */}
                  <div
                    className="user-avatar"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "var(--color-bg-tertiary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {rev.studentProfilePic ? (
                      <img
                        src={rev.studentProfilePic}
                        alt="User"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ color: "white", fontWeight: "bold" }}>
                        {rev.studentName.charAt(0)}
                      </span>
                    )}
                  </div>

                  <div>
                    <strong>{rev.studentName}</strong>
                    <p
                      style={{ fontSize: "12px", color: "var(--color-accent)" }}
                    >
                      {rev.courseTitle}
                    </p>
                  </div>
                </div>
                <div style={{ color: "#fbbf24", marginBottom: "10px" }}>
                  {"★".repeat(rev.rating)}
                </div>
                <p>"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTACT FORM */}
      <section className="contact-section">
        <h2>Contact Us</h2>
        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <input
              type="text"
              placeholder="Your Name"
              required
              value={contactForm.name}
              onChange={(e) =>
                setContactForm({ ...contactForm, name: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Your Email"
              required
              value={contactForm.email}
              onChange={(e) =>
                setContactForm({ ...contactForm, email: e.target.value })
              }
            />
          </div>
          <input
            type="text"
            placeholder="Subject"
            required
            value={contactForm.subject}
            onChange={(e) =>
              setContactForm({ ...contactForm, subject: e.target.value })
            }
          />
          <textarea
            rows="5"
            placeholder="Message"
            required
            value={contactForm.message}
            onChange={(e) =>
              setContactForm({ ...contactForm, message: e.target.value })
            }
          ></textarea>
          <button className="hero-btn" style={{ width: "100%" }}>
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}

export default LandingPage;
