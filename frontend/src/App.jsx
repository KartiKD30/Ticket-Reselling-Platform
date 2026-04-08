import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/ui/Layout';
import DashboardOverview from './pages/DashboardOverview';
import EventManagement from './pages/EventManagement';
import SalesAnalytics from './pages/SalesAnalytics';
import ResaleMonitoring from './pages/ResaleMonitoring';

import Earnings from './pages/Earnings';
import PromoCodes from './pages/PromoCodes';

function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="events" element={<EventManagement />} />
          <Route path="analytics" element={<SalesAnalytics />} />
          <Route path="resale" element={<ResaleMonitoring />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="promos" element={<PromoCodes />} />
          <Route path="*" element={<div className="p-8 text-center text-muted-foreground">Coming Soon / Construction</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
