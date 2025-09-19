import { Router } from 'express';
import { sessionRoutes } from './session';
import { dialRoutes } from './dial';
import { dispositionRoutes } from './disposition';
import { eventRoutes } from './events';
import { RedisClient } from '../services/redis';
import { PolicyManager } from '../services/policy';
import { WebSocketManager } from '../services/websocket';

export function setupRoutes(
  redis: RedisClient,
  policyManager: PolicyManager,
  wsManager: WebSocketManager
): Router {
  const router = Router();
  
  // Mount route modules
  router.use('/session', sessionRoutes(redis, policyManager, wsManager));
  router.use('/dial', dialRoutes(redis, policyManager, wsManager));
  router.use('/disposition', dispositionRoutes(redis, policyManager, wsManager));
  router.use('/events', eventRoutes(redis, wsManager));
  
  // Policy endpoint
  router.get('/policies', (req, res) => {
    res.json({
      success: true,
      data: policyManager.getAllPolicies()
    });
  });
  
  // WebSocket info endpoint
  router.get('/ws-info', (req, res) => {
    res.json({
      success: true,
      data: {
        clients: wsManager.getConnectedClients()
      }
    });
  });
  
  return router;
}