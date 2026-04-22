import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddCustomerModal from './AddCustomerModal';
import '../products/ProductsPage.css';
import './CustomersPage.css';
import { API_BASE_URL as API_BASE } from '../../config';



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
  const [editingItem, setEditingItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedData, setExpandedData] = useState([]);
  const [expandedLoading, setExpandedLoading] = useState(false);

  const navigate = useNavigate();

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
      id: editingItem?.id, // Include ID for updates
      businessId,
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      notes: form.notes || undefined,
    };

    const isCustomersTab = activeTab === 'customers';

    const url = editingItem
      ? (isCustomersTab ? `${API_BASE}/api/customers/${editingItem.id}` : `${API_BASE}/api/suppliers/${editingItem.id}`)
      : (isCustomersTab ? `${API_BASE}/api/customers` : `${API_BASE}/api/suppliers`);
    
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
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
            `Failed to save ${isCustomersTab ? 'customer' : 'supplier'}.`
        );
        return;
      }

      if (editingItem) {
        if (isCustomersTab) {
          setCustomers((prev) => prev.map(c => c.id === data.data.id ? data.data : c));
        } else {
          setSuppliers((prev) => prev.map(s => s.id === data.data.id ? data.data : s));
        }
      } else {
        if (isCustomersTab) {
          setCustomers((prev) => [data.data, ...prev]);
        } else {
          setSuppliers((prev) => [data.data, ...prev]);
        }
      }

      setEditingItem(null);
      setShowModal(false);
    } catch (e) {
      setModalError(
        `Network error while saving ${isCustomersTab ? 'customer' : 'supplier'}.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem({
      id: item.id,
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEmail = (item) => {
    navigate('/assistant', { state: { prefillEntity: item, type: activeTab } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab === 'customers' ? 'customer' : 'supplier'}?`)) return;

    setLoading(true);
    try {
      const url = activeTab === 'customers' 
        ? `${API_BASE}/api/customers/${id}` 
        : `${API_BASE}/api/suppliers/${id}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        if (activeTab === 'customers') {
          setCustomers(prev => prev.filter(c => c.id !== id));
        } else {
          setSuppliers(prev => prev.filter(s => s.id !== id));
        }
      } else {
        setError('Failed to delete item.');
      }
    } catch (e) {
      setError('Network error during deletion.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (item) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(item.id);
    setExpandedLoading(true);
    setExpandedData([]);

    try {
      if (activeTab === 'customers') {
        const res = await fetch(`${API_BASE}/api/invoices/business/${businessId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const customerInvoices = data.data.filter(inv => inv.customerId === item.id);
          setExpandedData(customerInvoices);
        }
      } else {
        const res = await fetch(`${API_BASE}/api/products/supplier/${item.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setExpandedData(data.data);
        }
      }
    } catch (e) {
      console.error('Failed to load details', e);
    } finally {
      setExpandedLoading(false);
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
          onClick={handleCreateNew}
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
              <div key={item.id} className={`customer-card ${expandedId === item.id ? 'expanded' : ''}`}>
                <div className="customer-content-row" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div className="customer-main" onClick={() => toggleExpand(item)} style={{ cursor: 'pointer', flex: 1 }}>
                    <h3>{item.name}</h3>
                    {item.phone && <p className="customer-phone">{item.phone}</p>}
                    {item.email && (
                      <p className="customer-email">{item.email}</p>
                    )}
                    {item.address && (
                      <p className="customer-address">{item.address}</p>
                    )}
                    {item.notes && (
                      <p className="customer-notes" style={{ fontStyle: 'italic', marginTop: '0.5rem', color: '#666' }}>📝 {item.notes}</p>
                    )}
                  </div>
                  <div className="customer-actions" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <button className="icon-button" title="Email" onClick={() => handleEmail(item)}>
                      ✉️
                    </button>
                    <button className="icon-button" title="Edit" onClick={() => handleEdit(item)}>
                      ✏️
                    </button>
                    <button className="icon-button danger" title="Delete" onClick={() => handleDelete(item.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
                {expandedId === item.id && (
                  <div className="customer-expanded-content" style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #4a90e2' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                      {activeTab === 'customers' ? 'Recent Purchase Invoices' : 'Supplied Products'}
                    </h4>
                    {expandedLoading ? (
                      <p style={{ margin: 0, color: '#666' }}>Loading data...</p>
                    ) : expandedData.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#444' }}>
                        {activeTab === 'customers' 
                          ? expandedData.map(inv => (
                              <li key={inv.id} style={{ marginBottom: '4px' }}>
                                <strong>Invoice #{inv.id}</strong> - ${inv.totalAmount.toFixed(2)} 
                                <span style={{ marginLeft: '8px', fontSize: '0.85em', background: inv.status === 'PAID' ? '#d4edda' : '#fff3cd', padding: '2px 6px', borderRadius: '4px' }}>
                                  {inv.status}
                                </span>
                              </li>
                            ))
                          : expandedData.map(prod => (
                              <li key={prod.id} style={{ marginBottom: '4px' }}>
                                <strong>{prod.name}</strong> (SKU: {prod.sku || 'N/A'}) - Stock: {prod.stockQuantity} @ ${prod.cost.toFixed(2)}
                              </li>
                            ))
                        }
                      </ul>
                    ) : (
                      <p style={{ margin: 0, color: '#666', fontStyle: 'italic' }}>
                        No records found.
                      </p>
                    )}
                  </div>
                )}
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
        initialValues={editingItem}
      />
    </div>
  );
};

export default CustomersPage;


