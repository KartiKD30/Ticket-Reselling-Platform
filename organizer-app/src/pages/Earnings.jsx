import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const Earnings = () => {
    const [payoutData, setPayoutData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchPayouts = async () => {
        try {
            const res = await api.get('/payouts');
            setPayoutData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleRequestPayout = async () => {
        if (payoutData?.totalEarnings === undefined) return;
        const requestAmount = payoutData.totalEarnings > 0 ? payoutData.totalEarnings : 500; 
        try {
            const payload = { amount: requestAmount };
            if (payoutData?.defaultEventId) {
                payload.eventId = payoutData.defaultEventId;
            }

            await api.post('/payouts/request', payload);
            fetchPayouts();
        } catch (err) {
            console.error(err);
            alert('Failed to request payout. Check console.');
        }
    }

    const handleCompletePayout = async (id) => {
        try {
            await api.put(`/payouts/${id}/complete`);
            fetchPayouts();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-8">Loading Earnings...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Earnings & Payouts</h2>
                <p className="text-muted-foreground mt-1">Manage your revenue and track payout statuses.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col justify-center">
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" /> Total Earnings
                    </div>
                    <div className="text-4xl font-bold tracking-tight">₹{payoutData?.totalEarnings?.toLocaleString()}</div>
                </div>
                <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col justify-center">
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" /> Pending Payouts
                    </div>
                    <div className="text-4xl font-bold tracking-tight text-orange-500">₹{payoutData?.pendingPayouts?.toLocaleString()}</div>
                </div>
                <div className="bg-card border border-border shadow-sm rounded-xl p-6 flex flex-col justify-center">
                    <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Completed Payouts
                    </div>
                    <div className="text-4xl font-bold tracking-tight text-green-500">₹{payoutData?.completedPayouts?.toLocaleString()}</div>
                </div>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden mt-8">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
                    <h3 className="font-semibold text-lg">Payout History</h3>
                    <button onClick={handleRequestPayout} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        Request Payout
                    </button>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Event</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {payoutData?.payoutHistory?.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No payouts requested yet.</td>
                            </tr>
                        )}
                        {payoutData?.payoutHistory?.map(payout => (
                            <tr key={payout._id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-medium">{new Date(payout.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-muted-foreground">{payout.eventId?.title || payout.eventId?.name || 'All Events'}</td>
                                <td className="px-6 py-4 font-bold text-foreground">₹{payout.amount?.toLocaleString()}</td>
                                <td className="px-6 py-4 flex items-center gap-4">
                                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex w-fit items-center gap-1.5 ${
                                        payout.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                        'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                    }`}>
                                        {payout.status === 'completed' ? <CheckCircle2 className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                                    </span>
                                    {payout.status === 'pending' && (
                                        <button 
                                            onClick={() => handleCompletePayout(payout._id)}
                                            className="text-[10px] uppercase font-bold text-primary hover:underline"
                                            title="Simulate Admin Completion"
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Earnings;
