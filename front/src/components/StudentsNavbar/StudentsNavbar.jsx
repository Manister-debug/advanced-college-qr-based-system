import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "../Navbar/Navbar.css"; // You might want a separate CSS file, but using same for now
import UniScanLogo from "../../assets/UniScan.png";
import { auth, db } from "../../firebase";
export default function StudentNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const coursesDropdownRef = useRef(null);
  
  const { user, logout, getDisplayName } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setIsCoursesDropdownOpen(false);
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

  const toggleCoursesDropdown = () => {
    setIsCoursesDropdownOpen(!isCoursesDropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/student/home" className="nav-logo">
          <img 
            src={UniScanLogo} 
            alt="UniScan Logo" 
            className="logo-image"
          />
        </NavLink>
        <ul className="nav-links">
          {/* Home */}
          <li><NavLink to="/student/home" end className="nav-item">Home</NavLink></li>
          
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
                  to="/student/view-registered-courses" 
                  className="dropdown-item"
                  onClick={() => setIsCoursesDropdownOpen(false)}
                >
                  <i className="fas fa-list"></i>
                  View Registered Courses
                </NavLink>
                <NavLink 
                  to="/student/view-term-table" 
                  className="dropdown-item"
                  onClick={() => setIsCoursesDropdownOpen(false)}
                >
                  <i className="fas fa-table"></i>
                  View Term Table
                </NavLink>
                <NavLink 
                  to="/student/register-courses" 
                  className="dropdown-item"
                  onClick={() => setIsCoursesDropdownOpen(false)}
                >
                  <i className="fas fa-edit"></i>
                  Register Courses
                </NavLink>
                <NavLink 
                  to="/student/withdraw-from-course" 
                  className="dropdown-item"
                  onClick={() => setIsCoursesDropdownOpen(false)}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Withdraw from Course
                </NavLink>
              </div>
            )}
          </li>

          {/* Attendance Log */}
          <li><NavLink to="/student/attendance-log" className="nav-item">Attendance Log</NavLink></li>        
          
          {/* User Authentication Section */}
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
                      <span className="user-role">Student</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <NavLink 
                      to="/student/profile" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="fas fa-user"></i>
                      Profile
                    </NavLink>
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