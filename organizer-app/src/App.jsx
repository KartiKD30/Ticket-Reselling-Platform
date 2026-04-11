import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/ui/Layout';
import DashboardOverview from './pages/DashboardOverview';
import EventManagement from './pages/EventManagement';
import SalesAnalytics from './pages/SalesAnalytics';
import ResaleMonitoring from './pages/ResaleMonitoring';
import Earnings from './pages/Earnings';
import PromoCodes from './pages/PromoCodes';
import Login from './pages/Login';

function OrganizerRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('access');
  const role = localStorage.getItem('role');

  if (!token || role !== 'organizer') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <OrganizerRoute>
              <Layout />
            </OrganizerRoute>
          }
        >
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
