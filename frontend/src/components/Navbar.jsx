import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">SurveyHub</Link>
      </div>
      {user && (
        <div className="navbar-links">
          {user.role === 'company' && (
            <>
              <Link to="/company/profile">Profile</Link>
              <Link to="/company/products">Products</Link>
              <Link to="/company/surveys">My Surveys</Link>
            </>
          )}
          {user.role !== 'company' && (
            <Link to="/surveys">Surveys</Link>
          )}
          <Link to="/change-password">Change Password</Link>
          <span className="navbar-user">Hi, {user.name}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
