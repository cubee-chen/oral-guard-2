import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../store/slices/authSlice";
import "../css/Header.css"; // Updated CSS file

function Header({ isHomePage }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // 1) Log out
  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk());
      console.log("Logged out (Redux state is now null).");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("登出失敗，請稍後再試");
    }
  };

  // 2) Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // 3) Close dropdown if clicked outside
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  // 4) Close dropdown if user scrolls
  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
    setDropdownOpen(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`header ${scrolled || !isHomePage ? "scrolled" : "transparent"}`}
    >
      <div className="header-container">
        <div className="logo">
          <Link to="/">Pinecraft</Link>
        </div>
        <div className="nav-links">
          {user ? (
            <div className="profile-dropdown" ref={dropdownRef}>
              <img
                src={user.profilePicture || "/default-profile.png"}
                alt="Profile"
                className="profile-picture"
                onClick={toggleDropdown}
              />
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/user-profile");
                      setDropdownOpen(false);
                    }}
                  >
                    帳戶管理
                  </div>
                  <div
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    登出
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">登入</Link>
          )}

          <Link to="/about-us">關於我們</Link>
          <button
            className="search-button"
            onClick={(e) => {
              e.preventDefault();
              alert("搜尋功能尚未開放，敬請期待！");
            }}
          >
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Header;
