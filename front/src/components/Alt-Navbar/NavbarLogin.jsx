import { NavLink } from "react-router-dom";
import "../Login/Login.css"; // Reusing the same CSS file
import UniScanLogo from "../../assets/UniScan.png";

export default function NavbarLogin() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Only the logo, centered */}
        <NavLink to="/" className="nav-logo nav-logo-centered">
          <img 
            src={UniScanLogo} 
            alt="UniScan Logo" 
            className="logo-image"
          />
          <span className="logo-text">UniScan</span>
        </NavLink>
      </div>
    </nav>
  );
}