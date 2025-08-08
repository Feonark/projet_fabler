import React from "react";
import { Outlet, Link } from "react-router";
import "./PublicLayout.css";
import Navbar from "../../Components/Navbar/Navbar";

const PublicLayout = () => {
  return (
    <div className="container">
      <header className="header">
        <Navbar />
      </header>

      <main>
        <Outlet />
      </main>

      <footer>FooterContent</footer>
    </div>
  );
};

export default PublicLayout;
