import React from 'react';
import './Card.css';

const Card = ({ 
  title, 
  subtitle, 
  children, 
  actions, 
  className = '', 
  hoverable = false,
  onClick
}) => {
  return (
    <div 
      className={`card ${hoverable ? 'hoverable' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div className="card-header-text">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;