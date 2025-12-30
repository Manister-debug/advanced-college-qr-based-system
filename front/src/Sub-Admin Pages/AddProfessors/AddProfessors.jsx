import React, { useState } from 'react';
import './AddProfessors.css';

// Firestore imports
import { db } from '../../firebase';
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";

export default function AddProfessors() {
  const [userType, setUserType] = useState('theory');
  const [professorData, setProfessorData] = useState({
    fullName: '',
    specialization: '',
    faculty: '',
    phone: '',
    email: '',
    username: ''
  });

  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [lecturerID, setLecturerID] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfessorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateLecturerID = () => {
    // Generate a 4-digit LecturerID
    const newID = Math.floor(1000 + Math.random() * 9000).toString();
    setLecturerID(newID);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!professorData.fullName || !professorData.specialization || !professorData.faculty || 
        !professorData.phone || !professorData.email || !professorData.username) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please fill all required fields.'
      });
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(professorData.email)) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter a valid email address.'
      });
      setLoading(false);
      return;
    }

    // Validate phone number
    const phoneRegex = /^[+]?[\d\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(professorData.phone.replace(/\s+/g, ''))) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter a valid phone number (at least 8 digits).'
      });
      setLoading(false);
      return;
    }

    // Generate default password (first 4 letters of name + LecturerID)
    const defaultPassword = `${professorData.fullName.substring(0, 4).toLowerCase()}${lecturerID || '1234'}`;

    try {
      // Generate LecturerID if not provided
      const finalLecturerID = lecturerID || Math.floor(1000 + Math.random() * 9000).toString();

      // Check if professor with same email already exists
      const professorsRef = collection(db, "professors");
      const emailQuery = query(professorsRef, where("email", "==", professorData.email.toLowerCase()));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        setAlert({
          show: true,
          type: "error",
          message: "This email address is already registered in the system!"
        });
        setLoading(false);
        return;
      }

      // Check if username already exists
      const usernameQuery = query(professorsRef, where("username", "==", professorData.username));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        setAlert({
          show: true,
          type: "error",
          message: "This username is already taken. Please choose another one."
        });
        setLoading(false);
        return;
      }

      // Check if LecturerID already exists
      const lecturerIdQuery = query(professorsRef, where("LecturerID", "==", finalLecturerID));
      const lecturerIdSnapshot = await getDocs(lecturerIdQuery);
      
      if (!lecturerIdSnapshot.empty) {
        setAlert({
          show: true,
          type: "error",
          message: "Lecturer ID already exists. Generating new ID..."
        });
        // Generate new ID
        const newLecturerID = Math.floor(1000 + Math.random() * 9000).toString();
        setLecturerID(newLecturerID);
        setLoading(false);
        return;
      }

      // Add professor to Firestore
      const professorDoc = {
        LecturerID: finalLecturerID,
        name: professorData.fullName.trim(),
        specialization: professorData.specialization,
        faculty: professorData.faculty,
        phone: professorData.phone.trim(),
        email: professorData.email.toLowerCase().trim(),
        username: professorData.username,
        password: defaultPassword,
        role: "Professor",
        // ✅ Fix: Save correct type based on selection
        type: userType === "theory" ? "theory" : "practical",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Use LecturerID as the document ID for easy lookup
      await setDoc(doc(db, "professors", finalLecturerID), professorDoc);

      setAlert({
        show: true,
        type: "success",
        message: `
          ${userType === 'theory' ? 'Theory Professor' : 'Practical Engineer'} "${professorData.fullName}" has been successfully added!
          LecturerID: ${finalLecturerID}
          Username: ${professorData.username}
          Default Password: ${defaultPassword}
          Please share these credentials with the professor.
        `
      });

      // Reset form
      setProfessorData({
        fullName: "",
        specialization: "",
        faculty: "",
        phone: "",
        email: "",
        username: ""
      });
      setLecturerID('');

    } catch (error) {
      console.error("Error adding professor:", error);
      setAlert({
        show: true,
        type: "error",
        message: "An error occurred while adding the professor. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProfessorData({
      fullName: '',
      specialization: '',
      faculty: '',
      phone: '',
      email: '',
      username: ''
    });
    setLecturerID('');
    setAlert({ show: false, type: '', message: '' });
  };

  const faculties = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Computer Engineering',
    'Data Science',
    'Cybersecurity',
    'Artificial Intelligence',
    'Networking',
    'Information Systems'
  ];

  const specializations = [
    'Artificial Intelligence (AI)',
    'Software Engineering',
    'Robotics',
    'Data Science',
    'Machine Learning',
    'Computer Networks',
    'Cybersecurity',
    'Computer Vision',
    'Natural Language Processing',
    'Database Systems',
    'Web Development',
    'Mobile App Development',
    'Cloud Computing',
    'Internet of Things (IoT)',
    'Operating Systems',
    'Computer Architecture',
    'Embedded Systems',
    'Human-Computer Interaction',
    'Game Development',
    'Bioinformatics'
  ];

  return (
    <div className="add-professors-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-user-plus"></i>
            Add New {userType === 'theory' ? 'Professor' : 'Engineer'}
          </h1>
          <p className="page-subtitle">
            Add new {userType === 'theory' ? 'professors' : 'engineers'} to the academic system
          </p>
        </div>
        <div className="header-actions">
          <div className="admin-info">
            <i className="fas fa-user-shield"></i>
            <span>System Administrator</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            <span style={{ whiteSpace: 'pre-line' }}>{alert.message}</span>
            <button 
              className="alert-close" 
              onClick={() => setAlert({ ...alert, show: false })}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* User Type Tabs */}
        <div className="user-type-tabs">
          <div className="tabs-container">
            <button 
              className={`tab-button ${userType === 'theory' ? 'active' : ''}`}
              onClick={() => setUserType('theory')}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              <span>Theory Professor</span>
              <small>Academic theory instructors</small>
            </button>
            <button 
              className={`tab-button ${userType === 'practical' ? 'active' : ''}`}
              onClick={() => setUserType('practical')}
            >
              <i className="fas fa-cogs"></i>
              <span>Practical Engineer</span>
              <small>Laboratory and practical instructors</small>
            </button>
          </div>
        </div>

        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">
              <i className="fas fa-file-alt"></i>
              {userType === 'theory' ? 'Professor' : 'Engineer'} Registration Form
            </h2>
            <div className="form-subtitle">
              All fields marked with (*) are required
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="professor-form">
            <div className="form-grid">
              {/* Lecturer ID */}
              <div className="form-group">
                <label htmlFor="lecturerID" className="form-label">
                  <i className="fas fa-id-card"></i>
                  Lecturer ID *
                </label>
                <div className="input-with-action">
                  <input
                    type="text"
                    id="lecturerID"
                    value={lecturerID}
                    onChange={(e) => setLecturerID(e.target.value)}
                    className="form-input"
                    placeholder="0001"
                    required
                    disabled={loading}
                    maxLength="4"
                    pattern="[0-9]{4}"
                  />
                  <button
                    type="button"
                    className="btn btn-generate"
                    onClick={generateLecturerID}
                    disabled={loading}
                  >
                    <i className="fas fa-sync-alt"></i>
                    Generate
                  </button>
                </div>
                <div className="form-hint">4-digit unique ID for the professor</div>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  <i className="fas fa-user"></i>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={professorData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={`Enter ${userType === 'theory' ? 'professor' : 'engineer'}'s full name`}
                  required
                  disabled={loading}
                />
                <div className="form-hint">Example: Ahmed Ali Mohammed</div>
              </div>

              {/* Username */}
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  <i className="fas fa-user-circle"></i>
                  Username *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={professorData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your user name"
                  required
                  disabled={loading}
                />
                <div className="form-hint">Login username (e.g., drflan)</div>
              </div>

              {/* Faculty */}
              <div className="form-group">
                <label htmlFor="faculty" className="form-label">
                  <i className="fas fa-university"></i>
                  Faculty *
                </label>
                <select
                  id="faculty"
                  name="faculty"
                  value={professorData.faculty}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={loading}
                >
                  <option value="">Select Faculty</option>
                  {faculties.map((faculty, index) => (
                    <option key={index} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
                <div className="form-hint">Select the faculty/department</div>
              </div>

              {/* Specialization */}
              <div className="form-group">
                <label htmlFor="specialization" className="form-label">
                  <i className="fas fa-graduation-cap"></i>
                  Specialization *
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  value={professorData.specialization}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={loading}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((specialization, index) => (
                    <option key={index} value={specialization}>
                      {specialization}
                    </option>
                  ))}
                </select>
                <div className="form-hint">Select academic specialization</div>
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  <i className="fas fa-phone"></i>
                  Phone Number *
                </label>
                <div className="input-with-prefix">
                  <span className="prefix">+963</span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={professorData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="955123456"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-hint">Phone number without country code</div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <i className="fas fa-envelope"></i>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={professorData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="example@university.edu.sy"
                  required
                  disabled={loading}
                />
                <div className="form-hint">Use official university email</div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={resetForm}
                disabled={loading}
              >
                <i className="fas fa-redo"></i>
                Reset Form
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle"></i>
                    Add {userType === 'theory' ? 'Professor' : 'Engineer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <div className="info-card-header">
              <i className="fas fa-info-circle"></i>
              <h3>Important Information</h3>
            </div>
            <div className="info-card-body">
              <ul>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>LecturerID will be used for course assignments</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Default password: First 4 letters of name + LecturerID</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Email must be official university email</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Verify all information before submission</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <i className="fas fa-history"></i>
              <h3>System Information</h3>
            </div>
            <div className="info-card-body">
              <div className="system-info">
                <div className="info-item">
                  <span className="info-label">Last Update:</span>
                  <span className="info-value">Today {new Date().toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">System Status:</span>
                  <span className="info-value status-active">Operational</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Today's Additions:</span>
                  <span className="info-value">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}