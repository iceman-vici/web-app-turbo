# Web App Turbo - Power Dialer System

A high-performance, real-time power dialer application built with React.js and Node.js, designed for seamless integration with Dialpad and Google Sheets.

## 🚀 Power Dialer Features

### Agent Dashboard
- **Ultra-Fast Disposition Modal** - Instant popup on call hangup with hotkey support (1-5 keys)
- **Real-Time Session Controls** - Play/Pause/Stop with keyboard shortcuts
- **Live Call Statistics** - Track connect rates, calls per hour, and performance metrics
- **Call History** - View recent calls with outcomes and durations
- **WebSocket Integration** - Real-time events and updates without page refresh

### Core Functionality
- **Dialpad Integration** - Automatic call initiation via Dialpad API (Option A architecture)
- **Google Sheets Integration** - Direct read/write to agent sheets with uniform schema
- **Smart Skip Logic** - Automatically skip green (completed) numbers
- **Session Persistence** - Resume sessions after browser refresh
- **Hotkey Support** - Complete keyboard control for maximum efficiency

## 📁 Architecture

```
web-app-turbo/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   └── PowerDialer.jsx    # Main dialer interface
│   │   ├── components/dialer/     # Dialer-specific components
│   │   │   ├── DispositionModal.jsx
│   │   │   ├── SessionControls.jsx
│   │   │   ├── CallStats.jsx
│   │   │   └── CallHistory.jsx
│   │   ├── services/
│   │   │   └── dialerService.js   # API communication
│   │   └── hooks/
│   │       └── useWebSocket.js    # Real-time connection
│   
└── server/                      # Node.js Backend
    ├── src/
    │   ├── routes/             # API endpoints
    │   ├── controllers/        # Business logic
    │   └── services/          # Dialpad & Sheets integration
    └── package.json
```

## 🔧 Tech Stack

### Frontend
- React.js 18 with Hooks
- WebSocket for real-time events
- Context API for state management
- CSS3 with responsive design

### Backend
- Node.js with Express
- WebSocket server for real-time communication
- Google Sheets API integration
- Dialpad API integration
- Redis for session management

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/iceman-vici/web-app-turbo.git
cd web-app-turbo
```

2. Install dependencies:
```bash
npm run install:all
```

3. Configure environment variables:

Create `.env` file in server directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/webappturbo

# JWT
JWT_SECRET=your_jwt_secret_key

# Dialpad Configuration
DIALPAD_API_KEY=your_dialpad_api_key
DIALPAD_WEBHOOK_SECRET=your_webhook_secret

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# WebSocket
WS_PORT=5001
```

4. Run development servers:
```bash
npm run dev
```

## 🎯 Power Dialer Usage

### For Agents

1. **Start Session**
   - Navigate to Power Dialer from sidebar
   - Click "Start Session" or press `S`
   - System validates sheet and begins dialing

2. **During Calls**
   - Talk through Dialpad CTI (separate tab)
   - On hangup, disposition modal appears instantly

3. **Disposition**
   - Press 1-5 for quick selection:
     - `1` = Connected
     - `2` = No Answer
     - `3` = Voicemail
     - `4` = Callback
     - `5` = Do Not Call

4. **Session Control**
   - `Space` = Pause/Resume
   - `Escape` = Stop Session

### Sheet Schema (Uniform)

Your Google Sheet must have these columns:
```
RowID | Name | Num1-Num10 | Status1-Status10 | Notes | LastOutcome | AttemptCount | NextIndex | Lock
```

### API Endpoints

#### Session Management
- `POST /api/session/start` - Start dialing session
- `POST /api/session/pause` - Pause current session
- `POST /api/session/resume` - Resume paused session
- `POST /api/session/stop` - Stop and end session
- `GET /api/session/status` - Get session status

#### Dialing
- `POST /api/dial` - Initiate next call
- `POST /api/disposition` - Submit call outcome

#### Events (Webhook)
- `POST /api/events/dialpad` - Receive Dialpad events

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

## 🔌 WebSocket Events

### Client → Server
- `subscribe` - Subscribe to session updates
- `ping` - Keep connection alive

### Server → Client
- `SHOW_DISPO` - Display disposition modal
- `NEXT_DIAL` - Next number being dialed
- `STATE` - Session state change
- `STATS_UPDATE` - Statistics update

## 🚀 Performance Targets

- **Hangup → Modal**: < 500ms
- **Disposition → Next Dial**: < 1 second
- **Sheet Update**: < 2 seconds
- **WebSocket Latency**: < 100ms

## 🔒 Security

- JWT authentication for all API calls
- Dialpad webhook signature verification
- Service account access for Google Sheets
- Redis session locks to prevent race conditions
- PII masking in logs

## 📊 Additional Features

- ✅ User Authentication (JWT)
- ✅ Dashboard with Analytics
- ✅ User Management System
- ✅ Responsive Design
- ✅ Dark/Light Theme
- ✅ RESTful API
- ✅ MongoDB Database
- ✅ Real-time Updates

## 🖥️ Usage

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- WebSocket: ws://localhost:5001

### Default Login Credentials
- Email: demo@example.com
- Password: password

## 🧪 Testing

```bash
# Run all tests
npm test

# Frontend tests
cd client && npm test

# Backend tests
cd server && npm test
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For issues and questions:
- GitHub Issues: [https://github.com/iceman-vici/web-app-turbo/issues](https://github.com/iceman-vici/web-app-turbo/issues)

---

**Built for speed. Designed for agents. Ready to scale.**