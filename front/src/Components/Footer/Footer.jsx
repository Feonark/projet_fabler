import "./Footer.css";
import { Link } from "react-router";
import { Github, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer__supercontainer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__fabler">
            <img src="/logo_fabler.png" alt="Logo" className="footer__logo" />
            <span className="footer__liner">
              Where stories are forged, one line at a time.
            </span>
          </div>

          <hr className="footer__divider" />

          <div className="footer__infos">
            <div className="links__container">
              <span className="footer__link-category">Navigation</span>
              <Link to="/" className="footer__link">
                Home
              </Link>
              <Link to="/stories/search" className="footer__link">
                Search
              </Link>
              <Link to="/login" className="footer__link">
                Login
              </Link>
              <Link to="/register" className="footer__link">
                Register
              </Link>
            </div>
            <div className="links__container">
              <span className="footer__link-category">Legal</span>
              <Link className="footer__link">Terms & conditions</Link>
              <Link className="footer__link">Privacy policy</Link>
              <Link className="footer__link">Terms of use</Link>
            </div>
            <div className="links__container">
              <span className="footer__link-category">Get in touch</span>
              <a className="footer__link" href="mailto:hugo.thivel@gmail.com">
                hugo.thivel@gmail.com
              </a>
              <div className="footer__socials">
                <a
                  href="https://github.com/feonark"
                  target="_blank"
                  className="btn"
                >
                  <Github className="social__icon" />
                </a>
                <a
                  href="https://www.linkedin.com/in/hugo-thivel/"
                  target="_blank"
                  className="btn"
                >
                  <Linkedin className="social__icon" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <span className="footer__copyright">
          Hugo Thivel 2025 © All rights reserved
        </span>
      </div>
    </footer>
  );
};

export default Footer;
