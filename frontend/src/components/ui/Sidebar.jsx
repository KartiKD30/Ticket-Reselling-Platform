import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, BarChart3, Wallet, Tag, ArrowRightLeft } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Earnings', path: '/earnings', icon: Wallet },
    { name: 'Promo Codes', path: '/promos', icon: Tag },
    { name: 'Resale', path: '/resale', icon: ArrowRightLeft },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen text-card-foreground p-4">
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary">OrganizerPro</h1>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
