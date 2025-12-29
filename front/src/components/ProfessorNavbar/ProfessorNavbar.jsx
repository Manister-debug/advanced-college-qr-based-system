import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProfessorNavbar.css';
import UniScanLogo from '../../assets/UniScan.png';

function ProfessorNavbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isCoursesDropdownOpen, setIsCoursesDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);
    const coursesDropdownRef = useRef(null);

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
        navigate('/login');
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
                {/* Logo/Brand Section */}
                <NavLink to="/professor/home" className="nav-logo">
                    <img
                        src={UniScanLogo}
                        alt="UniScan Logo"
                        className="logo-image"
                    />
                </NavLink>

                {/* Navigation Links */}
                <ul className="nav-links">
                    <li>
                        <NavLink to="/professor/home" end className="nav-item">Home</NavLink>
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
                                    to="/professor/courses"
                                    className="dropdown-item"
                                    onClick={() => setIsCoursesDropdownOpen(false)}
                                >
                                    <i className="fas fa-list"></i>
                                    View Assigned Courses
                                </NavLink>
                                <NavLink
                                    to="/professor/schedule"
                                    className="dropdown-item"
                                    onClick={() => setIsCoursesDropdownOpen(false)}
                                >
                                    <i className="fas fa-calendar-alt"></i>
                                    View Courses Schedule
                                </NavLink>
                            </div>
                        )}
                    </li>

                    <li>
                        <NavLink to="/professor/attendance-log" className="nav-item">Attendance Log</NavLink>
                    </li>

                    {/* ADDED: QR Code Gate Link */}
                    <li>
                        <NavLink to="/professor/qr-code-gate" className="nav-item">QR Code Gate</NavLink>
                    </li>

                    {/* User Profile Dropdown */}
                    <li className="nav-auth-item" ref={dropdownRef}>
                        <div className="user-dropdown">
                            <button
                                className="user-toggle"
                                onClick={toggleDropdown}
                                aria-expanded={isDropdownOpen}
                            >
                                <span className="user-icon">👤</span>
                                <span className="user-name">{user?.name || 'Professor'}</span>
                                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                            </button>

                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-header">
                                        <strong>{user?.name || 'Professor'}</strong>
                                        <span className="user-role">Professor</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <NavLink
                                        to="/professor/profile"
                                        className="dropdown-item"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Profile
                                    </NavLink>
                                    <NavLink
                                        to="/professor/support"
                                        className="dropdown-item"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Support
                                    </NavLink>
                                    <NavLink
                                        to="/professor/settings"
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
                                        <i className="fas fa-sign-out-alt"></i>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default ProfessorNavbar;