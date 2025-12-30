import React from "react";
import Navbar from "../../components/SubAdminNavbar/SubAdminNavbar.jsx";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";
import { Link } from "react-router-dom";

const Home = () => {
  const { user, logout, getDisplayName } = useAuth();

  // Statistics
  const stats = [
    { icon: "fas fa-user-graduate", label: "Total Students", value: "1,245", color: "#4ecdc4" },
    { icon: "fas fa-chalkboard-teacher", label: "Total Professors", value: "89", color: "#ffd166" },
    { icon: "fas fa-book", label: "Courses", value: "45", color: "#ff6b6b" },
    { icon: "fas fa-calendar-check", label: "Today's Attendance", value: "94%", color: "#8da9c4" },
  ];

  // Quick Actions
  const quickActions = [
    { icon: "fas fa-user-plus", label: "Register Student", link: "/register-students", color: "#2a5a9c" },
    { icon: "fas fa-chalkboard-teacher", label: "Add Professor", link: "/add-professors", color: "#1a4375" },
    { icon: "fas fa-book", label: "Add Course", link: "/add-courses", color: "#13315c" },
    { icon: "fas fa-calendar-alt", label: "Attendance Log", link: "/attendance-log", color: "#0a1b35" },
  ];

  // Main Pages
  const mainPages = [
    { icon: "fas fa-users", label: "View Students", description: "Manage and view all student records", link: "/view-students", gradient: "linear-gradient(135deg, #2a5a9c 0%, #1a4375 100%)" },
    { icon: "fas fa-chalkboard-teacher", label: "View Professors", description: "Manage and view all professor records", link: "/view-professors", gradient: "linear-gradient(135deg, #1a4375 0%, #13315c 100%)" },
    { icon: "fas fa-book-open", label: "View Courses", description: "Manage and view all courses", link: "/view-courses", gradient: "linear-gradient(135deg, #13315c 0%, #0a1b35 100%)" },
    { icon: "fas fa-table", label: "Manage Term Table", description: "Manage academic schedules and classes", link: "/manage-term-table", gradient: "linear-gradient(135deg, #0a1b35 0%, #051224 100%)" },
  ];

  return (
    <div className="home-page">
      <Navbar />

      {/* Page Header - Similar to ViewCourses page */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </h1>
          <p className="page-subtitle">College Management System - Assistant Admin Overview</p>
        </div>
        <div className="user-info">
          <span>Welcome, {getDisplayName()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Stats Section */}
        <div className="section">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon" style={{ color: stat.color }}>
                  <i className={stat.icon}></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-label">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                  <span className="status-value">1 minute ago</span>
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
                  <span className="status-label">Records:</span>
                  <span className="status-value">12,458</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Size:</span>
                  <span className="status-value">245 MB</span>
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
            <p>© 2024 College Management System. All rights reserved.</p>
            <p className="footer-version">Version 2.1.0</p>
          </div>
          <div className="footer-actions">
            <button className="btn btn-secondary" onClick={logout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;