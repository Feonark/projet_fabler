import React from "react";
import { Outlet, Link, useLocation } from "react-router";
import "./PublicLayout.css";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

const PublicLayout = () => {
  const location = useLocation();
  const hideFooterOn = ["/chat/:id", "/login"];

  const shouldHideFooter =
    location.pathname.endsWith("/chat") ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="layout__container">
      <header className="layout__header">
        <Navbar />
      </header>

      <div className="layout__content">
        <main className="layout__main">
          <Outlet />
        </main>

        {!shouldHideFooter && <Footer />}
      </div>
    </div>
  );
};

export default PublicLayout;
