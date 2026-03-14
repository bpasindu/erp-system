import React, { useState } from 'react';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className="sa-admin-settings">
      <div className="sa-page-header">
        <h1 className="sa-page-title">Admin Settings</h1>
        <p className="sa-page-subtitle">Manage platform configuration</p>
      </div>

      <div className="sa-stats-tabs sa-settings-tabs">
        <button 
          className={`sa-tab ${activeTab === 'Profile' ? 'active' : ''}`} 
          onClick={() => setActiveTab('Profile')}
        >
          Profile
        </button>
        <button 
          className={`sa-tab ${activeTab === 'Platform' ? 'active' : ''}`} 
          onClick={() => setActiveTab('Platform')}
        >
          Platform
        </button>
        <button 
          className={`sa-tab ${activeTab === 'Roles' ? 'active' : ''}`} 
          onClick={() => setActiveTab('Roles')}
        >
          Roles
        </button>
      </div>

      {activeTab === 'Profile' && (
        <div className="sa-settings-card">
          <h2 className="sa-settings-title">Admin Profile</h2>
          
          <form className="sa-settings-form" onSubmit={(e) => { e.preventDefault(); alert('Settings saved!'); }}>
            <div className="sa-form-group">
              <label>Full Name</label>
              <input type="text" className="sa-settings-input" defaultValue="Super Admin" />
            </div>

            <div className="sa-form-group">
              <label>Email</label>
              <input type="email" className="sa-settings-input" defaultValue="admin@smartbiz.lk" />
            </div>

            <div className="sa-form-group">
              <label>Password</label>
              <input type="password" className="sa-settings-input" defaultValue="********" />
            </div>

            <button type="submit" className="sa-btn-primary">Save Changes</button>
          </form>
        </div>
      )}

      {activeTab === 'Platform' && (
        <div className="sa-settings-card">
          <h2 className="sa-settings-title">Platform Configuration</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginBottom: '20px'}}>Global settings for the ERP system.</p>
          
          <div className="sa-form-group">
            <label>System Maintenance Mode</label>
            <label className="sa-toggle">
              <input type="checkbox" />
              <span className="sa-slider"></span>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'Roles' && (
        <div className="sa-settings-card">
          <h2 className="sa-settings-title">Role Management</h2>
          <p style={{color: '#64748b', fontSize: '14px'}}>Configure default permissions for different user roles.</p>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
