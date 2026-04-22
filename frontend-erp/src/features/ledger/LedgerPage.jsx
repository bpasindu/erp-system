import React, { useEffect, useMemo, useState } from 'react';
import AddEntryModal from './AddEntryModal';
import '../products/ProductsPage.css';
import './LedgerPage.css';
import { API_BASE_URL as API_BASE } from '../../config';



const formatDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

const todayString = () => new Date().toISOString().slice(0, 10);

const LedgerPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState(todayString());

  const token = localStorage.getItem('token');
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const businessId = user?.businessId;

  useEffect(() => {
    const fetchAll = async () => {
      if (!token || !businessId) {
        setError('Missing authentication information. Please sign in again.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [txRes, catRes] = await Promise.all([
          fetch(`${API_BASE}/api/finance/transactions/business/${businessId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_BASE}/api/finance/categories/business/${businessId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        const [txData, catData] = await Promise.all([
          txRes.json(),
          catRes.json(),
        ]);

        if (!txRes.ok || !txData.success) {
          throw new Error(txData.message || 'Failed to load transactions.');
        }
        if (!catRes.ok || !catData.success) {
          throw new Error(catData.message || 'Failed to load categories.');
        }

        setTransactions(txData.data || []);
        setCategories(catData.data || []);
      } catch (e) {
        setError(e.message || 'Failed to load ledger data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, businessId]);

  const categoryById = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const enhancedTransactions = useMemo(() => {
    return transactions.map((tx) => {
      let meta = {};
      try {
        if (tx.description && tx.description.trim().startsWith('{')) {
          meta = JSON.parse(tx.description);
        } else if (tx.description) {
          meta = { note: tx.description };
        }
      } catch {
        meta = { note: tx.description };
      }

      const category = categoryById.get(tx.categoryId);
      return {
        ...tx,
        categoryName: category?.name,
        method: meta.method || meta.paymentMethod || 'Cash',
        note: meta.note || '',
        dateOnly: formatDate(tx.transactionDate),
      };
    });
  }, [transactions, categoryById]);

  const filteredForDay = useMemo(() => {
    if (!selectedDate) return enhancedTransactions;
    return enhancedTransactions.filter((tx) => tx.dateOnly === selectedDate);
  }, [enhancedTransactions, selectedDate]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredForDay.forEach((tx) => {
      const amount = Number(tx.amount ?? 0);
      if (tx.type === 'INCOME') {
        income += amount;
      } else if (tx.type === 'EXPENSE') {
        expense += amount;
      }
    });
    return {
      income,
      expense,
      net: income - expense,
    };
  }, [filteredForDay]);

  const handleSaveEntry = async ({ type, date, categoryName, amount, note, method }) => {
    if (!token || !businessId) {
      setModalError('Missing authentication information. Please sign in again.');
      return;
    }

    if (!categoryName || !amount) {
      setModalError('Category and amount are required.');
      return;
    }

    setSaving(true);
    setModalError('');

    try {
      // Find or create category
      let finalCategoryId = null;
      const existingCategory = categories.find(
        (c) => c.name.toLowerCase() === categoryName.trim().toLowerCase()
      );

      if (existingCategory) {
        finalCategoryId = existingCategory.id;
      } else {
        // Create new category
        const catRes = await fetch(`${API_BASE}/api/finance/categories`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessId,
            name: categoryName.trim(),
            type,
          }),
        });
        const catData = await catRes.json();
        if (!catRes.ok || !catData.success) {
          throw new Error(catData.message || 'Failed to create new category.');
        }
        finalCategoryId = catData.data.id;
        setCategories((prev) => [...prev, catData.data]);
      }

      const payload = {
        businessId,
        categoryId: Number(finalCategoryId),
        amount: Number(amount),
        description: JSON.stringify({
          note: note || '',
          method,
          date,
        }),
        type,
      };

      const res = await fetch(`${API_BASE}/api/finance/transactions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to save entry.');
        return;
      }

      setTransactions((prev) => [data.data, ...prev]);
      setShowModal(false);
      setSelectedDate(date);
    } catch (e) {
      setModalError(e.message || 'Network error while saving entry.');
    } finally {
      setSaving(false);
    }
  };

  const formatAmount = (amount, type) => {
    const value = Number(amount ?? 0);
    const formatted = `Rs. ${value.toLocaleString()}`;
    if (type === 'EXPENSE') {
      return <span className="amount-expense">{formatted}</span>;
    }
    return <span className="amount-income">{formatted}</span>;
  };

  return (
    <div className="products-page ledger-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">Daily Ledger</h1>
          <p className="page-subtitle">
            Monitor daily income and expenses across your business.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Entry
        </button>
      </div>

      <div className="ledger-summary-row">
        <div className="ledger-summary-card income">
          <span className="label">Today Income</span>
          <span className="value">{`Rs. ${summary.income.toLocaleString()}`}</span>
        </div>
        <div className="ledger-summary-card expense">
          <span className="label">Today Expense</span>
          <span className="value">{`Rs. ${summary.expense.toLocaleString()}`}</span>
        </div>
        <div className="ledger-summary-card net">
          <span className="label">Net</span>
          <span className="value">{`Rs. ${summary.net.toLocaleString()}`}</span>
        </div>
      </div>

      <div className="ledger-toolbar">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="ledger-date-input"
        />
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="products-table-wrapper ledger-table-wrapper">
        {loading ? (
          <div className="loading-state">Loading ledger...</div>
        ) : filteredForDay.length === 0 ? (
          <div className="empty-state">No entries for this date.</div>
        ) : (
          <table className="products-table ledger-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Note</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForDay.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.dateOnly}</td>
                  <td>
                    <span
                      className={`ledger-type ${
                        tx.type === 'INCOME' ? 'income' : 'expense'
                      }`}
                    >
                      {tx.type === 'INCOME' ? 'Income' : 'Expense'}
                    </span>
                  </td>
                  <td>{tx.categoryName || '—'}</td>
                  <td>{tx.note}</td>
                  <td>{tx.method}</td>
                  <td>{formatAmount(tx.amount, tx.type)}</td>
                  <td className="cell-actions">
                    <button className="icon-button" title="Edit">
                      ✏️
                    </button>
                    <button className="icon-button danger" title="Delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddEntryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveEntry}
        loading={saving}
        error={modalError}
        categories={categories}
      />
    </div>
  );
};

export default LedgerPage;

