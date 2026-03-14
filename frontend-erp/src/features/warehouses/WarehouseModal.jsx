import React, { useCallback, useEffect, useState } from 'react';
import './WarehouseModal.css';

const API_BASE = 'http://localhost:8080';

const initialForm = { name: '', location: '' };

const WarehouseModal = ({ isOpen, onClose, businessId, token }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadWarehouses = useCallback(async () => {
    if (!token || !businessId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/warehouses/business/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWarehouses(data.data || []);
      } else {
        setError(data.message || 'Failed to load warehouses.');
      }
    } catch (e) {
      setError('Network error loading warehouses.');
    } finally {
      setLoading(false);
    }
  }, [token, businessId]);

  useEffect(() => {
    if (isOpen && businessId && token) {
      loadWarehouses();
      setForm(initialForm);
      setShowAddForm(false);
      setError('');
    }
  }, [isOpen, businessId, token, loadWarehouses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/warehouses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          name: form.name.trim(),
          location: form.location?.trim() || '',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setForm(initialForm);
        setShowAddForm(false);
        await loadWarehouses();
      } else {
        setError(data.message || 'Failed to create warehouse.');
      }
    } catch (e) {
      setError('Network error saving warehouse.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal warehouse-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-modal-header">
          <h2>Warehouses</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="warehouse-modal-body">
          <div className="warehouse-list-section">
            <div className="warehouse-list-header">
              <span className="warehouse-list-title">Existing warehouses</span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddForm((v) => !v)}
              >
                {showAddForm ? 'Cancel' : '+ Add warehouse'}
              </button>
            </div>
            {error && <div className="modal-error">{error}</div>}
            {loading ? (
              <div className="loading-state">Loading warehouses...</div>
            ) : warehouses.length === 0 && !showAddForm ? (
              <div className="empty-state">No warehouses yet. Add one below.</div>
            ) : (
              <ul className="warehouse-list">
                {warehouses.map((wh) => (
                  <li key={wh.id} className="warehouse-list-item">
                    <div>
                      <strong>{wh.name}</strong>
                      {wh.location && (
                        <span className="warehouse-location"> — {wh.location}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {showAddForm && (
              <form className="warehouse-add-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="wh-name">Name</label>
                  <input
                    id="wh-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Main Store"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="wh-location">Location</label>
                  <input
                    id="wh-location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Colombo"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddForm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save warehouse'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseModal;
