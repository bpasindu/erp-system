import React, { useEffect, useMemo, useState } from 'react';
import AddCustomerModal from './AddCustomerModal';
import '../products/ProductsPage.css';
import './CustomersPage.css';

const API_BASE = 'http://localhost:8080';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('customers');

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
    const fetchCustomers = async () => {
      if (!token || !businessId) {
        setError('Missing authentication information. Please sign in again.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch(
          `${API_BASE}/api/customers/business/${businessId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || 'Failed to load customers.');
          return;
        }

        setCustomers(data.data || []);
      } catch (e) {
        setError('Network error while loading customers.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token, businessId]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term)
      );
    });
  }, [customers, search]);

  const handleSaveCustomer = async (form) => {
    if (!token || !businessId) {
      setModalError('Missing authentication information. Please sign in again.');
      return;
    }

    if (!form.name) {
      setModalError('Name is required.');
      return;
    }

    setSaving(true);
    setModalError('');

    const payload = {
      businessId,
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
    };

    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to create customer.');
        return;
      }

      setCustomers((prev) => [data.data, ...prev]);
      setShowModal(false);
    } catch (e) {
      setModalError('Network error while saving customer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="products-page customers-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">Customers &amp; Suppliers</h1>
          <p className="page-subtitle">
            Keep track of your customers and supplier contacts.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add
        </button>
      </div>

      <div className="customers-toolbar">
        <div className="customers-tabs">
          <button
            className={`tab-button${
              activeTab === 'customers' ? ' active' : ''
            }`}
            type="button"
          >
            Customers
          </button>
          <button
            className={`tab-button${
              activeTab === 'suppliers' ? ' active' : ''
            }`}
            type="button"
            disabled
          >
            Suppliers
          </button>
        </div>
        <div className="products-search customers-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="customers-grid-wrapper">
        {loading ? (
          <div className="loading-state">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-state">No customers found.</div>
        ) : (
          <div className="customers-grid">
            {filteredCustomers.map((c) => (
              <div key={c.id} className="customer-card">
                <div className="customer-main">
                  <h3>{c.name}</h3>
                  {c.phone && <p className="customer-phone">{c.phone}</p>}
                  {c.email && <p className="customer-email">{c.email}</p>}
                  {c.address && (
                    <p className="customer-address">{c.address}</p>
                  )}
                </div>
                <div className="customer-actions">
                  <button className="icon-button" title="Email">
                    ✉️
                  </button>
                  <button className="icon-button" title="Edit">
                    ✏️
                  </button>
                  <button className="icon-button danger" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddCustomerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCustomer}
        loading={saving}
        error={modalError}
      />
    </div>
  );
};

export default CustomersPage;

