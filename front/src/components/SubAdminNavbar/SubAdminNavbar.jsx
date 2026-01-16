import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./SubAdminNavbar.css";
import UniScanLogo from "../../assets/UniScan.png";
import { auth, db } from "../../firebase";
export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStudentsDropdownOpen, setIsStudentsDropdownOpen] = useState(false);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  const [isProfessorsDropdownOpen, setIsProfessorsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const studentsDropdownRef = useRef(null);
  const coursesDropdownRef = useRef(null);
  const professorsDropdownRef = useRef(null);

  const { user, logout, getDisplayName } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (studentsDropdownRef.current && !studentsDropdownRef.current.contains(event.target)) {
        setIsStudentsDropdownOpen(false);
      }
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setIsCoursesDropdownOpen(false);
      }
      if (professorsDropdownRef.current && !professorsDropdownRef.current.contains(event.target)) {
        setIsProfessorsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleStudentsDropdown = () => {
    setIsStudentsDropdownOpen(!isStudentsDropdownOpen);
  };

  const toggleCoursesDropdown = () => {
    setIsCoursesDropdownOpen(!isCoursesDropdownOpen);
  };

  const toggleProfessorsDropdown = () => {
    setIsProfessorsDropdownOpen(!isProfessorsDropdownOpen);
  };

  // Determine which logo link to use based on user role
  const getLogoLink = () => {
    if (user) {
      return user.role === 'student' ? "/student/home" : "/home";
    }
    return "/";
  };

  // Determine which home link to use based on user role
  const getHomeLink = () => {
    if (user) {
      return user.role === 'student' ? "/student/home" : "/home";
    }
    return "/";
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to={getLogoLink()} className="nav-logo">
          <img
            src={UniScanLogo}
            alt="UniScan Logo"
            className="logo-image"
          />
        </NavLink>
        <ul className="nav-links">
          <li><NavLink to={getHomeLink()} end className="nav-item">Home</NavLink></li>

          {/* Only show these management options for non-student users */}
          {user && user.role !== 'student' && (
            <>
              <li className="nav-dropdown" ref={studentsDropdownRef}>
                <button
                  className={`nav-item nav-dropdown-toggle ${isStudentsDropdownOpen ? 'active' : ''}`}
                  onClick={toggleStudentsDropdown}
                >
                  Students
                  <span className={`dropdown-arrow ${isStudentsDropdownOpen ? 'open' : ''}`}>▼</span>
                </button>
                {isStudentsDropdownOpen && (
                  <div className="dropdown-menu">
                    <NavLink
                      to="/view-students"
                      className="dropdown-item"
                      onClick={() => setIsStudentsDropdownOpen(false)}
                    >
                      <i className="fas fa-list"></i>
                      View Students
                    </NavLink>
                    <NavLink
                      to="/register-students"
                      className="dropdown-item"
                      onClick={() => setIsStudentsDropdownOpen(false)}
                    >
                      <i className="fas fa-user-plus"></i>
                      Register Students
                    </NavLink>
                  </div>
                )}
              </li>

              {/* Courses Dropdown */}
              <li className="nav-dropdown" ref={coursesDropdownRef}>
                <button
                  className={`nav-item nav-dropdown-toggle ${isCoursesDropdownOpen ? 'active' : ''}`}
                  onClick={toggleCoursesDropdown}
                >
                  Courses
                  <span className={`dropdown-arrow ${isCoursesDropdownOpen ? 'open' : ''}`}>▼</span>
                </button>
                {isCoursesDropdownOpen && (
                  <div className="dropdown-menu">
                    <NavLink
                      to="/add-course"
                      className="dropdown-item"
                      onClick={() => setIsCoursesDropdownOpen(false)}
                    >
                      <i className="fas fa-plus"></i>
                      Add Course
                    </NavLink>
                    <NavLink
                      to="/view-courses"
                      className="dropdown-item"
                      onClick={() => setIsCoursesDropdownOpen(false)}
                    >
                      <i className="fas fa-list"></i>
                      View Courses
                    </NavLink>
                    <NavLink
                      to="/manage-term-table"
                      className="dropdown-item"
                      onClick={() => setIsCoursesDropdownOpen(false)}
                    >
                      <i className="fas fa-list"></i>
                      Manage Term Table
                    </NavLink>
                  </div>
                )}
              </li>

              {/* Professors Dropdown */}
              <li className="nav-dropdown" ref={professorsDropdownRef}>
                <button
                  className={`nav-item nav-dropdown-toggle ${isProfessorsDropdownOpen ? 'active' : ''}`}
                  onClick={toggleProfessorsDropdown}
                >
                  Professors
                  <span className={`dropdown-arrow ${isProfessorsDropdownOpen ? 'open' : ''}`}>▼</span>
                </button>
                {isProfessorsDropdownOpen && (
                  <div className="dropdown-menu">
                    <NavLink
                      to="/view-professors"
                      className="dropdown-item"
                      onClick={() => setIsProfessorsDropdownOpen(false)}
                    >
                      <i className="fas fa-list"></i>
                      View Professors
                    </NavLink>
                    <NavLink
                      to="/add-professors"
                      className="dropdown-item"
                      onClick={() => setIsProfessorsDropdownOpen(false)}
                    >
                      <i className="fas fa-user-plus"></i>
                      Add Professors
                    </NavLink>
                  </div>
                )}
              </li>

              <li><NavLink to="/attendance-log" className="nav-item">Attendance Log</NavLink></li>

              {/* REMOVED: QR Code Room link from here */}
              
            </>
          )}

          {/* Show student-specific navigation for student users */}
          {user && user.role === 'student' && (
            <>
              <li><NavLink to="/student/attendance-log" className="nav-item">Attendance Log</NavLink></li>
            </>
          )}

          {/* User Authentication Section - Using AuthContext */}
          <li className="nav-auth-item" ref={dropdownRef}>
            {user ? (
              <div className="user-dropdown">
                <button
                  className="user-toggle"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                >
                  <span className="user-icon">👤</span>
                  <span className="user-name">{getDisplayName()}</span>
                  <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                </button>

                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{getDisplayName()}</strong>
                      <span className="user-role">
                        {user.role === 'student' ? 'Student' :
                          user.role === 'sub-admin' ? 'Sub-Admin' :
                            user.role === 'professional' ? 'Professional' :
                              'User'}
                      </span>
                      {user.studentId && (
                        <span className="user-id">ID: {user.studentId}</span>
                      )}
                    </div>
                    <div className="dropdown-divider"></div>

                    {/* Profile link - different for students vs professionals */}
                    {user.role === 'student' ? (
                      <NavLink
                        to="/student/profile"
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="fas fa-user"></i>
                        Profile
                      </NavLink>
                    ) : (
                      <NavLink
                        to="/profile"
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="fas fa-user"></i>
                        Profile
                      </NavLink>
                    )}

                    {/* Tickets link for all users */}
                    <NavLink
                      to="/tickets"
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="fas fa-ticket-alt"></i>
                      My Tickets
                    </NavLink>

                    {/* Settings link */}
                    <NavLink
                      to="/settings"
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="fas fa-cog"></i>
                      Settings
                    </NavLink>

                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" className="nav-login">
                <span className="user-icon">👤</span>
                Login
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}