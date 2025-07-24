import React from "react";
import { Outlet, Link } from "react-router";
import "./PublicLayout.css";
import Navbar from "../../Components/Navbar/Navbar";

const PublicLayout = () => {
  return (
    <div class="container">
      <header class="header">
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
