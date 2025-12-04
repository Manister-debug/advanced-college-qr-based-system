import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import "./Login.css";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Skip the login page if user already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // API call
      const result = await mockAuthentication(credentials);
      
      if (result.success) {
        login(result.user, result.token);

      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mock authentication function - replace with actual API
  const mockAuthentication = async (credentials) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock user validation
        if (credentials.username === "subadmin" && credentials.password === "password") {
          resolve({
            success: true,
            user: {
              id: 1,
              username: 'subadmin',
              name: 'Faculty Secretary',
              role: 'sub-admin',
              faculty: 'Computer Science'
            },
            token: 'mock-jwt-token-subadmin'
          });
        } else if (credentials.username === "student" && credentials.password === "password") {
          resolve({
            success: true,
            user: {
              id: 2,
              username: 'student123',
              name: 'John Doe',
              role: 'student',
              studentId: '2023001',
              faculty: 'Computer Science'
            },
            token: 'mock-jwt-token-student'
          });
        } else if (!credentials.username || !credentials.password) {
          resolve({
            success: false,
            message: 'Please enter both username and password'
          });
        } else {
          resolve({
            success: false,
            message: 'Invalid credentials. Please try again.'
          });
        }
      }, 1500);
    });
  };

  // If user is already logged in, show loading or nothing (will redirect)
  if (user) {
    return (
      <div className="login-container">
        <div className="login-loading">
          <div className="spinner"></div>
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

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
              Please contact IT support for account registration or if you 
              have forgotten your credentials.
            </p>
          </div>
          
          <div className="support-info">
            <p>
              <strong>IT Support:</strong> it-support@college.edu | Ext: 1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}