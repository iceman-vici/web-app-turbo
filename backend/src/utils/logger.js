const winston = require('winston');
const { config } = require('../config');

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

const logger = winston.createLogger({
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
const createRequestLogger = (correlationId) => {
  return logger.child({ correlationId });
};

// Structured logging helpers
const logCall = ({
  sessionId,
  agentEmail,
  rowId,
  numIndex,
  action,
  result,
  duration,
  error
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

const logDisposition = ({
  sessionId,
  callId,
  rowId,
  numIndex,
  disposition,
  phoneStatus
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

const logMetric = ({
  metric,
  value,
  tags
}) => {
  logger.info('Metric recorded', {
    metric,
    value,
    tags,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  createRequestLogger,
  logCall,
  logDisposition,
  logMetric
};