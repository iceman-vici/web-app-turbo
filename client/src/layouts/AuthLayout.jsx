import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-header">
        <Link to="/" className="auth-logo">
          <span className="logo-text">Web App Turbo</span>
        </Link>
      </div>
      <main className="auth-content">
        <Outlet />
      </main>
      <footer className="auth-footer-layout">
        <p>&copy; 2024 Web App Turbo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AuthLayout;