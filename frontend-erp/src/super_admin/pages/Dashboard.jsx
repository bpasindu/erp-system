import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_BASE = 'http://localhost:8080';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    aiRequests: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all businesses to summarize
        const bizRes = await fetch(`${API_BASE}/api/businesses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const bizData = await bizRes.json();

        if (bizRes.ok && bizData.success) {
          const businesses = bizData.data || [];
          
          // Compute mock stats based on real business count
          const activeCount = businesses.filter(b => b.status === 'ACTIVE' || !b.status || b.status === '').length;
          
          setStats({
            totalBusinesses: businesses.length,
            activeSubscriptions: activeCount,
            monthlyRevenue: businesses.length * 15000, // Mock calculation for prototype
            aiRequests: businesses.length * 125, // Mock calculation
          });
        } else {
          throw new Error(bizData.message || 'Failed to fetch business data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) return <div className="sa-loading">Loading Dashboard...</div>;
  if (error) return <div className="sa-error">{error}</div>;

  return (
    <div className="sa-dashboard">
      <div className="sa-page-header">
        <h1 className="sa-page-title">Dashboard</h1>
        <p className="sa-page-subtitle">System overview and key metrics</p>
      </div>

      <div className="sa-kpi-grid">
        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Total Businesses</span>
            <span className="sa-kpi-icon">🏢</span>
          </div>
          <div className="sa-kpi-value">{stats.totalBusinesses}</div>
          <div className="sa-kpi-trend positive">↑ 12% vs last month</div>
        </div>

        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Active Subscriptions</span>
            <span className="sa-kpi-icon">✅</span>
          </div>
          <div className="sa-kpi-value">{stats.activeSubscriptions}</div>
          <div className="sa-kpi-trend positive">↑ 3 new this week</div>
        </div>

        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Monthly Revenue</span>
            <span className="sa-kpi-icon">💲</span>
          </div>
          <div className="sa-kpi-value">LKR {stats.monthlyRevenue.toLocaleString()}</div>
          <div className="sa-kpi-trend positive">↑ 8.5% growth</div>
        </div>

        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">AI Requests</span>
            <span className="sa-kpi-icon">🤖</span>
          </div>
          <div className="sa-kpi-value">{stats.aiRequests.toLocaleString()}</div>
          <div className="sa-kpi-trend neutral">This month</div>
        </div>

        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">System Health</span>
            <span className="sa-kpi-icon">⚡</span>
          </div>
          <div className="sa-kpi-value">Operational</div>
          <div className="sa-kpi-trend neutral">All services running</div>
        </div>
      </div>

      <div className="sa-charts-row">
        <div className="sa-chart-container">
          <h3 className="sa-chart-title">New Signups (Last 30 Days)</h3>
          <div className="sa-mock-bar-chart">
            {/* Mock bars for visual parity */}
            {Array.from({length: 30}).map((_, i) => (
              <div key={i} className="sa-bar" style={{height: `${Math.random() * 80 + 10}%`}}></div>
            ))}
          </div>
        </div>
        <div className="sa-chart-container">
          <h3 className="sa-chart-title">Revenue Trend (6 Months)</h3>
          <div className="sa-mock-area-chart">
             {/* CSS trick to simulate an area chart */}
             <div className="sa-area-fill"></div>
          </div>
        </div>
      </div>

      <div className="sa-bottom-row">
        <div className="sa-quick-actions">
          <h3>Quick Actions</h3>
          <button className="sa-action-btn">Add Plan <span>→</span></button>
          <button className="sa-action-btn">View All Businesses <span>→</span></button>
          <button className="sa-action-btn">View AI Usage <span>→</span></button>
        </div>

        <div className="sa-recent-activity">
          <h3>Recent Activity</h3>
          <ul className="sa-activity-list">
            <li><span className="dot blue"></span> <strong>Amal Perera</strong> — Login <br/><small>Lanka Trading - 2 mins ago</small></li>
            <li><span className="dot green"></span> <strong>Kasun Fernando</strong> — Created Invoice #1042 <br/><small>Ceylon Solutions - 15 mins ago</small></li>
            <li><span className="dot orange"></span> <strong>Dilshan Silva</strong> — Updated Stock <br/><small>Island Enterprises - 1 hour ago</small></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
