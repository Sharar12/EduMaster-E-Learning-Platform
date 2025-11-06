// src/CourseLearning.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "./style.css";

function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // --- STATE ---
  const [course, setCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // GRANULAR TRACKING
  const [progress, setProgress] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState(new Set());
  const [passedQuizzes, setPassedQuizzes] = useState(new Set());
  const [viewCounted, setViewCounted] = useState(false);

  // UI Toggles
  const [showResources, setShowResources] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // --- 1. LOAD DATA & RESTORE STATE ---
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:3001/course/${courseId}`)
      .then((res) => {
        setCourse(res.data);

        axios
          .get(`http://localhost:3001/user/${user._id}`)
          .then((uRes) => {
            const freshUser = uRes.data;
            const enrolled = freshUser.enrolledCourses.find(
              (c) => c.courseId === courseId
            );

            if (enrolled) {
              setProgress(enrolled.progress);

              const vSet = new Set(enrolled.completedVideos || []);
              const qSet = new Set(enrolled.completedQuizzes || []);

              setWatchedVideos(vSet);
              setPassedQuizzes(qSet);
            }
          })
          .catch((err) => console.log("Error fetching user progress:", err));
      })
      .catch((err) => console.log("Error fetching course:", err));
  }, [courseId, navigate, user._id]);

  // --- 2. RESET VIEW COUNTER ON VIDEO CHANGE ---
  useEffect(() => {
    setViewCounted(false);
    setShowQuiz(false);
    setShowResources(false);
  }, [currentVideoIndex]);

  // --- 3. CALCULATE AND SAVE PROGRESS ---
  const updateGlobalProgress = useCallback(
    (newWatched, newPassed) => {
      if (!course) return;

      let totalSteps = 0;
      let completedSteps = 0;

      course.videos.forEach((video, index) => {
        totalSteps++;
        if (newWatched.has(index)) completedSteps++;

        if (video.quizzes.length > 0) {
          totalSteps++;
          if (newPassed.has(index)) completedSteps++;
        }
      });

      const newPercentage =
        totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
      setProgress(newPercentage);

      axios
        .post("http://localhost:3001/update-progress", {
          userId: user._id,
          courseId: courseId,
          progress: newPercentage,
          completedVideos: Array.from(newWatched),
          completedQuizzes: Array.from(newPassed),
        })
        .then(() => {
          const updatedUser = { ...user };
          const enrolled = updatedUser.enrolledCourses.find(
            (c) => c.courseId === courseId
          );
          if (enrolled) {
            enrolled.progress = newPercentage;
            enrolled.completedVideos = Array.from(newWatched);
            enrolled.completedQuizzes = Array.from(newPassed);
          }
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        });
    },
    [course, courseId, user]
  );

  // --- 4. HANDLERS ---
  const handleVideoEnd = () => {
    if (!watchedVideos.has(currentVideoIndex)) {
      const newWatched = new Set(watchedVideos);
      newWatched.add(currentVideoIndex);
      setWatchedVideos(newWatched);
      updateGlobalProgress(newWatched, passedQuizzes);
    }
  };

  const handleQuizSubmit = (e, videoIndex, correctAns) => {
    e.preventDefault();
    const selected = e.target.elements.option.value;

    if (selected === correctAns) {
      alert("Correct Answer! 🎉");

      if (!passedQuizzes.has(videoIndex)) {
        const newPassed = new Set(passedQuizzes);
        newPassed.add(videoIndex);
        setPassedQuizzes(newPassed);
        updateGlobalProgress(watchedVideos, newPassed);
      }
      setShowQuiz(false);
    } else {
      alert("Wrong Answer. Try again.");
    }
  };

  const handleVideoPlay = () => {
    if (!viewCounted) {
      axios
        .post(`http://localhost:3001/course/views/${courseId}`)
        .then(() => console.log("View counted +1"))
        .catch((err) => console.log(err));
      setViewCounted(true);
    }
  };

  const downloadCertificate = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 297, 210, "F");
    doc.setLineWidth(2);
    doc.setDrawColor(74, 144, 226);
    doc.rect(10, 10, 277, 190);
    doc.setFontSize(40);
    doc.setTextColor(44, 62, 80);
    doc.setFont("helvetica", "bold");
    doc.text("Certificate of Completion", 148, 50, { align: "center" });
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("This certificate is awarded to", 148, 80, { align: "center" });
    doc.setFontSize(35);
    doc.setTextColor(74, 144, 226);
    doc.setFont("helvetica", "bold");
    doc.text(user.name, 148, 105, { align: "center" });
    doc.setTextColor(0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("for successfully completing the course", 148, 130, {
      align: "center",
    });
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(course.title, 148, 155, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 148, 185, {
      align: "center",
    });
    doc.save(`${user.name}-Certificate.pdf`);
  };

  // --- RENDER ---
  if (!course)
    return <div style={{ color: "white", padding: "50px" }}>Loading...</div>;

  const currentVideo = course.videos[currentVideoIndex];

  // Check module status logic (internal only now, not displayed in header)
  const isVideoDone = watchedVideos.has(currentVideoIndex);
  const hasQuiz = currentVideo.quizzes.length > 0;
  const isQuizDone = passedQuizzes.has(currentVideoIndex);
  const isComplete = isVideoDone && (!hasQuiz || isQuizDone);

  return (
    <div className="learning-container">
      {/* --- LEFT: VIDEO PLAYER --- */}
      <div className="learning-main">
        <div className="video-wrapper">
          <video
            src={currentVideo.videoPath}
            controls
            key={currentVideo.videoPath}
            poster={currentVideo.thumbnailPath}
            onEnded={handleVideoEnd}
            onPlay={handleVideoPlay}
          />
        </div>

        <div className="lesson-controls">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* --- CLEAN HEADER: Just Title --- */}
            <div>
              <h2 style={{ margin: "0 0 10px 0" }}>{currentVideo.title}</h2>
            </div>

            {/* --- RIGHT: Global Progress --- */}
            <div style={{ textAlign: "right", minWidth: "200px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                  fontSize: "14px",
                }}
              >
                <span>Total Progress</span>
                <span>{progress}%</span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  background: "#444",
                  borderRadius: "4px",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "#27ae60",
                    borderRadius: "4px",
                    transition: "width 0.5s",
                  }}
                ></div>
              </div>
              {progress === 100 && (
                <button
                  className="hero-btn"
                  style={{
                    marginTop: "15px",
                    padding: "8px 15px",
                    fontSize: "13px",
                    background: "#f1c40f",
                    color: "#333",
                    fontWeight: "bold",
                  }}
                  onClick={downloadCertificate}
                >
                  🏆 Download Certificate
                </button>
              )}
            </div>
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
                📂 Resources
              </button>
            )}

            {hasQuiz && (
              <button
                className={`btn-primary-outline ${
                  showQuiz ? "active-btn" : ""
                }`}
                style={{
                  borderColor: isQuizDone ? "#27ae60" : "#e74c3c",
                  color: isQuizDone ? "#27ae60" : "#e74c3c",
                }}
                onClick={() => {
                  setShowQuiz(!showQuiz);
                  setShowResources(false);
                }}
              >
                {isQuizDone ? "✔ Quiz Passed" : "❓ Take Quiz"}
              </button>
            )}
          </div>

          {/* PANELS */}
          {showResources && currentVideo.resources.length > 0 && (
            <div className="resource-panel">
              <h4>Downloadable Materials</h4>
              {currentVideo.resources.map((res, i) => (
                <div key={i} style={{ padding: "10px" }}>
                  <a
                    href={res.filePath}
                    download
                    target="_blank"
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
                <form
                  key={i}
                  onSubmit={(e) =>
                    handleQuizSubmit(e, currentVideoIndex, quiz.correctAns)
                  }
                >
                  <p style={{ fontWeight: "bold" }}>Q: {quiz.question}</p>
                  <div style={{ margin: "10px 0" }}>
                    {quiz.options.map((opt, idx) => (
                      <div key={idx}>
                        <label>
                          <input
                            type="radio"
                            name="option"
                            value={opt}
                            required
                          />{" "}
                          {opt}
                        </label>
                      </div>
                    ))}
                  </div>
                  {!isQuizDone && (
                    <button
                      type="submit"
                      className="hero-btn"
                      style={{ padding: "6px 20px" }}
                    >
                      Submit Answer
                    </button>
                  )}
                  {isQuizDone && (
                    <p style={{ color: "green", fontWeight: "bold" }}>
                      You have already passed this quiz!
                    </p>
                  )}
                </form>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- SIDEBAR --- */}
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

        {course.videos.map((video, index) => {
          const vDone = watchedVideos.has(index);
          const qExists = video.quizzes.length > 0;
          const qDone = passedQuizzes.has(index);
          const isComplete = vDone && (!qExists || qDone);

          return (
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
                  <span style={{ color: vDone ? "#2ecc71" : "#95a5a6" }}>
                    Video
                  </span>
                  {qExists && (
                    <span style={{ color: qDone ? "#2ecc71" : "#e74c3c" }}>
                      {" "}
                      + Quiz
                    </span>
                  )}
                </div>
              </div>
              {isComplete && (
                <span style={{ color: "#2ecc71", fontSize: "18px" }}>✔</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CourseLearning;
