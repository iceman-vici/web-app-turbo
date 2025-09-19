import React from 'react';
import './CallStats.css';

const CallStats = ({ stats }) => {
  const calculateRate = () => {
    if (stats.totalCalls === 0) return 0;
    return ((stats.connected / stats.totalCalls) * 100).toFixed(1);
  };

  return (
    <div className="call-stats-card">
      <h3>Session Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Total Calls</span>
          <span className="stat-value">{stats.totalCalls}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Connected</span>
          <span className="stat-value stat-success">{stats.connected}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">No Answer</span>
          <span className="stat-value stat-warning">{stats.noAnswer}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Voicemail</span>
          <span className="stat-value stat-info">{stats.voicemail}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Callback</span>
          <span className="stat-value stat-primary">{stats.callback}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Do Not Call</span>
          <span className="stat-value stat-danger">{stats.doNotCall}</span>
        </div>
      </div>
      
      <div className="stats-summary">
        <div className="summary-item">
          <span className="summary-label">Connect Rate</span>
          <span className="summary-value">{calculateRate()}%</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Calls/Hour</span>
          <span className="summary-value">{stats.callsPerHour || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default CallStats;