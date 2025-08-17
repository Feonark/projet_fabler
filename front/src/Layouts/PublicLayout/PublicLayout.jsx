import React from "react";
import { Outlet, Link } from "react-router";
import "./PublicLayout.css";
import Navbar from "../../Components/Navbar/Navbar";

const PublicLayout = () => {
  return (
    <div className="layout__container">
      <header className="layout__header">
        <Navbar />
      </header>

      <div className="layout__content">
        <main className="layout__main">
          <Outlet />
        </main>

        <footer className="layout__footer">FooterContent</footer>
      </div>
    </div>
  );
};

export default PublicLayout;
