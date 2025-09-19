import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">Web App Turbo</h3>
          <p className="footer-description">
            Building the future of web applications with modern technologies.
          </p>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Product</h4>
          <ul className="footer-links">
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/docs">Documentation</Link></li>
            <li><Link to="/api">API</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Web App Turbo. All rights reserved.</p>
        <div className="social-links">
          <a href="#" aria-label="Twitter">🐦</a>
          <a href="#" aria-label="GitHub">🐱</a>
          <a href="#" aria-label="LinkedIn">👥</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;