import React, { useState } from 'react';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';
import './Users.css';

const Users = () => {
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', joinDate: '2024-01-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Editor', status: 'Inactive', joinDate: '2024-02-01' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'User', status: 'Active', joinDate: '2024-02-10' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'Admin', status: 'Active', joinDate: '2024-02-15' }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`status-badge ${status.toLowerCase()}`}>
          {status}
        </span>
      )
    },
    { key: 'joinDate', label: 'Join Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <div className="action-buttons">
          <button 
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
          >
            ✏️
          </button>
          <button 
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user);
            }}
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      console.log('Deleting user:', user);
    }
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users Management</h1>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Add New User
        </Button>
      </div>

      <Card>
        <div className="users-filters">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="search-input"
          />
          <select className="filter-select">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">User</option>
          </select>
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Table
          columns={columns}
          data={users}
          onRowClick={handleRowClick}
          selectable
          sortable
          pagination
          pageSize={5}
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? 'Edit User' : 'Add New User'}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary">
              {selectedUser ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <form className="user-form">
          <div className="form-group">
            <label>Name</label>
            <input 
              type="text" 
              defaultValue={selectedUser?.name} 
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              defaultValue={selectedUser?.email} 
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select 
              defaultValue={selectedUser?.role} 
              className="form-input"
            >
              <option value="User">User</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select 
              defaultValue={selectedUser?.status} 
              className="form-input"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;