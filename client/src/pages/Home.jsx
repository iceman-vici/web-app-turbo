import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Web App Turbo</h1>
          <p className="hero-subtitle">
            Build faster, scale better, and deliver exceptional user experiences
          </p>
          <div className="hero-buttons">
            <Link to="/auth/register" className="btn btn-primary btn-lg">
              Get Started
            </Link>
            <Link to="/auth/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="placeholder-image"></div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Advanced Analytics</h3>
              <p>Get detailed insights into your data with powerful analytics tools</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure by Default</h3>
              <p>Enterprise-grade security with end-to-end encryption</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Optimized performance for the best user experience</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Beautiful Design</h3>
              <p>Modern, responsive interface that works on all devices</p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>10K+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-card">
              <h3>99.9%</h3>
              <p>Uptime</p>
            </div>
            <div className="stat-card">
              <h3>24/7</h3>
              <p>Support</p>
            </div>
            <div className="stat-card">
              <h3>50+</h3>
              <p>Features</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;