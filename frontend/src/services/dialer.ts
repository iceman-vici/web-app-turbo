import { apiService } from './api';
import { ReadyState, Disposition } from '../types';
import toast from 'react-hot-toast';

class DialerService {
  async startSession(agentEmail: string) {
    try {
      const response = await apiService.post('/session/start', { agentEmail });
      if (response.success && response.data) {
        localStorage.setItem('sessionId', response.data.sessionId);
        return response.data;
      }
      throw new Error('Failed to start session');
    } catch (error) {
      console.error('Start session error:', error);
      throw error;
    }
  }
  
  async pauseSession(sessionId: string) {
    try {
      const response = await apiService.post('/session/pause', { sessionId });
      return response.data;
    } catch (error) {
      console.error('Pause session error:', error);
      throw error;
    }
  }
  
  async resumeSession(sessionId: string) {
    try {
      const response = await apiService.post('/session/resume', { sessionId });
      return response.data;
    } catch (error) {
      console.error('Resume session error:', error);
      throw error;
    }
  }
  
  async stopSession(sessionId: string) {
    try {
      const response = await apiService.post('/session/stop', { sessionId });
      localStorage.removeItem('sessionId');
      return response.data;
    } catch (error) {
      console.error('Stop session error:', error);
      throw error;
    }
  }
  
  async getSessionStatus(sessionId: string) {
    try {
      const response = await apiService.get('/session/status', { session_id: sessionId });
      return response.data;
    } catch (error) {
      console.error('Get session status error:', error);
      throw error;
    }
  }
  
  async dial(sessionId: string) {
    try {
      const response = await apiService.post('/dial', { sessionId });
      if (response.data?.done) {
        toast.info('No more numbers to dial');
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Dial error:', error);
      throw error;
    }
  }
  
  async submitDisposition(
    sessionId: string,
    callId: string,
    rowId: string,
    numIndex: number,
    outcome: Disposition
  ) {
    try {
      const idempotencyKey = `${rowId}:${numIndex}`;
      const response = await apiService.post(
        '/disposition',
        {
          sessionId,
          callId,
          rowId,
          numIndex,
          outcome
        },
        idempotencyKey
      );
      return response.data;
    } catch (error) {
      console.error('Submit disposition error:', error);
      throw error;
    }
  }
}

export const dialerService = new DialerService();