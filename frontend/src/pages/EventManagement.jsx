import React, { useState, useEffect } from 'react';
import { Plus, Copy, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/ui/Modal';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        venue: '',
        description: '',
        tickets: [
            { category: 'General', price: '', totalQuantity: '' }
        ]
    });

    const fetchEvents = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/events');
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDuplicate = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/events/${id}/duplicate`, { method: 'POST' });
            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you certain you want to delete this event and all its tickets/bookings?')) return;
        try {
            await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' });
            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    const addTicketCategory = () => {
        setFormData({
            ...formData, 
            tickets: [...formData.tickets, { category: '', price: '', totalQuantity: '' }]
        });
    };

    const handleTicketChange = (index, field, value) => {
        const newTickets = [...formData.tickets];
        newTickets[index][field] = value;
        setFormData({ ...formData, tickets: newTickets });
    };

    const handleRemoveTicket = (index) => {
        const newTickets = formData.tickets.filter((_, i) => i !== index);
        setFormData({ ...formData, tickets: newTickets });
    };

    const handleEdit = (event) => {
        let parsedDate = '';
        let parsedTime = '';
        if (event.date) {
            const d = new Date(event.date);
            parsedDate = d.toISOString().split('T')[0];
            parsedTime = d.toISOString().split('T')[1].substring(0, 5);
        }
        setFormData({
            ...event,
            date: parsedDate,
            time: parsedTime,
            tickets: [{ category: 'General', price: '', totalQuantity: '' }] // Keep dummy since tickets aren't fetched per event here
        });
        setIsEditMode(true);
        setEditingId(event._id);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setFormData({ name: '', date: '', time: '', venue: '', description: '', tickets: [{ category: 'General', price: '', totalQuantity: '' }] });
        setIsEditMode(false);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const safeTime = formData.time || "00:00";
            const dateObj = new Date(`${formData.date}T${safeTime}:00Z`);
            
            if (isEditMode) {
                await fetch(`http://localhost:5000/api/events/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        venue: formData.venue,
                        description: formData.description,
                        date: dateObj
                    })
                });
            } else {
                // Create event
                const evRes = await fetch('http://localhost:5000/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        venue: formData.venue,
                        description: formData.description,
                        date: dateObj
                    })
                });
                const newEvent = await evRes.json();

                // Create tickets
                for (let t of formData.tickets) {
                    if (t.category && t.price && t.totalQuantity) {
                        await fetch('http://localhost:5000/api/tickets', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                eventId: newEvent._id,
                                category: t.category,
                                price: Number(t.price),
                                totalQuantity: Number(t.totalQuantity)
                            })
                        });
                    }
                }
            }

            setIsModalOpen(false);
            setFormData({ name: '', date: '', time: '', venue: '', description: '', tickets: [{ category: 'General', price: '', totalQuantity: '' }] });
            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Events</h2>
                    <p className="text-muted-foreground mt-1">Manage your events, dates, and venues here.</p>
                </div>
                <button onClick={openCreateModal} className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-5 h-5" />
                    Create Event
                </button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Event Name</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Venue</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {events.map((event) => (
                                <tr key={event._id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                                        {event.name}
                                        {Math.random() > 0.7 && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">🔥 High Demand</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{event.venue}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                            event.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            event.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            'bg-muted text-muted-foreground border-border'
                                        }`}>
                                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 text-muted-foreground">
                                            <button onClick={() => handleDuplicate(event._id)} className="p-2 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Duplicate">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEdit(event)} className="p-2 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(event._id)} className="p-2 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr><td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No events found. Click 'Create Event' to get started.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Edit Event" : "Create New Event"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-foreground border-b border-border pb-2">Basic Details</h4>
                        <div><label className="block text-sm font-medium mb-1">Event Name</label><input required className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1">Date</label><input type="date" required className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                            <div><label className="block text-sm font-medium mb-1">Time</label><input type="time" required className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Venue</label><input required className="w-full bg-background border border-border rounded-lg px-3 py-2" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} /></div>
                    </div>

                    {!isEditMode && (
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <h4 className="font-semibold text-foreground">Ticket Configuration</h4>
                                <button type="button" onClick={addTicketCategory} className="text-primary text-sm font-medium hover:underline">+ Add Category</button>
                            </div>
                            {formData.tickets.map((ticket, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-4"><label className="block text-xs font-medium mb-1">Category (e.g. VIP)</label><input required className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-sm" value={ticket.category} onChange={e => handleTicketChange(index, 'category', e.target.value)} /></div>
                                    <div className="col-span-3"><label className="block text-xs font-medium mb-1">Price ($)</label><input type="number" required className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-sm" value={ticket.price} onChange={e => handleTicketChange(index, 'price', e.target.value)} /></div>
                                    <div className="col-span-3"><label className="block text-xs font-medium mb-1">Quantity</label><input type="number" required className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-sm" value={ticket.totalQuantity} onChange={e => handleTicketChange(index, 'totalQuantity', e.target.value)} /></div>
                                    <div className="col-span-2 pb-1 text-center">
                                        {formData.tickets.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveTicket(index)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors"><Trash2 className="w-4 h-4 inline"/></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-2 text-sm border-t border-border mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground font-medium">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium">{isEditMode ? "Save Changes" : "Create Event & Tickets"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default EventManagement;
