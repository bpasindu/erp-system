import React from 'react';
import '../Page2/Page2.css';
import Sidebar from '../../common/layout/Sidebar';
import TopHeader from '../../common/layout/TopHeader';
import LedgerPage from '../../features/ledger/LedgerPage';

const Page6 = () => {
  return (
    <div className="dashboard-layout">
      <div className="sidebar-overlay"></div>
      <Sidebar />
      <main className="main-content">
        <TopHeader />
        <LedgerPage />
      </main>
    </div>
  );
};

export default Page6;

