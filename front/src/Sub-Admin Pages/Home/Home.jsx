import React from "react";
import Navbar from "../../components/SubAdminNavbar/SubAdminNavbar.jsx";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user, logout, getDisplayName } = useAuth();

  // رسالة ترحيب حسب الوقت
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return " good morning";
    if (hour < 18) return "good afternoon  ";
    return "good night ";
  };

  return (
    <div className="App" style={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Navbar />
      <main className="main-content" style={{ padding: "40px", textAlign: "center" }}>
        <div className="page-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
            {getGreeting()} 
          </h1>
          <p style={{ fontSize: "20px", marginBottom: "30px" }}>
            coming soon          </p>
          <button
            onClick={logout}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            تسجيل الخروج
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;