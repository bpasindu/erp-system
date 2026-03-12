import React from 'react';
import '../Page2/Page2.css';
import Sidebar from '../../common/layout/Sidebar';
import TopHeader from '../../common/layout/TopHeader';
import CustomersPage from '../../features/customers/CustomersPage';

const Page4 = () => {
  return (
    <div className="dashboard-layout">
      <div className="sidebar-overlay"></div>
      <Sidebar />
      <main className="main-content">
        <TopHeader />
        <CustomersPage />
      </main>
    </div>
  );
};

export default Page4;

