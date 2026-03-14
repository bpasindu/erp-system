import React from 'react';
import '../Page2/Page2.css';
import Sidebar from '../../common/layout/Sidebar';
import TopHeader from '../../common/layout/TopHeader';
import InvoicesPage from '../../features/invoices/InvoicesPage';

const Page5 = () => {
  return (
    <div className="dashboard-layout">
      <div className="sidebar-overlay"></div>
      <Sidebar />
      <main className="main-content">
        <TopHeader />
        <InvoicesPage />
      </main>
    </div>
  );
};

export default Page5;

