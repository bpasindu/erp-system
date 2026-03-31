import React, { useEffect, useMemo, useState } from 'react';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceViewModal from './InvoiceViewModal';
import '../products/ProductsPage.css';
import './InvoicesPage.css';
import { API_BASE_URL as API_BASE } from '../../config';



const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [invRes, custRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/api/invoices/business/${businessId}`, { headers }),
          fetch(`${API_BASE}/api/customers/business/${businessId}`, { headers }),
          fetch(`${API_BASE}/api/products/business/${businessId}`, { headers }),
        ]);

        const [invData, custData, prodData] = await Promise.all([
          invRes.json(),
          custRes.json(),
          prodRes.json(),
        ]);

        if (!invRes.ok || !invData.success) {
          throw new Error(invData.message || 'Failed to load invoices.');
        }
        if (!custRes.ok || !custData.success) {
          throw new Error(custData.message || 'Failed to load customers.');
        }
        if (!prodRes.ok || !prodData.success) {
          throw new Error(prodData.message || 'Failed to load products.');
        }

        setInvoices(invData.data || []);
        setCustomers(custData.data || []);
        setProducts(prodData.data || []);
      } catch (e) {
        setError(e.message || 'Failed to load invoice data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, businessId]);

  const customerNameById = useMemo(() => {
    const map = new Map();
    customers.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  const statusOptions = useMemo(() => {
    const set = new Set();
    invoices.forEach((inv) => {
      if (inv.status) set.add(inv.status);
    });
    return Array.from(set);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        inv.invoiceNumber?.toLowerCase().includes(term) ||
        customerNameById
          .get(inv.customerId)
          ?.toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === 'all' ||
        (inv.status && inv.status.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter, customerNameById]);

  const handleCreateInvoice = async ({ customerId, items, taxPercent }) => {
    if (!token || !businessId) {
      setModalError('Missing authentication information. Please sign in again.');
      return;
    }

    if (!customerId) {
      setModalError('Customer is required.');
      return;
    }

    if (!items.length) {
      setModalError('At least one item is required.');
      return;
    }

    setSaving(true);
    setModalError('');

    const payload = {
      businessId,
      customerId: Number(customerId),
      items: items.map((it) => ({
        productId: Number(it.productId),
        quantity: Number(it.quantity),
        description:
          products.find((p) => p.id === Number(it.productId))?.name || '',
      })),
    };

    try {
      const res = await fetch(`${API_BASE}/api/invoices`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to create invoice.');
        return;
      }

      setInvoices((prev) => [data.data, ...prev]);
      setShowModal(false);
    } catch (e) {
      setModalError('Network error while creating invoice.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    try {
      return new Date(value).toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  const handleOpenModal = () => {
    if (!customers.length || !products.length) {
      setError('You need at least one customer and one product before creating invoices.');
      return;
    }

    setModalError('');
    setShowModal(true);
  };

  const handleToggleStatus = async (inv) => {
    if (!token) return;
    const newStatus = inv.status?.toLowerCase() === 'paid' ? 'unpaid' : 'paid';
    if (!window.confirm(`Mark invoice ${inv.invoiceNumber} as ${newStatus}?`)) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/invoices/${inv.id}/status?status=${newStatus.toUpperCase()}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update status');
      
      setInvoices(prev => prev.map(i => i.id === inv.id ? data.data : i));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (inv) => {
    if (!token) return;
    if (!window.confirm(`Delete invoice ${inv.invoiceNumber}?`)) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/invoices/${inv.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete invoice');
      
      setInvoices(prev => prev.filter(i => i.id !== inv.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="products-page invoices-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">Sales &amp; Invoices</h1>
          <p className="page-subtitle">
            Track issued invoices and their payment status.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenModal}
        >
          + Create Invoice
        </button>
      </div>

      <div className="products-toolbar invoices-toolbar">
        <div className="products-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="products-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="products-table-wrapper">
        {loading ? (
          <div className="loading-state">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="empty-state">No invoices found.</div>
        ) : (
          <table className="products-table invoices-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="cell-name">{inv.invoiceNumber}</td>
                  <td>{customerNameById.get(inv.customerId) || '—'}</td>
                  <td>{formatDate(inv.createdAt)}</td>
                  <td>{`Rs. ${Number(inv.totalAmount ?? 0).toLocaleString()}`}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        inv.status && inv.status.toLowerCase() === 'paid'
                          ? 'paid'
                          : 'unpaid'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="cell-actions">
                    <button className="icon-button" title="View" onClick={() => setViewInvoice(inv)}>
                      👁️
                    </button>
                    <button className="icon-button" title="Mark paid" onClick={() => handleToggleStatus(inv)}>
                      ✔️
                    </button>
                    <button className="icon-button" title="Download" onClick={() => setViewInvoice(inv)}>
                      ⬇️
                    </button>
                    <button className="icon-button danger" title="Delete" onClick={() => handleDeleteInvoice(inv)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateInvoiceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleCreateInvoice}
        loading={saving}
        error={modalError}
        customers={customers ?? []}
        products={products ?? []}
      />
      
      <InvoiceViewModal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        invoice={viewInvoice}
        customer={viewInvoice ? customers.find(c => c.id === viewInvoice.customerId) : null}
        products={products}
      />
    </div>
  );
};

export default InvoicesPage;

