import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import './Statistics.css';

const Statistics = () => {
  const [activeTab, setActiveTab] = useState('Growth');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/admin/statistics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="sa-loading-container"><div className="sa-loader"></div><p>Loading System Intelligence...</p></div>;
  if (!data) return <div className="sa-error">Connection to analytics engine lost.</div>;

  const renderGridLines = (steps = 4) => (
    <div className="sa-chart-grid-lines">
      {[...Array(steps + 1)].map((_, i) => (
        <div key={i} className="sa-grid-line" style={{ bottom: `${(i / steps) * 100}%` }}></div>
      ))}
    </div>
  );

  const generateLinePath = (points, width, height, maxVal, closePath = false) => {
    if (!points || points.length === 0) return "";
    const stepX = width / (points.length - 1);
    const coords = points.map((p, i) => {
      const x = i * stepX;
      const y = height - (Math.min(p.value, maxVal) / maxVal) * height;
      return { x, y };
    });

    let path = `M${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
        // Curve implementation
        const cp1x = coords[i].x + (coords[i+1].x - coords[i].x) / 2;
        path += ` C${cp1x},${coords[i].y} ${cp1x},${coords[i + 1].y} ${coords[i + 1].x},${coords[i + 1].y}`;
    }

    if (closePath) {
        path += ` L${width},${height} L0,${height} Z`;
    }
    return path;
  };

  const renderGrowth = () => (
    <>
      <div className="sa-stats-card sa-stats-wide">
        <h3 className="sa-stats-card-title">New Signups</h3>
        <div className="sa-chart-container">
            <div className="sa-y-axis">
                <span>8</span><span>6</span><span>4</span><span>2</span><span>0</span>
            </div>
            <div className="sa-chart-content">
                {renderGridLines(4)}
                <div className="sa-bar-chart">
                    {data.growth.newSignups.map((p, i) => (
                    <div key={i} className="sa-bar signup-bar" style={{height: `${Math.min(100, (p.value / 8) * 100)}%`}} title={`${p.label}: ${p.value}`}></div>
                    ))}
                </div>
            </div>
        </div>
        <div className="sa-x-axis">
            {data.growth.newSignups.filter((_, i) => i % 6 === 0).map((p, i) => <span key={i}>{p.label}</span>)}
        </div>
      </div>

      <div className="sa-stats-card sa-stats-wide">
        <h3 className="sa-stats-card-title">Growth Data Table</h3>
        <div className="sa-stats-table-wrapper">
          <table className="sa-stats-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>New Signups</th>
              </tr>
            </thead>
            <tbody>
              {data.growth.newSignups.slice(-10).reverse().map((p, i) => (
                <tr key={i}>
                  <td>{p.label}</td>
                  <td>{p.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderRevenue = () => {
    const dist = data.revenue.planDistribution || {};
    const total = Object.values(dist).reduce((a, b) => a + b, 0);
    
    // Consistent color mapping
    const colors = {
      'Free': '#3b82f6',
      'Starter': '#22c55e',
      'Pro': '#f59e0b',
      'Enterprise': '#a855f7'
    };
    
    let currentOffset = 0;
    const PI = 3.14159;
    const circumference = 2 * PI * 40; // r=40

    return (
      <>
        <div className="sa-stats-card sa-stats-wide">
          <h3 className="sa-stats-card-title">MRR Trend</h3>
          <div className="sa-chart-container">
              <div className="sa-y-axis">
                  <span>600K</span><span>450K</span><span>300K</span><span>150K</span><span>0K</span>
              </div>
              <div className="sa-chart-content">
                  {renderGridLines(4)}
                  <svg viewBox="0 0 500 200" className="sa-line-svg" preserveAspectRatio="none">
                      <path d={generateLinePath(data.revenue.mrrTrend, 500, 200, 600000, true)} 
                          fill="rgba(34, 197, 94, 0.15)" />
                      <path d={generateLinePath(data.revenue.mrrTrend, 500, 200, 600000)} 
                          fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" />
                  </svg>
              </div>
          </div>
          <div className="sa-x-axis">
              {data.revenue.mrrTrend.map((p, i) => <span key={i}>{p.label}</span>)}
          </div>
        </div>

        <div className="sa-stats-card sa-stats-wide">
          <h3 className="sa-stats-card-title">Revenue Distribution</h3>
          <div className="sa-pie-chart-container">
              <svg viewBox="0 0 100 100" className="sa-pie-svg">
                  {Object.entries(dist).map(([name, count], i) => {
                    const percentage = total > 0 ? (count / total) : 0;
                    const dashArray = `${percentage * circumference} ${circumference}`;
                    const dashOffset = -currentOffset;
                    currentOffset += (percentage * circumference);
                    
                    return (
                      <circle 
                        key={i}
                        cx="50" cy="50" r="40" 
                        fill="transparent" 
                        stroke={colors[name] || '#64748b'} 
                        strokeWidth="20" 
                        strokeDasharray={dashArray} 
                        strokeDashoffset={dashOffset} 
                      />
                    );
                  })}
                  {total === 0 && <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="20" />}
              </svg>
              <div className="sa-pie-labels">
                  {Object.entries(dist).map(([name, count], i) => (
                    <span key={i} className="sa-pie-label" style={{borderLeftColor: colors[name] || 'var(--sa-text-muted)'}}>
                      {name}: {count}
                    </span>
                  ))}
                  {total === 0 && <span className="sa-pie-label gray">No active accounts</span>}
              </div>
          </div>
        </div>

      <div className="sa-stats-card sa-stats-full">
        <h3 className="sa-stats-card-title">Monthly MRR Table</h3>
        <div className="sa-stats-table-wrapper">
          <table className="sa-stats-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {data.revenue.mrrTrend.map((p, i) => (
                <tr key={i}>
                  <td>{p.label}</td>
                  <td>{p.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
    );
  };

  const renderAIStats = () => (
    <>
      <div className="sa-stats-card sa-stats-wide">
        <h3 className="sa-stats-card-title">AI Requests by Feature</h3>
        <div className="sa-chart-container">
            <div className="sa-y-axis">
                <span>60</span><span>45</span><span>30</span><span>15</span><span>0</span>
            </div>
            <div className="sa-chart-content">
                {renderGridLines(4)}
                <div className="sa-bar-chart">
                    {Object.entries(data.aiAnalytics.requestsByFeature).map(([name, val], i) => (
                    <div key={i} className="sa-bar ai-bar" style={{height: `${Math.min(100, (val / 60) * 100)}%`}} title={`${name}: ${val}`}></div>
                    ))}
                </div>
            </div>
        </div>
        <div className="sa-x-axis ai-x">
            {Object.keys(data.aiAnalytics.requestsByFeature).map((name, i) => <span key={i}>{name}</span>)}
        </div>
      </div>

      <div className="sa-stats-card sa-stats-wide">
        <h3 className="sa-stats-card-title">Daily AI Usage Table</h3>
        <div className="sa-stats-table-wrapper">
           <table className="sa-stats-table">
             <thead>
               <tr>
                 <th>Feature</th>
                 <th>Total Requests</th>
               </tr>
             </thead>
             <tbody>
               {Object.entries(data.aiAnalytics.requestsByFeature).map(([name, val], i) => (
                 <tr key={i}>
                   <td>{name}</td>
                   <td>{val}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>

      <div className="sa-stats-card sa-stats-full">
        <h3 className="sa-stats-card-title">Daily AI Requests</h3>
        <div className="sa-chart-container">
            <div className="sa-y-axis">
                <span>260</span><span>195</span><span>130</span><span>65</span><span>0</span>
            </div>
            <div className="sa-chart-content">
                {renderGridLines(4)}
                <svg viewBox="0 0 500 200" className="sa-line-svg" preserveAspectRatio="none">
                    <path d={generateLinePath(data.aiAnalytics.dailyRequests, 500, 200, 260, true)} 
                        fill="rgba(168, 85, 247, 0.15)" />
                    <path d={generateLinePath(data.aiAnalytics.dailyRequests, 500, 200, 260)} 
                        fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
        <div className="sa-x-axis">
            {data.aiAnalytics.dailyRequests.filter((_, i) => i % 6 === 0).map((p, i) => <span key={i}>{p.label}</span>)}
        </div>
      </div>
    </>
  );

  return (
    <div className="sa-statistics">
      <div className="sa-page-header sa-stats-header">
        <div>
          <h1 className="sa-page-title">Statistics</h1>
          <p className="sa-page-subtitle">Real-time system intelligence</p>
        </div>
        <button className="sa-btn-outline" onClick={() => window.print()}>↓ Export PDF</button>
      </div>

      <div className="sa-stats-tabs">
        <button className={`sa-tab ${activeTab === 'Growth' ? 'active' : ''}`} onClick={() => setActiveTab('Growth')}>Growth</button>
        <button className={`sa-tab ${activeTab === 'Revenue' ? 'active' : ''}`} onClick={() => setActiveTab('Revenue')}>Revenue</button>
        <button className={`sa-tab ${activeTab === 'AI Analytics' ? 'active' : ''}`} onClick={() => setActiveTab('AI Analytics')}>AI Analytics</button>
      </div>

      <div className="sa-stats-grid">
        {activeTab === 'Growth' && renderGrowth()}
        {activeTab === 'Revenue' && renderRevenue()}
        {activeTab === 'AI Analytics' && renderAIStats()}
      </div>
    </div>
  );
};

export default Statistics;
