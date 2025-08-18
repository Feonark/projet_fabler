import React from "react";
import { Outlet, Link, useLocation } from "react-router";
import "./PublicLayout.css";
import Navbar from "../../Components/Navbar/Navbar";

const PublicLayout = () => {
  const location = useLocation();
  const hideFooterOn = ["/chat/:id", "/login"];

  const shouldHideFooter =
    location.pathname.endsWith("/chat") || location.pathname === "/login";

  return (
    <div className="layout__container">
      <header className="layout__header">
        <Navbar />
      </header>

      <div className="layout__content">
        <main className="layout__main">
          <Outlet />
        </main>

        {!shouldHideFooter && (
          <footer className="layout__footer">FooterContent</footer>
        )}
      </div>
    </div>
  );
};

export default PublicLayout;
