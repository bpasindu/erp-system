import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AddProductModal from './AddProductModal';
import AdjustStockModal from './AdjustStockModal';
import './ProductsPage.css';
import { API_BASE_URL as API_BASE } from '../../config';



const normalizeProducts = (items) =>
  (Array.isArray(items) ? items : []).map((p) => {
    let meta = {};
    let parsedDescription = '';

    if (typeof p.description === 'string' && p.description.trim()) {
      try {
        meta = JSON.parse(p.description);
      } catch {
        parsedDescription = p.description;
      }
    }

    return {
      ...p,
      ...meta,
      descriptionText: parsedDescription,
      stockQty: Number(
        p.stockQuantity ??
          meta.stockQty ??
          meta.stockQuantity ??
          0
      ),
      reorderLevel: Number(meta.reorderLevel ?? 0),
      category: meta.category ?? '',
      supplier: meta.supplier ?? '',
    };
  });

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockModalProduct, setStockModalProduct] = useState(null);
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

  const loadProducts = useCallback(async () => {
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

      const normalized = normalizeProducts(data.data || []);
      setProducts(normalized);

      // Load Suppliers
      const supRes = await fetch(`${API_BASE}/api/suppliers/business/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const supData = await supRes.json();
      if (supData.success) {
        setSuppliers(supData.data || []);
      }

    } catch (e) {
      setError('Network error while loading products.');
    } finally {
      setLoading(false);
    }
  }, [token, businessId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category && String(p.category).trim()) {
        set.add(String(p.category).trim());
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
        Number(p.stockQty ?? 0) < 5;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, search, selectedCategory, lowStockOnly]);

  const handleSaveProduct = async (form, productToEdit = editingProduct) => {
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
      stockQuantity: Number(form.stockQty ?? 0),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      description: JSON.stringify({
        category: form.category || '',
        reorderLevel: Number(form.reorderLevel ?? 0),
      }),
    };

    const url = productToEdit
      ? `${API_BASE}/api/products/${productToEdit.id}`
      : `${API_BASE}/api/products`;
    const method = productToEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalError(data.message || (productToEdit ? 'Failed to update product.' : 'Failed to create product.'));
        return;
      }

      await loadProducts();
      setEditingProduct(null);
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
    if (qty > 0 && qty < 5) {
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
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
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
                        <span>{Number(p.stockQty ?? 0)}</span>
                        {stockStatus && (
                          <span className={`stock-badge ${stockStatus.className}`}>
                            {stockStatus.label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="cell-actions">
                      <button
                        className="icon-button"
                        title="Adjust stock"
                        onClick={() => setStockModalProduct(p)}
                      >
                        ⚖️
                      </button>
                      <button
                        className="icon-button"
                        title="Edit"
                        onClick={() => {
                          setEditingProduct(p);
                          setShowModal(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-button danger"
                        title="Delete"
                        onClick={async () => {
                          if (!window.confirm('Delete this product?')) return;
                          try {
                            const res = await fetch(`${API_BASE}/api/products/${p.id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            const data = await res.json().catch(() => ({}));
                            if (!res.ok || (data && data.success === false)) {
                              alert(data.message || 'Failed to delete product.');
                              return;
                            }
                            await loadProducts();
                          } catch {
                            alert('Network error while deleting product.');
                          }
                        }}
                      >
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
        initialValues={
          editingProduct
            ? {
                name: editingProduct.name || '',
                sku: editingProduct.sku || '',
                category: editingProduct.category || '',
                supplierId: editingProduct.supplierId || '',
                buyingPrice: editingProduct.cost ?? '',
                sellingPrice: editingProduct.price ?? '',
                stockQty: editingProduct.stockQty ?? '',
                reorderLevel: editingProduct.reorderLevel ?? '',
              }
            : null
        }
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        suppliers={suppliers}
      />

      <AdjustStockModal
        isOpen={!!stockModalProduct}
        onClose={() => setStockModalProduct(null)}
        product={stockModalProduct}
        loading={saving}
        error={modalError}
        onApply={async ({ delta }) => {
          if (!stockModalProduct) return;
          const updatedQty =
            Number(stockModalProduct.stockQty ?? 0) + Number(delta);
          const form = {
            name: stockModalProduct.name,
            sku: stockModalProduct.sku,
            category: stockModalProduct.category,
            supplier: stockModalProduct.supplier,
            buyingPrice: stockModalProduct.cost,
            sellingPrice: stockModalProduct.price,
            stockQty: updatedQty,
            reorderLevel: stockModalProduct.reorderLevel,
          };
          setEditingProduct(stockModalProduct);
          await handleSaveProduct(form, stockModalProduct);
          setStockModalProduct(null);
        }}
      />
    </div>
  );
};

export default ProductsPage;

