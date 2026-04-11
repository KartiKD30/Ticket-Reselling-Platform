import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  LogOut, 
  PlusCircle,
  Menu,
  X,
  Ticket,
  Wallet
} from 'lucide-react';

import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import EventsPage from './pages/EventsPage';
import UsersPage from './pages/UsersPage';
import RevenuePage from './pages/RevenuePage';
import AuditLog from './pages/AuditLog';
import ResalesPage from './pages/ResalesPage';
import PayoutsPage from './pages/PayoutsPage';

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // If not logged in and trying to access dashboard, redirect to login
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // Show login page
  if (!user) {
    return <Routes><Route path="/login" element={<Login />} /></Routes>;
  }

  // Show admin dashboard
  return (
    <div className="dashboard-container">
      {/* Sidebar - Always show */}
      <aside className="sidebar premium-shadow">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 16px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>SmartTicket</span>
        </div>
        <nav style={{ flex: 1 }}>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={22} /> Dashboard
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Calendar size={22} /> Events
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={22} /> Users
          </NavLink>
          <NavLink to="/revenue" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <TrendingUp size={22} /> Revenue
          </NavLink>
          <NavLink to="/resales" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Ticket size={22} /> Resale Requests
          </NavLink>
          <NavLink to="/payouts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Wallet size={22} /> Payouts
          </NavLink>
          <NavLink to="/audit" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={22} /> Audit Logs
          </NavLink>
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{user.username}</div>
               <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Admin</div>
            </div>
            <button 
              onClick={logout}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px 16px',
                background: 'var(--danger)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

      {/* Main Content */}
      <main className="main-content" style={{ marginLeft: '270px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/revenue" element={<RevenuePage />} />
          <Route path="/resales" element={<ResalesPage />} />
          <Route path="/payouts" element={<PayoutsPage />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
