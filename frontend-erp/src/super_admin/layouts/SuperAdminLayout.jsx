import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './SuperAdminLayout.css';

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`super-admin-layout ${isDarkMode ? 'sa-dark-mode' : ''}`}>
      {/* Sidebar */}
      <aside className="sa-sidebar">
        <div className="sa-sidebar-header">
          <div className="sa-logo-icon">SB</div>
          <span className="sa-logo-text">SmartBiz Admin</span>
        </div>

        <nav className="sa-nav-menu">
          <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? 'sa-nav-item active' : 'sa-nav-item'}>
            <span className="sa-nav-icon">⊞</span> Dashboard
          </NavLink>
          <NavLink to="/admin/businesses" className={({isActive}) => isActive ? 'sa-nav-item active' : 'sa-nav-item'}>
            <span className="sa-nav-icon">🏢</span> Businesses
          </NavLink>
          <NavLink to="/admin/usage-logs" className={({isActive}) => isActive ? 'sa-nav-item active' : 'sa-nav-item'}>
            <span className="sa-nav-icon">📄</span> Usage Logs
          </NavLink>
          <NavLink to="/admin/ai-usage" className={({isActive}) => isActive ? 'sa-nav-item active' : 'sa-nav-item'}>
            <span className="sa-nav-icon">🧠</span> AI Usage
          </NavLink>
          <NavLink to="/admin/statistics" className={({isActive}) => isActive ? 'sa-nav-item active' : 'sa-nav-item'}>
            <span className="sa-nav-icon">📊</span> Statistics
          </NavLink>
          <div className="sa-nav-divider"></div>
          <NavLink to="/admin/plans" className={({isActive}) => isActive ? 'sa-nav-item active' : 'sa-nav-item'}>
            <span className="sa-nav-icon">💳</span> Plans & Billing
          </NavLink>
          <NavLink to="/admin/settings" className={({isActive}) => isActive ? 'sa-nav-item active' : 'sa-nav-item'}>
            <span className="sa-nav-icon">⚙️</span> Admin Settings
          </NavLink>
        </nav>

        <div className="sa-sidebar-footer">
          <div className="sa-user-profile">
            <div className="sa-avatar">SA</div>
            <div className="sa-user-info">
              <span className="sa-user-name">Super Admin</span>
              <span className="sa-user-email">admin@smartbiz.lk</span>
            </div>
          </div>
          <button className="sa-logout-btn" onClick={handleLogout} title="Logout">
            ⎋
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="sa-main-wrapper">
        <header className="sa-topbar">
          <div className="sa-search-bar">
            <span className="sa-search-icon">🔍</span>
            <input type="text" placeholder="Search businesses..." />
          </div>
          <div className="sa-topbar-actions">
            <button className="sa-icon-btn">🔔<span className="sa-badge">2</span></button>
            <button className="sa-icon-btn" onClick={toggleDarkMode}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="sa-topbar-profile">
              <div className="sa-avatar small">SA</div>
              <span>Super Admin</span>
              <span className="sa-dropdown-icon">▼</span>
            </div>
          </div>
        </header>

        <main className="sa-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
