import React from 'react';
import './CallHistory.css';

const CallHistory = ({ history }) => {
  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'CONNECTED': return 'success';
      case 'NO_ANSWER': return 'warning';
      case 'VOICEMAIL': return 'info';
      case 'CALLBACK': return 'primary';
      case 'DO_NOT_CALL': return 'danger';
      default: return 'default';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="call-history-card">
      <h3>Recent Calls</h3>
      
      {history.length === 0 ? (
        <p className="no-calls">No calls yet</p>
      ) : (
        <div className="history-list">
          {history.slice(0, 10).map((call, index) => (
            <div key={index} className="history-item">
              <div className="history-time">
                {formatTime(call.timestamp)}
              </div>
              <div className="history-info">
                <div className="history-name">{call.lead_name}</div>
                <div className="history-phone">{call.phone_number}</div>
              </div>
              <div className={`history-outcome outcome-${getOutcomeColor(call.outcome)}`}>
                {call.outcome.replace('_', ' ')}
              </div>
              <div className="history-duration">
                {call.duration || '00:00'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CallHistory;