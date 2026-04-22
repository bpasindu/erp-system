import React, { useState, useEffect, useMemo } from 'react';
import '../products/ProductsPage.css';
import './ReportsPage.css';
import { API_BASE_URL as API_BASE } from '../../config';


const TABS = ['sales', 'profit', 'bestSellers', 'balances'];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    const fetchAllData = async () => {
      if (!token || !businessId) {
        setError('Authentication required');
        return;
      }
      setLoading(true);
      try {
        const [invRes, txRes, custRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/api/invoices/business/${businessId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/finance/transactions/business/${businessId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/customers/business/${businessId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/products/business/${businessId}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const [inv, tx, cust, prod] = await Promise.all([invRes.json(), txRes.json(), custRes.json(), prodRes.json()]);

        if (inv.success) setInvoices(inv.data || []);
        if (tx.success) setTransactions(tx.data || []);
        if (cust.success) setCustomers(cust.data || []);
        if (prod.success) setProducts(prod.data || []);

      } catch (err) {
        setError('Failed to fetch report data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [token, businessId]);

  // Derived Data
  const weeklySales = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: d.toISOString().slice(0, 10),
        value: 0
      });
    }
    invoices.forEach(inv => {
      const date = inv.createdAt ? String(inv.createdAt).slice(0, 10) : '';
      const dayObj = days.find(d => d.dateStr === date);
      if (dayObj && inv.status === 'PAID') {
        dayObj.value += Number(inv.totalAmount ?? 0);
      } else if (dayObj) {
         dayObj.value += Number(inv.totalAmount ?? 0);
      }
    });
    const maxVal = Math.max(...days.map(d => d.value), 10);
    return { days, maxVal };
  }, [invoices]);

  const profitStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(tx => {
      const amount = Number(tx.amount ?? 0);
      if (tx.type === 'INCOME') income += amount;
      if (tx.type === 'EXPENSE') expense += amount;
    });
    return { income, expense, net: income - expense };
  }, [transactions]);

  const bestSellersData = useMemo(() => {
    const salesMap = {};
    invoices.forEach(inv => {
      if (inv.items) {
        inv.items.forEach(item => {
          if (!salesMap[item.productId]) salesMap[item.productId] = 0;
          salesMap[item.productId] += Number(item.quantity ?? 0);
        });
      }
    });

    const list = Object.entries(salesMap).map(([pId, qty]) => {
      const p = products.find(prod => String(prod.id) === String(pId));
      return {
        name: p?.name || `Product #${pId}`,
        value: qty
      };
    });

    list.sort((a, b) => b.value - a.value);
    const top5 = list.slice(0, 5);
    const maxVal = Math.max(...top5.map(i => i.value), 10);
    return { top5, maxVal };
  }, [invoices, products]);

  const customerBalances = useMemo(() => {
    const balances = {};
    invoices.forEach(inv => {
      if (inv.status && inv.status.toUpperCase() !== 'PAID') {
        const cId = inv.customerId;
        if (!balances[cId]) balances[cId] = 0;
        balances[cId] += Number(inv.totalAmount ?? 0);
      }
    });

    const list = Object.entries(balances).map(([cId, amt]) => {
      const cust = customers.find(c => String(c.id) === String(cId));
      return {
        name: cust?.name || `Customer #${cId}`,
        amount: amt
      };
    }).filter(row => row.amount > 0);

    return list.sort((a, b) => b.amount - a.amount);
  }, [invoices, customers]);

  const recentWeeklyInvoices = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return invoices
      .filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate >= sevenDaysAgo;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(inv => ({
        id: inv.invoiceNumber || `INV-${inv.id}`,
        customerName: customers.find(c => String(c.id) === String(inv.customerId))?.name || 'Unknown Customer',
        amount: Number(inv.totalAmount || 0).toLocaleString(),
        status: (inv.status || 'UNPAID').toLowerCase(),
        date: new Date(inv.createdAt).toLocaleDateString()
      }));
  }, [invoices, customers]);

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return (
          <div className="report-card">
            <h3 className="section-title">Sales Last 7 Days</h3>
            <div className="weekly-sales-chart">
              {weeklySales.days.map((entry) => (
                <div key={entry.day} className="weekly-bar-wrapper" title={`Rs. ${entry.value.toLocaleString()}`}>
                  <div
                    className="weekly-bar"
                    style={{ height: `${Math.max((entry.value / weeklySales.maxVal) * 100, 2)}%` }}
                  ></div>
                  <span className="weekly-label">{entry.day}</span>
                </div>
              ))}
            </div>

            <div style={{marginTop: '2.5rem'}}>
              <h3 className="section-title">Detailed Weekly Sales</h3>
              <div className="orders-list">
                {recentWeeklyInvoices.length === 0 ? (
                  <p style={{color: '#6b7280', fontSize: '0.9rem', padding: '1.5rem 0'}}>
                    No sales recorded in the last 7 days.
                  </p>
                ) : (
                  recentWeeklyInvoices.map((inv) => (
                    <div className="order-item" key={inv.id}>
                      <div className="order-info">
                        <span className="order-id">{inv.id}</span>
                        <span className="recent-order-name">— {inv.customerName}</span>
                        <div className="order-date">{inv.date}</div>
                      </div>
                      <div className="order-amount-status">
                         <span className="order-amount">Rs. {inv.amount}</span>
                         <span className={`status-badge ${inv.status}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      case 'profit':
        const total = profitStats.income + profitStats.expense || 1;
        const incPct = (profitStats.income / total) * 100;
        const expPct = (profitStats.expense / total) * 100;

        return (
          <div className="profit-layout">
            <div className="report-card">
              <h3 className="section-title">Income vs Expenses</h3>
              <div className="profit-chart">
                <div className="pie-chart" style={
                  profitStats.income === 0 && profitStats.expense === 0 
                  ? { background: '#e5e7eb' } 
                  : { background: `conic-gradient(#10b981 0% ${incPct}%, #ef4444 ${incPct}% 100%)`}
                }>
                </div>
                <div className="pie-legend">
                  <span className="income-label">
                    Income: Rs. {profitStats.income.toLocaleString()}
                  </span>
                  <span className="expense-label">
                    Expenses: Rs. {profitStats.expense.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="report-card profit-summary-card">
              <h3 className="section-title">Summary</h3>
              <div className="profit-summary">
                <div>
                  <span className="summary-label">Total Income</span>
                  <span className="summary-income">Rs. {profitStats.income.toLocaleString()}</span>
                </div>
                <div>
                  <span className="summary-label">Total Expenses</span>
                  <span className="summary-expense">Rs. {profitStats.expense.toLocaleString()}</span>
                </div>
                <div>
                  <span className="summary-label">Net Profit</span>
                  <span className="summary-net" style={{ color: profitStats.net < 0 ? '#ef4444' : '#10b981' }}>
                    Rs. {profitStats.net.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'bestSellers':
        return (
          <div className="report-card">
            <h3 className="section-title">Top 5 Best-Selling Products</h3>
            <div className="best-sellers-list">
              {bestSellersData.top5.length === 0 ? <p style={{color:'#6b7280'}}>No distinct items sold yet.</p> : bestSellersData.top5.map((item) => (
                <div key={item.name} className="best-seller-row">
                  <span className="best-seller-name">{item.name}</span>
                  <div className="best-seller-bar-wrapper">
                    <div
                      className="best-seller-bar"
                      style={{ width: `${Math.max((item.value / bestSellersData.maxVal) * 100, 2)}%` }}
                    ></div>
                  </div>
                  <span className="best-seller-value">{item.value} sold</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'balances':
        return (
          <div className="report-card">
            <h3 className="section-title">Customer Balances (Unpaid)</h3>
            <table className="products-table balances-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount Owed</th>
                </tr>
              </thead>
              <tbody>
                {customerBalances.length === 0 ? (
                  <tr><td colSpan="2" style={{textAlign:'center', color:'#6b7280', padding: '1rem'}}>All balances are settled.</td></tr>
                ) : customerBalances.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td className="balance-amount">Rs. {row.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="products-page reports-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">Reports &amp; Summaries</h1>
          <p className="page-subtitle">
            Visualize sales performance, profitability, and key business metrics.
          </p>
        </div>
        <button className="btn btn-secondary export-btn">
          ⬇️ Export
        </button>
      </div>

      <div className="reports-tabs">
        <button
          type="button"
          className={`reports-tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          📊 Sales
        </button>
        <button
          type="button"
          className={`reports-tab ${activeTab === 'profit' ? 'active' : ''}`}
          onClick={() => setActiveTab('profit')}
        >
          📈 Profit
        </button>
        <button
          type="button"
          className={`reports-tab ${activeTab === 'bestSellers' ? 'active' : ''}`}
          onClick={() => setActiveTab('bestSellers')}
        >
          ⭐ Best Sellers
        </button>
        <button
          type="button"
          className={`reports-tab ${activeTab === 'balances' ? 'active' : ''}`}
          onClick={() => setActiveTab('balances')}
        >
          👥 Balances
        </button>
      </div>

      <div className="reports-content">
        {loading ? <div style={{ color: '#6b7280' }}>Loading report metrics...</div> : renderContent()}
      </div>
    </div>
  );
};

export default ReportsPage;

