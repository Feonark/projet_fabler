import React from "react";
import { Link } from "react-router";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="page__container">
      <div className="page__title-header notfound__title-header">
        <h1 className="title">Sorry, the page you requested doesn't exist.</h1>
        <Link to="/" className="btn invert-btn">
          Go back to homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
