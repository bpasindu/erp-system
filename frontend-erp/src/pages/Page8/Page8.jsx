import React from 'react';
import '../Page2/Page2.css';
import Sidebar from '../../common/layout/Sidebar';
import TopHeader from '../../common/layout/TopHeader';
import AiAssistantPage from '../../features/aiAssistant/AiAssistantPage';

const Page8 = () => {
  return (
    <div className="dashboard-layout">
      <div className="sidebar-overlay"></div>
      <Sidebar />
      <main className="main-content">
        <TopHeader />
        <AiAssistantPage />
      </main>
    </div>
  );
};

export default Page8;

