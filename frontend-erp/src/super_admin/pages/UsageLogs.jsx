import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../config';
import './UsageLogs.css';

const UsageLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  const token = localStorage.getItem('token');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_BASE_URL}/api/admin/usage-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Map the backend data to the frontend structure
        const mappedLogs = (data.data || []).map(log => ({
          id: log.id,
          timestamp: new Date(log.createdAt).toLocaleString(),
          business: log.businessName,
          user: log.userName,
          action: log.action,
          module: log.module || 'System',
          ip: log.ip || '—',
          result: log.result || 'Success'
        }));
        setLogs(mappedLogs);
      } else {
        setError(data.message || 'Failed to fetch usage logs');
      }
    } catch (err) {
      setError('Network error while fetching logs');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLogs();
  }, [token]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = 
        (l.business || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (l.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.action || '').toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesModule = moduleFilter === 'All' || l.module === moduleFilter;

      return matchesSearch && matchesModule;
    });
  }, [logs, searchTerm, moduleFilter]);

  if (loading && logs.length === 0) return <div className="sa-loading">Loading Logs...</div>;

  return (
    <div className="sa-usage-logs">
      <div className="sa-page-header">
        <h1 className="sa-page-title">Usage Logs</h1>
        <p className="sa-page-subtitle">Audit and system activity logs</p>
      </div>

      <div className="sa-filters-toolbar">
        <div className="sa-search-input">
          <span style={{cursor: 'pointer'}} onClick={() => console.log('Search triggered for:', searchTerm)}>🔍</span>
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sa-filter-group">
          <span className="sa-filter-icon">⚲</span>
          <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
            <option>All</option>
            <option>Billing</option>
            <option>Reports</option>
            <option>CRM</option>
            <option>Auth</option>
            <option>Inventory</option>
          </select>
        </div>
      </div>

      <div className="sa-table-container">
        <table className="sa-table sa-logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Business</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>IP</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(l => (
              <tr key={l.id}>
                <td className="sa-log-time">{l.timestamp}</td>
                <td><strong>{l.business}</strong></td>
                <td>{l.user}</td>
                <td>{l.action}</td>
                <td>{l.module}</td>
                <td className="sa-log-ip">{l.ip}</td>
                <td>
                  <span className={`sa-result-badge ${l.result.toLowerCase()}`}>
                    {l.result}
                  </span>
                </td>
              </tr>
            ))}
            
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '24px', color: '#64748b'}}>
                  No logs found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsageLogs;
