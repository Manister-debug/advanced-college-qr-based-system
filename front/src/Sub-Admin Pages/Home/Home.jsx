import React, { useState, useEffect } from "react";
import Navbar from "../../components/SubAdminNavbar/SubAdminNavbar.jsx";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

const Home = () => {
  const { user, logout, getDisplayName } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentProfessors, setRecentProfessors] = useState([]);
  const [totalTheoryProfessors, setTotalTheoryProfessors] = useState(0);
  const [totalPracticalProfessors, setTotalPracticalProfessors] = useState(0);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch professors with real-time updates
        const professorsQuery = query(
          collection(db, "users"),
          where("role", "in", ["Professor", "professor"])
        );

        const unsubscribe = onSnapshot(professorsQuery, (snapshot) => {
          let theoryCount = 0;
          let practicalCount = 0;
          const recent = [];

          snapshot.forEach((doc) => {
            const data = doc.data();

            // Count by type
            if (data.type === "theory") {
              theoryCount++;
            } else if (data.type === "practical") {
              practicalCount++;
            }

            // Get recent professors (last 5)
            if (recent.length < 5) {
              recent.push({
                id: doc.id,
                name: data.name,
                faculty: data.faculty,
                specialization: data.specialization,
                type: data.type,
                status: data.status,
                createdAt: data.createdAt
              });
            }
          });

          setTotalTheoryProfessors(theoryCount);
          setTotalPracticalProfessors(practicalCount);
          setRecentProfessors(recent);
        });

        // Cleanup subscription
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Quick Actions
  const quickActions = [
    { icon: "fas fa-user-plus", label: "Register Student", link: "/register-students", color: "#2a5a9c" },
    { icon: "fas fa-chalkboard-teacher", label: "Add Professor", link: "/add-professors", color: "#1a4375" },
    { icon: "fas fa-book", label: "Add Course", link: "/add-courses", color: "#13315c" },
    { icon: "fas fa-calendar-alt", label: "Attendance Log", link: "/attendance-log", color: "#0a1b35" },
  ];

  // Main Pages with professor-related pages
  const mainPages = [
    { icon: "fas fa-users", label: "View Students", description: "Manage and view all student records", link: "/view-students", gradient: "linear-gradient(135deg, #2a5a9c 0%, #1a4375 100%)" },
    { icon: "fas fa-chalkboard-teacher", label: "View Professors", description: "Manage and view all professor records", link: "/view-professors", gradient: "linear-gradient(135deg, #1a4375 0%, #13315c 100%)" },
    { icon: "fas fa-book-open", label: "View Courses", description: "Manage and view all courses", link: "/view-courses", gradient: "linear-gradient(135deg, #13315c 0%, #0a1b35 100%)" },
    { icon: "fas fa-table", label: "Manage Term Table", description: "Manage academic schedules and classes", link: "/manage-term-table", gradient: "linear-gradient(135deg, #0a1b35 0%, #051224 100%)" },
  ];

  // Professor type badge color
  const getProfessorTypeBadge = (type) => {
    switch (type) {
      case "theory":
        return { color: "#4ecdc4", label: "Theory" };
      case "practical":
        return { color: "#ffd166", label: "Practical" };
      default:
        return { color: "#8da9c4", label: type };
    }
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* Main Content */}
      <div className="main-content">
        {/* تم حذف Welcome Header */}

        {/* تم حذف Recent Professors Section بالكامل */}

        {/* Quick Actions */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-bolt"></i>
              Quick Actions
            </h2>
            <p className="section-subtitle">Quick access to main functions</p>
          </div>

          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link} className="quick-action-card">
                <div className="action-icon" style={{ backgroundColor: action.color }}>
                  <i className={action.icon}></i>
                </div>
                <span className="action-label">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Pages */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-th-large"></i>
              Main Pages
            </h2>
            <p className="section-subtitle">Manage all aspects of the educational system</p>
          </div>

          <div className="main-pages-grid">
            {mainPages.map((page, index) => (
              <Link key={index} to={page.link} className="main-page-card">
                <div className="page-card-header" style={{ background: page.gradient }}>
                  <i className={page.icon}></i>
                  <h3 className="page-card-title">{page.label}</h3>
                </div>
                <div className="page-card-body">
                  <p className="page-card-description">{page.description}</p>
                  <div className="page-card-arrow">
                    <i className="fas fa-arrow-left"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-heartbeat"></i>
              System Status
            </h2>
            <p className="section-subtitle">System performance and stability</p>
          </div>

          <div className="status-container">
            <div className="status-card">
              <div className="status-header">
                <i className="fas fa-server"></i>
                <h3>Server Status</h3>
              </div>
              <div className="status-content">
                <div className="status-item">
                  <span className="status-label">Status:</span>
                  <span className="status-value status-active">
                    <i className="fas fa-circle"></i>
                    Active
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Response:</span>
                  <span className="status-value">45ms</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Last Update:</span>
                  <span className="status-value">Just now</span>
                </div>
              </div>
            </div>

            <div className="status-card">
              <div className="status-header">
                <i className="fas fa-database"></i>
                <h3>Database</h3>
              </div>
              <div className="status-content">
                <div className="status-item">
                  <span className="status-label">Status:</span>
                  <span className="status-value status-active">
                    <i className="fas fa-circle"></i>
                    Connected
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Professors Data:</span>
                  <span className="status-value">
                    {recentProfessors.length > 0 ? "Data Loaded" : "No Data"}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Real-time Sync:</span>
                  <span className="status-value status-active">
                    <i className="fas fa-check-circle"></i>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p>© 2026 Student attendance tracking system using QR code.</p>
          </div>
          {/* تم حذف زر تسجيل الخروج */}
        </div>
      </footer>
    </div>
  );
};

export default Home;