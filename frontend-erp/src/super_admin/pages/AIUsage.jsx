import React, { useState, useEffect, useMemo } from 'react';
import './AIUsage.css';

const API_BASE = 'http://localhost:8080';

const AIUsage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const token = localStorage.getItem('token');

  const fetchAILogs = async () => {
    try {
      setLoading(true);
      // Attempting to fetch from actual AIRequest endpoint
      const res = await fetch(`${API_BASE}/api/admin/ai-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success && data.data) {
        setLogs(data.data);
      } else {
        generateMockAILogs();
      }
    } catch (err) {
      generateMockAILogs();
    } finally {
      setLoading(false);
    }
  };

  const generateMockAILogs = () => {
    const businesses = ['Pro Tech', 'Metro Tech', 'Digital Holdings', 'Nova Corp', 'Emerald Systems', 'Island Ventures'];
    const features = ['Marketing Post', 'Insights', 'Invoice Summary', 'Supplier Analysis'];
    
    const mockData = Array.from({length: 25}).map((_, i) => {
      const isAbuse = Math.random() < 0.15;
      const tokens = isAbuse ? Math.floor(Math.random() * 2000) + 1500 : Math.floor(Math.random() * 500) + 50;
      
      return {
        id: i,
        timestamp: new Date(Date.now() - Math.random() * 50000000).toLocaleString(),
        business: businesses[Math.floor(Math.random() * businesses.length)],
        feature: features[Math.floor(Math.random() * features.length)],
        promptLen: Math.floor(tokens * 0.2),
        tokens: tokens,
        outcome: Math.random() > 0.05 ? 'Success' : 'Failed',
        isAbuse: isAbuse
      };
    });

    setLogs(mockData);
  };

  useEffect(() => {
    fetchAILogs();
  }, [token]);

  const flaggedLogs = useMemo(() => logs.filter(l => l.isAbuse), [logs]);
  
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = l.business.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'All' || 
                           (filter === 'High Token Usage' && l.tokens > 1000) ||
                           (filter === 'Failed Requests' && l.outcome === 'Failed');
      return matchesSearch && matchesFilter;
    });
  }, [logs, searchTerm, filter]);

  if (loading && logs.length === 0) return <div className="sa-loading">Loading AI Analytics...</div>;

  return (
    <div className="sa-ai-usage">
      <div className="sa-page-header">
        <h1 className="sa-page-title">AI Usage</h1>
        <p className="sa-page-subtitle">Review AI usage across businesses</p>
      </div>

      <div className="sa-ai-kpi-row">
        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Total AI Requests</span>
            <span className="sa-kpi-icon">🧠</span>
          </div>
          <div className="sa-kpi-value">150</div>
        </div>
        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Avg / Business</span>
            <span className="sa-kpi-icon">📈</span>
          </div>
          <div className="sa-kpi-value">6.0</div>
        </div>
        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Top Feature</span>
            <span className="sa-kpi-icon">⚡</span>
          </div>
          <div className="sa-kpi-value" style={{fontSize: '22px'}}>Insights</div>
        </div>
        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Est. AI Cost</span>
            <span className="sa-kpi-icon">💲</span>
          </div>
          <div className="sa-kpi-value">$7.74</div>
        </div>
      </div>

      {flaggedLogs.length > 0 && (
        <div className="sa-abuse-detection">
          <div className="sa-abuse-header">
            <span className="warning-icon">⚠️</span> Abuse Detection — {flaggedLogs.length} flagged
          </div>
          <div className="sa-abuse-list">
            {flaggedLogs.slice(0, 5).map(log => (
              <div key={`abuse-${log.id}`} className="sa-abuse-item">
                <div className="sa-abuse-info">
                  <strong>{log.business}</strong> — {log.feature} — {log.tokens} tokens
                </div>
                <button className="sa-btn-outline success-text">✓ Mark Reviewed</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sa-filters-toolbar">
        <div className="sa-search-input">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Search business..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sa-filter-group">
          <span className="sa-filter-icon">⚲</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>High Token Usage</option>
            <option>Failed Requests</option>
          </select>
        </div>
      </div>

      <div className="sa-table-container">
        <table className="sa-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Business</th>
              <th>Feature</th>
              <th>Prompt Len</th>
              <th>Tokens</th>
              <th>Outcome</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(l => (
              <tr key={l.id}>
                <td style={{color: '#64748b', fontSize: '13px'}}>{l.timestamp}</td>
                <td><strong>{l.business}</strong></td>
                <td>{l.feature}</td>
                <td>{l.promptLen}</td>
                <td>{l.tokens}</td>
                <td>
                  <span className={`sa-status-badge ${l.outcome === 'Success' ? 'active' : 'suspended'}`}>
                    {l.outcome}
                  </span>
                </td>
                <td className="sa-actions-cell">
                  <button className="sa-action-link">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AIUsage;
