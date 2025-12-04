import { useState } from 'react';
import './AddProfessors.css';

export default function AddProfessors() {
  const [userType, setUserType] = useState('professor'); // 'professor' or 'engineer'
  const [professorData, setProfessorData] = useState({
    fullName: '',
    specialization: '',
    phone: '',
    email: ''
  });
  
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfessorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation for required fields
    if (!professorData.fullName || !professorData.specialization || !professorData.phone || !professorData.email) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(professorData.email)) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter a valid email address.'
      });
      return;
    }
    
    // Phone validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(professorData.phone.replace(/\s+/g, ''))) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter a valid phone number.'
      });
      return;
    }
    
    // Simulate API call
    setAlert({
      show: true,
      type: 'success',
      message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} has been successfully added to the system!`
    });
    
    // Reset form
    setProfessorData({
      fullName: '',
      specialization: '',
      phone: '',
      email: ''
    });
  };

  const resetForm = () => {
    setProfessorData({
      fullName: '',
      specialization: '',
      phone: '',
      email: ''
    });
    setAlert({ show: false, type: '', message: '' });
  };

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
    'Internet of Things (IoT)'
  ];

  return (
    <div className="professors-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-chalkboard-teacher"></i>
            Add New {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </h1>
          <p className="page-subtitle">Add new {userType === 'professor' ? 'professors' : 'engineers'} to the college system</p>
        </div>
        <div className="user-info">
          <span>Administrator</span>
        </div>
      </div>

      <div className="main-content">
        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {alert.message}
          </div>
        )}

        {/* User Type Tabs */}
        <div className="user-type-tabs">
          <div className="tabs-container">
            <button 
              className={`tab-button ${userType === 'professor' ? 'active' : ''}`}
              onClick={() => setUserType('professor')}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              Professor
            </button>
            <button 
              className={`tab-button ${userType === 'engineer' ? 'active' : ''}`}
              onClick={() => setUserType('engineer')}
            >
              <i className="fas fa-cogs"></i>
              Engineer
            </button>
          </div>
        </div>

        <div className="form-container">
          <h2 className="form-title">{userType.charAt(0).toUpperCase() + userType.slice(1)} Registration Form</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={professorData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={`Enter ${userType}'s full name`}
                  required
                />
              </div>

              {/* Specialization */}
              <div className="form-group">
                <label htmlFor="specialization" className="form-label">
                  Specialization *
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  value={professorData.specialization}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(specialization => (
                    <option key={specialization} value={specialization}>{specialization}</option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={professorData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter contact number"
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={professorData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <i className="fas fa-undo"></i>
                Reset Form
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-user-plus"></i>
                Add {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </button>
            </div>
          </form>
        </div>

        <div className="info-card">
          <h3><i className="fas fa-info-circle"></i> Important Notes</h3>
          <ul>
            <li>All fields marked with * are required</li>
            <li>Phone number should include country code if applicable</li>
            <li>Email should be the official university/work email address</li>
            <li>{userType.charAt(0).toUpperCase() + userType.slice(1)} will receive system access credentials via email</li>
            <li>Ensure all information is accurate before submission</li>
          </ul>
        </div>
      </div>
    </div>
  );
}