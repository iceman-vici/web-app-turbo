# Web App Turbo - Preview Dialer System

## Overview
Speed-first preview dialer web application with React frontend and Node.js backend for managing call campaigns with Google Sheets integration and Dialpad CTI.

## Architecture

### Components
- **Frontend**: React SPA with real-time WebSocket updates
- **Backend**: Node.js/Express API with Redis session management
- **Database**: Redis for sessions and locks, Google Sheets for persistence
- **Integration**: Dialpad CTI for voice, n8n for webhook forwarding

### Key Features
- ✅ Preview dialing with Play/Pause/Stop controls
- ✅ 6-option disposition modal with hotkey support
- ✅ SKIPPED status tracking with auditable reasons
- ✅ Sibling-skip logic on terminal success
- ✅ Time window and retry policy enforcement
- ✅ Idempotent operations with distributed locks
- ✅ Real-time WebSocket communication
- ✅ Crash-safe session recovery

## Getting Started

### Prerequisites
- Node.js 18+
- Redis server
- Google Cloud Service Account with Sheets API access
- Dialpad API credentials
- n8n instance for webhook forwarding

### Installation

```bash
# Clone the repository
git clone https://github.com/iceman-vici/web-app-turbo.git
cd web-app-turbo

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Configuration

1. Copy environment templates:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Configure backend environment variables:
- `REDIS_URL`: Redis connection string
- `GOOGLE_SERVICE_ACCOUNT`: Base64 encoded service account JSON
- `DIALPAD_API_KEY`: Dialpad API key
- `JWT_SECRET`: Secret for JWT tokens
- `PORT`: Backend server port (default: 8080)

3. Configure frontend environment variables:
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_WS_URL`: WebSocket server URL

### Development

```bash
# Run both frontend and backend in development mode
npm run dev

# Or run separately
npm run backend:dev
npm run frontend:dev
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
web-app-turbo/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   └── utils/          # Utilities
│   └── public/
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── api/            # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration
│   │   └── utils/          # Utilities
│   └── tests/
├── docker/                   # Docker configurations
├── docs/                     # Documentation
└── scripts/                  # Deployment scripts
```

## API Documentation

See [API.md](docs/API.md) for detailed API documentation.

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.

## License

MIT