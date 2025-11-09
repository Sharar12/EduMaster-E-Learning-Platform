// src/CourseDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const isEnrolled =
    user && user.enrolledCourses
      ? user.enrolledCourses.some((c) => c.courseId === id)
      : false;
  const isInstructor =
    user && user.role === "Instructor" && user._id === course?.instructorId;
  const isAdmin =
    user && (user.role === "Admin" || user.role === "Super Admin");

  useEffect(() => {
    axios
      .get(`http://localhost:3001/course/${id}`)
      .then((res) => {
        setCourse(res.data);
        setLoading(false);

        // PRE-FILL REVIEW IF EXISTS
        if (user && res.data.reviews) {
          const myReview = res.data.reviews.find(
            (r) => r.studentId === user._id
          );
          if (myReview) {
            setRating(myReview.rating);
            setComment(myReview.comment);
          }
        }
      })
      .catch((err) => console.log(err));
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      alert("Please Login to add items to cart.");
      navigate("/login");
      return;
    }
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.some((item) => item._id === course._id)) {
      alert("Item already in cart!");
      return;
    }
    cart.push(course);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    alert("Added to Cart!");
  };

  const submitReview = (e) => {
    e.preventDefault();
    axios
      .post(`http://localhost:3001/course/review/${id}`, {
        studentId: user._id,
        studentName: user.name,
        studentProfilePic: user.profilePic,
        rating: rating,
        comment: comment,
      })
      .then((res) => {
        alert("Review Saved!"); // Changed from "Submitted" to generic "Saved"
        setCourse(res.data.course);
        // Don't clear setComment("") here, so they can see what they just wrote
      })
      .catch((err) => alert("Failed to submit review"));
  };

  if (loading)
    return (
      <div style={{ padding: "50px", textAlign: "center", color: "white" }}>
        Loading...
      </div>
    );
  if (!course)
    return (
      <h2 style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Course not found
      </h2>
    );

  return (
    <div>
      <div className="course-detail-header">
        <div>
          <h1
            style={{
              fontSize: "36px",
              marginBottom: "10px",
              color: "var(--color-text-primary)",
            }}
          >
            {course.title}
          </h1>
          <p
            style={{
              fontSize: "18px",
              marginBottom: "20px",
              color: "var(--color-text-muted)",
            }}
          >
            {course.description.substring(0, 150)}...
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              fontSize: "14px",
              color: "var(--color-text-secondary)",
              alignItems: "center",
            }}
          >
            <span>
              👨‍🏫 Created by{" "}
              <strong style={{ color: "var(--color-text-primary)" }}>
                {course.instructorName}
              </strong>
            </span>
            <span>
              ⭐ {course.averageRating || "New"} ({course.reviews?.length || 0}{" "}
              reviews)
            </span>
            <span>
              📅 Last updated{" "}
              {new Date(course.dateCreated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="course-detail-container">
        <div className="detail-content">
          <div className="course-description-box">
            <h3>Description</h3>
            <p>{course.description}</p>
          </div>

          <h3
            style={{ color: "var(--color-text-primary)", marginBottom: "15px" }}
          >
            Course Content
          </h3>
          <div className="curriculum-list">
            {course.videos.map((video, index) => (
              <div key={index} className="video-list-item">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    Video {index + 1}:
                  </span>
                  <strong style={{ color: "var(--color-text-primary)" }}>
                    {video.title}
                  </strong>
                </div>
                {isEnrolled || isInstructor || isAdmin ? (
                  <span style={{ color: "#4ade80", fontSize: "0.9rem" }}>
                    Unlocked ✅
                  </span>
                ) : (
                  <span className="locked-icon">🔒 Locked</span>
                )}
              </div>
            ))}
          </div>

          {/* --- REVIEWS SECTION --- */}
          <div className="reviews-container">
            <h3
              style={{
                color: "var(--color-text-primary)",
                marginBottom: "20px",
              }}
            >
              Student Reviews
            </h3>

            {/* Review Form (Only if Enrolled) */}
            {isEnrolled && (
              <div className="review-form">
                <h4
                  style={{
                    color: "var(--color-text-primary)",
                    marginBottom: "10px",
                  }}
                >
                  Leave a Rating
                </h4>
                <form onSubmit={submitReview}>
                  <div style={{ marginBottom: "10px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star-input ${
                          star <= rating ? "active" : ""
                        }`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Write your experience..."
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      background: "var(--color-bg-secondary)",
                      color: "white",
                      marginBottom: "10px",
                    }}
                  ></textarea>
                  <button
                    className="hero-btn"
                    style={{ padding: "8px 20px", fontSize: "14px" }}
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List */}
            {course.reviews && course.reviews.length > 0 ? (
              course.reviews
                .slice()
                .reverse()
                .map((rev, i) => (
                  <div key={i} className="review-card">
                    <div
                      className="review-header"
                      style={{
                        alignItems: "center",
                        justifyContent: "flex-start",
                        gap: "15px",
                      }}
                    >
                      {/* REVIEWER IMAGE */}
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          background: "#333",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
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

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <strong
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {rev.studentName}
                          </strong>
                          <span className="star-display">
                            {"★".repeat(rev.rating)}
                            {"☆".repeat(5 - rev.rating)}
                          </span>
                        </div>
                        <small style={{ color: "var(--color-text-muted)" }}>
                          {new Date(rev.date).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.9rem",
                        marginTop: "10px",
                        marginLeft: "55px",
                      }}
                    >
                      {rev.comment}
                    </p>
                    <small style={{ color: "var(--color-text-muted)" }}>
                      {new Date(rev.date).toLocaleDateString()}
                    </small>
                  </div>
                ))
            ) : (
              <p style={{ color: "var(--color-text-muted)" }}>
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>
        </div>

        <aside className="detail-sidebar">
          <div className="buy-card">
            <img src={course.thumbnail} alt={course.title} />
            <h2
              className="price"
              style={{ fontSize: "32px", margin: "15px 0" }}
            >
              ${course.price}
            </h2>

            {isInstructor || isAdmin ? (
              <button
                className="btn-primary-outline"
                style={{ width: "100%", padding: "15px" }}
                onClick={() => navigate(`/edit-course/${course._id}`)}
              >
                Edit Course
              </button>
            ) : isEnrolled ? (
              <button
                className="hero-btn"
                style={{ width: "100%", padding: "15px" }}
                onClick={() => navigate("/dashboard/student")}
              >
                Go to Dashboard
              </button>
            ) : (
              <button
                className="add-to-cart-button"
                style={{ width: "100%", padding: "15px" }}
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            )}
            <p
              style={{
                fontSize: "12px",
                marginTop: "15px",
                color: "var(--color-text-muted)",
              }}
            >
              30-Day Money-Back Guarantee
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CourseDetails;
