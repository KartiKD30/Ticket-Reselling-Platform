import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

const PromoCodes = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]);

    const [formData, setFormData] = useState({
        code: '',
        eventId: '',
        discountType: 'percentage',
        discountValue: '',
        usageLimit: '',
        expiryDate: ''
    });

    const fetchPromos = async () => {
        try {
            setError('');
            const res = await api.get('/promos');
            setPromos(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to load promo codes.');
            setPromos([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await api.get('/events/organizer/my-events');
            setEvents(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (err) {
            console.error(err);
            setEvents([]);
        }
    };

    useEffect(() => {
        fetchPromos();
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/promos', {
                ...formData,
                discountValue: Number(formData.discountValue),
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
            });
            setIsModalOpen(false);
            fetchPromos();
            setFormData({ code: '', eventId: '', discountType: 'percentage', discountValue: '', usageLimit: '', expiryDate: '' });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to create promo code.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this promo code?')) return;
        try {
            await api.delete(`/promos/${id}`);
            fetchPromos();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to delete promo code.');
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Promo Codes</h2>
                    <p className="text-muted-foreground mt-1">Create discount codes to boost sales.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} disabled={events.length === 0} className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus className="w-5 h-5" />
                    Create Promo
                </button>
            </div>

            {events.length === 0 && !loading && (
                <div className="bg-card border border-border shadow-sm rounded-xl p-4 text-sm text-muted-foreground">
                    Create an event first, then promo codes will be available here.
                </div>
            )}

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Event</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Uses</th>
                            <th className="px-6 py-4">Expires</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading && (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Loading promo codes...</td></tr>
                        )}
                        {!loading && promos.length === 0 && (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No promo codes active.</td></tr>
                        )}
                        {!loading && promos.map(promo => (
                            <tr key={promo._id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-bold tracking-wider"><span className="bg-muted px-2 py-1 rounded text-foreground">{promo.code}</span></td>
                                <td className="px-6 py-4 text-muted-foreground">{promo.eventId?.title || promo.eventId?.name || 'Assigned Event'}</td>
                                <td className="px-6 py-4 font-medium text-green-500">
                                    {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {promo.timesUsed} / {promo.usageLimit || '∞'}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{new Date(promo.expiryDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}</td>
                                <td className="px-6 py-4 text-right text-muted-foreground">
                                    <button onClick={() => handleDelete(promo._id)} className="p-2 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Promo Code">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Promo Code</label>
                        <input required type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2" placeholder="e.g. SUMMER26" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Target Event</label>
                        <select required className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.eventId} onChange={(e) => setFormData({...formData, eventId: e.target.value})}>
                            <option value="" disabled>Select Event...</option>
                            {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title || ev.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Discount Type</label>
                            <select className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Value</label>
                            <input required type="number" min="1" className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.discountValue} onChange={(e) => setFormData({...formData, discountValue: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Usage Limit (Optional)</label>
                            <input type="number" placeholder="Leave empty for unlimited" className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.usageLimit} onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expiry Date</label>
                            <input required type="date" className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-end gap-2 text-sm">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground font-medium">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium">Create Code</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PromoCodes;
