import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./Components/Navbar/Navbar.jsx";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import RegisterStudents from "./pages/RegisterStudents/RegisterStudents.jsx";
import ViewStudents from "./pages/ViewStudents/ViewStudents.jsx";
import AddCourse from "./pages/AddCourses/AddCourses.jsx";
import ViewCourses from "./pages/ViewCourses/ViewCourses.jsx";
import AddProfessors from "./pages/AddProfessors/AddProfessors.jsx";
import ViewProfessors from "./pages/ViewProfessors/ViewProfessors.jsx";

// Create basic placeholder components for missing routes
function AttendanceLog() { 
  return (
    <div className="page-container">
      <h1>Attendance Log</h1>
      <p>Attendance log functionality will be implemented here.</p>
    </div>
  ); 
}

function Support() { 
  return (
    <div className="page-container">
      <h1>Support</h1>
      <p>Support page will be implemented here.</p>
    </div>
  ); 
}

function Profile() { 
  return (
    <div className="page-container">
      <h1>Profile</h1>
      <p>User profile page will be implemented here.</p>
    </div>
  ); 
}

function Tickets() { 
  return (
    <div className="page-container">
      <h1>My Tickets</h1>
      <p>Support tickets page will be implemented here.</p>
    </div>
  ); 
}

function Settings() { 
  return (
    <div className="page-container">
      <h1>Settings</h1>
      <p>Settings page will be implemented here.</p>
    </div>
  ); 
}

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Course routes */}
              <Route path="/add-course" element={<AddCourse />} />
              <Route path="/view-courses" element={<ViewCourses />} />
              
              {/* Student routes */}
              <Route path="/view-students" element={<ViewStudents />} />
              <Route path="/register-students" element={<RegisterStudents />} />
              
              {/* Professor routes - IMPORTANT: Added these routes */}
              <Route path="/add-professors" element={<AddProfessors />} />
              <Route path="/view-professors" element={<ViewProfessors />} />
              
              {/* Other routes */}
              <Route path="/attendance-log" element={<AttendanceLog />} />
              <Route path="/support" element={<Support />} />
              
              {/* User profile routes (from dropdown) */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* 404 route */}
              <Route path="*" element={
                <div className="page-container">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you are looking for does not exist.</p>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;