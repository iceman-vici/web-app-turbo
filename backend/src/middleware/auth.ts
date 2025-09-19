import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    agentEmail: string;
    sessionId?: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Skip auth for health check and webhooks
  if (req.path === '/health' || req.path.startsWith('/api/events/')) {
    return next();
  }
  
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_TOKEN',
        message: 'Authentication token required'
      }
    });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    req.user = {
      agentEmail: decoded.agentEmail,
      sessionId: decoded.sessionId
    };
    
    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path
    });
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
}

// Generate JWT token
export function generateToken(
  agentEmail: string,
  sessionId?: string
): string {
  return jwt.sign(
    {
      agentEmail,
      sessionId,
      iat: Date.now()
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiry
    }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  return jwt.verify(token, config.jwt.secret);
}