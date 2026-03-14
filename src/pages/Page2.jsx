import React, { useState } from "react";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const kpiData = [
  {
    title: "Today Sales",
    value: "Rs. 5,500",
    icon: "🛒",
    color: "#4f8ef7",
    bg: "#eef3ff",
  },
  {
    title: "Month Sales",
    value: "Rs. 53,020",
    icon: "💵",
    color: "#22c55e",
    bg: "#edfff4",
  },
  {
    title: "Profit",
    value: "Rs. -21,180",
    icon: "📈",
    color: "#f59e0b",
    bg: "#fffbea",
  },
  {
    title: "Low Stock Items",
    value: "5",
    icon: "⚠️",
    color: "#f97316",
    bg: "#fff7ed",
  },
  {
    title: "Total Products",
    value: "12",
    icon: "📦",
    color: "#6366f1",
    bg: "#f0f0ff",
  },
  {
    title: "Out of Stock",
    value: "2",
    icon: "❌",
    color: "#ef4444",
    bg: "#fff0f0",
  },
];

const recentInvoices = [
  {
    id: "INV-001",
    customer: "Kamal Perera",
    date: "2026-02-14",
    amount: "Rs. 5,500",
    status: "paid",
  },
  {
    id: "INV-002",
    customer: "Nishani Fernando",
    date: "2026-02-13",
    amount: "Rs. 18,287",
    status: "unpaid",
  },
  {
    id: "INV-003",
    customer: "Arun Wickramasinghe",
    date: "2026-02-12",
    amount: "Rs. 10,780",
    status: "paid",
  },
  {
    id: "INV-004",
    customer: "Sanduni Silva",
    date: "2026-02-11",
    amount: "Rs. 15,444",
    status: "unpaid",
  },
  {
    id: "INV-005",
    customer: "Dilan Rajapaksa",
    date: "2026-02-10",
    amount: "Rs. 7,940",
    status: "paid",
  },
];

const lowStockProducts = [
  { name: "Rice Bag 5kg", qty: 3 },
  { name: "Coconut Oil 1L", qty: 2 },
  { name: "Sugar 1kg", qty: 4 },
  { name: "Dhal 500g", qty: 1 },
  { name: "Milk Powder 400g", qty: 2 },
];

const salesData = [
  { day: "Mon", sales: 9000 },
  { day: "Tue", sales: 18000 },
  { day: "Wed", sales: 7500 },
  { day: "Thu", sales: 21000 },
  { day: "Fri", sales: 14000 },
  { day: "Sat", sales: 26000 },
  { day: "Sun", sales: 8000 },
];

const navItems = [
  { label: "Dashboard", icon: "⊞", active: true },
  { label: "Products", icon: "📦", active: false },
  { label: "Customers", icon: "👤", active: false },
  { label: "Invoices", icon: "📄", active: false },
  { label: "Ledger", icon: "📊", active: false },
  { label: "Reports", icon: "📈", active: false },
  { label: "AI Assistant", icon: "🤖", active: false },
  { label: "Settings", icon: "⚙️", active: false },
];

// ─── Sub Components ───────────────────────────────────────────────────────────

// KPI Card
const DashboardCard = ({ title, value, icon, color, bg }) => (
  <div style={styles.card}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={styles.cardTitle}>{title}</p>
        <p style={{ ...styles.cardValue, color }}>{value}</p>
      </div>
      <div style={{ ...styles.cardIcon, background: bg, color }}>{icon}</div>
    </div>
  </div>
);

// Sales Bar Chart
const SalesChart = ({ data }) => {
  const max = Math.max(...data.map((d) => d.sales));
  return (
    <div style={styles.chartCard}>
      <h3 style={styles.sectionTitle}>Sales Last 7 Days</h3>
      <div style={styles.chartContainer}>
        {data.map((item, i) => (
          <div key={i} style={styles.barWrapper}>
            <div style={styles.barLabelTop}>
              {item.sales >= 20000 ? `${(item.sales / 1000).toFixed(0)}k` : ""}
            </div>
            <div style={styles.barOuter}>
              <div
                style={{
                  ...styles.bar,
                  height: `${(item.sales / max) * 180}px`,
                }}
              />
            </div>
            <span style={styles.barLabel}>{item.day}</span>
          </div>
        ))}
      </div>
      <div style={styles.yAxisLabels}>
        {["26k", "20k", "13k", "7k", "0k"].map((l) => (
          <span key={l} style={styles.yLabel}>{l}</span>
        ))}
      </div>
    </div>
  );
};

// Recent Invoices Table
const OrdersTable = ({ invoices }) => (
  <div style={styles.tableCard}>
    <div style={styles.tableHeader}>
      <h3 style={styles.sectionTitle}>Recent Invoices</h3>
      <button style={styles.viewAllBtn}>View all</button>
    </div>
    <table style={styles.table}>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id} style={styles.tableRow}>
            <td style={styles.td}>
              <span style={styles.invId}>{inv.id}</span>
              <span style={styles.invName}> — {inv.customer}</span>
              <br />
              <span style={styles.invDate}>{inv.date}</span>
            </td>
            <td style={{ ...styles.td, textAlign: "right" }}>
              <span style={styles.invAmount}>{inv.amount}</span>
              <br />
              <span
                style={{
                  ...styles.badge,
                  background: inv.status === "paid" ? "#4f8ef7" : "#ef4444",
                }}
              >
                {inv.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Low Stock List
const LowStockList = ({ products }) => (
  <div style={styles.lowStockCard}>
    <h3 style={styles.sectionTitle}>Low Stock Products</h3>
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {products.map((p, i) => (
        <li key={i} style={styles.lowStockItem}>
          <span style={styles.lowStockName}>📦 {p.name}</span>
          <span
            style={{
              ...styles.lowStockQty,
              color: p.qty <= 2 ? "#ef4444" : "#f97316",
            }}
          >
            {p.qty} left
          </span>
        </li>
      ))}
    </ul>
  </div>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = () => (
  <div style={styles.sidebar}>
    <div style={styles.logoArea}>
      <span style={styles.logoText}>SmartBiz</span>
    </div>
    <nav style={styles.nav}>
      {navItems.map((item) => (
        <div
          key={item.label}
          style={{
            ...styles.navItem,
            ...(item.active ? styles.navItemActive : {}),
          }}
        >
          <span style={styles.navIcon}>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </nav>
    <div style={styles.logout}>
      <span>🚪</span>
      <span style={{ marginLeft: 8 }}>Logout</span>
    </div>
  </div>
);

// ─── Top Header ───────────────────────────────────────────────────────────────
const TopHeader = () => {
  const [search, setSearch] = useState("");
  return (
    <div style={styles.topHeader}>
      <div style={styles.headerLeft}>
        <button style={styles.menuBtn}>☰</button>
      </div>
      <div style={styles.searchBar}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={styles.headerRight}>
        <div style={styles.notifWrapper}>
          <span style={styles.notifIcon}>🔔</span>
          <span style={styles.notifDot} />
        </div>
        <div style={styles.avatar}>SB</div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Page2 = () => {
  return (
    <div style={styles.appContainer}>
      <Sidebar />
      <div style={styles.mainArea}>
        <TopHeader />
        <div style={styles.content}>
          {/* Page Title + Action Buttons */}
          <div style={styles.pageTitleRow}>
            <h2 style={styles.pageTitle}>Dashboard</h2>
            <div style={styles.actionBtns}>
              <button style={styles.primaryBtn}>+ Create Invoice</button>
              <button style={styles.secondaryBtn}>📦 Add Product</button>
              <button style={styles.secondaryBtn}>🤖 Ask AI</button>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={styles.kpiGrid}>
            {kpiData.map((kpi) => (
              <DashboardCard key={kpi.title} {...kpi} />
            ))}
          </div>

          {/* Bottom Section */}
          <div style={styles.bottomSection}>
            <SalesChart data={salesData} />
            <div style={styles.rightSection}>
              <OrdersTable invoices={recentInvoices} />
              <LowStockList products={lowStockProducts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  appContainer: {
    display: "flex",
    minHeight: "100vh",
    background: "#f5f6fa",
    fontFamily: "'Segoe UI', sans-serif",
  },
  // Sidebar
  sidebar: {
    width: 230,
    minHeight: "100vh",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
    position: "sticky",
    top: 0,
  },
  logoArea: {
    padding: "20px 24px 10px",
    borderBottom: "1px solid #f0f0f0",
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: "#4f8ef7",
    letterSpacing: 1,
  },
  nav: { flex: 1, padding: "12px 0" },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 24px",
    cursor: "pointer",
    color: "#555",
    fontSize: 14,
    borderRadius: 8,
    margin: "2px 10px",
    transition: "background 0.2s",
  },
  navItemActive: {
    background: "#4f8ef7",
    color: "#fff",
    fontWeight: 600,
  },
  navIcon: { fontSize: 16 },
  logout: {
    display: "flex",
    alignItems: "center",
    padding: "16px 24px",
    cursor: "pointer",
    color: "#888",
    fontSize: 14,
    borderTop: "1px solid #f0f0f0",
  },
  // Header
  topHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    padding: "12px 28px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerLeft: { display: "flex", alignItems: "center" },
  menuBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    color: "#555",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    background: "#f5f6fa",
    borderRadius: 8,
    padding: "6px 14px",
    width: 340,
    gap: 8,
  },
  searchIcon: { fontSize: 15, color: "#aaa" },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 14,
    color: "#333",
    width: "100%",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  notifWrapper: { position: "relative", cursor: "pointer" },
  notifIcon: { fontSize: 20 },
  notifDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    background: "#ef4444",
    borderRadius: "50%",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#4f8ef7",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  // Content
  mainArea: { flex: 1, display: "flex", flexDirection: "column" },
  content: { padding: "24px 28px", flex: 1 },
  pageTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: { fontSize: 26, fontWeight: 700, color: "#1a202c", margin: 0 },
  actionBtns: { display: "flex", gap: 10 },
  primaryBtn: {
    background: "#4f8ef7",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  secondaryBtn: {
    background: "#fff",
    color: "#333",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "9px 16px",
    fontWeight: 500,
    fontSize: 14,
    cursor: "pointer",
  },
  // KPI Grid
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: "18px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  cardTitle: { fontSize: 13, color: "#888", margin: "0 0 6px", fontWeight: 500 },
  cardValue: { fontSize: 22, fontWeight: 700, margin: 0 },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  // Bottom Section
  bottomSection: {
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: 20,
    alignItems: "start",
  },
  rightSection: { display: "flex", flexDirection: "column", gap: 20 },
  // Chart
  chartCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "22px 24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    position: "relative",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1a202c",
    margin: "0 0 18px",
  },
  chartContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: 16,
    height: 200,
    paddingLeft: 40,
  },
  barWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  barLabelTop: { fontSize: 10, color: "#aaa", marginBottom: 2, height: 14 },
  barOuter: {
    display: "flex",
    alignItems: "flex-end",
    height: 180,
    width: "100%",
    justifyContent: "center",
  },
  bar: {
    background: "#4f8ef7",
    width: "60%",
    borderRadius: "4px 4px 0 0",
    transition: "height 0.3s",
  },
  barLabel: { fontSize: 12, color: "#888", marginTop: 6 },
  yAxisLabels: {
    position: "absolute",
    left: 10,
    top: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: 180,
  },
  yLabel: { fontSize: 11, color: "#aaa" },
  // Table
  tableCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "18px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  viewAllBtn: {
    background: "none",
    border: "none",
    color: "#4f8ef7",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableRow: { borderBottom: "1px solid #f5f6fa" },
  td: { padding: "10px 4px", verticalAlign: "middle" },
  invId: { fontWeight: 700, color: "#333", fontSize: 13 },
  invName: { color: "#333", fontSize: 13 },
  invDate: { fontSize: 11, color: "#aaa" },
  invAmount: { fontWeight: 600, color: "#333", fontSize: 13 },
  badge: {
    display: "inline-block",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 20,
    padding: "2px 10px",
    marginTop: 4,
  },
  // Low Stock
  lowStockCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "18px 20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  lowStockItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f5f6fa",
    fontSize: 13,
  },
  lowStockName: { color: "#444" },
  lowStockQty: { fontWeight: 700, fontSize: 13 },
};

export default Page2;