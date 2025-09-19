const { z } = require('zod');
const { Disposition, ReadyState } = require('../constants');

// Session validation schemas
const StartSessionSchema = z.object({
  agentEmail: z.string().email()
});

const SessionIdSchema = z.object({
  sessionId: z.string().uuid()
});

const DialSchema = z.object({
  sessionId: z.string().uuid()
});

const DispositionSchema = z.object({
  sessionId: z.string().uuid(),
  callId: z.string(),
  rowId: z.string(),
  numIndex: z.number().int().min(1).max(10),
  outcome: z.nativeEnum(Disposition)
});

const PauseSessionSchema = z.object({
  sessionId: z.string().uuid()
});

const ResumeSessionSchema = z.object({
  sessionId: z.string().uuid()
});

const StopSessionSchema = z.object({
  sessionId: z.string().uuid()
});

// Event validation schemas
const DialpadEventSchema = z.object({
  eventId: z.string().optional(),
  event: z.string(),
  callId: z.string(),
  timestamp: z.string().or(z.number()),
  customData: z.object({
    sessionId: z.string().uuid(),
    rowId: z.string(),
    numIndex: z.number(),
    leadName: z.string().optional()
  }).optional()
}).passthrough();

// Google Sheets validation
const SheetHeaderSchema = z.object({
  RowID: z.number(),
  Name: z.number(),
  Num1: z.number(),
  Num2: z.number(),
  Num3: z.number(),
  Num4: z.number(),
  Num5: z.number(),
  Num6: z.number(),
  Num7: z.number(),
  Num8: z.number(),
  Num9: z.number(),
  Num10: z.number(),
  Status1: z.number(),
  Status2: z.number(),
  Status3: z.number(),
  Status4: z.number(),
  Status5: z.number(),
  Status6: z.number(),
  Status7: z.number(),
  Status8: z.number(),
  Status9: z.number(),
  Status10: z.number(),
  Notes: z.number(),
  LastOutcome: z.number(),
  AttemptCount: z.number(),
  NextIndex: z.number(),
  Lock: z.number().optional()
});

// Time validation
const TimeWindowSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
});

// Phone number validation
const PhoneNumberSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/)
  .transform(val => {
    // Normalize to E.164 format
    if (!val.startsWith('+')) {
      // Assume US number if no country code
      if (val.length === 10) {
        return `+1${val}`;
      }
      if (val.length === 11 && val.startsWith('1')) {
        return `+${val}`;
      }
    }
    return val;
  });

// Validate disposition to phone status mapping
const validateDispositionMapping = (disposition) => {
  const mapping = {
    [Disposition.VM_OR_NA_UNKNOWN]: 'VOICEMAIL',
    [Disposition.WRONG_OR_DISCONNECTED]: 'WRONG',
    [Disposition.CURRENT_CLIENT]: 'CORRECT',
    [Disposition.VM_SAME_NAME_UNCONFIRMED]: 'VOICEMAIL',
    [Disposition.CORRECT_NUMBER]: 'CORRECT',
    [Disposition.NO_ANSWER]: 'NO_ANSWER'
  };
  
  return mapping[disposition] || null;
};

// Validate time window
const isWithinTimeWindow = (
  timezone,
  window
) => {
  // Implementation would use date-fns-tz to check if current time in timezone
  // is within the specified window
  // This is a placeholder
  return true;
};

// Validate idempotency key
const IdempotencyKeySchema = z.string()
  .min(1)
  .max(255)
  .regex(/^[a-zA-Z0-9-_:]+$/);

module.exports = {
  StartSessionSchema,
  SessionIdSchema,
  DialSchema,
  DispositionSchema,
  PauseSessionSchema,
  ResumeSessionSchema,
  StopSessionSchema,
  DialpadEventSchema,
  SheetHeaderSchema,
  TimeWindowSchema,
  PhoneNumberSchema,
  IdempotencyKeySchema,
  validateDispositionMapping,
  isWithinTimeWindow
};