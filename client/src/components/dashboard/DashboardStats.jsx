import React from 'react';
import Card from '../common/Card';
import './DashboardStats.css';

const DashboardStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+12%',
      trend: 'up',
      icon: '👥'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      change: '+5%',
      trend: 'up',
      icon: '✅'
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      change: '+8%',
      trend: 'up',
      icon: '💰'
    },
    {
      title: 'Growth',
      value: `${stats.growth}%`,
      change: '+2.5%',
      trend: 'up',
      icon: '📈'
    }
  ];

  return (
    <div className="dashboard-stats">
      {statCards.map((stat, index) => (
        <Card key={index} className="stat-card" hoverable>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <p className="stat-title">{stat.title}</p>
            <h3 className="stat-value">{stat.value}</h3>
            <div className={`stat-change ${stat.trend}`}>
              <span className="change-arrow">
                {stat.trend === 'up' ? '↑' : '↓'}
              </span>
              <span className="change-value">{stat.change}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;