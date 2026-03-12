import React from 'react';
import './Page2.css';

// Reusable Components
const DashboardCard = ({ title, value, icon, description, trend }) => (
  <div className="dashboard-card">
    <div className="card-header">
      <div className="card-icon">{icon}</div>
      <span className="card-title">{title}</span>
    </div>
    <div className="card-body">
      <h2 className="card-value">{value}</h2>
      <div className="card-trend">
        {trend && <span className={`trend ${trend.type}`}>{trend.value}</span>}
      </div>
    </div>
  </div>
);

const SalesChart = () => (
  <div className="chart-container">
    <h3 className="section-title">Sales Last 7 Days</h3>
    <div className="chart-placeholder">
      {/* CSS-based bar chart representation for the mockup */}
      <div className="bar-wrapper"><div className="bar" style={{height: '40%'}}></div><span className="x-label">Mon</span></div>
      <div className="bar-wrapper"><div className="bar" style={{height: '60%'}}></div><span className="x-label">Tue</span></div>
      <div className="bar-wrapper"><div className="bar" style={{height: '35%'}}></div><span className="x-label">Wed</span></div>
      <div className="bar-wrapper"><div className="bar" style={{height: '75%'}}></div><span className="x-label">Thu</span></div>
      <div className="bar-wrapper"><div className="bar" style={{height: '55%'}}></div><span className="x-label">Fri</span></div>
      <div className="bar-wrapper"><div className="bar" style={{height: '90%'}}></div><span className="x-label">Sat</span></div>
      <div className="bar-wrapper"><div className="bar" style={{height: '45%'}}></div><span className="x-label">Sun</span></div>
    </div>
  </div>
);

const OrdersTable = ({ orders }) => (
  <div className="orders-container">
    <div className="orders-header">
      <h3 className="section-title">Recent Invoices</h3>
      <button className="btn-link">View all</button>
    </div>
    <div className="orders-list">
      {orders.map((order, index) => (
        <div className="order-item" key={index}>
          <div className="order-info">
            <span className="order-id">{order.id}</span>
            <span className="order-separator">—</span>
            <span className="order-customer">{order.customer}</span>
            <div className="order-date">{order.date}</div>
          </div>
          <div className="order-amount-status">
            <span className="order-amount">{order.amount}</span>
            <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LowStockList = ({ products }) => (
  <div className="low-stock-container">
    <h3 className="section-title">Low Stock Items</h3>
    <ul className="low-stock-list">
      {products.map((product, index) => (
        <li className="low-stock-item" key={index}>
          <div className="product-info">
            <span className="product-name">{product.name}</span>
            <span className="product-sku">{product.sku}</span>
          </div>
          <span className="product-qty">{product.qty} left</span>
        </li>
      ))}
    </ul>
  </div>
);

const Page2 = () => {
  // Mock Data
  const recentOrders = [
    { id: 'INV-001', customer: 'Kamal Perera', amount: 'Rs. 5,500', status: 'paid', date: '2026-02-14' },
    { id: 'INV-002', customer: 'Nishani Fernando', amount: 'Rs. 18,287', status: 'unpaid', date: '2026-02-13' },
    { id: 'INV-003', customer: 'Arun Wickramasinghe', amount: 'Rs. 10,780', status: 'paid', date: '2026-02-12' },
    { id: 'INV-004', customer: 'Sanduni Silva', amount: 'Rs. 15,444', status: 'unpaid', date: '2026-02-11' },
    { id: 'INV-005', customer: 'Dilan Rajapaksa', amount: 'Rs. 7,040', status: 'paid', date: '2026-02-10' },
  ];

  const lowStockProducts = [
    { name: 'Printer Paper A4', sku: 'PR-A4-01', qty: 2 },
    { name: 'Wireless Mouse', sku: 'WM-05', qty: 4 },
    { name: 'Office Chair', sku: 'OC-09', qty: 1 },
    { name: 'Stapler', sku: 'ST-02', qty: 5 },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay (Mobile) */}
      <div className="sidebar-overlay"></div>

      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2 className="brand-name">SmartBiz</h2>
          <button className="menu-toggle">☰</button>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="nav-icon">⊞</span> Dashboard
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📦</span> Products
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">👥</span> Customers
          </a>
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

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search..." aria-label="Search" />
          </div>
          <div className="header-actions">
            <button className="icon-button notification-btn">
              🔔
              <span className="notification-badge"></span>
            </button>
            <div className="profile-avatar">
              <span>SB</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-wrapper">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <div className="page-actions">
              <button className="btn btn-primary">+ Create Invoice</button>
              <button className="btn btn-secondary">📦 Add Product</button>
              <button className="btn btn-secondary">🤖 Ask AI</button>
            </div>
          </div>

          {/* KPI Cards Row */}
          <div className="kpi-grid">
            <DashboardCard 
              title="Today Sales" 
              value="Rs. 5,500" 
              icon="🛒" 
            />
            <DashboardCard 
              title="Month Sales" 
              value="Rs. 53,020" 
              icon="💲" 
            />
            <DashboardCard 
              title="Profit" 
              value="Rs. -21,180" 
              icon="📈" 
            />
            <DashboardCard 
              title="Low Stock Items" 
              value="5" 
              icon="⚠️" 
            />
            <DashboardCard 
              title="Total Products" 
              value="12" 
              icon="📦" 
            />
            <DashboardCard 
              title="Out of Stock" 
              value="2" 
              icon="❌" 
            />
          </div>

          {/* Charts and Tables Row */}
          <div className="content-grid">
            {/* Left Column (Chart) */}
            <div className="chart-section layout-card">
              <SalesChart />
            </div>

            {/* Right Column (Invoices & Low Stock) */}
            <div className="right-sidebar-section">
              <div className="layout-card">
                <OrdersTable orders={recentOrders} />
              </div>
              <div className="layout-card mt-4">
                <LowStockList products={lowStockProducts} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page2;
