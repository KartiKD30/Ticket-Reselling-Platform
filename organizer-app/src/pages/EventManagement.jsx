import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, MapPin, Calendar, Image as ImageIcon,
  Tag, Users, Info, CheckCircle, XCircle, Clock
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

/* ─── tiny in-page toast ─────────────────────────────────────────── */
const Toast = ({ msg, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const Icon = type === 'success' ? CheckCircle : XCircle;
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium ${bg} animate-in slide-in-from-bottom-4 duration-300`}>
      <Icon className="w-5 h-5 shrink-0" />
      {msg}
    </div>
  );
};

/* ─── status badge helper ─────────────────────────────────────────── */
const statusStyle = (s) => {
  switch (s) {
    case 'Pending':   return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
    case 'Approved':  return 'text-green-500 border-green-500/20 bg-green-500/10';
    case 'Rejected':  return 'text-red-500 border-red-500/20 bg-red-500/10';
    case 'Live':      return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
    case 'Completed': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
    case 'Cancelled': return 'text-red-500 border-red-500/20 bg-red-500/10';
    default:          return 'text-muted-foreground border-border bg-muted';
  }
};

const CATEGORY_OPTIONS = ['Music', 'Sports', 'Entertainment', 'Conference', 'Workshop', 'Other'];

/* ─── blank form ──────────────────────────────────────────────────── */
const BLANK = {
  title: '', date: '', time: '', venue: '', city: '', description: '',
  price: '', category: '', images: '', totalTickets: '', availableTickets: '',
  source: 'organizer',
};

/* ═══════════════════════════════════════════════════════════════════ */
const EventManagement = () => {
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode,  setIsEditMode]  = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [viewEvent,   setViewEvent]   = useState(null);
  const [formData,    setFormData]    = useState(BLANK);
  const [toast,       setToast]       = useState(null); // { msg, type }

  /* ── helpers ──────────────────────────────────────────────────── */
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /** Always prefer title; fall back to name for legacy documents */
  const getTitle = (ev) => ev?.title || ev?.name || '';

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      // Get organizer's own events
      const res = await api.get('/events/organizer/my-events');
      setEvents(res.data.data || res.data);
    } catch (err) {
      console.error('[fetchEvents]', err);
      showToast('Could not load events — is the server running?', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  /* ── delete ───────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      showToast('Event deleted successfully');
      fetchEvents();
    } catch (err) {
      console.error('[handleDelete]', err);
      showToast(err.response?.data?.error || err.response?.data?.msg || err.message, 'error');
    }
  };

  /* ── open edit modal ──────────────────────────────────────────── */
  const handleEdit = (event) => {
    let parsedDate = '';
    let parsedTime = event.time || '';
    if (event.date) {
      const d = new Date(event.date);
      parsedDate = d.toISOString().split('T')[0];
      if (!parsedTime) parsedTime = d.toISOString().split('T')[1].substring(0, 5);
    }
    setFormData({
      title:            getTitle(event),
      description:      event.description      || '',
      venue:            event.venue            || '',
      city:             event.city             || '',
      date:             parsedDate,
      time:             parsedTime,
      images:           Array.isArray(event.images)
        ? event.images.join(', ')
        : (event.images || event.imageUrl || ''),
      price:            event.price            != null ? String(event.price)            : '',
      category:         event.category         || '',
      totalTickets:     event.totalTickets     != null ? String(event.totalTickets)     : '',
      availableTickets: event.availableTickets != null ? String(event.availableTickets) : '',
      source:           event.source           || 'organizer',
    });
    setIsEditMode(true);
    setEditingId(event._id);
    setIsModalOpen(true);
  };

  /* ── open create modal ────────────────────────────────────────── */
  const openCreateModal = () => {
    setFormData(BLANK);
    setIsEditMode(false);
    setEditingId(null);
    setIsModalOpen(true);
  };

  /* ── field helper ─────────────────────────────────────────────── */
  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  /* ── submit ───────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── client-side validation ──────────────────────────────────
    const title = formData.title.trim();
    if (!title)          return showToast('Event title is required',    'error');
    if (!formData.date)  return showToast('Event date is required',     'error');
    if (!formData.venue.trim()) return showToast('Venue is required',   'error');
    if (!formData.category.trim()) return showToast('Category is required', 'error');

    const safeTime = formData.time || '00:00';

    // Build a UTC date from the local date + time values
    // Using Date.UTC avoids timezone drift issues
    const [yr, mo, dy] = formData.date.split('-').map(Number);
    const [hh, mm]     = safeTime.split(':').map(Number);
    const dateObj      = new Date(Date.UTC(yr, mo - 1, dy, hh, mm, 0));

    const priceVal          = parseFloat(formData.price);
    const totalTicketsVal   = parseInt(formData.totalTickets,   10);
    const availableTicketsVal = parseInt(formData.availableTickets, 10);

    if (
      !isNaN(totalTicketsVal) &&
      !isNaN(availableTicketsVal) &&
      availableTicketsVal > totalTicketsVal
    ) {
      return showToast('Available tickets cannot exceed total tickets', 'error');
    }

    const payload = {
      title,
      name:             title,                              // backward compat
      venue:            formData.venue.trim(),
      city:             formData.city.trim(),
      description:      formData.description.trim(),
      date:             dateObj.toISOString(),
      time:             formData.time,
      price:            isNaN(priceVal) ? 0 : priceVal,
      category:         formData.category.trim(),
      totalTickets:     isNaN(totalTicketsVal)     ? 0 : totalTicketsVal,
      availableTickets: isNaN(availableTicketsVal) ? 0 : availableTicketsVal,
      source:           formData.source,
      images:           typeof formData.images === 'string'
        ? formData.images.split(',').map((u) => u.trim()).filter(Boolean)
        : (formData.images || []),
    };

    try {
      setSaving(true);
      let res;
      if (isEditMode) {
        res = await api.put(`/events/${editingId}`, payload);
      } else {
        res = await api.post('/events', payload);
      }

      console.log('[EventManagement] Saved event:', res.data);

      showToast(`Event ${isEditMode ? 'updated' : 'created'} successfully! 🎉`);
      setIsModalOpen(false);
      setFormData(BLANK);
      setIsEditMode(false);
      setEditingId(null);
      await fetchEvents(); // refresh list
    } catch (err) {
      console.error('[handleSubmit]', err);
      showToast(err.response?.data?.error || err.response?.data?.msg || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground mt-1">
            Submit events for admin approval and track their review status here.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary text-primary-foreground flex items-center gap-2 px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* ── Event Grid ─────────────────────────────────────────── */}
      {loading ? (
        <div className="bg-card border border-border shadow-sm rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading events…
        </div>
      ) : events.length === 0 ? (
        <div className="bg-card border border-border shadow-sm rounded-xl p-12 text-center text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No events yet</p>
          <p className="text-sm mt-1">Click <strong>Create Event</strong> to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const title          = getTitle(event);
            const initial        = title ? title.charAt(0).toUpperCase() : '?';
            const price          = event.price       != null ? event.price       : '—';
            const totalTix       = event.totalTickets     != null ? event.totalTickets     : '—';
            const availableTix   = event.availableTickets != null ? event.availableTickets : '—';
            const eventDateLabel = event.date
              ? new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : '—';

            return (
              <div
                key={event._id}
                onClick={() => setViewEvent(event)}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="h-48 w-full bg-muted relative">
                  {event.images && event.images.length > 0 ? (
                    <img src={event.images[0]} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/30 text-5xl font-bold bg-primary/5">
                      {initial}
                    </div>
                  )}

                  {/* Price badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-background/90 backdrop-blur-sm shadow-sm text-foreground">
                      ₹{price}
                    </span>
                  </div>

                  {/* Status badge */}
                  {event.status && (
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm shadow-sm ${statusStyle(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg line-clamp-1 flex-1 pr-2">
                      {title || <span className="text-muted-foreground italic">Untitled</span>}
                    </h3>
                    {event.category && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {event.category}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mt-auto text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>{eventDateLabel}{event.time ? ` · ${event.time}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">{[event.venue, event.city].filter(Boolean).join(', ') || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>{availableTix} / {totalTix} available</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-border flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                      className="p-2 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors text-muted-foreground"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(event._id); }}
                      className="p-2 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Detail Modal ───────────────────────────────────── */}
      <Modal isOpen={!!viewEvent} onClose={() => setViewEvent(null)} title="Event Details">
        {viewEvent && (() => {
          const title = getTitle(viewEvent);
          return (
            <div className="space-y-6">
              {viewEvent.images && viewEvent.images.length > 0 && (
                <div className="w-full h-64 rounded-xl overflow-hidden">
                  <img src={viewEvent.images[0]} alt={title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{title || 'Untitled Event'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {viewEvent.category && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        {viewEvent.category}
                      </span>
                    )}
                    {viewEvent.status && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyle(viewEvent.status)}`}>
                        {viewEvent.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{viewEvent.price ?? 0}</div>
                  <div className="text-sm text-muted-foreground">per ticket</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-xl border border-border/50">
                {[
                  {
                    Icon: Calendar, label: 'Date & Time',
                    value: `${viewEvent.date ? new Date(viewEvent.date).toLocaleDateString('en-IN') : '—'}${viewEvent.time ? ` · ${viewEvent.time}` : ''}`,
                  },
                  { Icon: MapPin,   label: 'Venue',   value: viewEvent.venue  || '—' },
                  { Icon: MapPin,   label: 'City',    value: viewEvent.city   || '—' },
                  { Icon: Users,    label: 'Tickets', value: `${viewEvent.availableTickets ?? '—'} left (of ${viewEvent.totalTickets ?? '—'})` },
                  { Icon: Info,     label: 'Source',  value: viewEvent.source || '—' },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-lg border border-border shadow-sm shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                      <p className="font-medium text-sm capitalize">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {viewEvent.description && (
                <div>
                  <h4 className="font-semibold text-base border-b border-border pb-2 mb-3">About this Event</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{viewEvent.description}</p>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  onClick={() => { const ev = viewEvent; setViewEvent(null); handleEdit(ev); }}
                  className="px-5 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/90 transition-colors border border-border flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit Event
                </button>
                <button
                  onClick={() => setViewEvent(null)}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ── Create / Edit Modal ─────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { if (!saving) setIsModalOpen(false); }}
        title={isEditMode ? 'Edit Event' : 'Create New Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* Basic Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Info className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Basic Information</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Event Title <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Summer Music Festival"
                  value={formData.title}
                  onChange={set('title')}
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.date}
                  onChange={set('date')}
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Time
                </label>
                <input
                  type="time"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.time}
                  onChange={set('time')}
                />
              </div>

              {/* Venue */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Venue <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. NSIC Exhibition Grounds, Delhi"
                  value={formData.venue}
                  onChange={set('venue')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={set('city')}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  placeholder="Tell attendees what to expect…"
                  value={formData.description}
                  onChange={set('description')}
                />
              </div>
            </div>
          </section>

          {/* Pricing & Tickets */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Tag className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Categorization &amp; Pricing</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-destructive">*</span>
                </label>
                <select
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.category}
                  onChange={set('category')}
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.price}
                  onChange={set('price')}
                />
              </div>

              {/* Total Tickets — auto-fills Available */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Tickets <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.totalTickets}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      totalTickets:     val,
                      availableTickets: val, // auto-sync when creating
                    }));
                  }}
                />
              </div>

              {/* Available Tickets */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Available Tickets <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.availableTickets}
                  onChange={set('availableTickets')}
                />
                {formData.totalTickets && formData.availableTickets &&
                  parseInt(formData.availableTickets) > parseInt(formData.totalTickets) && (
                  <p className="text-xs text-destructive mt-1">Available cannot exceed total tickets</p>
                )}
              </div>
            </div>
          </section>

          {/* Media & Source */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              <h4 className="font-semibold">Media &amp; Source</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg, https://…"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.images}
                  onChange={set('images')}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Source</label>
                <select
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.source}
                  onChange={set('source')}
                >
                  <option value="organizer">Organizer</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </section>

          {/* Footer buttons */}
          <div className="pt-4 flex justify-end gap-2 text-sm border-t border-border">
            <button
              type="button"
              disabled={saving}
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Toast ──────────────────────────────────────────────── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
};

export default EventManagement;
