import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/dashboard/dialer', icon: '📞', label: 'Power Dialer' },
    { path: '/dashboard/analytics', icon: '📈', label: 'Analytics' },
    { path: '/dashboard/users', icon: '👥', label: 'Users' },
    { path: '/dashboard/reports', icon: '📄', label: 'Reports' },
    { path: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '→' : '←'}
      </button>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;