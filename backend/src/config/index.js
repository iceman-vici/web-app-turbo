const dotenv = require('dotenv');

dotenv.config();

const config = {
  server: {
    port: parseInt(process.env.PORT || '8080'),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'dialer:',
    ttl: {
      session: 3600,
      lock: 5,
      idempotency: 60
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-in-production',
    expiry: process.env.JWT_EXPIRY || '1d',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  
  google: {
    serviceAccount: process.env.GOOGLE_SERVICE_ACCOUNT || '',
    routerSpreadsheetId: process.env.GOOGLE_ROUTER_SPREADSHEET_ID || ''
  },
  
  dialpad: {
    apiKey: process.env.DIALPAD_API_KEY || '',
    apiUrl: process.env.DIALPAD_API_URL || 'https://api.dialpad.com/v2',
    webhookSecret: process.env.DIALPAD_WEBHOOK_SECRET
  },
  
  policies: {
    orgDefaultTz: process.env.ORG_DEFAULT_TZ || 'America/Denver',
    defaultCallWindow: {
      startLocal: process.env.DEFAULT_CALL_WINDOW_START || '09:00',
      endLocal: process.env.DEFAULT_CALL_WINDOW_END || '18:00'
    },
    selection: {
      maxAttemptsPerPhone: parseInt(process.env.MAX_ATTEMPTS_PER_PHONE || '3'),
      respectTimeWindows: process.env.RESPECT_TIME_WINDOWS !== 'false',
      respectNextRetryAt: process.env.RESPECT_NEXT_RETRY_AT !== 'false',
      stopOnFirstCorrect: process.env.STOP_ON_FIRST_CORRECT !== 'false'
    },
    retryDelaysMin: {
      vmOrNaUnknown: parseInt(process.env.RETRY_DELAY_VM_OR_NA_UNKNOWN || '180'),
      vmSameNameUnconfirmed: parseInt(process.env.RETRY_DELAY_VM_SAME_NAME || '180'),
      noAnswer: parseInt(process.env.RETRY_DELAY_NO_ANSWER || '60')
    },
    runtime: {
      maxIncallMinutes: parseInt(process.env.MAX_INCALL_MINUTES || '45'),
      wsHeartbeatSeconds: parseInt(process.env.WS_HEARTBEAT_SECONDS || '20')
    },
    network: {
      timeoutMs: parseInt(process.env.NETWORK_TIMEOUT_MS || '10000'),
      backoffBaseMs: parseInt(process.env.BACKOFF_BASE_MS || '500'),
      backoffMaxMs: parseInt(process.env.BACKOFF_MAX_MS || '10000'),
      idempotencyHeader: process.env.IDEMPOTENCY_HEADER || 'Idempotency-Key'
    },
    statusColors: {
      skipped: '#8E7CC3',
      correct: '#4AA031',
      wrong: '#C07772',
      voicemail: '#6C97DD',
      noAnswer: '#6AC4CB',
      currentClient: '#F09001'
    }
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  },
  
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  }
};

module.exports = { config };