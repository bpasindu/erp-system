import React, { useState } from 'react';
import '../products/ProductsPage.css';
import './SettingsPage.css';

const SettingsPage = () => {
  const [businessName, setBusinessName] = useState('SmartBiz');
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // Placeholder for future backend integration
    // eslint-disable-next-line no-console
    console.log('Profile saved', { businessName });
  };

  const handleResetMockData = () => {
    // Placeholder for future backend integration
    // eslint-disable-next-line no-console
    console.log('Reset mock data');
  };

  return (
    <div className="products-page settings-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Manage your business profile, appearance, and data preferences.
          </p>
        </div>
      </div>

      <div className="settings-card">
        <h2 className="settings-section-title">Business Profile</h2>
        <form onSubmit={handleSaveProfile} className="settings-form">
          <div className="form-group">
            <label>Business Name</label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select disabled defaultValue="LKR">
              <option value="LKR">LKR (Rs.)</option>
            </select>
          </div>
          <div className="settings-logo-row">
            <div className="settings-logo">SB</div>
          </div>
          <button type="submit" className="btn btn-primary settings-save-btn">
            Save Profile
          </button>
        </form>
      </div>

      <div className="settings-card">
        <h2 className="settings-section-title">Appearance</h2>
        <div className="settings-row">
          <span className="settings-label">Dark Mode</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <span className="slider" />
          </label>
        </div>
      </div>

      <div className="settings-card">
        <h2 className="settings-section-title">Data Management</h2>
        <button
          type="button"
          className="btn settings-danger-btn"
          onClick={handleResetMockData}
        >
          Reset All Mock Data
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;

