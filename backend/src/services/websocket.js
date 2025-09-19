const { WebSocketServer, WebSocket } = require('ws');
const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { logger } = require('../utils/logger');

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.heartbeatInterval = null;
    this.redis = null;
  }
  
  initialize(wss, redis) {
    this.wss = wss;
    this.redis = redis;
    
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
    
    // Start heartbeat
    this.startHeartbeat();
    
    logger.info('WebSocket manager initialized');
  }
  
  handleConnection(ws, req) {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (!token) {
      ws.close(1002, 'Missing authentication token');
      return;
    }
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      ws.sessionId = decoded.sessionId;
      ws.agentEmail = decoded.agentEmail;
      ws.isAlive = true;
      
      // Store client
      if (ws.sessionId) {
        this.clients.set(ws.sessionId, ws);
      }
      
      logger.info('WebSocket client connected', {
        sessionId: ws.sessionId,
        agentEmail: ws.agentEmail
      });
      
      // Setup event handlers
      ws.on('pong', () => {
        ws.isAlive = true;
      });
      
      ws.on('message', async (data) => {
        await this.handleMessage(ws, data);
      });
      
      ws.on('close', () => {
        this.handleDisconnection(ws);
      });
      
      ws.on('error', (error) => {
        logger.error('WebSocket error', {
          sessionId: ws.sessionId,
          error: error.message
        });
      });
      
      // Send initial state
      this.sendInitialState(ws);
      
    } catch (error) {
      logger.error('WebSocket authentication failed', { error });
      ws.close(1002, 'Invalid authentication token');
    }
  }
  
  async handleMessage(ws, data) {
    try {
      const message = JSON.parse(data.toString());
      
      logger.debug('WebSocket message received', {
        sessionId: ws.sessionId,
        type: message.type
      });
      
      // Handle different message types
      switch (message.type) {
        case 'ping':
          this.sendMessage(ws.sessionId, { type: 'pong' });
          break;
        
        case 'get_state':
          await this.sendSessionState(ws);
          break;
        
        default:
          logger.warn('Unknown WebSocket message type', {
            type: message.type,
            sessionId: ws.sessionId
          });
      }
    } catch (error) {
      logger.error('Failed to handle WebSocket message', {
        sessionId: ws.sessionId,
        error
      });
    }
  }
  
  handleDisconnection(ws) {
    if (ws.sessionId) {
      this.clients.delete(ws.sessionId);
    }
    
    logger.info('WebSocket client disconnected', {
      sessionId: ws.sessionId,
      agentEmail: ws.agentEmail
    });
  }
  
  async sendInitialState(ws) {
    if (!ws.sessionId || !this.redis) return;
    
    const session = await this.redis.getSession(ws.sessionId);
    
    if (session) {
      this.sendToClient(ws, {
        type: 'STATE',
        payload: {
          readyState: session.readyState,
          currentCallId: session.currentCallId,
          rowId: session.rowId,
          numIndex: session.numIndex
        }
      });
    }
  }
  
  async sendSessionState(ws) {
    if (!ws.sessionId || !this.redis) return;
    
    const session = await this.redis.getSession(ws.sessionId);
    this.sendToClient(ws, {
      type: 'SESSION_STATE',
      payload: session
    });
  }
  
  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    }
  }
  
  // Public methods for sending messages
  sendMessage(sessionId, message) {
    const client = this.clients.get(sessionId);
    if (client) {
      this.sendToClient(client, message);
    }
  }
  
  broadcast(message) {
    this.clients.forEach((client) => {
      this.sendToClient(client, message);
    });
  }
  
  sendDispositionModal(
    sessionId,
    callId,
    rowId,
    numIndex,
    leadName
  ) {
    this.sendMessage(sessionId, {
      type: 'SHOW_DISPO',
      payload: {
        callId,
        rowId,
        numIndex,
        leadName
      }
    });
  }
  
  sendNextDialRequest(sessionId) {
    this.sendMessage(sessionId, {
      type: 'NEXT_DIAL_REQUEST',
      payload: {}
    });
  }
  
  sendStateUpdate(sessionId, readyState) {
    this.sendMessage(sessionId, {
      type: 'STATE',
      payload: { readyState }
    });
  }
  
  // Heartbeat management
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          ws.terminate();
          return;
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, config.policies.runtime.wsHeartbeatSeconds * 1000);
  }
  
  // Cleanup
  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.clients.forEach((client) => {
      client.close(1000, 'Server shutting down');
    });
    
    this.clients.clear();
    
    if (this.wss) {
      this.wss.close();
    }
    
    logger.info('WebSocket manager shut down');
  }
  
  // Get connected clients info
  getConnectedClients() {
    const clients = [];
    this.clients.forEach((client, sessionId) => {
      clients.push({
        sessionId,
        agentEmail: client.agentEmail,
        isAlive: client.isAlive,
        readyState: client.readyState
      });
    });
    return clients;
  }
}

module.exports = { WebSocketManager };