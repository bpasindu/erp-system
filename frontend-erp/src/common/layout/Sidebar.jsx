import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const getNavClass = ({ isActive }) =>
    `nav-item${isActive ? ' active' : ''}`;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2 className="brand-name">SmartBiz</h2>
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
        <a href="#" className="nav-item">
          <span className="nav-icon">📄</span> Invoices
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">📘</span> Ledger
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">📊</span> Reports
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">🤖</span> AI Assistant
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">⚙️</span> Settings
        </a>
      </nav>

      <div className="sidebar-footer">
        <a href="#" className="nav-item logout">
          <span className="nav-icon">🚪</span> Logout
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;

