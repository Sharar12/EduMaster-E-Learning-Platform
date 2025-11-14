// src/InstructorCourseView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function InstructorCourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Check if user is logged in (generic check)
  const user = JSON.parse(localStorage.getItem("user"));

  // --- STATE ---
  const [course, setCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // UI Toggles
  const [showResources, setShowResources] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // --- 1. LOAD COURSE ONLY (No User Progress needed) ---
  useEffect(() => {
    if (
      !user ||
      (user.role !== "Instructor" &&
        user.role !== "Admin" &&
        user.role !== "Super Admin")
    ) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:3001/course/${courseId}`)
      .then((res) => {
        setCourse(res.data);
      })
      .catch((err) => console.log("Error fetching course:", err));
  }, [courseId, navigate, user]);

  // --- 2. RESET UI ON VIDEO CHANGE ---
  useEffect(() => {
    setShowQuiz(false);
    setShowResources(false);
  }, [currentVideoIndex]);

  // --- RENDER ---
  if (!course)
    return (
      <div style={{ color: "white", padding: "50px" }}>Loading Preview...</div>
    );

  const currentVideo = course.videos[currentVideoIndex];
  const hasQuiz = currentVideo.quizzes.length > 0;

  return (
    <div className="learning-container">
      {/* --- LEFT: VIDEO PLAYER --- */}
      <div className="learning-main">
        {/* BANNER FOR INSTRUCTOR */}
        <div
          style={{
            background: "#f1c40f",
            color: "black",
            textAlign: "center",
            padding: "5px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          👀 INSTRUCTOR PREVIEW MODE (Progress is not tracked)
        </div>

        <div className="video-wrapper">
          <video
            src={currentVideo.videoPath}
            controls
            key={currentVideo.videoPath}
            poster={currentVideo.thumbnailPath}
          />
        </div>

        <div className="lesson-controls">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ margin: 0 }}>{currentVideo.title}</h2>
            {/* NO PROGRESS BAR HERE */}
          </div>

          {/* Toggle Buttons */}
          <div style={{ marginTop: "25px", display: "flex", gap: "15px" }}>
            {currentVideo.resources.length > 0 && (
              <button
                className={`btn-primary-outline ${
                  showResources ? "active-btn" : ""
                }`}
                onClick={() => {
                  setShowResources(!showResources);
                  setShowQuiz(false);
                }}
              >
                📂 View Resources
              </button>
            )}

            {hasQuiz && (
              <button
                className={`btn-primary-outline ${
                  showQuiz ? "active-btn" : ""
                }`}
                onClick={() => {
                  setShowQuiz(!showQuiz);
                  setShowResources(false);
                }}
              >
                ❓ Preview Quiz
              </button>
            )}
          </div>

          {/* PANELS */}
          {showResources && currentVideo.resources.length > 0 && (
            <div className="resource-panel">
              <h4>Uploaded Materials</h4>
              {currentVideo.resources.map((res, i) => (
                <div key={i} style={{ padding: "10px" }}>
                  <a
                    href={res.filePath}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#4A90E2" }}
                  >
                    📄 {res.title}
                  </a>
                </div>
              ))}
            </div>
          )}

          {showQuiz && hasQuiz && (
            <div className="quiz-panel">
              {currentVideo.quizzes.map((quiz, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: "20px",
                    borderBottom: "1px solid #ccc",
                    paddingBottom: "10px",
                  }}
                >
                  <p style={{ fontWeight: "bold" }}>Q: {quiz.question}</p>
                  <div style={{ margin: "10px 0" }}>
                    {quiz.options.map((opt, idx) => (
                      <div key={idx} style={{ marginBottom: "5px" }}>
                        <span
                          style={{
                            color: opt === quiz.correctAns ? "green" : "black",
                            fontWeight:
                              opt === quiz.correctAns ? "bold" : "normal",
                          }}
                        >
                          {opt === quiz.correctAns ? "✅ " : "⚪ "} {opt}
                        </span>
                      </div>
                    ))}
                  </div>
                  <small style={{ color: "#666" }}>
                    Correct Answer: {quiz.correctAns}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- SIDEBAR (Simplified) --- */}
      <div className="learning-sidebar">
        <div
          style={{
            padding: "20px",
            background: "#222",
            borderBottom: "1px solid #444",
          }}
        >
          <h3>Course Content</h3>
        </div>

        {course.videos.map((video, index) => (
          <div
            key={index}
            className={`module-item ${
              currentVideoIndex === index ? "active" : ""
            }`}
            onClick={() => setCurrentVideoIndex(index)}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                {index + 1}. {video.title}
              </div>
              <div style={{ fontSize: "11px", opacity: 0.7 }}>
                <span>Video</span>
                {video.quizzes.length > 0 && <span> + Quiz</span>}
              </div>
            </div>
            {/* NO CHECKMARKS HERE */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InstructorCourseView;
