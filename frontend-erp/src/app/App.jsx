import { Routes, Route } from 'react-router-dom';
import './App.css';
import Page1 from '../pages/Page1/Page1';
import Page2 from '../pages/Page2/Page2';
import Page3 from '../pages/Page3/Page3';
import Page4 from '../pages/Page4/Page4';
import Page5 from '../pages/Page5/Page5';
import Page6 from '../pages/Page6/Page6';
import Page7 from '../pages/Page7/Page7';
import Page8 from '../pages/Page8/Page8';
import Page9 from '../pages/Page9/Page9';

// Super Admin Imports
import SuperAdminLayout from '../super_admin/layouts/SuperAdminLayout';
import Dashboard from '../super_admin/pages/Dashboard';
import Businesses from '../super_admin/pages/Businesses';
import UsageLogs from '../super_admin/pages/UsageLogs';
import AIUsage from '../super_admin/pages/AIUsage';
import Statistics from '../super_admin/pages/Statistics';
import PlansBilling from '../super_admin/pages/PlansBilling';
import AdminSettings from '../super_admin/pages/AdminSettings';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<Page1 />} />
        <Route path="/home" element={<Page2 />} />
        <Route path="/products" element={<Page3 />} />
        <Route path="/customers" element={<Page4 />} />
        <Route path="/invoices" element={<Page5 />} />
        <Route path="/ledger" element={<Page6 />} />
        <Route path="/reports" element={<Page7 />} />
        <Route path="/assistant" element={<Page8 />} />
        <Route path="/settings" element={<Page9 />} />

        {/* Super Admin Routes */}
        <Route path="/admin" element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="businesses" element={<Businesses />} />
          <Route path="usage-logs" element={<UsageLogs />} />
          <Route path="ai-usage" element={<AIUsage />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="plans" element={<PlansBilling />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;


