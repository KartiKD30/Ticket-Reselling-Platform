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
  Ticket
} from 'lucide-react';

import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import EventsPage from './pages/EventsPage';
import UsersPage from './pages/UsersPage';
import RevenuePage from './pages/RevenuePage';
import AuditLog from './pages/AuditLog';
import ResalesPage from './pages/ResalesPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ height: '48px', width: '48px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }}></div>
        <p style={{ letterSpacing: '4px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Synchronizing System</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const isLoginPage = location.pathname === '/login';

  if (!user && !isLoginPage) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar - Hide if on login page */}
      {!isLoginPage && user && (
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
            <NavLink to="/audit" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={22} /> Audit Logs
            </NavLink>
          </nav>

          <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                   {user.name?.charAt(0) || 'A'}
                </div>
                <div>
                   <div style={{ fontSize: '13px', fontWeight: '600' }}>{user.name}</div>
                   <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administrator</div>
                </div>
             </div>
            <button 
              onClick={logout}
              className="nav-link" 
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="main-content" style={{ marginLeft: isLoginPage || !user ? '0' : '270px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<DashboardHome />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/revenue" element={<RevenuePage />} />
          <Route path="/resales" element={<ResalesPage />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
