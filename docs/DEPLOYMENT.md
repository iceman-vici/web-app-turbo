# Deployment Guide

## Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Redis server
- Google Cloud Service Account
- Dialpad API credentials
- n8n instance

## Environment Setup

### 1. Backend Configuration

Create `backend/.env`:
```env
# Server
NODE_ENV=production
PORT=8080

# Redis
REDIS_URL=redis://redis:6379
REDIS_KEY_PREFIX=dialer:

# JWT
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRY=1d

# Google Sheets
GOOGLE_SERVICE_ACCOUNT=<base64-encoded-json>
GOOGLE_ROUTER_SPREADSHEET_ID=<your-router-sheet-id>

# Dialpad
DIALPAD_API_KEY=<your-api-key>
DIALPAD_API_URL=https://api.dialpad.com/v2
DIALPAD_WEBHOOK_SECRET=<webhook-secret>

# Policies
ORG_DEFAULT_TZ=America/Denver
MAX_ATTEMPTS_PER_PHONE=3
STOP_ON_FIRST_CORRECT=true

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Frontend Configuration

Create `frontend/.env`:
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_WS_URL=wss://api.your-domain.com/ws
```

### 3. Google Service Account

1. Create a service account in Google Cloud Console
2. Enable Google Sheets API
3. Download the JSON key file
4. Base64 encode it: `base64 -i service-account.json`
5. Add to `GOOGLE_SERVICE_ACCOUNT` env variable

### 4. Router Spreadsheet Setup

Create a Google Sheet with columns:
- AgentEmail
- DialpadUserID
- SpreadsheetId
- TabId
- CampaignName
- Active

### 5. Agent Spreadsheet Setup

Each agent needs a spreadsheet with these exact headers:
```
RowID | Name | Num1-10 | Status1-10 | Notes | LastOutcome | AttemptCount | NextIndex | Lock
```

## Docker Deployment

### Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Compose

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    
  backend:
    build: ./backend
    restart: always
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      - redis
      
  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      
volumes:
  redis_data:
```

## Manual Deployment

### Backend

```bash
cd backend
npm install --production
npm run build
PORT=8080 node dist/server.js
```

### Frontend

```bash
cd frontend
npm install
npm run build
# Serve build/ directory with nginx or similar
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## n8n Webhook Setup

1. Create new workflow in n8n
2. Add Webhook node:
   - Path: `/dialpad`
   - Method: POST
   - Response Mode: On Received
3. Add HTTP Request node:
   - URL: `https://api.your-domain.com/api/events/dialpad`
   - Method: POST
   - Forward all headers and body
4. Configure Dialpad to send webhooks to:
   `https://your-n8n-instance.com/webhook/dialpad`

## Monitoring

### Health Check
```bash
curl https://api.your-domain.com/health
```

### Logs
```bash
# Docker logs
docker-compose logs -f backend

# PM2 logs
pm2 logs web-app-turbo

# Application logs
tail -f logs/combined.log
```

### Metrics
- Monitor Redis memory usage
- Track API response times
- Monitor WebSocket connections
- Track call success rates

## Security Checklist

- [ ] Strong JWT secret
- [ ] SSL/TLS configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Monitoring alerts setup
- [ ] Error tracking enabled

## Troubleshooting

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping

# Check Redis memory
redis-cli info memory
```

### Google Sheets API Issues
- Verify service account has editor access to sheets
- Check API quotas in Google Cloud Console
- Ensure sheet headers match exactly

### Dialpad Integration Issues
- Verify API key is valid
- Check webhook signature if configured
- Monitor n8n workflow executions

### WebSocket Issues
- Check nginx upgrade headers
- Verify JWT token in connection URL
- Monitor heartbeat messages