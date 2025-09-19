import React, { useState } from 'react';
import { Play, Pause, Square, Phone, PhoneOff } from 'lucide-react';
import { useDialerStore } from '../store/dialerStore';
import { dialerService } from '../services/dialer';
import { ReadyState } from '../constants';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import PropTypes from 'prop-types';

export function DialerControl({ agentEmail }) {
  const {
    sessionId,
    readyState,
    currentCallId,
    currentLeadName,
    setSession,
    setReadyState,
    incrementCallCount,
    reset
  } = useDialerStore();
  
  const [loading, setLoading] = useState(false);
  
  const handleStart = async () => {
    try {
      setLoading(true);
      const session = await dialerService.startSession(agentEmail);
      setSession(session.sessionId, session.spreadsheetId, session.tabId);
      
      // Immediately dial first number
      await dialerService.dial(session.sessionId);
      incrementCallCount();
      
      toast.success('Session started');
    } catch (error) {
      toast.error('Failed to start session');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePause = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      await dialerService.pauseSession(sessionId);
      setReadyState(ReadyState.PAUSE);
      toast.info('Session paused');
    } catch (error) {
      toast.error('Failed to pause session');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResume = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      await dialerService.resumeSession(sessionId);
      setReadyState(ReadyState.PLAY);
      toast.success('Session resumed');
    } catch (error) {
      toast.error('Failed to resume session');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStop = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      await dialerService.stopSession(sessionId);
      reset();
      toast.info('Session stopped');
    } catch (error) {
      toast.error('Failed to stop session');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Dialer Control</h2>
        <div className="flex items-center space-x-2">
          <div
            className={clsx(
              'w-3 h-3 rounded-full',
              {
                'bg-green-500 animate-pulse': readyState === ReadyState.PLAY,
                'bg-yellow-500': readyState === ReadyState.PAUSE,
                'bg-gray-400': readyState === ReadyState.STOP
              }
            )}
          />
          <span className="text-sm font-medium">
            {readyState === ReadyState.PLAY && 'Active'}
            {readyState === ReadyState.PAUSE && 'Paused'}
            {readyState === ReadyState.STOP && 'Stopped'}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-4 mb-6">
        {!sessionId ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex-1 btn-success flex items-center justify-center space-x-2"
          >
            <Play size={20} />
            <span>Start Session</span>
          </button>
        ) : (
          <>
            {readyState === ReadyState.PLAY ? (
              <button
                onClick={handlePause}
                disabled={loading}
                className="flex-1 btn-secondary flex items-center justify-center space-x-2"
              >
                <Pause size={20} />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleResume}
                disabled={loading || readyState === ReadyState.STOP}
                className="flex-1 btn-success flex items-center justify-center space-x-2"
              >
                <Play size={20} />
                <span>Resume</span>
              </button>
            )}
            
            <button
              onClick={handleStop}
              disabled={loading}
              className="flex-1 btn-danger flex items-center justify-center space-x-2"
            >
              <Square size={20} />
              <span>Stop</span>
            </button>
          </>
        )}
      </div>
      
      {currentCallId && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Phone className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium">Active Call</p>
                <p className="text-sm text-gray-500">
                  {currentLeadName || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Call ID: {currentCallId.slice(0, 8)}...
            </div>
          </div>
        </div>
      )}
      
      {!currentCallId && sessionId && readyState === ReadyState.PLAY && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <PhoneOff className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium">Ready</p>
                <p className="text-sm text-gray-500">
                  Waiting for next call...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

DialerControl.propTypes = {
  agentEmail: PropTypes.string.isRequired
};