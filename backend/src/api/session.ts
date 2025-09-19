import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RedisClient } from '../services/redis';
import { PolicyManager } from '../services/policy';
import { WebSocketManager } from '../services/websocket';
import { GoogleSheetsService } from '../services/googleSheets';
import { StartSessionSchema, SessionIdSchema } from '../utils/validation';
import { logger, logCall } from '../utils/logger';
import { Session, ReadyState } from '../types';

export function sessionRoutes(
  redis: RedisClient,
  policyManager: PolicyManager,
  wsManager: WebSocketManager
): Router {
  const router = Router();
  const sheets = new GoogleSheetsService();
  
  // Start session
  router.post('/start', async (req, res, next) => {
    try {
      const { agentEmail } = StartSessionSchema.parse(req.body);
      
      // Check for existing session
      const existingSessionId = await redis.getAgentSession(agentEmail);
      if (existingSessionId) {
        const existingSession = await redis.getSession(existingSessionId);
        if (existingSession && existingSession.readyState !== ReadyState.STOP) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'SESSION_EXISTS',
              message: 'Active session already exists for this agent'
            }
          });
        }
      }
      
      // Get router configuration
      const routerEntry = await sheets.getRouterEntry(agentEmail);
      if (!routerEntry) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ROUTER_NOT_FOUND',
            message: 'No router configuration found for agent'
          }
        });
      }
      
      // Validate sheet headers
      const isValid = await sheets.validateHeaders(
        routerEntry.spreadsheetId,
        'Calls_Queue'
      );
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SHEET',
            message: 'Sheet headers do not match required schema'
          }
        });
      }
      
      // Create session
      const sessionId = uuidv4();
      const session: Session = {
        sessionId,
        agentEmail,
        readyState: ReadyState.PLAY,
        spreadsheetId: routerEntry.spreadsheetId,
        tabId: routerEntry.tabId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await redis.createSession(session);
      await redis.setAgentSession(agentEmail, sessionId);
      
      // Notify via WebSocket
      wsManager.sendStateUpdate(sessionId, ReadyState.PLAY);
      
      logCall({
        sessionId,
        agentEmail,
        action: 'session_start',
        result: 'success'
      });
      
      res.json({
        success: true,
        data: {
          sessionId,
          readyState: ReadyState.PLAY,
          spreadsheetId: routerEntry.spreadsheetId,
          tabId: routerEntry.tabId
        }
      });
      
    } catch (error) {
      next(error);
    }
  });
  
  // Pause session
  router.post('/pause', async (req, res, next) => {
    try {
      const { sessionId } = SessionIdSchema.parse(req.body);
      
      const session = await redis.getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
      }
      
      await redis.updateSession(sessionId, {
        readyState: ReadyState.PAUSE
      });
      
      wsManager.sendStateUpdate(sessionId, ReadyState.PAUSE);
      
      logCall({
        sessionId,
        agentEmail: session.agentEmail,
        action: 'session_pause',
        result: 'success'
      });
      
      res.json({
        success: true,
        data: { readyState: ReadyState.PAUSE }
      });
      
    } catch (error) {
      next(error);
    }
  });
  
  // Resume session
  router.post('/resume', async (req, res, next) => {
    try {
      const { sessionId } = SessionIdSchema.parse(req.body);
      
      const session = await redis.getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
      }
      
      await redis.updateSession(sessionId, {
        readyState: ReadyState.PLAY
      });
      
      wsManager.sendStateUpdate(sessionId, ReadyState.PLAY);
      
      // Request next dial
      setImmediate(() => {
        wsManager.sendNextDialRequest(sessionId);
      });
      
      logCall({
        sessionId,
        agentEmail: session.agentEmail,
        action: 'session_resume',
        result: 'success'
      });
      
      res.json({
        success: true,
        data: { readyState: ReadyState.PLAY }
      });
      
    } catch (error) {
      next(error);
    }
  });
  
  // Stop session
  router.post('/stop', async (req, res, next) => {
    try {
      const { sessionId } = SessionIdSchema.parse(req.body);
      
      const session = await redis.getSession(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
      }
      
      await redis.deleteSession(sessionId);
      await redis.deleteAgentSession(session.agentEmail);
      
      wsManager.sendStateUpdate(sessionId, ReadyState.STOP);
      
      logCall({
        sessionId,
        agentEmail: session.agentEmail,
        action: 'session_stop',
        result: 'success'
      });
      
      res.json({
        success: true,
        data: { readyState: ReadyState.STOP }
      });
      
    } catch (error) {
      next(error);
    }
  });
  
  // Get session status
  router.get('/status', async (req, res, next) => {
    try {
      const sessionId = req.query.session_id as string;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_SESSION_ID',
            message: 'Session ID is required'
          }
        });
      }
      
      const session = await redis.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: session
      });
      
    } catch (error) {
      next(error);
    }
  });
  
  return router;
}