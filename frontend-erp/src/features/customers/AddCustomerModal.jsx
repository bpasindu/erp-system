import React, { useEffect, useState } from 'react';

const initialForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

const AddCustomerModal = ({
  isOpen,
  onClose,
  onSave,
  loading,
  error,
  activeTab,
  initialValues,
}) => {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setForm({ ...initialForm, ...initialValues });
      } else {
        setForm(initialForm);
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

  const title = initialValues
    ? activeTab === 'suppliers'
      ? 'Edit Supplier'
      : 'Edit Customer'
    : activeTab === 'suppliers'
    ? 'Add Supplier'
    : 'Add Customer';

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
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <input
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
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
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;


