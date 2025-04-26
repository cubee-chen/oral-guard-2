import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import "../css/layout/AuthLayout.css";

// Simple layout for login/signup pages
function AuthLayout() {
  return (
    <div>
      <nav className="simplified-header">
        <div className="logo">
          <Link to="/">Pinecraft</Link>
        </div>
      </nav>

      <Outlet />
    </div>
  );
}

export default AuthLayout;
