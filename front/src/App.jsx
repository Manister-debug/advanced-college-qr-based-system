import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login/Login.jsx";
import "./App.css";

// Navbars
import Navbar from "./components/SubAdminNavbar/SubAdminNavbar.jsx";
import NavbarLogin from "./components/Alt-Navbar/NavbarLogin.jsx";
import StudentNavbar from "./components/StudentsNavbar/StudentsNavbar.jsx";
import ProfessorNavbar from "./components/ProfessorNavbar/ProfessorNavbar.jsx";

// Sub-Admin Pages
import Home from "./Sub-Admin Pages/Home/Home.jsx";
import Dashboard from "./Sub-Admin Pages/Dashboard/Dashboard.jsx";
import RegisterStudents from "./Sub-Admin Pages/RegisterStudents/RegisterStudents.jsx";
import ViewStudents from "./Sub-Admin Pages/ViewStudents/ViewStudents.jsx";
import AddCourse from "./Sub-Admin Pages/AddCourses/AddCourses.jsx";
import ViewCourses from "./Sub-Admin Pages/ViewCourses/ViewCourses.jsx";
import ManageTermTable from "./Sub-Admin Pages/Manage Term Table/ManageTermTable.jsx";
import AddProfessors from "./Sub-Admin Pages/AddProfessors/AddProfessors.jsx";
import ViewProfessors from "./Sub-Admin Pages/ViewProfessors/ViewProfessors.jsx";
import AttendanceLog from "./Sub-Admin Pages/AttendanceLog/AttendanceLog.jsx";

// Student Pages
import StudentsHome from "./Student Pages/StudentsHome/StudentsHome.jsx";

// Professor Pages
import ProfessorHome from "./ProfessorPages/ProfessorHome/ProfessorHome.jsx";
import ViewTermCourses from "./ProfessorPages/ViewTermCourses/ViewTermCourses.jsx";
import ProfessorSchedule from "./ProfessorPages/ProfessorSchedule/ProfessorSchedule.jsx";
import ProfessorAttendanceLog from "./ProfessorPages/ProfessorAttendanceLog/ProfessorAttendanceLog.jsx";
import QrCodeRoom from "./ProfessorPages/QR-Code-Room/QrCodeRoom.jsx";

// Protected Route Component for Sub-Admin routes
const ProtectedRoute = ({ children, requiredRole = 'sub-admin' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role to lowercase for comparison
  const normalizedRole = user?.role?.toLowerCase();
  const normalizedRequiredRole = requiredRole.toLowerCase();

  // Check user role if requiredRole is specified
  if (requiredRole && normalizedRole !== normalizedRequiredRole) {
    // Redirect to appropriate home based on role
    if (normalizedRole === 'student') {
      return <Navigate to="/student/home" replace />;
    } else if (normalizedRole === 'professor') {
      return <Navigate to="/professor/home" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Protected Route Component for Student routes
const StudentProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = user?.role?.toLowerCase();

  if (normalizedRole !== 'student') {
    if (normalizedRole === 'sub-admin' || normalizedRole === 'admin') {
      return <Navigate to="/home" replace />;
    } else if (normalizedRole === 'professor') {
      return <Navigate to="/professor/home" replace />;
    }
  }

  return children;
};

// Protected Route Component for Professional users (both sub-admin and professional)
const ProfessionalProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = user?.role?.toLowerCase();
  const allowedRoles = ['sub-admin', 'admin', 'professional'].map(r => r.toLowerCase());

  if (!allowedRoles.includes(normalizedRole)) {
    if (normalizedRole === 'student') {
      return <Navigate to="/student/home" replace />;
    } else if (normalizedRole === 'professor') {
      return <Navigate to="/professor/home" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
};

// Protected Route Component for Professor routes - UPDATED WITH DEBUG LOGS
const ProfessorProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log("ProfessorProtectedRoute - User:", user); // Debug log

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check for professor role (case-insensitive)
  const normalizedRole = user?.role?.toLowerCase();
  console.log("Checking role:", normalizedRole);

  if (normalizedRole !== 'professor') {
    console.log("Not a professor, redirecting. Role was:", user?.role);
    if (normalizedRole === 'student') {
      return <Navigate to="/student/home" replace />;
    } else if (normalizedRole === 'sub-admin' || normalizedRole === 'admin') {
      return <Navigate to="/home" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  console.log("Professor authorized, rendering children");
  return children;
};

// Public Route Component (only for non-authenticated users)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  // If user is already logged in, redirect to appropriate home
  if (user) {
    const normalizedRole = user?.role?.toLowerCase();
    if (normalizedRole === 'student') {
      return <Navigate to="/student/home" replace />;
    } else if (normalizedRole === 'professor') {
      return <Navigate to="/professor/home" replace />;
    } else if (normalizedRole === 'sub-admin' || normalizedRole === 'admin') {
      return <Navigate to="/home" replace />;
    }
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
              <ProfessionalProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <Home />
                  </main>
                </div>
              </ProfessionalProtectedRoute>
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="sub-admin">
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
              <ProtectedRoute requiredRole="sub-admin">
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
              <ProtectedRoute requiredRole="sub-admin">
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
          <Route
            path="/manage-term-table"
            element={
              <ProtectedRoute requiredRole="sub-admin">
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <ManageTermTable />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Professor Management */}
          <Route
            path="/add-professors"
            element={
              <ProtectedRoute requiredRole="sub-admin">
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

          {/* Attendance Log */}
          <Route
            path="/attendance-log"
            element={
              <ProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <AttendanceLog />
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* QR Code Room */}
          <Route
            path="/qr-code-room"
            element={
              <ProfessionalProtectedRoute>
                <div className="App">
                  <Navbar />
                  <main className="main-content">
                    <QrCodeRoom />
                  </main>
                </div>
              </ProfessionalProtectedRoute>
            }
          />

          {/* ================== PROFESSOR ROUTES ================== */}
          {/* Professor Home */}
          <Route
            path="/professor/home"
            element={
              <ProfessorProtectedRoute>
                <div className="App">
                  <ProfessorNavbar />
                  <main className="main-content">
                    <ProfessorHome />
                  </main>
                </div>
              </ProfessorProtectedRoute>
            }
          />

          {/* Professor Courses - View assigned courses */}
          <Route
            path="/professor/courses"
            element={
              <ProfessorProtectedRoute>
                <div className="App">
                  <ProfessorNavbar />
                  <main className="main-content">
                    <ViewTermCourses />
                  </main>
                </div>
              </ProfessorProtectedRoute>
            }
          />

          {/* Professor Schedule */}
          <Route
            path="/professor/schedule"
            element={
              <ProfessorProtectedRoute>
                <div className="App">
                  <ProfessorNavbar />
                  <main className="main-content">
                    <ProfessorSchedule />
                  </main>
                </div>
              </ProfessorProtectedRoute>
            }
          />

          {/* Professor Attendance Log */}
          <Route
            path="/professor/attendance-log"
            element={
              <ProfessorProtectedRoute>
                <div className="App">
                  <ProfessorNavbar />
                  <main className="main-content">
                    <ProfessorAttendanceLog />
                  </main>
                </div>
              </ProfessorProtectedRoute>
            }
          />
          {/* Professor QR Code Gate */}
          <Route
            path="/professor/qr-code-gate"
            element={
              <ProfessorProtectedRoute>
                <div className="App">
                  <ProfessorNavbar />
                  <main className="main-content">
                    <QrCodeRoom />
                  </main>
                </div>
              </ProfessorProtectedRoute>
            }
          />
          {/* Professor Profile */}
          <Route
            path="/professor/profile"
            element={
              <ProfessorProtectedRoute>
                <div className="App">
                  <ProfessorNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Professor Profile</h1>
                      <p>Professor profile page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProfessorProtectedRoute>
            }
          />

          {/* Professor Settings */}
          <Route
            path="/professor/settings"
            element={
              <ProfessorProtectedRoute>
                <div className="App">
                  <ProfessorNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Professor Settings</h1>
                      <p>Professor settings page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProfessorProtectedRoute>
            }
          />

          {/* Professor Support */}
          <Route
            path="/professor/support"
            element={
              <ProfessorProtectedRoute>
                <div className="App">
                  <ProfessorNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Professor Support</h1>
                      <p>Professor support page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </ProfessorProtectedRoute>
            }
          />

          {/* Support */}
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

          {/* Profile */}
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

          {/* Tickets */}
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

          {/* Settings */}
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

          {/* Student Profile */}
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

          {/* Student Attendance Log (if needed) */}
          <Route
            path="/student/attendance-log"
            element={
              <StudentProtectedRoute>
                <div className="App">
                  <StudentNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Student Attendance Log</h1>
                      <p>Student attendance viewing page will be implemented here.</p>
                    </div>
                  </main>
                </div>
              </StudentProtectedRoute>
            }
          />

          {/* Student Tickets */}
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

          {/* Student Settings */}
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

          {/* Student Support */}
          <Route
            path="/student/support"
            element={
              <StudentProtectedRoute>
                <div className="App">
                  <StudentNavbar />
                  <main className="main-content">
                    <div className="page-container">
                      <h1>Student Support</h1>
                      <p>Student support page will be implemented here.</p>
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