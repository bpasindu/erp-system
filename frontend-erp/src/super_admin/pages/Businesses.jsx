import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import BusinessRegisterModal from '../components/BusinessRegisterModal';
import './Businesses.css';

const Businesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [planFilter, setPlanFilter] = useState('All Plans');

  const [showAddModal, setShowAddModal] = useState(false);

  const token = localStorage.getItem('token');

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/businesses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setBusinesses(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch businesses');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [token]);

  useEffect(() => {
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchFromUrl]);

  const handleSuspend = async (business) => {
    if (!window.confirm(`Are you sure you want to suspend ${business.name}?`)) return;
    
    try {
      const newStatus = business.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
      
      const payload = {
        name: business.name,
        currency: business.currency || 'LKR',
        ownerEmail: business.ownerEmail || 'admin@smartbiz.lk',
        status: newStatus,
        plan: business.plan || 'Free',
        defaultPassword: 'DUMMY_PASSWORD' // Required by DTO but ignored for updates
      };

      const res = await fetch(`${API_BASE_URL}/api/businesses/${business.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Update local state
        setBusinesses(prev => prev.map(b => b.id === business.id ? { ...b, status: newStatus } : b));
      } else {
        alert(data.message || 'Failed to update business status');
      }
    } catch (err) {
      alert('Network error while updating status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to completely delete ${name}? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/businesses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setBusinesses(prev => prev.filter(b => b.id !== id));
      } else {
        alert(data.message || 'Failed to delete business');
      }
    } catch (err) {
      alert('Network error while deleting business');
    }
  };

  const formatLastActive = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    
    return date.toISOString().slice(0, 10);
  };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const actualPlan = b.plan || 'Free'; // fallback if null

      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || 
          (statusFilter === 'Active' && (!b.status || b.status !== 'SUSPENDED')) ||
          (statusFilter === 'Suspended' && b.status === 'SUSPENDED');
      const matchesPlan = planFilter === 'All Plans' || actualPlan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [businesses, searchTerm, statusFilter, planFilter]);

  if (loading && businesses.length === 0) return <div className="sa-loading">Loading Businesses...</div>;

  return (
    <div className="sa-businesses">
      <div className="sa-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="sa-page-title">Businesses</h1>
          <p className="sa-page-subtitle">Manage registered businesses</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="sa-btn-outline" 
            onClick={fetchBusinesses}
            title="Refresh Data"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            🔄
          </button>
          <button 
            className="sa-btn-primary" 
            onClick={() => setShowAddModal(true)}
          >
            + Add Business
          </button>
        </div>
      </div>

      {error && <div className="sa-error">{error}</div>}

      <div className="sa-filters-toolbar">
        <div className="sa-search-input">
          <span style={{cursor: 'pointer'}} onClick={() => console.log('Search triggered for:', searchTerm)}>🔍</span>
          <input 
            type="text" 
            placeholder="Search businesses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sa-filter-group">
          <span className="sa-filter-icon">⚲</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>

          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
            <option>All Plans</option>
            <option>Free</option>
            <option>Starter</option>
            <option>Enterprise</option>
          </select>
        </div>
      </div>

      <div className="sa-table-container">
        <table className="sa-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Business Email</th>
              <th>Owner Email</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.map(b => {
              const isActive = (!b.status || b.status !== 'SUSPENDED');
              const createdDate = b.createdAt ? new Date(b.createdAt).toISOString().slice(0, 10) : '—';
              const lastActiveDate = b.lastActiveAt ? new Date(b.lastActiveAt).toISOString().slice(0, 10) : '—';
              
              return (
                <tr key={b.id}>
                  <td>
                    <strong>{b.name}</strong>
                  </td>
                  <td>{b.email || '—'}</td>
                  <td>{b.ownerEmail || '—'}</td>
                  <td>
                    <span className={`sa-plan-badge ${(b.plan || 'Free').toLowerCase()}`}>{b.plan || 'Free'}</span>
                  </td>
                  <td>
                    <span className={`sa-status-badge ${isActive ? 'active' : 'suspended'}`}>
                      {isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>{b.createdAt ? new Date(b.createdAt).toISOString().slice(0, 10) : '—'}</td>
                  <td style={{ color: '#3b82f6', fontWeight: '500' }}>{formatLastActive(b.lastActiveAt)}</td>
                  <td className="sa-actions-cell">
                    <button className="sa-action-link warning" onClick={() => handleSuspend(b)}>
                      {isActive ? 'Suspend' : 'Activate'}
                    </button>
                    <button className="sa-action-link" style={{color: '#dc2626'}} onClick={() => handleDelete(b.id, b.name)}>Delete</button>
                  </td>
                </tr>
              );
            })}
            
            {filteredBusinesses.length === 0 && (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '24px', color: '#64748b'}}>
                  No businesses found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <BusinessRegisterModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={(newBusiness) => {
            setShowAddModal(false);
            setBusinesses(prev => [newBusiness, ...prev]);
            fetchBusinesses(); // fully sync
          }}
        />
      )}
    </div>
  );
};

export default Businesses;
