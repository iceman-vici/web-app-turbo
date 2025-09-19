import React, { useEffect } from 'react';
import './DispositionModal.css';

const DispositionModal = ({ isOpen, call, onDisposition, onClose }) => {
  const dispositions = [
    { key: '1', value: 'CONNECTED', label: 'Connected', color: 'success', icon: '✅' },
    { key: '2', value: 'NO_ANSWER', label: 'No Answer', color: 'warning', icon: '📞' },
    { key: '3', value: 'VOICEMAIL', label: 'Voicemail', color: 'info', icon: '📧' },
    { key: '4', value: 'CALLBACK', label: 'Callback', color: 'primary', icon: '🔄' },
    { key: '5', value: 'DO_NOT_CALL', label: 'Do Not Call', color: 'danger', icon: '🚫' }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !call) return null;

  return (
    <div className="disposition-overlay">
      <div className="disposition-modal">
        <div className="disposition-header">
          <h2>Call Disposition</h2>
          <div className="call-details">
            <h3>{call.lead_name}</h3>
            <p>{call.phone_number}</p>
            <p className="call-duration">Duration: {call.duration || '00:00'}</p>
          </div>
        </div>

        <div className="disposition-body">
          <p className="disposition-prompt">Select outcome (press 1-5):</p>
          
          <div className="disposition-buttons">
            {dispositions.map(dispo => (
              <button
                key={dispo.key}
                className={`disposition-btn disposition-${dispo.color}`}
                onClick={() => onDisposition(dispo.value)}
              >
                <span className="disposition-key">{dispo.key}</span>
                <span className="disposition-icon">{dispo.icon}</span>
                <span className="disposition-label">{dispo.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="disposition-footer">
          <p className="disposition-hint">
            Press number keys 1-5 for quick selection
          </p>
        </div>
      </div>
    </div>
  );
};

export default DispositionModal;