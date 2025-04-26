import "../css/Footer.css";
import NotionLogo from "../assets/notion-logo.svg";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>相關連結</h4>
          <a
            href="https://www.instagram.com/pinecraft.notion/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-instagram"></i> Instagram
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61562886333392"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-facebook"></i> Facebook
          </a>
          <a
            href="https://www.notion.so/profile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={ NotionLogo } alt="Notion Logo" className="notion-icon"/> Creator Page
          </a>
        </div>
        <div className="footer-section">
          <h4>聯絡我們</h4>
          <p>
            <i className="fas fa-envelope"></i> pinecraft.notion@gmail.com
          </p>
          <p>
            <i className="fas fa-phone-alt"></i> 0902-216-809
          </p>
          <p>
            <i className="fas fa-map-marker-alt"></i> Taipei, Taiwan
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 PINECRAFT. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
