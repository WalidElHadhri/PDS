import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          PDS Platform
        </Link>
        {user ? (
          <div className="navbar-menu">
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <Link to="/projects/new" className="navbar-link">New Project</Link>
            <span className="navbar-user">Welcome, {user.username}</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar-menu">
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-link">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
