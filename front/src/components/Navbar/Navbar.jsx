import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import "./Navbar.css";
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
  
  // Mock user data
  const [user, setUser] = useState(null);

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

  const handleLogin = () => {
    setUser({ name: "John Doe", role: "student" });
  };

  const handleLogout = () => {
    setUser(null);
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

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          <img 
            src={UniScanLogo} 
            alt="UniScan Logo" 
            className="logo-image"
          />
        </NavLink>
        <ul className="nav-links">
          <li><NavLink to="/" end className="nav-item">Home</NavLink></li>
          
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
              </div>
            )}
          </li>

          {/* Professors Dropdown - NEW */}
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
          <li><NavLink to="/support" className="nav-item">Support</NavLink></li>
          
          <li className="nav-auth-item" ref={dropdownRef}>
            {user ? (
              <div className="user-dropdown">
                <button 
                  className="user-toggle"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                >
                  <span className="user-icon">👤</span>
                  <span className="user-name">{user.name}</span>
                  <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                </button>
                
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{user.name}</strong>
                      <span className="user-role">{user.role}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <NavLink 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <NavLink 
                      to="/tickets" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Tickets
                    </NavLink>
                    <NavLink 
                      to="/settings" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </NavLink>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item logout-btn"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" className="nav-login">
                Login
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}