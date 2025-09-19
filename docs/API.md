# Web App Turbo API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication

All API endpoints require JWT authentication via Bearer token:

```http
Authorization: Bearer <token>
```

## Endpoints

### Session Management

#### Start Session
```http
POST /session/start
```

**Request Body:**
```json
{
  "agentEmail": "agent@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "readyState": "PLAY",
    "spreadsheetId": "sheet_id",
    "tabId": 0
  }
}
```

#### Pause Session
```http
POST /session/pause
```

**Request Body:**
```json
{
  "sessionId": "uuid"
}
```

#### Resume Session
```http
POST /session/resume
```

**Request Body:**
```json
{
  "sessionId": "uuid"
}
```

#### Stop Session
```http
POST /session/stop
```

**Request Body:**
```json
{
  "sessionId": "uuid"
}
```

#### Get Session Status
```http
GET /session/status?session_id=uuid
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "agentEmail": "agent@company.com",
    "readyState": "PLAY",
    "spreadsheetId": "sheet_id",
    "tabId": 0,
    "currentCallId": "call_id",
    "rowId": "1234",
    "numIndex": 3
  }
}
```

### Dialing

#### Dial Next Number
```http
POST /dial
```

**Request Body:**
```json
{
  "sessionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "callId": "dp_call_abc",
    "rowId": "1234",
    "numIndex": 3,
    "leadName": "John Doe"
  }
}
```

Or when no more numbers:
```json
{
  "success": true,
  "data": {
    "done": true
  }
}
```

### Disposition

#### Submit Disposition
```http
POST /disposition
Idempotency-Key: row_id:num_index
```

**Request Body:**
```json
{
  "sessionId": "uuid",
  "callId": "dp_call_abc",
  "rowId": "1234",
  "numIndex": 3,
  "outcome": "CORRECT_NUMBER"
}
```

**Outcome Values:**
- `VM_OR_NA_UNKNOWN`
- `WRONG_OR_DISCONNECTED`
- `CURRENT_CLIENT`
- `VM_SAME_NAME_UNCONFIRMED`
- `CORRECT_NUMBER`
- `NO_ANSWER`

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": true,
    "phoneStatus": "CORRECT",
    "color": "#4AA031",
    "nextRetryAt": null
  }
}
```

### Policies

#### Get Policies
```http
GET /policies
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orgDefaultTz": "America/Denver",
    "defaultCallWindow": {
      "startLocal": "09:00",
      "endLocal": "18:00"
    },
    "selection": {
      "maxAttemptsPerPhone": 3,
      "respectTimeWindows": true,
      "respectNextRetryAt": true,
      "stopOnFirstCorrect": true
    },
    "retryDelaysMin": {
      "vmOrNaUnknown": 180,
      "vmSameNameUnconfirmed": 180,
      "noAnswer": 60
    },
    "statusColors": {
      "skipped": "#8E7CC3",
      "correct": "#4AA031",
      "wrong": "#C07772",
      "voicemail": "#6C97DD",
      "noAnswer": "#6AC4CB",
      "currentClient": "#F09001"
    }
  }
}
```

### Events (Webhooks)

#### Dialpad Event Webhook
```http
POST /events/dialpad
```

**Request Body:**
```json
{
  "eventId": "evt_123",
  "event": "call.hangup",
  "callId": "dp_call_abc",
  "timestamp": 1234567890,
  "customData": {
    "sessionId": "uuid",
    "rowId": "1234",
    "numIndex": 3,
    "leadName": "John Doe"
  }
}
```

**Response:**
```json
{
  "ok": true
}
```

## WebSocket Events

### Connection
```
ws://localhost:8080/ws?token=<jwt_token>
```

### Message Types

#### Client → Server
```json
{
  "type": "ping"
}
```

#### Server → Client

**State Update:**
```json
{
  "type": "STATE",
  "payload": {
    "readyState": "PLAY"
  }
}
```

**Show Disposition Modal:**
```json
{
  "type": "SHOW_DISPO",
  "payload": {
    "callId": "dp_call_abc",
    "rowId": "1234",
    "numIndex": 3,
    "leadName": "John Doe"
  }
}
```

**Request Next Dial:**
```json
{
  "type": "NEXT_DIAL_REQUEST",
  "payload": {}
}
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- `SESSION_NOT_FOUND`: Session doesn't exist
- `SESSION_EXISTS`: Active session already exists
- `ROUTER_NOT_FOUND`: No router configuration
- `INVALID_SHEET`: Sheet headers invalid
- `NOT_IN_PLAY_STATE`: Session not in PLAY state
- `DIAL_IN_PROGRESS`: Another dial in progress
- `DUPLICATE_REQUEST`: Idempotent request already processed
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_TOKEN`: Authentication failed