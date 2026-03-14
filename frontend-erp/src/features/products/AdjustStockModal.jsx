import React, { useEffect, useState } from 'react';

const AdjustStockModal = ({ isOpen, onClose, product, onApply, loading, error }) => {
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDelta('');
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = Number(delta);
    if (!Number.isFinite(value) || value === 0) return;
    onApply({ delta: value, reason });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="product-modal"
        style={{ maxWidth: '360px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="product-modal-header">
          <h2>Adjust Stock — {product.name}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="product-modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quantityDelta">Quantity (+/-)</label>
            <input
              id="quantityDelta"
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              placeholder="+5 or -3"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reason">Reason</label>
            <input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Restock, Damaged..."
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustStockModal;

