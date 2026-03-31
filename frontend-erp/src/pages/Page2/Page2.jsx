import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Page2.css';
import Sidebar from '../../common/layout/Sidebar';
import TopHeader from '../../common/layout/TopHeader';
import { API_BASE_URL as API_BASE } from '../../config';

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

const SalesChart = ({ invoices }) => {
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().slice(0, 10);
      days.push({ label: dayName, dateStr, total: 0 });
    }
    
    (invoices || []).forEach(inv => {
      const date = inv.createdAt ? String(inv.createdAt).slice(0, 10) : '';
      const dayObj = days.find(d => d.dateStr === date);
      if (dayObj && inv.status === 'PAID') { // Option to only count PAID or all invoices. Let's count all or paid? Usually totalAmount is count if paid. Let's count all for now since older code counted all.
        dayObj.total += Number(inv.totalAmount ?? 0);
      } else if (dayObj) {
         dayObj.total += Number(inv.totalAmount ?? 0);
      }
    });

    const maxVal = Math.max(...days.map(d => d.total), 10); // arbitrary minimum max to prevent huge bars for tiny first sales
    
    return days.map(d => ({
      ...d,
      heightPercent: Math.round((d.total / maxVal) * 100)
    }));
  }, [invoices]);

  return (
    <div className="chart-container">
      <h3 className="section-title">Sales Last 7 Days</h3>
      <div className="chart-placeholder">
        {last7Days.map((day, idx) => (
          <div key={idx} className="bar-wrapper" title={`Rs. ${day.total.toLocaleString()}`}>
            <div className="bar" style={{height: `${Math.max(day.heightPercent, 2)}%`}}></div>
            <span className="x-label">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrdersTable = ({ orders, onViewAll }) => (
  <div className="orders-container">
    <div className="orders-header">
      <h3 className="section-title">Recent Invoices</h3>
      <button className="btn-link" type="button" onClick={onViewAll}>
        View all
      </button>
    </div>
    <div className="orders-list">
      {orders.length === 0 ? (
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          No invoices yet.
        </div>
      ) : (
        orders.map((order) => (
          <div className="order-item" key={order.id}>
            <div className="order-info">
              <span className="order-id">{order.id}</span>
              <span className="order-separator">—</span>
              <span className="order-customer">{order.customer}</span>
              <div className="order-date">{order.date}</div>
            </div>
            <div className="order-amount-status">
              <span className="order-amount">{order.amount}</span>
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const LowStockList = ({ products }) => (
  <div className="low-stock-container">
    <h3 className="section-title">Low Stock Items</h3>
    <ul className="low-stock-list">
      {products.length === 0 ? (
        <li style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          No low stock items.
        </li>
      ) : (
        products.map((product) => (
          <li className="low-stock-item" key={product.id}>
            <div className="product-info">
              <span className="product-name">{product.name}</span>
              <span className="product-sku">{product.sku || '—'}</span>
            </div>
            <span className="product-qty">{product.qty} left</span>
          </li>
        ))
      )}
    </ul>
  </div>
);

// API URL configured in config.js

const parseProductMeta = (product) => {
  let meta = {};
  try {
    if (product.description) meta = JSON.parse(product.description);
  } catch {
    meta = {};
  }
  return { ...product, ...meta };
};

const Page2 = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const businessId = user?.businessId;

  useEffect(() => {
    const fetchAll = async () => {
      if (!token || !businessId) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [invRes, custRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/api/invoices/business/${businessId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/customers/business/${businessId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/api/products/business/${businessId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [invData, custData, prodData] = await Promise.all([
          invRes.json(),
          custRes.json(),
          prodRes.json(),
        ]);

        if (!invRes.ok || !invData.success) {
          throw new Error(invData.message || 'Failed to load invoices.');
        }
        if (!custRes.ok || !custData.success) {
          throw new Error(custData.message || 'Failed to load customers.');
        }
        if (!prodRes.ok || !prodData.success) {
          throw new Error(prodData.message || 'Failed to load products.');
        }

        setInvoices(invData.data || []);
        setCustomers(custData.data || []);
        setProducts((prodData.data || []).map(parseProductMeta));
      } catch (e) {
        setError(e.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, businessId, navigate]);

  const customerNameById = useMemo(() => {
    const map = new Map();
    customers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  const todayKey = new Date().toISOString().slice(0, 10);

  const todaySales = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      const date = inv.createdAt ? String(inv.createdAt).slice(0, 10) : '';
      if (date !== todayKey) return sum;
      return sum + Number(inv.totalAmount ?? 0);
    }, 0);
  }, [invoices, todayKey]);

  const monthKey = new Date().toISOString().slice(0, 7);
  const monthSales = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      const date = inv.createdAt ? String(inv.createdAt).slice(0, 7) : '';
      if (date !== monthKey) return sum;
      return sum + Number(inv.totalAmount ?? 0);
    }, 0);
  }, [invoices, monthKey]);

  const stockStats = useMemo(() => {
    let low = 0;
    let out = 0;
    products.forEach((p) => {
      const qty = Number(p.stockQuantity ?? p.stockQty ?? 0);
      if (qty <= 0) out += 1;
      else if (qty < 5) low += 1;
    });
    return { low, out, total: products.length };
  }, [products]);

  const recentOrders = useMemo(() => {
    const sorted = [...invoices].sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
    return sorted.slice(0, 5).map((inv) => ({
      id: inv.invoiceNumber || `INV-${inv.id}`,
      customer: customerNameById.get(inv.customerId) || '—',
      amount: `Rs. ${Number(inv.totalAmount ?? 0).toLocaleString()}`,
      status: (inv.status || 'unpaid').toLowerCase(),
      date: String(inv.createdAt || '').slice(0, 10) || '—',
    }));
  }, [invoices, customerNameById]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => {
        const qty = Number(p.stockQuantity ?? p.stockQty ?? 0);
        return qty > 0 && qty < 5;
      })
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        qty: Number(p.stockQuantity ?? p.stockQty ?? 0),
      }));
  }, [products]);

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay (Mobile) */}
      <div className="sidebar-overlay"></div>
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        <TopHeader />

        {/* Dashboard Content */}
        <div className="dashboard-wrapper">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <div className="page-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate('/invoices')}
              >
                + Create Invoice
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => navigate('/products')}
              >
                📦 Add Product
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => navigate('/assistant')}
              >
                🤖 Ask AI
              </button>
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: '1rem', color: '#b91c1c' }}>{error}</div>
          )}

          {/* KPI Cards Row */}
          <div className="kpi-grid">
            <DashboardCard 
              title="Today Sales" 
              value={`Rs. ${Number(todaySales).toLocaleString()}`} 
              icon="🛒" 
            />
            <DashboardCard 
              title="Month Sales" 
              value={`Rs. ${Number(monthSales).toLocaleString()}`} 
              icon="💲" 
            />
            <DashboardCard 
              title="Profit" 
              value="Rs. 0" 
              icon="📈" 
            />
            <DashboardCard 
              title="Low Stock Items" 
              value={String(stockStats.low)} 
              icon="⚠️" 
            />
            <DashboardCard 
              title="Total Products" 
              value={String(stockStats.total)} 
              icon="📦" 
            />
            <DashboardCard 
              title="Out of Stock" 
              value={String(stockStats.out)} 
              icon="❌" 
            />
          </div>

          {/* Charts and Tables Row */}
          <div className="content-grid">
            {/* Left Column (Chart) */}
            <div className="chart-section layout-card">
              <SalesChart invoices={invoices} />
            </div>

            {/* Right Column (Invoices & Low Stock) */}
            <div className="right-sidebar-section">
              <div className="layout-card">
                <OrdersTable
                  orders={recentOrders}
                  onViewAll={() => navigate('/invoices')}
                />
              </div>
              <div className="layout-card mt-4">
                <LowStockList products={lowStockProducts} />
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ marginTop: '1rem', color: '#6b7280' }}>
              Loading dashboard...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Page2;
