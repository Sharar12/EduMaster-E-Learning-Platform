// src/CreateCourse.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function CreateCourse() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [basicInfo, setBasicInfo] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [courseThumbnail, setCourseThumbnail] = useState(null);
  const [videos, setVideos] = useState([
    { title: "", videoFile: null, thumbFile: null, resources: [], quizzes: [] },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- HANDLERS ---
  const handleVideoChange = (index, field, value) => {
    const updated = [...videos];
    updated[index][field] = value;
    setVideos(updated);
  };
  const addVideo = () =>
    setVideos([
      ...videos,
      {
        title: "",
        videoFile: null,
        thumbFile: null,
        resources: [],
        quizzes: [],
      },
    ]);
  const removeVideo = (i) => {
    const updated = [...videos];
    updated.splice(i, 1);
    setVideos(updated);
  };
  const addResource = (vIndex) => {
    const updated = [...videos];
    updated[vIndex].resources.push({ title: "", file: null });
    setVideos(updated);
  };
  const removeResource = (vIndex, rIndex) => {
    const updated = [...videos];
    updated[vIndex].resources.splice(rIndex, 1);
    setVideos(updated);
  };
  const addQuiz = (vIndex) => {
    const updated = [...videos];
    updated[vIndex].quizzes.push({ question: "", options: "", correctAns: "" });
    setVideos(updated);
  };
  const removeQuiz = (vIndex, qIndex) => {
    const updated = [...videos];
    updated[vIndex].quizzes.splice(qIndex, 1);
    setVideos(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    const courseData = {
      title: basicInfo.title,
      description: basicInfo.description,
      price: basicInfo.price,
      instructorId: user._id,
      instructorName: user.name,
      videos: videos.map((v) => ({
        title: v.title,
        resources: v.resources.map((r) => ({ title: r.title })),
        quizzes: v.quizzes.map((q) => ({
          question: q.question,
          options: q.options.split(","),
          correctAns: q.correctAns,
        })),
      })),
    };
    formData.append("courseData", JSON.stringify(courseData));
    if (courseThumbnail) formData.append("courseThumbnail", courseThumbnail);
    videos.forEach((video, vIndex) => {
      if (video.videoFile) formData.append(`video_${vIndex}`, video.videoFile);
      if (video.thumbFile)
        formData.append(`videoThumb_${vIndex}`, video.thumbFile);
      video.resources.forEach((res, rIndex) => {
        if (res.file) formData.append(`resource_${vIndex}_${rIndex}`, res.file);
      });
    });
    try {
      const res = await axios.post(
        "http://localhost:3001/add-course",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.status === "Success") {
        alert("Course Created!");
        navigate("/dashboard/instructor");
      }
    } catch (err) {
      console.log(err);
      alert("Failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="landing-container"
      style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ color: "var(--color-text-primary)" }}>
          Create New Course
        </h1>
        <button className="btn-primary-outline" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "30px" }}
      >
        <div
          className="auth-card"
          style={{ textAlign: "left", maxWidth: "100%", padding: "30px" }}
        >
          <h3
            style={{
              marginBottom: "20px",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "10px",
              color: "var(--color-text-primary)",
            }}
          >
            Basic Information
          </h3>
          <label>Course Title</label>
          <input
            className="form-control"
            placeholder="e.g., Python Bootcamp"
            required
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, title: e.target.value })
            }
          />
          <label style={{ marginTop: "15px", display: "block" }}>
            Description
          </label>
          <textarea
            className="form-control"
            rows="4"
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, description: e.target.value })
            }
          ></textarea>

          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            <div style={{ flex: 1 }}>
              <label>Price ($)</label>
              <input
                type="number"
                className="form-control"
                required
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, price: e.target.value })
                }
              />
            </div>

            {/* COURSE THUMBNAIL PREVIEW */}
            <div style={{ flex: 1 }}>
              <label>Thumbnail</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setCourseThumbnail(e.target.files[0])}
              />
              {courseThumbnail && (
                <div className="file-preview-container">
                  <img
                    src={URL.createObjectURL(courseThumbnail)}
                    alt="Preview"
                    className="file-preview-img"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {videos.map((video, vIndex) => (
          <div
            key={vIndex}
            className="auth-card"
            style={{
              textAlign: "left",
              maxWidth: "100%",
              borderLeft: "5px solid var(--color-accent)",
              padding: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h4 style={{ margin: 0, color: "var(--color-text-primary)" }}>
                Video Module #{vIndex + 1}
              </h4>
              {videos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVideo(vIndex)}
                  style={{
                    color: "#ef4444",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  🗑 Remove
                </button>
              )}
            </div>

            <label>Video Title</label>
            <input
              className="form-control"
              style={{ marginBottom: "15px" }}
              required
              onChange={(e) =>
                handleVideoChange(vIndex, "title", e.target.value)
              }
            />

            <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
              {/* VIDEO FILE PREVIEW */}
              <div style={{ flex: 1 }}>
                <label>Video File</label>
                <input
                  type="file"
                  className="form-control"
                  accept="video/*"
                  required
                  onChange={(e) =>
                    handleVideoChange(vIndex, "videoFile", e.target.files[0])
                  }
                />
                {video.videoFile && (
                  <div className="file-preview-container">
                    <video
                      src={URL.createObjectURL(video.videoFile)}
                      controls
                      className="file-preview-video"
                    />
                  </div>
                )}
              </div>

              {/* VIDEO THUMBNAIL PREVIEW */}
              <div style={{ flex: 1 }}>
                <label>Video Thumbnail</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) =>
                    handleVideoChange(vIndex, "thumbFile", e.target.files[0])
                  }
                />
                {video.thumbFile && (
                  <div className="file-preview-container">
                    <img
                      src={URL.createObjectURL(video.thumbFile)}
                      alt="Preview"
                      className="file-preview-img"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="nested-box">
              <h5
                style={{
                  marginBottom: "15px",
                  color: "var(--color-text-secondary)",
                }}
              >
                📄 Resources
              </h5>
              {video.resources.map((res, rIndex) => (
                <div
                  key={rIndex}
                  style={{
                    marginBottom: "15px",
                    borderBottom: "1px solid var(--color-bg-primary)",
                    paddingBottom: "10px",
                  }}
                >
                  {/* INPUTS ROW */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      placeholder="File Title"
                      className="form-control"
                      style={{ flex: 1 }}
                      value={res.title}
                      onChange={(e) => {
                        const u = [...videos];
                        u[vIndex].resources[rIndex].title = e.target.value;
                        setVideos(u);
                      }}
                    />
                    <input
                      type="file"
                      className="form-control"
                      style={{ flex: 1 }}
                      onChange={(e) => {
                        const u = [...videos];
                        u[vIndex].resources[rIndex].file = e.target.files[0];
                        setVideos(u);
                      }}
                    />
                    <button
                      type="button"
                      style={{
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        background: "transparent",
                        borderRadius: "5px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                      onClick={() => removeResource(vIndex, rIndex)}
                    >
                      ✕
                    </button>
                  </div>

                  {/* FILE PREVIEW (The part I missed) */}
                  {res.file && (
                    <div
                      className="file-preview-container"
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {/* Check if it is an image to show thumbnail, otherwise show Icon */}
                      {res.file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(res.file)}
                          alt="Preview"
                          className="file-preview-img"
                          style={{ width: "50px", height: "50px" }}
                        />
                      ) : (
                        <span style={{ fontSize: "24px" }}>📄</span>
                      )}

                      <div>
                        <div
                          style={{
                            color: "var(--color-accent)",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                          }}
                        >
                          Selected:
                        </div>
                        <div
                          style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {res.file.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn-primary-outline"
                style={{ fontSize: "13px", marginTop: "5px" }}
                onClick={() => addResource(vIndex)}
              >
                + Add Resource
              </button>
            </div>

            <div className="nested-box">
              <h5
                style={{
                  marginBottom: "15px",
                  color: "var(--color-text-secondary)",
                }}
              >
                ❓ Quiz
              </h5>
              {video.quizzes.map((quiz, qIndex) => (
                <div
                  key={qIndex}
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    paddingBottom: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Question #{qIndex + 1}
                    </span>
                    <button
                      type="button"
                      style={{
                        color: "red",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => removeQuiz(vIndex, qIndex)}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    placeholder="Question?"
                    className="form-control"
                    style={{ marginBottom: "8px" }}
                    onChange={(e) => {
                      const u = [...videos];
                      u[vIndex].quizzes[qIndex].question = e.target.value;
                      setVideos(u);
                    }}
                  />
                  <input
                    placeholder="Options (A,B,C,D)"
                    className="form-control"
                    style={{ marginBottom: "8px" }}
                    onChange={(e) => {
                      const u = [...videos];
                      u[vIndex].quizzes[qIndex].options = e.target.value;
                      setVideos(u);
                    }}
                  />
                  <input
                    placeholder="Correct Answer"
                    className="form-control"
                    onChange={(e) => {
                      const u = [...videos];
                      u[vIndex].quizzes[qIndex].correctAns = e.target.value;
                      setVideos(u);
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                className="btn-primary-outline"
                style={{ fontSize: "13px", marginTop: "5px" }}
                onClick={() => addQuiz(vIndex)}
              >
                + Add Quiz
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="hero-btn"
          style={{
            backgroundColor: "var(--color-bg-tertiary)",
            padding: "15px",
          }}
          onClick={addVideo}
        >
          + Add Video Module
        </button>
        <hr style={{ margin: "20px 0", borderColor: "var(--color-border)" }} />
        <button
          type="submit"
          className="create-course-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Uploading..." : "🚀 Create Course Now"}
        </button>
      </form>
    </div>
  );
}

export default CreateCourse;
