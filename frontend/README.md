# Web App Turbo - Frontend

## React JavaScript/JSX Application

This is the frontend application for Web App Turbo, built with React using JavaScript and JSX (no TypeScript).

## Tech Stack

- **React 18** - UI framework
- **JavaScript/JSX** - Programming language
- **Vite** - Build tool for fast development
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **React Hotkeys Hook** - Keyboard shortcuts

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components (JSX)
│   │   ├── DialerControl.jsx
│   │   ├── DispositionModal.jsx
│   │   └── SessionInfo.jsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useWebSocket.js
│   │   └── useHotkeys.js
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── dialer.js
│   ├── store/              # State management
│   │   └── dialerStore.js
│   ├── constants/          # App constants
│   │   └── index.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── public/                 # Static assets
├── vite.config.js         # Vite configuration
├── jsconfig.json          # JavaScript configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

## Component Examples

### Functional Component with Props

```jsx
import React from 'react';
import PropTypes from 'prop-types';

function MyComponent({ title, onAction, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
      <button onClick={onAction}>Click Me</button>
    </div>
  );
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  children: PropTypes.node
};

export default MyComponent;
```

### Using State and Effects

```jsx
import React, { useState, useEffect } from 'react';

function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const response = await apiService.get('/data');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data</div>;
  
  return (
    <div>
      {/* Render your data */}
    </div>
  );
}
```

### Using Zustand Store

```jsx
import { useDialerStore } from '../store/dialerStore';

function MyComponent() {
  const { sessionId, readyState, setReadyState } = useDialerStore();
  
  const handlePause = () => {
    setReadyState('PAUSE');
  };
  
  return (
    <div>
      <p>Session: {sessionId}</p>
      <p>State: {readyState}</p>
      <button onClick={handlePause}>Pause</button>
    </div>
  );
}
```

## Key Features

### Hotkey Support
The app supports keyboard shortcuts for quick disposition:
- `1-6` - Select disposition option
- `Space` - Toggle confirmation checkbox
- `Enter` - Submit disposition
- `Esc` - Close modal

### WebSocket Connection
Real-time updates via WebSocket for:
- Session state changes
- Disposition modal triggers
- Call status updates

### State Management
Zustand provides simple state management for:
- Session information
- Call status
- Disposition tracking
- Statistics

## Styling with Tailwind CSS

The app uses Tailwind CSS utility classes. Custom styles are defined in `index.css`:

```css
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700;
}

.card {
  @apply bg-white rounded-lg shadow-md p-6;
}
```

## API Integration

All API calls go through the `apiService` which handles:
- Authentication (JWT tokens)
- Error handling
- Toast notifications
- Idempotency keys

## Building for Production

```bash
# Build the app
npm run build

# Files will be in the build/ directory
# Serve with any static file server
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend is running
   - Verify VITE_WS_URL is correct
   - Check browser console for errors

2. **API Calls Failing**
   - Verify VITE_API_URL is correct
   - Check backend logs
   - Ensure JWT token is valid

3. **Styles Not Loading**
   - Run `npm run dev` to rebuild
   - Clear browser cache
   - Check Tailwind configuration

## License

MIT