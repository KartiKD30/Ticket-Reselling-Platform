import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
    CheckCircle,
    XCircle,
    Loader2,
    Ticket,
    Calendar,
    IndianRupee,
    User
} from 'lucide-react';

const ResalesPage = () => {
    const [resales, setResales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResales();
    }, []);

    const fetchResales = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/resales');
            setResales(res.data?.data || []);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch resale requests');
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/admin/resales/approve/${id}`);
            toast.success('Resale request approved successfully');
            fetchResales();
        } catch (err) {
            toast.error('Failed to approve resale request');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this resale request?')) return;
        try {
            await api.patch(`/admin/resales/reject/${id}`);
            toast.success('Resale request rejected successfully');
            fetchResales();
        } catch (err) {
            toast.error('Failed to reject resale request');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-slide-up">
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                     <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em' }}>Resale Requests</h1>
                     <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '16px' }}>Review and manage pending attendee ticket resales.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: '600', fontSize: '13px' }}>
                        {resales.length} Pending
                    </div>
                </div>
            </header>

            <div className="table-container premium-shadow">
                <table>
                    <thead>
                        <tr>
                            <th>USER / SELLER</th>
                            <th>EVENT & DATE</th>
                            <th>TICKETS QTY</th>
                            <th>RESALE PRICE</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resales.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No pending resale requests at the moment.</td>
                            </tr>
                        ) : (
                            resales.map((resale) => (
                                <tr key={resale._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={16} color="var(--text-muted)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{resale.user?.name || 'Unknown User'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{resale.user?.email || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>{resale.event?.title || 'Unknown Event'}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                            <Calendar size={12} />
                                            {resale.event?.date ? new Date(resale.event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Ticket size={16} color="var(--primary)" />
                                            <span style={{ fontWeight: '700' }}>{resale.ticketsCount}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: 'var(--success)' }}>
                                            <IndianRupee size={14} />
                                            ₹{(resale.resalePrice ? resale.resalePrice : (resale.event?.price || 0)).toLocaleString('en-IN')} <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>(requested)</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => handleApprove(resale._id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', transition: '0.2s' }}
                                                title="Approve Resale"
                                            >
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                            <button 
                                                onClick={() => handleReject(resale._id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', transition: '0.2s' }}
                                                title="Reject Resale"
                                            >
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResalesPage;
