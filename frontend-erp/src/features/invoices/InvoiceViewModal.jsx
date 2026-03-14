import React from 'react';
import './InvoiceViewModal.css';

const InvoiceViewModal = ({ isOpen, onClose, invoice, customer, products, businessName = "SmartBiz" }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay print-modal-overlay">
      <div className="product-modal invoice-view-modal">
        <div className="product-modal-header no-print">
          <h2>Invoice {invoice.invoiceNumber}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="invoice-print-container" id="printable-invoice">
          <div className="invoice-header">
            <div className="business-info">
              <h2>{businessName}</h2>
              <p>Your Business Address</p>
            </div>
            <div className="invoice-meta">
              <strong>{invoice.invoiceNumber}</strong>
              <p>{invoice.createdAt ? String(invoice.createdAt).slice(0, 10) : ''}</p>
            </div>
          </div>

          <div className="invoice-customer">
            <small>Bill to</small>
            <h3>{customer?.name || 'Unknown Customer'}</h3>
          </div>

          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => {
                  const pName = products?.find(p => p.id === item.productId)?.name || item.description || `Item ${idx + 1}`;
                  return (
                    <tr key={item.id || idx}>
                      <td>{pName}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {Number(item.unitPrice).toLocaleString()}</td>
                      <td>Rs. {Number(item.totalPrice).toLocaleString()}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="empty-items">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="invoice-footer">
            <div className="invoice-status">
              <span className={`status-pill ${invoice.status?.toLowerCase() === 'paid' ? 'paid' : 'unpaid'}`}>
                {invoice.status?.toLowerCase() || 'unpaid'}
              </span>
            </div>
            <div className="invoice-total">
              Rs. {Number(invoice.totalAmount ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="modal-actions no-print">
          <button type="button" className="btn btn-secondary" onClick={handlePrint}>
            <span className="icon">⬇️</span> PDF
          </button>
          <button type="button" className="btn btn-secondary">
            <span className="icon">🔗</span> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewModal;
