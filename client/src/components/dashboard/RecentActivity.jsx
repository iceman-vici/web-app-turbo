import React from 'react';
import Card from '../common/Card';
import './RecentActivity.css';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'share': return '🔗';
      case 'export': return '📤';
      default: return '📌';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'create': return 'success';
      case 'update': return 'info';
      case 'delete': return 'danger';
      case 'share': return 'primary';
      case 'export': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card title="Recent Activity" className="recent-activity">
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className={`activity-icon ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <p className="activity-user">{activity.user}</p>
              <p className="activity-action">{activity.action}</p>
              <p className="activity-time">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="view-all-btn">View All Activity</button>
    </Card>
  );
};

export default RecentActivity;