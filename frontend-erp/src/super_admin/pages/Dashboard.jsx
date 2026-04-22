import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './Dashboard.css';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();

        if (res.ok && json.success) {
          setData(json.data);
        } else {
          throw new Error(json.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) return <div className="sa-loading-container"><div className="sa-loader"></div><p>Syncing Dashboard...</p></div>;
  if (error) return <div className="sa-error-container"><div className="sa-error-icon">⚠️</div><p>{error}</p></div>;
  if (!data) return null;

  const generateLinePath = (points, width, height, maxVal, closePath = false) => {
    if (!points || points.length === 0) return "";
    const stepX = width / (points.length - 1);
    const coords = points.map((p, i) => ({
      x: i * stepX,
      y: height - (Math.min(p.value, maxVal) / maxVal) * height
    }));

    let path = `M${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const cp1x = coords[i].x + (coords[i+1].x - coords[i].x) / 2;
        path += ` C${cp1x},${coords[i].y} ${cp1x},${coords[i + 1].y} ${coords[i + 1].x},${coords[i + 1].y}`;
    }

    if (closePath) {
        path += ` L${width},${height} L0,${height} Z`;
    }
    return path;
  };

  return (
    <div className="sa-dashboard">
      <div className="sa-page-header">
        <h1 className="sa-page-title">Dashboard</h1>
        <p className="sa-page-subtitle">Real-time system overview and platform metrics</p>
      </div>

      <div className="sa-kpi-grid">
        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Total Businesses</span>
            <span className="sa-kpi-icon">🏢</span>
          </div>
          <div className="sa-kpi-value">{data.totalBusinesses}</div>
          <div className="sa-kpi-trend positive">↑ Live count</div>
        </div>

        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Active Subscriptions</span>
            <span className="sa-kpi-icon">✅</span>
          </div>
          <div className="sa-kpi-value">{data.activeSubscriptions}</div>
          <div className="sa-kpi-trend positive">Status: Active</div>
        </div>

        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Monthly Revenue</span>
            <span className="sa-kpi-icon">💲</span>
          </div>
          <div className="sa-kpi-value">LKR {data.monthlyRevenue.toLocaleString()}</div>
          <div className="sa-kpi-trend positive">↑ 30 days trailing</div>
        </div>

        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">AI Requests</span>
            <span className="sa-kpi-icon">🤖</span>
          </div>
          <div className="sa-kpi-value">{data.totalAiRequests.toLocaleString()}</div>
          <div className="sa-kpi-trend neutral">Total usage</div>
        </div>
      </div>

      <div className="sa-charts-row">
        <div className="sa-chart-card">
          <h3 className="sa-chart-title">New Signups (Last 30 Days)</h3>
          <div className="sa-dash-bar-chart">
            {data.signupTrend.map((p, i) => (
              <div key={i} className="sa-dash-bar" style={{height: `${Math.min(100, (p.value / 8) * 100)}%`}} title={`${p.label}: ${p.value}`}></div>
            ))}
          </div>
          <div className="sa-dash-chart-labels">
            <span>{data.signupTrend[0]?.label}</span>
            <span>{data.signupTrend[data.signupTrend.length - 1]?.label}</span>
          </div>
        </div>

        <div className="sa-chart-card">
          <h3 className="sa-chart-title">Revenue Trend (LKR)</h3>
          <div className="sa-dash-area-chart">
             <svg viewBox="0 0 500 200" className="sa-dash-svg" preserveAspectRatio="none">
                <path d={generateLinePath(data.revenueTrend, 500, 200, 600000, true)} fill="rgba(34, 197, 94, 0.1)" />
                <path d={generateLinePath(data.revenueTrend, 500, 200, 600000)} fill="none" stroke="#22c55e" strokeWidth="3" />
             </svg>
          </div>
          <div className="sa-dash-chart-labels">
            <span>{data.revenueTrend[0]?.label}</span>
            <span>{data.revenueTrend[data.revenueTrend.length - 1]?.label}</span>
          </div>
        </div>
      </div>

      <div className="sa-bottom-row">
        <div className="sa-quick-actions">
          <h3>Quick Actions</h3>
          <button className="sa-action-btn" onClick={() => navigate('/admin/plans')}>Add Plan <span>→</span></button>
          <button className="sa-action-btn" onClick={() => navigate('/admin/businesses')}>View All Businesses <span>→</span></button>
          <button className="sa-action-btn" onClick={() => navigate('/admin/ai-usage')}>View AI Usage <span>→</span></button>
        </div>

        <div className="sa-recent-activity">
          <h3>Recent System Activity</h3>
          <ul className="sa-activity-list">
            {data.recentActivities.map((act, i) => (
              <li key={i}>
                <span className={`dot ${act.result === 'SUCCESS' ? 'green' : 'orange'}`}></span>
                <strong>{act.userName}</strong> — {act.action} <br/>
                <small>{act.businessName} • {new Date(act.createdAt).toLocaleTimeString()}</small>
              </li>
            ))}
            {data.recentActivities.length === 0 && <p className="sa-no-data">No recent activity detected.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
