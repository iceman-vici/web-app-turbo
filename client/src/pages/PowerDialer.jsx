import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import DispositionModal from '../components/dialer/DispositionModal';
import CallStats from '../components/dialer/CallStats';
import SessionControls from '../components/dialer/SessionControls';
import CallHistory from '../components/dialer/CallHistory';
import useWebSocket from '../hooks/useWebSocket';
import { dialerService } from '../services/dialerService';
import './PowerDialer.css';

const PowerDialer = () => {
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [dialerState, setDialerState] = useState('STOP'); // PLAY | PAUSE | STOP
  const [currentCall, setCurrentCall] = useState(null);
  const [showDispoModal, setShowDispoModal] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    connected: 0,
    noAnswer: 0,
    voicemail: 0,
    callback: 0,
    doNotCall: 0,
    avgCallDuration: 0,
    callsPerHour: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // WebSocket connection for real-time events
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket(
    process.env.REACT_APP_WS_URL || 'ws://localhost:5000',
    {
      reconnectInterval: 3000,
      reconnectAttempts: 10,
      shouldReconnect: true
    }
  );

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage);
      handleWebSocketMessage(data);
    }
  }, [lastMessage]);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'SHOW_DISPO':
        setCurrentCall({
          call_id: data.call_id,
          row_id: data.row_id,
          num_index: data.num_index,
          lead_name: data.lead_name,
          phone_number: data.phone_number,
          start_time: data.start_time,
          end_time: data.end_time,
          duration: data.duration
        });
        setShowDispoModal(true);
        break;

      case 'NEXT_DIAL':
        // Show toast notification for next dial
        console.log('Dialing next:', data.lead_name);
        break;

      case 'STATE':
        setDialerState(data.ready_state);
        break;

      case 'STATS_UPDATE':
        setStats(data.stats);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  // Start session
  const handleStart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await dialerService.startSession(user.email);
      setSession(response);
      setDialerState('PLAY');
      
      // Start initial dial
      if (response.ready_state === 'PLAY') {
        await handleDial();
      }
    } catch (err) {
      setError('Failed to start session: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pause session
  const handlePause = async () => {
    if (!session) return;
    
    try {
      await dialerService.pauseSession(session.session_id);
      setDialerState('PAUSE');
    } catch (err) {
      setError('Failed to pause session: ' + err.message);
    }
  };

  // Resume session
  const handleResume = async () => {
    if (!session) return;
    
    try {
      await dialerService.resumeSession(session.session_id);
      setDialerState('PLAY');
      // Immediately attempt next dial
      await handleDial();
    } catch (err) {
      setError('Failed to resume session: ' + err.message);
    }
  };

  // Stop session
  const handleStop = async () => {
    if (!session) return;
    
    try {
      await dialerService.stopSession(session.session_id);
      setDialerState('STOP');
      setSession(null);
    } catch (err) {
      setError('Failed to stop session: ' + err.message);
    }
  };

  // Initiate dial
  const handleDial = async () => {
    if (!session || dialerState !== 'PLAY') return;
    
    try {
      const response = await dialerService.dial(session.session_id);
      console.log('Dialing:', response);
    } catch (err) {
      console.error('Failed to dial:', err);
      if (err.message.includes('No more numbers')) {
        setDialerState('STOP');
        setError('No more numbers to dial');
      }
    }
  };

  // Handle disposition submission
  const handleDisposition = async (outcome) => {
    if (!currentCall || !session) return;
    
    try {
      const response = await dialerService.submitDisposition({
        session_id: session.session_id,
        call_id: currentCall.call_id,
        row_id: currentCall.row_id,
        num_index: currentCall.num_index,
        outcome: outcome
      });

      // Add to call history
      setCallHistory(prev => [{
        ...currentCall,
        outcome,
        timestamp: new Date().toISOString()
      }, ...prev].slice(0, 50)); // Keep last 50 calls

      // Close modal
      setShowDispoModal(false);
      setCurrentCall(null);

      // Update stats
      updateStats(outcome);

      // If session is in PLAY state, next dial will be triggered automatically by backend
    } catch (err) {
      setError('Failed to submit disposition: ' + err.message);
    }
  };

  // Update statistics
  const updateStats = (outcome) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalCalls++;
      
      switch (outcome) {
        case 'CONNECTED':
          newStats.connected++;
          break;
        case 'NO_ANSWER':
          newStats.noAnswer++;
          break;
        case 'VOICEMAIL':
          newStats.voicemail++;
          break;
        case 'CALLBACK':
          newStats.callback++;
          break;
        case 'DO_NOT_CALL':
          newStats.doNotCall++;
          break;
      }
      
      return newStats;
    });
  };

  // Check session status on mount/refresh
  useEffect(() => {
    const checkSessionStatus = async () => {
      const sessionId = localStorage.getItem('dialer_session_id');
      if (sessionId) {
        try {
          const status = await dialerService.getSessionStatus(sessionId);
          setSession(status.session);
          setDialerState(status.ready_state);
          
          // Re-show modal if there's a pending disposition
          if (status.pending_disposition) {
            setCurrentCall(status.pending_disposition);
            setShowDispoModal(true);
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('dialer_session_id');
        }
      }
    };

    checkSessionStatus();
  }, []);

  // Store session ID in localStorage
  useEffect(() => {
    if (session?.session_id) {
      localStorage.setItem('dialer_session_id', session.session_id);
    }
  }, [session]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showDispoModal) {
        // Disposition hotkeys
        switch (e.key) {
          case '1':
            handleDisposition('CONNECTED');
            break;
          case '2':
            handleDisposition('NO_ANSWER');
            break;
          case '3':
            handleDisposition('VOICEMAIL');
            break;
          case '4':
            handleDisposition('CALLBACK');
            break;
          case '5':
            handleDisposition('DO_NOT_CALL');
            break;
          case 'Escape':
            // Don't allow closing modal without disposition
            break;
        }
      } else {
        // Control hotkeys
        switch (e.key) {
          case ' ': // Spacebar
            e.preventDefault();
            if (dialerState === 'PLAY') {
              handlePause();
            } else if (dialerState === 'PAUSE') {
              handleResume();
            }
            break;
          case 's':
            if (!session) handleStart();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showDispoModal, dialerState, session]);

  return (
    <div className="power-dialer">
      <div className="dialer-header">
        <h1>Power Dialer</h1>
        <div className="connection-status">
          <span className={`status-indicator ${connectionStatus}`}></span>
          {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="close-btn">×</button>
        </div>
      )}

      <div className="dialer-grid">
        {/* Session Controls */}
        <SessionControls
          dialerState={dialerState}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          loading={loading}
          session={session}
        />

        {/* Call Statistics */}
        <CallStats stats={stats} />

        {/* Current Call Info */}
        {currentCall && (
          <Card title="Current Call" className="current-call-card">
            <div className="call-info">
              <h3>{currentCall.lead_name}</h3>
              <p className="phone-number">{currentCall.phone_number}</p>
              <p className="call-duration">
                Duration: {currentCall.duration || '00:00'}
              </p>
            </div>
          </Card>
        )}

        {/* Call History */}
        <CallHistory history={callHistory} />
      </div>

      {/* Disposition Modal */}
      <DispositionModal
        isOpen={showDispoModal}
        call={currentCall}
        onDisposition={handleDisposition}
        onClose={() => {
          // Don't allow closing without disposition
          console.log('Must select disposition');
        }}
      />

      {/* Keyboard Shortcuts Help */}
      <div className="keyboard-shortcuts">
        <h4>Keyboard Shortcuts</h4>
        <div className="shortcuts-grid">
          <div><kbd>Space</kbd> Play/Pause</div>
          <div><kbd>S</kbd> Start Session</div>
          <div><kbd>1-5</kbd> Disposition (when modal open)</div>
        </div>
      </div>
    </div>
  );
};

export default PowerDialer;