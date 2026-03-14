import React, { useEffect, useMemo, useState } from 'react';

const emptyItem = { productId: '', quantity: 1 };

const CreateInvoiceModal = ({
  isOpen,
  onClose,
  onSave,
  loading,
  error,
  customers = [],
  products = [],
}) => {
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([emptyItem]);
  const [taxPercent, setTaxPercent] = useState(10);

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeProducts = Array.isArray(products) ? products : [];

  useEffect(() => {
    if (isOpen) {
      setCustomerId('');
      setItems([emptyItem]);
      setTaxPercent(10);
    }
  }, [isOpen]);

  const productMap = useMemo(() => {
    const map = new Map();
    safeProducts.forEach((p) => map.set(p.id, p));
    return map;
  }, [safeProducts]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const product = productMap.get(Number(item.productId));
      const price = product ? Number(product.price ?? 0) : 0;
      const qty = Number(item.quantity || 0);
      return sum + price * qty;
    }, 0);

    const tax = (subtotal * Number(taxPercent || 0)) / 100;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [items, taxPercent, productMap]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, emptyItem]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      customerId,
      items: items.filter((i) => i.productId && i.quantity > 0),
      taxPercent,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="product-modal" style={{ maxWidth: '760px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
        <div className="product-modal-header">
          <h2>Create Invoice</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="product-modal-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label htmlFor="customer">Customer</label>
            <select
              id="customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
              }}
            >
              <option value="">Select customer</option>
              {safeCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="section-title" style={{ fontSize: '0.9rem' }}>
              Items
            </label>
            <div className="invoice-items-grid">
              {items.map((item, index) => {
                const product = productMap.get(Number(item.productId));
                const unitPrice = product ? Number(product.price ?? 0) : 0;
                const lineTotal = unitPrice * Number(item.quantity || 0);

                return (
                  <div key={index} className="invoice-item-row">
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        handleItemChange(index, 'productId', e.target.value)
                      }
                    >
                      <option value="">Product</option>
                      {safeProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={unitPrice ? `Rs. ${unitPrice.toLocaleString()}` : '0'}
                      readOnly
                    />
                    <input
                      type="text"
                      value={lineTotal ? `Rs. ${lineTotal.toLocaleString()}` : '0'}
                      readOnly
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        className="icon-button danger"
                        onClick={() => handleRemoveItem(index)}
                        title="Remove item"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '0.5rem' }}
              onClick={handleAddItem}
            >
              + Add Item
            </button>
          </div>

          <div className="invoice-footer-row">
            <div className="form-group" style={{ maxWidth: '140px' }}>
              <label htmlFor="taxPercent">Tax %</label>
              <input
                id="taxPercent"
                type="number"
                min="0"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
              />
            </div>
            <div className="invoice-total-display">
              <span>Total</span>
              <strong>{`Rs. ${totals.total.toLocaleString()}`}</strong>
            </div>
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
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;

