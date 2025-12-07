import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.name}!</h1>
      <div className="dashboard-content">
        <p>Role: {user.role}</p>
        {/* Add role-specific content here */}
        {user.role === 'student' && (
          <div>
            <h2>Student Dashboard</h2>
            {/* Student-specific features */}
          </div>
        )}
        {user.role === 'sub-admin' && (
          <div>
            <h2>Sub-Admin Dashboard</h2>
            {/* Sub-admin specific features */}
          </div>
        )}
      </div>
    </div>
  );
}