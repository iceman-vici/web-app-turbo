import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import Card from '../components/common/Card';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  return (
    <div style={{ padding: 'var(--spacing-xl)' }}>
      <h1>Settings</h1>

      <Card title="Appearance">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4>Dark Mode</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Toggle between light and dark theme
            </p>
          </div>
          <button 
            onClick={toggleTheme}
            className="btn btn-outline"
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </Card>

      <Card title="Notifications">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>Email Notifications</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Receive notifications via email
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>Push Notifications</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Receive push notifications in browser
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>SMS Notifications</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                Receive SMS notifications
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
              style={{ width: '20px', height: '20px' }}
            />
          </div>
        </div>
      </Card>

      <Card title="Privacy">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div>
            <h4>Profile Visibility</h4>
            <select className="form-input">
              <option>Public</option>
              <option>Private</option>
              <option>Friends Only</option>
            </select>
          </div>
          <div>
            <h4>Data Sharing</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
              Control how your data is shared with third parties
            </p>
            <button className="btn btn-outline">Manage Preferences</button>
          </div>
        </div>
      </Card>

      <Card title="Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <button className="btn btn-outline">Change Password</button>
          <button className="btn btn-outline">Download Data</button>
          <button className="btn btn-danger">Delete Account</button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;