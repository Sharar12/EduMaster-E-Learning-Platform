// src/EditCourse.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./style.css";

function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [courseThumbnail, setCourseThumbnail] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState("");
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/course/${id}`)
      .then((res) => {
        const data = res.data;
        setBasicInfo({
          title: data.title,
          description: data.description,
          price: data.price,
        });
        setExistingThumbnail(data.thumbnail);
        setVideos(
          data.videos.map((v) => ({
            ...v,
            videoFile: null,
            thumbFile: null,
            resources: v.resources.map((r) => ({ ...r, file: null })),
          }))
        );
        setLoading(false);
      })
      .catch((err) => console.log(err));
  }, [id]);

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
      thumbnail: existingThumbnail,
      videos: videos.map((v) => ({
        title: v.title,
        videoPath: v.videoPath,
        thumbnailPath: v.thumbnailPath,
        resources: v.resources.map((r) => ({
          title: r.title,
          filePath: r.filePath,
        })),
        quizzes: v.quizzes.map((q) => ({
          question: q.question,
          options: Array.isArray(q.options) ? q.options : q.options.split(","),
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
      const res = await axios.put(
        `http://localhost:3001/edit-course/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.status === "Success") {
        alert("Updated!");
        navigate("/dashboard/instructor");
      }
    } catch (err) {
      console.log(err);
      alert("Failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div style={{ color: "white", padding: "50px", textAlign: "center" }}>
        Loading...
      </div>
    );

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
        <h1 style={{ color: "var(--color-text-primary)" }}>Edit Course</h1>
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
          <h3 style={{ color: "var(--color-text-primary)" }}>
            Basic Information
          </h3>
          <label>Course Title</label>
          <input
            className="form-control"
            value={basicInfo.title}
            required
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, title: e.target.value })
            }
          />
          <label style={{ marginTop: "10px" }}>Description</label>
          <textarea
            className="form-control"
            rows="4"
            value={basicInfo.description}
            onChange={(e) =>
              setBasicInfo({ ...basicInfo, description: e.target.value })
            }
          ></textarea>
          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            <div style={{ flex: 1 }}>
              <label>Price</label>
              <input
                type="number"
                className="form-control"
                value={basicInfo.price}
                required
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, price: e.target.value })
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Update Thumbnail</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setCourseThumbnail(e.target.files[0])}
              />
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
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4 style={{ color: "var(--color-text-primary)" }}>
                Video #{vIndex + 1}
              </h4>
              <button
                type="button"
                style={{
                  color: "#ef4444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => removeVideo(vIndex)}
              >
                Remove
              </button>
            </div>
            <label>Video Title</label>
            <input
              className="form-control"
              value={video.title}
              style={{ marginBottom: "15px" }}
              required
              onChange={(e) =>
                handleVideoChange(vIndex, "title", e.target.value)
              }
            />

            {/* FIXED: NESTED BOX CLASS */}
            <div className="nested-box">
              <h5 style={{ color: "var(--color-text-secondary)" }}>
                Resources
              </h5>
              {video.resources.map((res, rIndex) => (
                <div
                  key={rIndex}
                  style={{ display: "flex", gap: "10px", marginBottom: "5px" }}
                >
                  <input
                    className="form-control"
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
                    onChange={(e) => {
                      const u = [...videos];
                      u[vIndex].resources[rIndex].file = e.target.files[0];
                      setVideos(u);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeResource(vIndex, rIndex)}
                    style={{
                      color: "red",
                      border: "1px solid red",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-primary-outline"
                onClick={() => addResource(vIndex)}
              >
                + Add Resource
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="hero-btn"
          style={{ backgroundColor: "var(--color-bg-tertiary)" }}
          onClick={addVideo}
        >
          + Add Video
        </button>
        <button type="submit" className="hero-btn" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default EditCourse;
