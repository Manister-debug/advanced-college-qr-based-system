import React from "react";
import Navbar from "../../components/SubAdminNavbar/SubAdminNavbar.jsx"; // تأكد من المسار الصحيح

const Home = () => {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          <h1>Welcome to the Home Page</h1>
          <p>Hello mahmod alagha👋</p>
        </div>
      </main>
    </div>
  );
};

export default Home;