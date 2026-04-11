import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    Wallet, 
    Clock, 
    CheckCircle2, 
    ArrowDownRight, 
    TrendingUp, 
    Loader2,
    Calendar,
    User,
    DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PayoutsPage = () => {
    const [payoutData, setPayoutData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchPayouts = async () => {
        try {
            const res = await api.get('/payouts');
            setPayoutData(res.data);
        } catch (err) {
            console.error('Error fetching payouts:', err);
            toast.error('Failed to fetch payouts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleApprovePayout = async (payoutId) => {
        setProcessingId(payoutId);
        try {
            await api.put(`/payouts/${payoutId}/complete`);
            toast.success('Payout approved successfully');
            fetchPayouts();
        } catch (err) {
            console.error('Error approving payout:', err);
            toast.error('Failed to approve payout');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-slide-up">
            <header style={{ marginBottom: '48px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em' }}>Payout Management</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '16px' }}>Review and approve organizer payout requests.</p>
            </header>

            <div className="stat-grid">
                <div className="stat-card premium-shadow" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>TOTAL EARNINGS</span>
                            <h2 style={{ fontSize: '36px', marginTop: '12px', fontWeight: '800', color: 'var(--success)' }}> 
                                ${payoutData?.totalEarnings?.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>
                            <TrendingUp color="var(--success)" size={28} />
                        </div>
                    </div>
                </div>

                <div className="stat-card premium-shadow" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>PENDING PAYOUTS</span>
                            <h2 style={{ fontSize: '36px', marginTop: '12px', fontWeight: '800', color: 'var(--warning)' }}>
                                ${payoutData?.pendingPayouts?.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '16px' }}>
                            <Clock color="var(--warning)" size={28} />
                        </div>
                    </div>
                </div>

                <div className="stat-card premium-shadow" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>COMPLETED PAYOUTS</span>
                            <h2 style={{ fontSize: '36px', marginTop: '12px', fontWeight: '800', color: 'var(--primary)' }}>
                                ${payoutData?.completedPayouts?.toLocaleString()}
                            </h2>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '16px' }}>
                            <CheckCircle2 color="var(--primary)" size={28} />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '48px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Payout Requests</h3>
                <div className="table-container premium-shadow">
                    <table>
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>ORGANIZER</th>
                                <th>EVENT</th>
                                <th>AMOUNT</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payoutData?.payoutHistory?.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                        No payout requests found.
                                    </td>
                                </tr>
                            ) : (
                                payoutData?.payoutHistory?.map(payout => (
                                    <tr key={payout._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={14} color="var(--text-muted)" />
                                                {new Date(payout.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <User size={14} color="var(--text-muted)" />
                                                {payout.organizerId || 'Unknown'}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>
                                            {payout.eventId?.title || payout.eventId?.name || 'All Events'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <DollarSign size={14} color="var(--text-muted)" />
                                                <span style={{ fontWeight: '700' }}>${payout.amount?.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                payout.status === 'completed' 
                                                    ? 'badge-success' 
                                                    : 'badge-warning'
                                            }`}>
                                                {payout.status === 'completed' ? (
                                                    <>
                                                        <CheckCircle2 size={12} style={{ marginRight: '4px' }} />
                                                        Completed
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={12} style={{ marginRight: '4px' }} />
                                                        Pending
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            {payout.status === 'pending' && (
                                                <button
                                                    onClick={() => handleApprovePayout(payout._id)}
                                                    disabled={processingId === payout._id}
                                                    style={{
                                                        background: 'var(--primary)',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        cursor: processingId === payout._id ? 'not-allowed' : 'pointer',
                                                        opacity: processingId === payout._id ? 0.7 : 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    {processingId === payout._id ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={14} />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 size={14} />
                                                            Approve
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            {payout.status === 'completed' && (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                                    {payout.transferredAt ? 
                                                        `Transferred on ${new Date(payout.transferredAt).toLocaleDateString()}` 
                                                        : 'Completed'
                                                    }
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayoutsPage;
