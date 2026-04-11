import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    TrendingUp, 
    ArrowUpRight, 
    ArrowDownRight, 
    IndianRupee, 
    PieChart, 
    Calendar,
    ArrowRightCircle,
    Loader2,
    X,
    PieChart as PieIcon,
    Ticket
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RevenuePage = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revenueModalOpen, setRevenueModalOpen] = useState(false);
    const [revenueData, setRevenueData] = useState(null);
    const [fetchingRevenue, setFetchingRevenue] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/revenue-stats');
                setStats(res.data?.data || []);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching revenue stats:', err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleViewRevenue = async (id) => {
        setFetchingRevenue(true);
        setRevenueModalOpen(true);
        try {
            const res = await api.get(`/admin/events/revenue/${id}`);
            setRevenueData(res.data);
            setFetchingRevenue(false);
        } catch (err) {
            toast.error('Failed to fetch revenue report');
            setRevenueModalOpen(false);
            setFetchingRevenue(false);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    const totalRevenue = stats.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalCommissions = stats.reduce((acc, curr) => acc + curr.commission, 0);

    return (
        <div className="animate-slide-up">
            <header style={{ marginBottom: '48px' }}>
                 <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em' }}>Financial Overview</h1>
                 <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '16px' }}>Detailed revenue analysis and platform commission tracking.</p>
            </header>

            <div className="stat-grid">
                <div className="stat-card premium-shadow" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>TOTAL GROSS SALES</span>
                            <h2 style={{ fontSize: '36px', marginTop: '12px', fontWeight: '800', color: 'var(--success)' }}>₹{totalRevenue.toLocaleString('en-IN')}</h2>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>
                            <TrendingUp color="var(--success)" size={28} />
                        </div>
                    </div>
                </div>

                <div className="stat-card premium-shadow" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>PLATFORM COMMISSION</span>
                            <h2 style={{ fontSize: '36px', marginTop: '12px', fontWeight: '800', color: 'var(--primary)' }}>₹{totalCommissions.toLocaleString('en-IN')}</h2>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '16px' }}>
                            <PieChart color="var(--primary)" size={28} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '48px' }}>
                 <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Revenue Breakthrough per Event</h3>
                 <div className="table-container premium-shadow">
                    <table>
                        <thead>
                            <tr>
                                <th>EVENT TITLE</th>
                                <th>TICKETS SOLD</th>
                                <th>GROSS REVENUE</th>
                                <th>PLATFORM CUT (10%)</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{item.title}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ padding: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                                                <IndianRupee size={14} color="var(--text-muted)" />
                                            </div>
                                            {item.sold} Units
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '600' }}>₹{item.revenue.toLocaleString('en-IN')}</td>
                                    <td style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{item.commission.toLocaleString('en-IN')}</td>
                                    <td>
                                        <span className="badge badge-success">Settleable</span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => handleViewRevenue(item.id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' }}
                                        >
                                            Details <ArrowRightCircle size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
            {/* Revenue Report Modal */}
            {revenueModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card premium-shadow" style={{ width: '100%', maxWidth: '800px', padding: '40px', position: 'relative' }}>
                        <button 
                            onClick={() => setRevenueModalOpen(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        {fetchingRevenue ? (
                            <div style={{ display: 'flex', height: '400px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                                <p style={{ color: 'var(--text-muted)' }}>Calculating financial data...</p>
                            </div>
                        ) : revenueData && (
                            <div className="animate-fade-in">
                                <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>Revenue Report</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{revenueData.event.title} • {new Date(revenueData.event.date).toLocaleDateString()}</p>

                                <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                                    <div className="stat-card" style={{ padding: '24px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                            <TrendingUp size={14} /> GROSS SALES
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)' }}>₹{revenueData.report.totalRevenue.toLocaleString('en-IN')}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{revenueData.report.totalSold} tickets sold</div>
                                    </div>
                                    <div className="stat-card" style={{ padding: '24px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                            <PieIcon size={14} /> PLATFORM CUT
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>₹{revenueData.report.adminCommission.toLocaleString('en-IN')}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Fixed 10% fee</div>
                                    </div>
                                    <div className="stat-card" style={{ padding: '24px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                            <IndianRupee size={14} /> ORG. SHARE
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>₹{revenueData.report.organizerShare.toLocaleString('en-IN')}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Net payout</div>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Recent Bookings</h3>
                                <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.05)', background: 'transparent' }}>
                                    <table style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--bg-card)' }}>
                                            <tr>
                                                <th style={{ background: 'transparent' }}>CUSTOMER</th>
                                                <th style={{ background: 'transparent' }}>TICKETS</th>
                                                <th style={{ background: 'transparent' }}>AMOUNT</th>
                                                <th style={{ background: 'transparent' }}>DATE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {revenueData.bookings.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No bookings yet for this event.</td>
                                                </tr>
                                            ) : (
                                                revenueData.bookings.map(booking => (
                                                    <tr key={booking._id} style={{ background: 'transparent' }}>
                                                        <td>
                                                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{booking.user?.name || 'Unknown'}</div>
                                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{booking.user?.email || 'N/A'}</div>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <Ticket size={14} color="var(--primary)" />
                                                                {booking.numTickets || 1}
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: '600' }}>₹{(booking.totalPrice || (booking.numTickets || 1) * revenueData.event.price).toLocaleString('en-IN')}</td>
                                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(booking.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenuePage;
