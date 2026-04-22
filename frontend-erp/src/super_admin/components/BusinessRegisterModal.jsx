import React, { useState } from 'react';
import { API_BASE_URL } from '../../config';
import './BusinessRegisterModal.css';

const BusinessRegisterModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [plan, setPlan] = useState('Free');
  const [status, setStatus] = useState('ACTIVE');
  const [defaultPassword, setDefaultPassword] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name,
        currency,
        status,
        plan,
        ownerEmail,
        email,
        defaultPassword
      };

      const res = await fetch(`${API_BASE_URL}/api/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(data.data); // Pass the new business back up
      } else {
        setError(data.message || 'Failed to create business');
      }
    } catch (err) {
      setError('Network error. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-modal-overlay">
      <div className="sa-modal-content">
        <button className="sa-modal-close" onClick={onClose}>×</button>
        <div className="sa-modal-header">
          <h2>Register New Business</h2>
          <p>Create a new business instance and owner account.</p>
        </div>

        {error && <div className="sa-modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="sa-modal-form">
          <div className="sa-form-row">
            <div className="sa-form-group">
              <label>Business Name</label>
              <input 
                type="text" 
                required 
                placeholder="Acme Corp"
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="sa-form-group">
              <label>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="LKR">LKR (Rs.)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="sa-form-row">
            <div className="sa-form-group">
              <label>Owner Email (Login)</label>
              <input 
                type="email" 
                required 
                placeholder="owner@acme.com"
                value={ownerEmail} 
                onChange={e => setOwnerEmail(e.target.value)} 
              />
            </div>
            <div className="sa-form-group">
              <label>Business Email (General)</label>
              <input 
                type="email" 
                placeholder="info@acme.com"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="sa-form-row">
            <div className="sa-form-group">
              <label>Subscription Plan</label>
              <select value={plan} onChange={e => setPlan(e.target.value)}>
                <option value="Free">Free</option>
                <option value="Starter">Starter</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="sa-form-group">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="sa-form-group">
            <label>Default Password (For Owner Login)</label>
            <input 
              type="text" 
              required 
              placeholder="Assign a secure password"
              value={defaultPassword} 
              onChange={e => setDefaultPassword(e.target.value)} 
            />
          </div>

          <div className="sa-modal-actions">
            <button type="button" className="sa-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="sa-btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Business'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessRegisterModal;
