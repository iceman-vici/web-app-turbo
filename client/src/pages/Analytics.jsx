import React from 'react';
import Card from '../components/common/Card';

const Analytics = () => {
  const metrics = [
    { label: 'Page Views', value: '125,430', change: '+12%' },
    { label: 'Unique Visitors', value: '23,456', change: '+5%' },
    { label: 'Bounce Rate', value: '42.3%', change: '-3%' },
    { label: 'Avg. Session', value: '3m 24s', change: '+8%' }
  ];

  return (
    <div style={{ padding: 'var(--spacing-xl)' }}>
      <h1>Analytics</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        {metrics.map((metric, index) => (
          <Card key={index}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {metric.label}
            </p>
            <h2 style={{ margin: 'var(--spacing-sm) 0' }}>{metric.value}</h2>
            <span style={{ 
              color: metric.change.startsWith('+') ? 'var(--success-color)' : 'var(--danger-color)',
              fontSize: 'var(--font-size-sm)'
            }}>
              {metric.change}
            </span>
          </Card>
        ))}
      </div>

      <Card title="Traffic Overview">
        <div style={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-md)'
        }}>
          <p style={{ color: 'var(--text-secondary)' }}>Chart will be rendered here</p>
        </div>
      </Card>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--spacing-lg)',
        marginTop: 'var(--spacing-xl)'
      }}>
        <Card title="Top Pages">
          <table className="table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>/dashboard</td><td>45,234</td></tr>
              <tr><td>/products</td><td>23,123</td></tr>
              <tr><td>/about</td><td>12,456</td></tr>
              <tr><td>/contact</td><td>8,234</td></tr>
            </tbody>
          </table>
        </Card>

        <Card title="Traffic Sources">
          <table className="table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Sessions</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Google</td><td>65%</td></tr>
              <tr><td>Direct</td><td>20%</td></tr>
              <tr><td>Social</td><td>10%</td></tr>
              <tr><td>Other</td><td>5%</td></tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;