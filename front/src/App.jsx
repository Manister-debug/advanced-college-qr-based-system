import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar/Navbar.jsx";
import NavbarLogin from "./components/Alt-Navbar/NavbarLogin.jsx";
import StudentNavbar from "./components/StudentsNavbar/StudentsNavbar.jsx";
import Home from "./Sub-Admin Pages/Home/Home.jsx";
import Login from "./components/Login/Login.jsx";
import Dashboard from "./Sub-Admin Pages/Dashboard/Dashboard.jsx";
import RegisterStudents from "./Sub-Admin Pages/RegisterStudents/RegisterStudents.jsx";
import ViewStudents from "./Sub-Admin Pages/ViewStudents/ViewStudents.jsx";
import AddCourse from "./Sub-Admin Pages/AddCourses/AddCourses.jsx";
import ViewCourses from "./Sub-Admin Pages/ViewCourses/ViewCourses.jsx";
import AddProfessors from "./Sub-Admin Pages/AddProfessors/AddProfessors.jsx";
import ViewProfessors from "./Sub-Admin Pages/ViewProfessors/ViewProfessors.jsx";
import StudentsHome from "./Student Pages/StudentsHome/StudentsHome.jsx";
import "./App.css";

// Protected Route Component for Sub-Admin/Professional routes
const ProtectedRoute = ({ children, requiredRole = 'sub-admin' }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check user role if requiredRole is specified
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate home based on role
    if (user.role === 'student') {
      return <Navigate to="/student/home" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

// Protected Route Component for Student routes
const StudentProtectedRoute = ({ children }) => {
  return <ProtectedRoute requiredRole="student">{children}</ProtectedRoute>;
};

// Public Route Component (only for non-authenticated users)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  // If user is already logged in, redirect to appropriate home
  if (user) {
    if (user.role === 'student') {
      return <Navigate to="/student/home" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root based on authentication status */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login page - only accessible when not logged in */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <div className="App">
                  <NavbarLogin />
                  <main className="main-content">
                    <Login />
                  </main>
                </div>
              </PublicRoute>
            } 
          />
          
          {/* ================== SUB-ADMIN/PROFESSIONAL ROUTES ================== */}
          {/* Home */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Home />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Dashboard />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Student Management */}
          <Route 
            path="/register-students" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <RegisterStudents />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/view-students" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <ViewStudents />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Course Management */}
          <Route 
            path="/add-course" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <AddCourse />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/view-courses" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <ViewCourses />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Professor Management */}
          <Route 
            path="/add-professors" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <AddProfessors />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/view-professors" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <ViewProfessors />
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* Other Sub-Admin Pages */}
          <Route 
            path="/attendance-log" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Attendance Log</h1>
                      <p>Attendance log functionality will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/support" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Support</h1>
                      <p>Support page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Profile</h1>
                      <p>User profile page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tickets" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>My Tickets</h1>
                      <p>Support tickets page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Settings</h1>
                      <p>Settings page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
          {/* ================== STUDENT ROUTES ================== */}
          {/* Student Home */}
          <Route 
            path="/student/home" 
            element={
              <StudentProtectedRoute>
                <div className="App">
                  <StudentNavbar />
                  <main className="main-content">
                    <StudentsHome />
                  </main>
                </div>
              </StudentProtectedRoute>
            } 
          />
          
          {/* Student Profile Pages */}
          <Route 
            path="/student/profile" 
            element={
              <StudentProtectedRoute>
                <div className="App">
                  <StudentNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Student Profile</h1>
                      <p>Student profile page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </StudentProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/tickets" 
            element={
              <StudentProtectedRoute>
                <div className="App">
                  <StudentNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Student Tickets</h1>
                      <p>Student support tickets page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </StudentProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/settings" 
            element={
              <StudentProtectedRoute>
                <div className="App">
                  <StudentNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Student Settings</h1>
                      <p>Student settings page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </StudentProtectedRoute>
            } 
          />
          
          {/* Student Course Management */}
          <Route 
            path="/student/view-courses" 
            element={
              <StudentProtectedRoute>
                <div className="App">
                  <StudentNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>View Courses</h1>
                      <p>Student course viewing page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </StudentProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/register-courses" 
            element={
              <StudentProtectedRoute>
                <div className="App">
                  <StudentNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Register for Courses</h1>
                      <p>Course registration page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </StudentProtectedRoute>
            } 
          />
          
          {/* 404 route - accessible without authentication */}
          <Route 
            path="*" 
            element={
              <div className="App">
                <NavbarLogin />
                <main className="main-content">
                  <div className="page-container">
                    <h1>404 - Page Not Found</h1>
                    <p>The page you are looking for does not exist.</p>
                  </div>
                </main>
              </div>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;