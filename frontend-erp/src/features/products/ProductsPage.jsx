import React, { useEffect, useMemo, useState } from 'react';
import AddProductModal from './AddProductModal';
import './ProductsPage.css';

const API_BASE = 'http://localhost:8080';

const normalizeProducts = (items) =>
  items.map((p) => {
    let meta = {};
    try {
      if (p.description) {
        meta = JSON.parse(p.description);
      }
    } catch {
      meta = {};
    }
    return { ...p, ...meta };
  });

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

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
    const fetchProducts = async () => {
      if (!token || !businessId) {
        setError('Missing authentication information. Please sign in again.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res = await fetch(
          `${API_BASE}/api/products/business/${businessId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || 'Failed to load products.');
          return;
        }

        setProducts(normalizeProducts(data.data || []));
      } catch (e) {
        setError('Network error while loading products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token, businessId]);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) {
        set.add(p.category);
      }
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        (p.category && p.category === selectedCategory);

      const matchesLowStock =
        !lowStockOnly ||
        (p.stockQty !== undefined &&
          p.reorderLevel !== undefined &&
          Number(p.stockQty) <= Number(p.reorderLevel));

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, search, selectedCategory, lowStockOnly]);

  const handleSaveProduct = async (form) => {
    if (!token || !businessId) {
      setModalError('Missing authentication information. Please sign in again.');
      return;
    }

    if (!form.name || !form.sellingPrice) {
      setModalError('Name and Selling Price are required.');
      return;
    }

    setSaving(true);
    setModalError('');

    const payload = {
      businessId,
      name: form.name,
      sku: form.sku || undefined,
      price: Number(form.sellingPrice) || 0,
      cost: Number(form.buyingPrice) || 0,
      description: JSON.stringify({
        category: form.category || '',
        supplier: form.supplier || '',
        stockQty: form.stockQty || 0,
        reorderLevel: form.reorderLevel || 0,
      }),
    };

    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.message || 'Failed to create product.');
        return;
      }

      const created = normalizeProducts([data.data])[0];
      setProducts((prev) => [created, ...prev]);
      setShowModal(false);
    } catch (e) {
      setModalError('Network error while saving product.');
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (product) => {
    const qty = Number(product.stockQty ?? 0);
    const reorder = Number(product.reorderLevel ?? 0);

    if (qty === 0) {
      return { label: 'Out', className: 'badge-out' };
    }
    if (qty <= reorder && qty > 0) {
      return { label: 'Low', className: 'badge-low' };
    }
    return null;
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">Products &amp; Stock</h1>
          <p className="page-subtitle">
            Manage your inventory, pricing, and stock levels.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Add Product
        </button>
      </div>

      <div className="products-toolbar">
        <div className="products-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="products-filters">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <label className="toggle-wrapper">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            <span>Low stock only</span>
          </label>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="products-table-wrapper">
        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">No products found.</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const stockStatus = getStockStatus(p);
                return (
                  <tr key={p.id}>
                    <td className="cell-name">{p.name}</td>
                    <td>{p.sku || '—'}</td>
                    <td>{p.category || 'Uncategorized'}</td>
                    <td>{`Rs. ${Number(p.price ?? 0).toLocaleString()}`}</td>
                    <td>
                      <div className="stock-cell">
                        <span>{p.stockQty ?? 0}</span>
                        {stockStatus && (
                          <span className={`stock-badge ${stockStatus.className}`}>
                            {stockStatus.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="cell-actions">
                      <button className="icon-button" title="View">
                        🧾
                      </button>
                      <button className="icon-button" title="Edit">
                        ✏️
                      </button>
                      <button className="icon-button danger" title="Delete">
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProduct}
        loading={saving}
        error={modalError}
      />
    </div>
  );
};

export default ProductsPage;

