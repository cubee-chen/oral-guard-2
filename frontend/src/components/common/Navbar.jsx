// src/components/common/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/Navbar.css';

const Navbar = () => {
  const { user, logout, isPatient, isWorker, isFacility } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>OralGuard</h1>
      </div>
      
      {user && (
        <div className="navbar-menu">
          {isPatient && (
            <>
              <Link to="/patient/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/patient/profile" className="nav-link">My Profile</Link>
            </>
          )}
          
          {isWorker && (
            <Link to="/worker/dashboard" className="nav-link">Dashboard</Link>
          )}
          
          {isFacility && (
            <Link to="/facility/dashboard" className="nav-link">Dashboard</Link>
          )}
          
          <div className="user-info">
            <span className="user-name">{user.firstName} {user.lastName}</span>
            <span className="user-role">{user.role}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;