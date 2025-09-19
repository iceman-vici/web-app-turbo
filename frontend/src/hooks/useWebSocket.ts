import { useCallback, useRef, useEffect } from 'react';
import { useDialerStore } from '../store/dialerStore';
import { WebSocketMessage } from '../types';
import toast from 'react-hot-toast';

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const heartbeatInterval = useRef<NodeJS.Timeout>();
  
  const {
    setReadyState,
    showDisposition,
    setCurrentCall,
    sessionId
  } = useDialerStore();
  
  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }
    
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'}?token=${token}`;
    
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => {
      console.log('WebSocket connected');
      toast.success('Connected to server');
      
      // Start heartbeat
      heartbeatInterval.current = setInterval(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };
    
    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Connection error');
    };
    
    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      toast.warning('Disconnected from server');
      
      // Clear heartbeat
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      
      // Attempt to reconnect
      if (sessionId) {
        reconnectTimeout.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };
  }, [sessionId]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);
  
  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log('WebSocket message:', message);
    
    switch (message.type) {
      case 'STATE':
        if (message.payload?.readyState) {
          setReadyState(message.payload.readyState);
        }
        break;
      
      case 'SHOW_DISPO':
        showDisposition(message.payload);
        break;
      
      case 'NEXT_DIAL':
        if (message.payload) {
          setCurrentCall(
            message.payload.callId,
            message.payload.rowId,
            message.payload.numIndex,
            message.payload.leadName
          );
        }
        break;
      
      case 'NEXT_DIAL_REQUEST':
        // Trigger dial from frontend
        if (sessionId) {
          import('../services/dialer').then(({ dialerService }) => {
            dialerService.dial(sessionId);
          });
        }
        break;
      
      case 'pong':
        // Heartbeat response
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }, [setReadyState, showDisposition, setCurrentCall, sessionId]);
  
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    connect,
    disconnect,
    sendMessage,
    isConnected: ws.current?.readyState === WebSocket.OPEN
  };
}