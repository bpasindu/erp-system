import React, { useState } from 'react';
import '../products/ProductsPage.css';
import './SettingsPage.css';
import { API_BASE_URL } from '../../config';

const SettingsPage = () => {
  const [businessName, setBusinessName] = useState(
    localStorage.getItem('businessName') || 'SmartBiz'
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('businessName', businessName);
    window.dispatchEvent(new Event('businessNameChange'));
  };

  const handleResetMockData = () => {
    // Placeholder for future backend integration
    // eslint-disable-next-line no-console
    console.log('Reset mock data');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    try {
      setPasswordLoading(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || !user.userId) {
        setPasswordError('User not authenticated.');
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/users/${user.userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMessage('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError('Network error. Check backend connection.');
    } finally {
      setPasswordLoading(false);
    }
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
        <h2 className="settings-section-title">Change Password</h2>
        <form onSubmit={handleChangePassword} className="settings-form">
          {passwordMessage && <div style={{ color: '#16a34a', marginBottom: '1rem', backgroundColor: '#dcfce7', padding: '0.5rem', borderRadius: '4px' }}>{passwordMessage}</div>}
          {passwordError && <div style={{ color: '#dc2626', marginBottom: '1rem', backgroundColor: '#fee2e2', padding: '0.5rem', borderRadius: '4px' }}>{passwordError}</div>}

          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary settings-save-btn" disabled={passwordLoading}>
            {passwordLoading ? 'Changing...' : 'Change Password'}
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
              onChange={(e) => {
                const isDark = e.target.checked;
                setDarkMode(isDark);
                if (isDark) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  localStorage.setItem('theme', 'dark');
                } else {
                  document.documentElement.removeAttribute('data-theme');
                  localStorage.setItem('theme', 'light');
                }
              }}
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

