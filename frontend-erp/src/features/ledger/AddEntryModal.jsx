import React, { useEffect, useMemo, useState } from 'react';

const todayString = () => new Date().toISOString().slice(0, 10);

const AddEntryModal = ({ isOpen, onClose, onSave, loading, error, categories }) => {
  const [type, setType] = useState('INCOME');
  const [date, setDate] = useState(todayString());
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState('Cash');

  useEffect(() => {
    if (isOpen) {
      setType('INCOME');
      setDate(todayString());
      setCategoryId('');
      setAmount('');
      setNote('');
      setMethod('Cash');
    }
  }, [isOpen]);

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      type,
      date,
      categoryId,
      amount,
      note,
      method,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="product-modal" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="product-modal-header">
          <h2>Add Entry</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="product-modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (Rs.)</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="note">Note</label>
            <input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="method">Payment Method</label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Other">Other</option>
            </select>
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

export default AddEntryModal;

