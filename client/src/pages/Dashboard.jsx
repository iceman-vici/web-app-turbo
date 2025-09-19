import React, { useState, useEffect } from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import Charts from '../components/dashboard/Charts';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeUsers: 450,
    revenue: 25600,
    growth: 12.5
  });

  const [activities, setActivities] = useState([
    { id: 1, user: 'John Doe', action: 'Created new project', time: '5 mins ago', type: 'create' },
    { id: 2, user: 'Jane Smith', action: 'Updated user settings', time: '15 mins ago', type: 'update' },
    { id: 3, user: 'Mike Johnson', action: 'Deleted old report', time: '1 hour ago', type: 'delete' },
    { id: 4, user: 'Sarah Williams', action: 'Shared dashboard', time: '2 hours ago', type: 'share' },
    { id: 5, user: 'Tom Brown', action: 'Exported analytics', time: '3 hours ago', type: 'export' }
  ]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          <button className="btn btn-outline">Export Report</button>
          <button className="btn btn-primary">Add Widget</button>
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <Charts />
        </div>
        <div className="dashboard-sidebar">
          <QuickActions />
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;