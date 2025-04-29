// src/components/common/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/components/Navbar.css';

const Navbar = () => {
  const { user, logout, isPatient, isDentist } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Dental Care</h1>
      </div>
      
      {user && (
        <div className="navbar-menu">
          {isPatient && (
            <>
              <Link to="/patient/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/patient/upload" className="nav-link">Upload Images</Link>
            </>
          )}
          
          {isDentist && (
            <Link to="/dentist/dashboard" className="nav-link">Dashboard</Link>
          )}
          
          <div className="user-info">
            <span>{user.firstName} {user.lastName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;