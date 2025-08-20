import React from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { Link, useNavigate } from "react-router";
import { House, Search, User, LogIn, Power } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar__container">
      <div className="navbar">
        <Link to="/" className="navbar__link" id="logo__link">
          <img src="/logo_fabler.png" alt="Logo" className="navbar__logo" />
        </Link>
        <nav className="navbar__nav">
          <Link to="/" className="navbar__link">
            <House className="navbar__icon" />
          </Link>
          <Link to="/stories/search" className="navbar__link">
            <Search className="navbar__icon" />
          </Link>
          {token && (
            <Link to="/profile" className="navbar__link">
              <User className="navbar__icon" />
            </Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="navbar__link"
              id="logout__link"
            >
              <Power className="navbar__icon" />
            </button>
          ) : (
            <Link to="/login" className="navbar__link">
              <LogIn className="navbar__icon" />
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
