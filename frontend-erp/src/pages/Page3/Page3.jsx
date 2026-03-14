import React from 'react';
import '../Page2/Page2.css';
import Sidebar from '../../common/layout/Sidebar';
import TopHeader from '../../common/layout/TopHeader';
import ProductsPage from '../../features/products/ProductsPage';

const Page3 = () => {
  return (
    <div className="dashboard-layout">
      <div className="sidebar-overlay"></div>
      <Sidebar />
      <main className="main-content">
        <TopHeader />
        <ProductsPage />
      </main>
    </div>
  );
};

export default Page3;

