import { useState } from 'react';
import './RegisterStudents.css';
import { db } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function RegisterStudents() {
  const [studentData, setStudentData] = useState({
    fullName: '',
    universityId: '',
    phone: '',
    email: '',
    branch: ''
  });
  
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ⭐ توليد كلمة مرور عشوائية
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let pass = "";
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation for required fields
    if (!studentData.fullName || !studentData.universityId || !studentData.phone || !studentData.email || !studentData.branch) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentData.email)) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter a valid email address.'
      });
      return;
    }
    
    // Phone validation
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(studentData.phone.replace(/\s+/g, ''))) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter a valid phone number.'
      });
      return;
    }
    
    // University ID validation
    const idRegex = /^\d+$/;
    if (!idRegex.test(studentData.universityId)) {
      setAlert({
        show: true,
        type: 'error',
        message: 'University ID should contain only numbers.'
      });
      return;
    }

    try {
      const cleanId = studentData.universityId.trim();

      // ⭐ التحقق من أن الطالب موجود مسبقًا
      const existingStudent = await getDoc(doc(db, "users", cleanId));
      if (existingStudent.exists()) {
        setAlert({
          show: true,
          type: 'error',
          message: 'A student with this University ID already exists.'
        });
        return;
      }

      // ⭐ توليد كلمة مرور عشوائية
      const randomPassword = generatePassword();

      // ⭐ حفظ الطالب داخل Firestore
      await setDoc(doc(db, "users", cleanId), {
        name: studentData.fullName,
        studentId: cleanId,
        phone: studentData.phone,
        email: studentData.email,
        branch: studentData.branch,
        faculty: studentData.branch.toLowerCase(),
        role: "student",
        username: studentData.email.split("@")[0],
        usernameLower: studentData.email.split("@")[0].toLowerCase(),
        password: randomPassword,
        adminLevel: 0,
        lecturerId: "",
        specialization: ""
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Student has been successfully registered in the system!'
      });

      setStudentData({
        fullName: '',
        universityId: '',
        phone: '',
        email: '',
        branch: ''
      });

    } catch (error) {
      console.error("Error registering student:", error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Failed to register student. Please try again.'
      });
    }
  };

  const resetForm = () => {
    setStudentData({
      fullName: '',
      universityId: '',
      phone: '',
     email: '',
      branch: ''
    });
    setAlert({ show: false, type: '', message: '' });
  };

  const branches = [
    'Software Engineering',
    'Artificial Intelligence (AI)',
    'Networking',
    'Robotics',
    'Cyber Security',
    'Data Science',
    'Computer Science',
    'Information Technology',
    'Machine Learning',
    'Computer Vision',
    'Web Development',
    'Mobile App Development',
    'Cloud Computing',
    'Internet of Things (IoT)'
  ];

  return (
    <div className="register-students-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-user-plus"></i>
            Register New Student
          </h1>
          <p className="page-subtitle">Add new students to the college system</p>
        </div>
        <div className="user-info">
          <span>Secretary Name</span>
        </div>
      </div>

      <div className="main-content">
        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {alert.message}
          </div>
        )}

        <div className="form-container">
          <h2 className="form-title">Student Registration Form</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={studentData.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="universityId" className="form-label">
                  Student University ID *
                </label>
                <input
                  type="text"
                  id="universityId"
                  name="universityId"
                  value={studentData.universityId}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter university identification number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={studentData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={studentData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="branch" className="form-label">
                  Branch *
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={studentData.branch}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                <i className="fas fa-undo"></i>
                Reset Form
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i>
                Register Student
              </button>
            </div>
          </form>
        </div>

        <div className="info-card">
          <h3><i className="fas fa-info-circle"></i> Important Notes</h3>
          <ul>
            <li>All fields marked with * are required</li>
            <li>University ID must be unique and follow university format</li>
            <li>Phone number should include country code if applicable</li>
            <li>Email should be the official university email address</li>
            <li>Student will receive login credentials via email after registration</li>
            <li>Ensure all information is accurate before submission</li>
          </ul>
        </div>
      </div>
    </div>
  );
}