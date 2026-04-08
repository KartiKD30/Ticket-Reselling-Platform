import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    TrendingUp, 
    Users, 
    Calendar, 
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Layers,
    Loader2
} from 'lucide-react';

const DashboardHome = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    const { stats, revenueByCategory } = data;

    return (
        <div className="animate-slide-up">
            <header style={{ marginBottom: '48px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em' }}>Dashboard Overview</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '18px' }}>Manage and monitor platform performance.</p>
            </header>

            <div className="stat-grid">
                {[
                    { label: 'TOTAL REVENUE', value: `$${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign />, color: 'var(--success)' },
                    { label: 'ACTIVE USERS', value: stats.totalUsers.toLocaleString(), icon: <Users />, color: 'var(--primary)' },
                    { label: 'ORGANIZERS', value: stats.totalOrganizers.toLocaleString(), icon: <Layers />, color: 'var(--accent)' },
                    { label: 'ACTIVE EVENTS', value: stats.totalEvents, icon: <Calendar />, color: 'var(--warning)' }
                ].map((item, idx) => (
                    <div key={idx} className="stat-card premium-shadow">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ padding: '12px', background: `${item.color}15`, borderRadius: '14px', color: item.color }}>
                                {React.cloneElement(item.icon, { size: 24 })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '12px', fontWeight: '700' }}>
                                <ArrowUpRight size={14} /> 12%
                            </div>
                        </div>
                        <div style={{ marginTop: '24px' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '800', letterSpacing: '0.05em' }}>{item.label}</span>
                            <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: 'var(--text-main)' }}>{item.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginTop: '16px' }}>
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Revenue by Category</h3>
                        <div style={{ background: 'rgba(0,0,0,0.05)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Top Performing</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {Object.entries(revenueByCategory || {}).map(([cat, val]) => (
                            <div key={cat}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                                    <span style={{ fontWeight: '600' }}>{cat}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>${val.toLocaleString()}</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(val / (stats.totalRevenue || 1)) * 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                                </div>
                            </div>
                        ))}
                        {Object.keys(revenueByCategory || {}).length === 0 && (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No revenue data recorded yet.</p>
                        )}
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ padding: '24px', background: 'var(--primary)15', borderRadius: '50%', marginBottom: '24px' }}>
                        <TrendingUp size={48} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>Platform Growth</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '240px' }}>User engagement has increased by 24% this week. Monitor performance logs regularly.</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
