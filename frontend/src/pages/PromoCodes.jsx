import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import Modal from '../components/ui/Modal';

const PromoCodes = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
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
            const res = await fetch('http://localhost:5000/api/promos');
            const data = await res.json();
            setPromos(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/events');
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPromos();
        fetchEvents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5000/api/promos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    discountValue: Number(formData.discountValue),
                    usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
                })
            });
            setIsModalOpen(false);
            fetchPromos();
            setFormData({ code: '', eventId: '', discountType: 'percentage', discountValue: '', usageLimit: '', expiryDate: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this promo code?')) return;
        try {
            await fetch(`http://localhost:5000/api/promos/${id}`, { method: 'DELETE' });
            fetchPromos();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Promo Codes</h2>
                    <p className="text-muted-foreground mt-1">Create discount codes to boost sales.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-5 h-5" />
                    Create Promo
                </button>
            </div>

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
                        {promos.length === 0 && (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No promo codes active.</td></tr>
                        )}
                        {promos.map(promo => (
                            <tr key={promo._id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-bold tracking-wider"><span className="bg-muted px-2 py-1 rounded text-foreground">{promo.code}</span></td>
                                <td className="px-6 py-4 text-muted-foreground">{promo.eventId?.name || 'All Events'}</td>
                                <td className="px-6 py-4 font-medium text-green-500">
                                    {promo.discountType === 'percentage' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
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
                            {events.map(ev => <option key={ev._id} value={ev._id}>{ev.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Discount Type</label>
                            <select className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.discountType} onChange={(e) => setFormData({...formData, discountType: e.target.value})}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
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
