import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import "./Login.css";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    userType: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        navigate("/student/home");
      } else if (user.role === 'sub-admin' || user.role === 'professional') {
        navigate("/home");
      }
    }
  }, [user, navigate]);

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="login-container">
        <div className="login-loading">
          <div className="spinner"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    
    if (error) setError("");
  };

  // Handle user type selection
  const handleUserTypeSelect = (userType) => {
    setCredentials({
      ...credentials,
      userType: userType
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate role selection
    if (!credentials.userType) {
      setError("Please select your role (Student or Professional)");
      setLoading(false);
      return;
    }

    try {
      // Mock authentication function
      const result = await mockAuthentication(credentials);
      
      if (result.success) {
        // Call the login function from AuthContext with user data and token
        login(result.user, result.token);
        
        // Note: The actual redirect will happen in the useEffect above
        // or through the AuthContext state change
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mock authentication function - Updated to match protected routes
  const mockAuthentication = async (credentials) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.userType === 'student') {
          if (credentials.username === "AhmadEAziz" && credentials.password === "ahmadpassword") {
            resolve({
              success: true,
              user: {
                id: 2,
                username: 'AhmadEAziz',
                name: 'Ahmad Imad Eddin Aziz',
                role: 'student',  // Must be 'student' for student routes
                studentId: '202110803',
                faculty: 'Software Engineering'
              },
              token: 'mock-jwt-token-student'
            });
          } else if (credentials.username === "MajdWQadri" && credentials.password === "majdpassword") {
            resolve({
              success: true,
              user: {
                id: 3,
                username: 'MajdWQadri',
                name: 'Majd Waleed Qadri',
                role: 'student',  // Must be 'student' for student routes
                studentId: '202110812',
                faculty: 'Software Engineering'
              },
              token: 'mock-jwt-token-student'
            });
          } else if (credentials.username === "student" && credentials.password === "password") {
            resolve({
              success: true,
              user: {
                id: 5,
                username: 'student',
                name: 'Demo Student',
                role: 'student',  // Must be 'student' for student routes
                studentId: '202100001',
                faculty: 'Software Engineering'
              },
              token: 'mock-jwt-token-student'
            });
          } else {
            resolve({
              success: false,
              message: 'Invalid student credentials. Please check your username and password.'
            });
          }
        }
        
        // PROFESSIONAL/SUB-ADMIN LOGIN - only works if professional role selected
        else if (credentials.userType === 'worker') {
          // Sub-admin with specific password
          if (credentials.username === "subadmin" && credentials.password === "password") {
            resolve({
              success: true,
              user: {
                id: 1,
                username: 'subadmin',
                name: 'Sub Administrator',
                role: 'sub-admin',  // Must be 'sub-admin' for sub-admin routes
                faculty: 'Administration'
              },
              token: 'mock-jwt-token-subadmin'
            });
          }
          // Another professional account
          else if (credentials.username === "professional" && credentials.password === "password") {
            resolve({
              success: true,
              user: {
                id: 4,
                username: 'professional',
                name: 'Professional User',
                role: 'sub-admin',  // Changed from 'professional' to 'sub-admin' to match protected routes
                faculty: 'Administration'
              },
              token: 'mock-jwt-token-professional'
            });
          }
          // Updated demo credentials for professional
          else if (credentials.username === "subadmin" && credentials.password === "subadminpassword") {
            resolve({
              success: true,
              user: {
                id: 6,
                username: 'subadmin',
                name: 'Faculty Secretary',
                role: 'sub-admin',  // Must be 'sub-admin' for sub-admin routes
                faculty: 'Computer Science'
              },
              token: 'mock-jwt-token-subadmin'
            });
          } else {
            resolve({
              success: false,
              message: 'Invalid professional credentials. Please check your username and password.'
            });
          }
        }
        
        // No role selected
        else {
          resolve({
            success: false,
            message: 'Please select your role first.'
          });
        }
      }, 1500);
    });
  };

  // If user is already logged in, show loading (handled by authLoading above)

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>UniScan</h1>
          <p>Sign in to access your account</p>
        </div>

        <div className="role-selection">
          <h3>Select Your Role</h3>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-button ${credentials.userType === 'student' ? 'active' : ''}`}
              onClick={() => handleUserTypeSelect('student')}
              disabled={loading}
            >
              Student
            </button>
            <button
              type="button"
              className={`role-button ${credentials.userType === 'worker' ? 'active' : ''}`}
              onClick={() => handleUserTypeSelect('worker')}
              disabled={loading}
            >
              Professional
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username / Student ID
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={credentials.username}
              onChange={handleChange}
              disabled={loading}
              className="form-input"
              placeholder="Enter your username or student ID"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

       

        <div className="login-footer">
          <div className="signup-info">
            <h3>Account Creation</h3>
            <p>
              Account creation is managed exclusively by the IT Department. 
              Please contact IT support for account registration.
            </p>
          </div>
          
          <div className="support-info">
            <p>
              <strong>IT Support:</strong> it-support@ypu.sy.edu | Ext: 7721
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}