import React, { useState, useEffect } from 'react';

const initialFormState = {
  name: '',
  sku: '',
  category: '',
  supplier: '',
  buyingPrice: '',
  sellingPrice: '',
  stockQty: '',
  reorderLevel: '',
};

const AddProductModal = ({
  isOpen,
  onClose,
  onSave,
  loading,
  error,
  initialValues,
  title = 'Add Product',
  suppliers = [],
}) => {
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setForm({
          ...initialFormState,
          ...initialValues,
        });
      } else {
        setForm(initialFormState);
      }
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="product-modal">
        <div className="product-modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="product-modal-form" onSubmit={handleSubmit}>
          <div className="modal-grid">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="sku">SKU</label>
              <input
                id="sku"
                name="sku"
                value={form.sku}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="supplierId">Supplier</label>
              <select
                id="supplierId"
                name="supplierId"
                value={form.supplierId || ''}
                onChange={handleChange}
              >
                <option value="">None</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="buyingPrice">Buying Price</label>
              <input
                id="buyingPrice"
                name="buyingPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.buyingPrice}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="sellingPrice">Selling Price</label>
              <input
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="stockQty">Stock Qty</label>
              <input
                id="stockQty"
                name="stockQty"
                type="number"
                min="0"
                step="1"
                value={form.stockQty}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reorderLevel">Reorder Level</label>
              <input
                id="reorderLevel"
                name="reorderLevel"
                type="number"
                min="0"
                step="1"
                value={form.reorderLevel}
                onChange={handleChange}
              />
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
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;

