import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState(
    localStorage.getItem('businessName') || 'SmartBiz'
  );

  useEffect(() => {
    const handleNameChange = () => {
      setBusinessName(localStorage.getItem('businessName') || 'SmartBiz');
    };
    
    window.addEventListener('businessNameChange', handleNameChange);
    return () => window.removeEventListener('businessNameChange', handleNameChange);
  }, []);
  
  const getNavClass = ({ isActive }) =>
    `nav-item${isActive ? ' active' : ''}`;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2 className="brand-name">{businessName}</h2>
        <button className="menu-toggle">☰</button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/home" className={getNavClass} end>
          <span className="nav-icon">⊞</span> Dashboard
        </NavLink>
        <NavLink to="/products" className={getNavClass}>
          <span className="nav-icon">📦</span> Products
        </NavLink>
        <NavLink to="/customers" className={getNavClass}>
          <span className="nav-icon">👥</span> Customers
        </NavLink>
        <NavLink to="/invoices" className={getNavClass}>
          <span className="nav-icon">📄</span> Invoices
        </NavLink>
        <NavLink to="/ledger" className={getNavClass}>
          <span className="nav-icon">📘</span> Ledger
        </NavLink>
        <NavLink to="/reports" className={getNavClass}>
          <span className="nav-icon">📊</span> Reports
        </NavLink>
        <NavLink to="/assistant" className={getNavClass}>
          <span className="nav-icon">🤖</span> AI Assistant
        </NavLink>
        <NavLink to="/settings" className={getNavClass}>
          <span className="nav-icon">⚙️</span> Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="nav-item logout" onClick={handleLogout}>
          <span className="nav-icon">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

