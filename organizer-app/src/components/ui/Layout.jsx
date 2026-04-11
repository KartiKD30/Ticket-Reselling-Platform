import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Organizer';

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-muted/20">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
          <h2 className="text-xl font-medium">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{username}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
