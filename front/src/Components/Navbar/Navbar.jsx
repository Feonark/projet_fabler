import React from "react";
import { useAuth } from "../../Contexts/AuthContext";
import "./Navbar.css";
import { Link, useNavigate } from "react-router";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar__container">
      <Link to="/" className="navbar__logo">
        Logo
      </Link>
      <nav className="navbar__nav">
        <Link to="/">Home</Link>
        <Link to="/">Search</Link>
        <Link to="/profile">Profile</Link>
      </nav>
      {isAuthenticated ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  );
};

export default Navbar;
