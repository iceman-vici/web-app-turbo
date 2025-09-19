export enum ReadyState {
  PLAY = 'PLAY',
  PAUSE = 'PAUSE',
  STOP = 'STOP'
}

export enum Disposition {
  VM_OR_NA_UNKNOWN = 'VM_OR_NA_UNKNOWN',
  WRONG_OR_DISCONNECTED = 'WRONG_OR_DISCONNECTED',
  CURRENT_CLIENT = 'CURRENT_CLIENT',
  VM_SAME_NAME_UNCONFIRMED = 'VM_SAME_NAME_UNCONFIRMED',
  CORRECT_NUMBER = 'CORRECT_NUMBER',
  NO_ANSWER = 'NO_ANSWER'
}

export enum PhoneStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
  VOICEMAIL = 'VOICEMAIL',
  NO_ANSWER = 'NO_ANSWER',
  SKIPPED = 'SKIPPED',
  EXHAUSTED = 'EXHAUSTED'
}

export enum SkipReason {
  SIBLING_CORRECT = 'SIBLING_CORRECT',
  MAX_ATTEMPTS = 'MAX_ATTEMPTS',
  OUTSIDE_WINDOW = 'OUTSIDE_WINDOW',
  RETRY_PENDING = 'RETRY_PENDING',
  MANUAL_SKIP = 'MANUAL_SKIP'
}

export interface Session {
  sessionId: string;
  agentEmail: string;
  readyState: ReadyState;
  spreadsheetId: string;
  tabId: number;
  rowId?: string;
  numIndex?: number;
  currentCallId?: string;
  lastEventTs?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  rowId: string;
  name: string;
  numbers: string[];
  statuses: (PhoneStatus | null)[];
  notes?: string;
  lastOutcome?: string;
  attemptCount: number;
  nextIndex: number;
  timezone?: string;
  callWindow?: {
    start: string;
    end: string;
  };
  nextRetryAt?: Date;
}

export interface CallEvent {
  eventId: string;
  event: string;
  callId: string;
  timestamp: Date;
  customData?: {
    sessionId: string;
    rowId: string;
    numIndex: number;
    leadName?: string;
  };
  [key: string]: any;
}

export interface DispositionResult {
  disposition: Disposition;
  phoneStatus: PhoneStatus;
  color: string;
  nextRetryAt?: Date;
  skipReason?: SkipReason;
}

export interface RouterEntry {
  agentEmail: string;
  dialpadUserId: string;
  spreadsheetId: string;
  tabId: number;
  campaignName: string;
  active: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
    [key: string]: any;
  };
}

export interface WebSocketMessage {
  type: string;
  payload?: any;
  timestamp: Date;
  correlationId?: string;
}