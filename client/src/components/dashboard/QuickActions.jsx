import React from 'react';
import Card from '../common/Card';
import './QuickActions.css';

const QuickActions = () => {
  const actions = [
    { icon: '📝', label: 'New Report', color: 'primary' },
    { icon: '👤', label: 'Add User', color: 'success' },
    { icon: '📊', label: 'Export Data', color: 'info' },
    { icon: '⚙️', label: 'Settings', color: 'default' }
  ];

  return (
    <Card title="Quick Actions" className="quick-actions">
      <div className="actions-grid">
        {actions.map((action, index) => (
          <button key={index} className={`action-btn action-${action.color}`}>
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;