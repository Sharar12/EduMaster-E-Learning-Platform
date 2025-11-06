// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import LandingPage from "./LandingPage";
import StudentDashboard from "./StudentDashboard";
import InstructorDashboard from "./InstructorDashboard";
import AdminDashboard from "./AdminDashboard";
import CourseDetails from "./CourseDetails";
import CreateCourse from "./CreateCourse";
import EditCourse from "./EditCourse";
import InstructorCourseView from "./InstructorCourseView";

import Cart from "./Cart";
import CourseLearning from "./CourseLearning";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Helper component
function Layout({ children }) {
  // We removed the "if" statement.
  // Now Navbar renders on EVERY page.
  return (
    <>
      <Navbar />
      <div className="main-wrapper">{children}</div>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/edit-course/:id" element={<EditCourse />} />
          <Route path="/course-details/:id" element={<CourseDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/course-learn/:courseId" element={<CourseLearning />} />
          <Route
            path="/instructor-course-view/:courseId"
            element={<InstructorCourseView />}
          />
          {/* Dashboards */}
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route
            path="/dashboard/instructor"
            element={<InstructorDashboard />}
          />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
