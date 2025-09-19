import winston from 'winston';
import { config } from '../config';

const format = config.logging.format === 'json'
  ? winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  : winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.simple()
    );

export const logger = winston.createLogger({
  level: config.logging.level,
  format,
  defaultMeta: {
    service: 'web-app-turbo',
    environment: config.server.env
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Add request correlation ID support
export const createRequestLogger = (correlationId: string) => {
  return logger.child({ correlationId });
};

// Structured logging helpers
export const logCall = ({
  sessionId,
  agentEmail,
  rowId,
  numIndex,
  action,
  result,
  duration,
  error
}: {
  sessionId: string;
  agentEmail: string;
  rowId?: string;
  numIndex?: number;
  action: string;
  result?: any;
  duration?: number;
  error?: Error;
}) => {
  const logData = {
    sessionId,
    agentEmail,
    rowId,
    numIndex,
    action,
    result,
    duration
  };
  
  if (error) {
    logger.error('Call action failed', { ...logData, error: error.message, stack: error.stack });
  } else {
    logger.info('Call action completed', logData);
  }
};

export const logDisposition = ({
  sessionId,
  callId,
  rowId,
  numIndex,
  disposition,
  phoneStatus
}: {
  sessionId: string;
  callId: string;
  rowId: string;
  numIndex: number;
  disposition: string;
  phoneStatus: string;
}) => {
  logger.info('Disposition recorded', {
    sessionId,
    callId,
    rowId,
    numIndex,
    disposition,
    phoneStatus,
    timestamp: new Date().toISOString()
  });
};

export const logMetric = ({
  metric,
  value,
  tags
}: {
  metric: string;
  value: number;
  tags?: Record<string, string | number>;
}) => {
  logger.info('Metric recorded', {
    metric,
    value,
    tags,
    timestamp: new Date().toISOString()
  });
};