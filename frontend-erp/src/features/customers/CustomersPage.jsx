import React, { useEffect, useMemo, useState } from 'react';
import AddCustomerModal from './AddCustomerModal';
import '../products/ProductsPage.css';
import './CustomersPage.css';

const API_BASE = 'http://localhost:8080';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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
    const fetchData = async () => {
      if (!token || !businessId) {
        setError('Missing authentication information. Please sign in again.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [customersRes, suppliersRes] = await Promise.all([
          fetch(`${API_BASE}/api/customers/business/${businessId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(`${API_BASE}/api/suppliers/business/${businessId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        const customersData = await customersRes.json();
        const suppliersData = await suppliersRes.json();

        if (!customersRes.ok || !customersData.success) {
          setError(customersData.message || 'Failed to load customers.');
        } else {
          setCustomers(customersData.data || []);
        }

        if (!suppliersRes.ok || !suppliersData.success) {
          setError((prev) =>
            prev
              ? prev
              : suppliersData.message || 'Failed to load suppliers.'
          );
        } else {
          setSuppliers(suppliersData.data || []);
        }
      } catch (e) {
        setError('Network error while loading contacts.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, businessId]);

  const filteredItems = useMemo(() => {
    const list = activeTab === 'customers' ? customers : suppliers;
    return list.filter((item) => {
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.phone?.toLowerCase().includes(term)
      );
    });
  }, [customers, suppliers, search, activeTab]);

  const handleSave = async (form) => {
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

    const basePayload = {
      businessId,
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
    };

    const isCustomersTab = activeTab === 'customers';

    const url = isCustomersTab
      ? `${API_BASE}/api/customers`
      : `${API_BASE}/api/suppliers`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(basePayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(
          data.message ||
            `Failed to create ${isCustomersTab ? 'customer' : 'supplier'}.`
        );
        return;
      }

      if (isCustomersTab) {
        setCustomers((prev) => [data.data, ...prev]);
      } else {
        setSuppliers((prev) => [data.data, ...prev]);
      }

      setShowModal(false);
    } catch (e) {
      setModalError(
        `Network error while saving ${isCustomersTab ? 'customer' : 'supplier'}.`
      );
    } finally {
      setSaving(false);
    }
  };

  const heading =
    activeTab === 'customers'
      ? 'Customers & Suppliers'
      : 'Customers & Suppliers';

  const searchPlaceholder =
    activeTab === 'customers' ? 'Search customers...' : 'Search suppliers...';

  const emptyText =
    activeTab === 'customers'
      ? 'No customers found.'
      : 'No suppliers found.';

  const loadingText =
    activeTab === 'customers'
      ? 'Loading customers...'
      : 'Loading suppliers...';

  return (
    <div className="products-page customers-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">{heading}</h1>
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
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </button>
          <button
            className={`tab-button${
              activeTab === 'suppliers' ? ' active' : ''
            }`}
            type="button"
            onClick={() => setActiveTab('suppliers')}
          >
            Suppliers
          </button>
        </div>
        <div className="products-search customers-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="customers-grid-wrapper">
        {loading ? (
          <div className="loading-state">{loadingText}</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">{emptyText}</div>
        ) : (
          <div className="customers-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="customer-card">
                <div className="customer-main">
                  <h3>{item.name}</h3>
                  {item.phone && <p className="customer-phone">{item.phone}</p>}
                  {item.email && (
                    <p className="customer-email">{item.email}</p>
                  )}
                  {item.address && (
                    <p className="customer-address">{item.address}</p>
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
        onSave={handleSave}
        loading={saving}
        error={modalError}
        activeTab={activeTab}
      />
    </div>
  );
};

export default CustomersPage;


