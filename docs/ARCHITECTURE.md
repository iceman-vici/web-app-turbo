# System Architecture

## Overview

Web App Turbo is a speed-first preview dialer system designed for high-volume call operations with Google Sheets integration and Dialpad CTI.

## Components

### Frontend (React SPA)
- **Technology**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Real-time**: WebSocket client
- **Styling**: Tailwind CSS
- **Key Features**:
  - Play/Pause/Stop controls
  - 6-option disposition modal
  - Hotkey support (1-6, Enter, Space, Esc)
  - Real-time session statistics
  - Crash-safe with session recovery

### Backend (Node.js API)
- **Technology**: Node.js, Express, TypeScript
- **Database**: Redis for sessions and locks
- **Persistence**: Google Sheets API
- **Voice**: Dialpad CTI API
- **Key Features**:
  - RESTful API with idempotency
  - WebSocket server for real-time updates
  - Distributed locks for concurrency
  - Policy-based call selection
  - Event-driven architecture

### Integration Layer
- **n8n**: Webhook forwarding and event processing
- **Google Sheets**: Lead data and disposition storage
- **Dialpad**: Voice path and call events
- **Redis**: Session state and distributed locks

## Data Flow

### Call Initiation Flow
```
1. Agent clicks Play → Frontend
2. POST /session/start → Backend
3. Validate router & sheet → Google Sheets
4. Create session → Redis
5. POST /dial → Backend
6. Select next number → Policy Engine
7. Initiate call → Dialpad API
8. Return call details → Frontend
```

### Disposition Flow
```
1. Call ends → Dialpad
2. Webhook → n8n
3. POST /events/dialpad → Backend
4. WebSocket SHOW_DISPO → Frontend
5. Agent selects & confirms → Frontend
6. POST /disposition → Backend
7. batchUpdate → Google Sheets
8. Skip siblings if needed → Sheets
9. Chain next dial → Backend
```

## Database Schema

### Redis Keys
```
dialer:session:{sessionId}     - Session object
dialer:agent:{agentEmail}       - Active session ID
dialer:lock:{resource}          - Distributed lock
dialer:idem:{key}               - Idempotency key
dialer:event:{eventId}          - Event deduplication
dialer:metric:{name}            - Metrics counter
```

### Google Sheets Schema
```
Router Sheet:
- AgentEmail | DialpadUserID | SpreadsheetId | TabId | CampaignName | Active

Agent Sheet:
- RowID | Name | Num1-10 | Status1-10 | Notes | LastOutcome | AttemptCount | NextIndex
```

## Status Management

### Phone Statuses
- **NEW**: Undialed number
- **IN_PROGRESS**: Currently dialing
- **CORRECT**: Terminal success
- **WRONG**: Wrong/disconnected number
- **VOICEMAIL**: Left voicemail
- **NO_ANSWER**: No answer
- **SKIPPED**: Sibling-skipped (purple #8E7CC3)
- **EXHAUSTED**: Max attempts reached

### Skip Reasons
- **SIBLING_CORRECT**: Sibling number was correct
- **MAX_ATTEMPTS**: Exceeded attempt limit
- **OUTSIDE_WINDOW**: Outside call window
- **RETRY_PENDING**: In retry cooldown
- **MANUAL_SKIP**: Agent skipped

## Policy Engine

### Selection Criteria
1. Check ready_state === PLAY
2. Respect time windows (if enabled)
3. Respect retry delays (if enabled)
4. Check sibling-correct status
5. Check attempt count < max
6. Use NextIndex for round-robin

### Retry Delays
- VM_OR_NA_UNKNOWN: 180 minutes
- VM_SAME_NAME: 180 minutes
- NO_ANSWER: 60 minutes

## Security

### Authentication
- JWT tokens with expiry
- Bearer token for API
- Token in WebSocket query params

### Authorization
- Agent-level session isolation
- Router-based access control
- Sheet-level permissions

### Data Protection
- Phone number masking in logs
- PII handling compliance
- SSL/TLS encryption
- Webhook signature verification

## Reliability

### Idempotency
- Required for state-changing operations
- 60-second deduplication window
- Stored results for duplicate requests

### Distributed Locks
- Per-session dial operations
- 5-second TTL with renewal
- Automatic release on completion

### Error Recovery
- Exponential backoff with jitter
- Circuit breaker for external APIs
- Automatic WebSocket reconnection
- Session recovery on reload

## Performance

### Optimization Strategies
- Redis for fast session access
- Batch operations for Sheets API
- Connection pooling
- Response caching
- Lazy loading

### Scalability
- Horizontal scaling for API servers
- Redis cluster support
- Load balancing ready
- Stateless architecture

## Monitoring

### Metrics
- Calls initiated/completed
- Disposition breakdown
- Success rates
- API response times
- WebSocket connections
- Error rates

### Logging
- Structured JSON logs
- Correlation IDs
- Request/response logging
- Error stack traces
- Audit trail

### Alerts
- High error rates
- Low success rates
- API timeouts
- Redis memory usage
- Sheet API quotas