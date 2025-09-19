import React, { useState } from 'react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';

const Reports = () => {
  const [reports] = useState([
    { id: 1, name: 'Q4 2024 Financial Report', type: 'Financial', date: '2024-12-31', status: 'Completed' },
    { id: 2, name: 'User Analytics Summary', type: 'Analytics', date: '2024-12-28', status: 'Completed' },
    { id: 3, name: 'Monthly Performance Review', type: 'Performance', date: '2024-12-25', status: 'In Progress' },
    { id: 4, name: 'Sales Dashboard Export', type: 'Sales', date: '2024-12-20', status: 'Completed' },
    { id: 5, name: 'Customer Feedback Analysis', type: 'Customer', date: '2024-12-15', status: 'Pending' }
  ]);

  const columns = [
    { key: 'name', label: 'Report Name' },
    { key: 'type', label: 'Type' },
    { key: 'date', label: 'Date' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
          {status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <button className="btn btn-sm btn-outline">View</button>
          <button className="btn btn-sm btn-outline">Download</button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 'var(--spacing-xl)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <h1>Reports</h1>
        <button className="btn btn-primary">Generate New Report</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <Card>
          <h3>15</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Total Reports
          </p>
        </Card>
        <Card>
          <h3>8</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Completed
          </p>
        </Card>
        <Card>
          <h3>5</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            In Progress
          </p>
        </Card>
        <Card>
          <h3>2</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Pending
          </p>
        </Card>
      </div>

      <Card title="Recent Reports">
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <input
            type="text"
            placeholder="Search reports..."
            className="form-input"
            style={{ maxWidth: '300px' }}
          />
        </div>
        <Table
          columns={columns}
          data={reports}
          sortable
          pagination
          pageSize={10}
        />
      </Card>
    </div>
  );
};

export default Reports;