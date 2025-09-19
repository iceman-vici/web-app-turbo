import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createRequestLogger } from '../utils/logger';

export interface RequestWithLogger extends Request {
  correlationId?: string;
  logger?: ReturnType<typeof createRequestLogger>;
  startTime?: number;
}

export function requestLogger(
  req: RequestWithLogger,
  res: Response,
  next: NextFunction
) {
  // Generate correlation ID
  req.correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  req.startTime = Date.now();
  
  // Create request-specific logger
  req.logger = createRequestLogger(req.correlationId);
  
  // Log request
  req.logger.info('Request received', {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type']
    },
    ip: req.ip
  });
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - (req.startTime || 0);
    
    req.logger?.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      correlationId: req.correlationId
    });
    
    // Add correlation ID to response headers
    res.setHeader('X-Correlation-ID', req.correlationId || '');
    
    return originalSend.call(this, data);
  };
  
  next();
}

// Middleware to add idempotency support
export function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  
  if (idempotencyKey && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    // Store key in request for later use
    (req as any).idempotencyKey = idempotencyKey;
  }
  
  next();
}