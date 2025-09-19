import React from 'react';
import './SessionControls.css';

const SessionControls = ({
  dialerState,
  onStart,
  onPause,
  onResume,
  onStop,
  loading,
  session
}) => {
  return (
    <div className="session-controls-card">
      <h3>Session Controls</h3>
      
      <div className="control-buttons">
        {dialerState === 'STOP' ? (
          <button
            className="control-btn control-start"
            onClick={onStart}
            disabled={loading}
          >
            <span className="control-icon">▶️</span>
            <span>Start Session</span>
          </button>
        ) : (
          <>
            {dialerState === 'PLAY' ? (
              <button
                className="control-btn control-pause"
                onClick={onPause}
                disabled={loading}
              >
                <span className="control-icon">⏸️</span>
                <span>Pause</span>
              </button>
            ) : (
              <button
                className="control-btn control-resume"
                onClick={onResume}
                disabled={loading}
              >
                <span className="control-icon">▶️</span>
                <span>Resume</span>
              </button>
            )}
            
            <button
              className="control-btn control-stop"
              onClick={onStop}
              disabled={loading}
            >
              <span className="control-icon">⏹️</span>
              <span>Stop</span>
            </button>
          </>
        )}
      </div>

      <div className="session-status">
        <div className={`status-badge status-${dialerState.toLowerCase()}`}>
          {dialerState}
        </div>
        {session && (
          <div className="session-info">
            <p>Campaign: {session.campaign_name || 'Default'}</p>
            <p>Sheet: {session.spreadsheet_id?.substring(0, 8)}...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionControls;