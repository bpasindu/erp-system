import React, { useState } from 'react';
import '../products/ProductsPage.css';
import './ReportsPage.css';

const TABS = ['sales', 'profit', 'bestSellers', 'balances'];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const renderContent = () => {
    switch (activeTab) {
      case 'sales':
        return (
          <div className="report-card">
            <h3 className="section-title">Weekly Sales</h3>
            <div className="weekly-sales-chart">
              {[
                { day: 'Mon', value: 13000 },
                { day: 'Tue', value: 19000 },
                { day: 'Wed', value: 9000 },
                { day: 'Thu', value: 21000 },
                { day: 'Fri', value: 15000 },
                { day: 'Sat', value: 26000 },
                { day: 'Sun', value: 9000 },
              ].map((entry) => (
                <div key={entry.day} className="weekly-bar-wrapper">
                  <div
                    className="weekly-bar"
                    style={{ height: `${(entry.value / 26000) * 100}%` }}
                  ></div>
                  <span className="weekly-label">{entry.day}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'profit':
        return (
          <div className="profit-layout">
            <div className="report-card">
              <h3 className="section-title">Income vs Expenses</h3>
              <div className="profit-chart">
                <div className="pie-chart">
                  <div className="pie-income"></div>
                  <div className="pie-expense"></div>
                </div>
                <div className="pie-legend">
                  <span className="income-label">
                    Income: Rs. 53,020
                  </span>
                  <span className="expense-label">
                    Expenses: Rs. 74,200
                  </span>
                </div>
              </div>
            </div>
            <div className="report-card profit-summary-card">
              <h3 className="section-title">Summary</h3>
              <div className="profit-summary">
                <div>
                  <span className="summary-label">Total Income</span>
                  <span className="summary-income">Rs. 53,020</span>
                </div>
                <div>
                  <span className="summary-label">Total Expenses</span>
                  <span className="summary-expense">Rs. 74,200</span>
                </div>
                <div>
                  <span className="summary-label">Net Profit</span>
                  <span className="summary-net">Rs. -21,180</span>
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
              {[
                { name: 'Notebook A5', value: 55 },
                { name: 'Paper Clips Box', value: 35 },
                { name: 'Ethernet Cable 3m', value: 22 },
                { name: 'Wireless Mouse', value: 18 },
                { name: 'Whiteboard Marker Set', value: 12 },
              ].map((item) => (
                <div key={item.name} className="best-seller-row">
                  <span className="best-seller-name">{item.name}</span>
                  <div className="best-seller-bar-wrapper">
                    <div
                      className="best-seller-bar"
                      style={{ width: `${(item.value / 55) * 100}%` }}
                    ></div>
                  </div>
                  <span className="best-seller-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'balances':
        return (
          <div className="report-card">
            <h3 className="section-title">Customer Balances</h3>
            <table className="products-table balances-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount Owed</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Kamal Perera', amount: 'Rs. 4,675' },
                  { name: 'Nishani Fernando', amount: 'Rs. 18,287' },
                  { name: 'Sanduni Silva', amount: 'Rs. 15,444' },
                  { name: 'Ruwan Bandara', amount: 'Rs. 3,960' },
                ].map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td className="balance-amount">{row.amount}</td>
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

      <div className="reports-content">{renderContent()}</div>
    </div>
  );
};

export default ReportsPage;

