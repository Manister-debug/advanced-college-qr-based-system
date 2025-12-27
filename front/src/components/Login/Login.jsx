import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Login.css";

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // نستخدم loginWithFirestore بدل login
  const { user, loginWithFirestore, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "student") {  
        navigate("/student/home");
      } else if (user.role === "sub-admin") {
        navigate("/home");
      } else if (user.role === "lecturer") {
        navigate("/lecturer/home");
      } else if (user.role === "admin") {
        navigate("/admin/home");
      }
    }
  }, [user, navigate]);

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
      [e.target.name]: e.target.value,
    });

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔥 تسجيل الدخول عبر Firestore
      await loginWithFirestore(credentials.username, credentials.password);

      // التوجيه سيتم تلقائيًا عبر useEffect
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>UniScan</h1>
          <p>Sign in to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

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
              autoFocus
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

          <button type="submit" disabled={loading} className="login-button">
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