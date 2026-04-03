import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
    PlusCircle, 
    Edit3, 
    Trash2, 
    Calendar, 
    MapPin, 
    DollarSign, 
    Users,
    X,
    Loader2,
    CheckCircle,
    XCircle,
    BarChart3,
    TrendingUp,
    PieChart as PieIcon,
    Ticket
} from 'lucide-react';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        venue: '',
        category: '',
        price: '',
        totalSeats: ''
    });

    const [currentTab, setCurrentTab] = useState('All');
    const [revenueModalOpen, setRevenueModalOpen] = useState(false);
    const [revenueData, setRevenueData] = useState(null);
    const [fetchingRevenue, setFetchingRevenue] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [currentTab]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/events?status=${currentTab}`);
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch events');
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.patch(`/admin/events/approve/${id}`);
            toast.success('Event approved successfully');
            fetchEvents();
        } catch (err) {
            toast.error('Failed to approve event');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this event?')) return;
        try {
            await api.patch(`/admin/events/reject/${id}`);
            toast.success('Event rejected successfully');
            fetchEvents();
        } catch (err) {
            toast.error('Failed to reject event');
        }
    };

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

    const handleOpenCreate = () => {
        setIsEditing(false);
        setFormData({ title: '', description: '', date: '', venue: '', category: '', price: '', totalSeats: '' });
        setModalOpen(true);
    };

    const handleOpenEdit = (event) => {
        setIsEditing(true);
        setCurrentEventId(event._id);
        const formattedDate = new Date(event.date).toISOString().slice(0, 16);
        setFormData({
            title: event.title,
            description: event.description,
            date: formattedDate,
            venue: event.venue,
            category: event.category,
            price: event.price,
            totalSeats: event.totalSeats
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/admin/events/${currentEventId}`, formData);
                toast.success('Event updated successfully');
            } else {
                await api.post('/admin/events', formData);
                toast.success('Event created successfully');
            }
            setModalOpen(false);
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Error saving event');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) return;
        
        try {
            await api.delete(`/admin/events/${id}`);
            toast.success('Event deleted successfully');
            fetchEvents();
        } catch (err) {
            toast.error('Failed to delete event');
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
                     <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em' }}>Event Management</h1>
                     <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '16px' }}>Manage primary ticket sales and event logistics.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setCurrentTab(tab)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: currentTab === tab ? 'var(--primary)' : 'transparent',
                                    color: currentTab === tab ? 'white' : 'var(--text-muted)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    fontSize: '13px'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button 
                    onClick={handleOpenCreate}
                    className="btn-primary"
                    >
                        <PlusCircle size={20} /> Create New Event
                    </button>
                </div>
            </header>

            <div className="table-container premium-shadow">
                <table>
                    <thead>
                        <tr>
                            <th>EVENT & CATEGORY</th>
                            <th>DATE & TIME</th>
                            <th>VENUE</th>
                            <th>PRICING</th>
                            <th>CAPACITY</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No events found. Start by creating one.</td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event._id}>
                                    <td>
                                        <div style={{ fontWeight: '700', fontSize: '15px', color: 'white' }}>{event.title}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{event.category}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={14} color="var(--primary)" />
                                            {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={14} color="var(--accent)" />
                                            {event.venue}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: 'var(--success)' }}>
                                            <DollarSign size={14} />
                                            {event.price.toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                                <div style={{ 
                                                    width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%`, 
                                                    height: '100%', 
                                                    background: 'var(--primary)' 
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '60px' }}>
                                                {event.totalSeats - event.availableSeats} / {event.totalSeats}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${
                                            event.status === 'Approved' ? 'badge-success' : 
                                            event.status === 'Pending' ? 'badge-warning' : 
                                            event.status === 'Rejected' ? 'badge-error' : 'badge-muted'}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            {event.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleApprove(event._id)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', padding: '4px' }}
                                                        title="Approve Event"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(event._id)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}
                                                        title="Reject Event"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {event.status === 'Approved' && (
                                                <button 
                                                    onClick={() => handleViewRevenue(event._id)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '4px' }}
                                                    title="View Revenue Report"
                                                >
                                                    <BarChart3 size={18} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleOpenEdit(event)}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                                                title="Edit Event"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(event._id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}
                                                title="Delete Event"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2, 6, 23, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
                    <div className="glass-card premium-shadow" style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}>
                        <button 
                            onClick={() => setModalOpen(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                        
                        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>{isEditing ? 'Edit Event' : 'Create Event'}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Fill in the details below to {isEditing ? 'update' : 'publish'} the event.</p>
                        
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>EVENT TITLE</label>
                                    <input placeholder="e.g. Tomorrowland 2026" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} style={{ width: '100%' }} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>DESCRIPTION</label>
                                    <textarea placeholder="Tell people about the event..." required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', height: '100px', resize: 'none' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>SCHEDULE DATE</label>
                                    <input type="datetime-local" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>CATEGORY</label>
                                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} style={{ width: '100%' }}>
                                        <option value="">Select Category</option>
                                        <option value="Music">Music</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Concert">Concert</option>
                                        <option value="Theatre">Theatre</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>VENUE NAME</label>
                                    <input placeholder="Madison Square" required value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>TICKET PRICE ($)</label>
                                    <input type="number" placeholder="99" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>TOTAL CAPACITY</label>
                                    <input type="number" placeholder="2000" required value={formData.totalSeats} onChange={(e) => setFormData({...formData, totalSeats: e.target.value})} style={{ width: '100%' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '16px' }}>
                                    {isEditing ? 'Save Changes' : 'Publish Event'}
                                </button>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, background: 'rgba(255,254,255,0.05)', color: 'white', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Revenue Report Modal */}
            {revenueModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(2, 6, 23, 0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
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
                                    <div className="stat-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                            <TrendingUp size={14} /> GROSS SALES
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)' }}>${revenueData.report.totalRevenue.toLocaleString()}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{revenueData.report.totalSold} tickets sold</div>
                                    </div>
                                    <div className="stat-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                            <PieIcon size={14} /> PLATFORM CUT
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>${revenueData.report.adminCommission.toLocaleString()}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Fixed 10% fee</div>
                                    </div>
                                    <div className="stat-card" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                                            <DollarSign size={14} /> ORG. SHARE
                                        </div>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>${revenueData.report.organizerShare.toLocaleString()}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Net payout</div>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Recent Bookings</h3>
                                <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.05)', background: 'transparent' }}>
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
                                                        <td style={{ fontWeight: '600' }}>${(booking.totalPrice || (booking.numTickets || 1) * revenueData.event.price).toLocaleString()}</td>
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

export default EventsPage;
