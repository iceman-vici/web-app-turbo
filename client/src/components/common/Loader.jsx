import React from 'react';
import './Loader.css';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`loader loader-${size}`}></div>
      </div>
    );
  }

  return (
    <div className="loader-container">
      <div className={`loader loader-${size}`}></div>
    </div>
  );
};

export default Loader;