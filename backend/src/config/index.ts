import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ConfigSchema = z.object({
  server: z.object({
    port: z.number().min(1024).max(65535),
    env: z.enum(['development', 'test', 'production']),
    corsOrigin: z.string().optional()
  }),
  
  redis: z.object({
    url: z.string().url().or(z.string().startsWith('redis://')),
    keyPrefix: z.string().default('dialer:'),
    ttl: z.object({
      session: z.number().default(3600),
      lock: z.number().default(5),
      idempotency: z.number().default(60)
    })
  }),
  
  jwt: z.object({
    secret: z.string().min(32),
    expiry: z.string().default('1d'),
    refreshExpiry: z.string().default('7d')
  }),
  
  google: z.object({
    serviceAccount: z.string(),
    routerSpreadsheetId: z.string()
  }),
  
  dialpad: z.object({
    apiKey: z.string(),
    apiUrl: z.string().url(),
    webhookSecret: z.string().optional()
  }),
  
  policies: z.object({
    orgDefaultTz: z.string().default('America/Denver'),
    defaultCallWindow: z.object({
      startLocal: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
      endLocal: z.string().regex(/^\d{2}:\d{2}$/).default('18:00')
    }),
    selection: z.object({
      maxAttemptsPerPhone: z.number().min(1).max(10).default(3),
      respectTimeWindows: z.boolean().default(true),
      respectNextRetryAt: z.boolean().default(true),
      stopOnFirstCorrect: z.boolean().default(true)
    }),
    retryDelaysMin: z.object({
      vmOrNaUnknown: z.number().default(180),
      vmSameNameUnconfirmed: z.number().default(180),
      noAnswer: z.number().default(60)
    }),
    runtime: z.object({
      maxIncallMinutes: z.number().min(5).max(180).default(45),
      wsHeartbeatSeconds: z.number().min(10).max(60).default(20)
    }),
    network: z.object({
      timeoutMs: z.number().min(2000).max(20000).default(10000),
      backoffBaseMs: z.number().min(100).max(2000).default(500),
      backoffMaxMs: z.number().min(2000).max(60000).default(10000),
      idempotencyHeader: z.string().default('Idempotency-Key')
    }),
    statusColors: z.object({
      skipped: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#8E7CC3'),
      correct: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#4AA031'),
      wrong: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#C07772'),
      voicemail: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6C97DD'),
      noAnswer: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6AC4CB'),
      currentClient: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#F09001')
    })
  }),
  
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    format: z.enum(['json', 'simple']).default('json')
  }),
  
  security: z.object({
    rateLimitWindowMs: z.number().default(60000),
    rateLimitMaxRequests: z.number().default(100)
  })
});

const rawConfig = {
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

export const config = ConfigSchema.parse(rawConfig);
export type Config = z.infer<typeof ConfigSchema>;