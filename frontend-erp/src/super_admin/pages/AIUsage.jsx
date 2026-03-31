import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config';
import './AIUsage.css';

const AIUsage = () => {
  const [logs, setLogs] = useState([]);
  const [flaggedLogs, setFlaggedLogs] = useState([]);
  const [summary, setSummary] = useState({
    totalRequests: 0,
    avgRequestsPerBusiness: 0.0,
    topFeature: 'N/A',
    totalCostEstimate: 0.0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch Summary
      const summaryRes = await fetch(`${API_BASE_URL}/api/admin/ai/summary`, { headers });
      const summaryData = await summaryRes.json();
      if (summaryRes.ok && summaryData.success) setSummary(summaryData.data);

      // Fetch All Requests
      const logsRes = await fetch(`${API_BASE_URL}/api/admin/ai/requests`, { headers });
      const logsData = await logsRes.json();
      if (logsRes.ok && logsData.success) setLogs(logsData.data || []);

      // Fetch Flagged Requests
      const flaggedRes = await fetch(`${API_BASE_URL}/api/admin/ai/flagged`, { headers });
      const flaggedData = await flaggedRes.json();
      if (flaggedRes.ok && flaggedData.success) setFlaggedLogs(flaggedData.data || []);

    } catch (err) {
      console.error('Error fetching AI data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/ai/requests/${id}/review`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFlaggedLogs(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error('Error reviewing AI request:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const businessName = l.businessName || 'Unknown';
      const matchesSearch = businessName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'All' || 
                           (filter === 'High Token Usage' && l.tokensUsed > 1000) ||
                           (filter === 'Failed Requests' && l.status === 'FAILED');
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
          <div className="sa-kpi-value">{summary.totalRequests}</div>
        </div>
        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Avg / Business</span>
            <span className="sa-kpi-icon">📈</span>
          </div>
          <div className="sa-kpi-value">{summary.avgRequestsPerBusiness.toFixed(1)}</div>
        </div>
        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Top Feature</span>
            <span className="sa-kpi-icon">⚡</span>
          </div>
          <div className="sa-kpi-value" style={{fontSize: '22px'}}>{summary.topFeature}</div>
        </div>
        <div className="sa-kpi-card">
          <div className="sa-kpi-header">
            <span className="sa-kpi-title">Est. AI Cost</span>
            <span className="sa-kpi-icon">💲</span>
          </div>
          <div className="sa-kpi-value">${summary.totalCostEstimate.toFixed(2)}</div>
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
                  <strong>{log.businessName}</strong> — {log.requestType} — {log.tokensUsed} tokens
                </div>
                <button 
                  className="sa-btn-outline success-text"
                  onClick={() => handleMarkReviewed(log.id)}
                >
                  ✓ Mark Reviewed
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sa-filters-toolbar">
        <div className="sa-search-input">
          <span style={{cursor: 'pointer'}} onClick={() => console.log('Search triggered for:', searchTerm)}>🔍</span>
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
            {(filteredLogs || []).map(l => (
              <tr key={l.id}>
                <td style={{color: '#64748b', fontSize: '13px'}}>
                  {new Date(l.createdAt).toLocaleString()}
                </td>
                <td><strong>{l.businessName}</strong></td>
                <td>{l.requestType}</td>
                <td>{l.prompt?.length || 0}</td>
                <td>{l.tokensUsed}</td>
                <td>
                  <span className={`sa-status-badge ${l.status === 'SUCCESS' ? 'active' : 'suspended'}`}>
                    {l.status}
                  </span>
                </td>
                <td className="sa-actions-cell">
                  <button className="sa-action-link" onClick={() => alert(l.prompt)}>Details</button>
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
