import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
    ShieldCheck, 
    ShieldOff, 
    Search, 
    User, 
    Mail, 
    AtSign, 
    Loader2,
    Filter,
    Calendar,
    Trash2,
    AlertTriangle
} from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            // Handle both formats: { data: [] } and { data: { data: [] } }
            const users = res.data.data || res.data;
            setUsers(Array.isArray(users) ? users : []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error(err.response?.data?.msg || 'Failed to fetch users');
            setLoading(false);
        }
    };

    const toggleBlock = async (id) => {
        setProcessingId(id);
        try {
            const res = await api.patch(`/admin/users/block/${id}`);
            toast.success(res.data.msg || 'User status updated successfully');
            fetchUsers();
        } catch (err) {
            console.error('Error updating user:', err);
            toast.error(err.response?.data?.msg || 'Error updating user status');
        } finally {
            setProcessingId(null);
        }
    };

    const deleteUser = async (id) => {
        setProcessingId(id);
        try {
            const res = await api.delete(`/admin/users/${id}`);
            toast.success(res.data.msg || 'User deleted successfully');
            setDeleteConfirm(null);
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            toast.error(err.response?.data?.msg || 'Error deleting user');
        } finally {
            setProcessingId(null);
        }
    };

    const confirmDelete = (user) => {
        setDeleteConfirm(user);
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    const filteredUsers = users.filter(user => 
        (user.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
        (user.email || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-slide-up">
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em' }}>User Moderation</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '18px' }}>Security control for user accounts and organizations.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            placeholder="Find unique accounts..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '48px', width: '320px' }}
                        />
                    </div>
                </div>
            </header>

            <div className="table-container premium-shadow">
                <table>
                    <thead>
                        <tr>
                            <th>IDENTIFICATION & ACCOUNT</th>
                            <th>SECURE EMAIL</th>
                            <th>PLATFORM ROLE</th>
                            <th>ACCESS STATUS</th>
                            <th>CREATED DATE</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No accounts match your criteria.</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', color: 'var(--primary)' }}>
                                                <User size={18} />
                                            </div>
                                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{user.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                            <Mail size={14} color="var(--primary)" /> {user.email}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ 
                                            background: user.role === 'Organizer' ? 'rgba(244, 63, 94, 0.1)' : 'rgba(129, 140, 248, 0.1)',
                                            color: user.role === 'Organizer' ? 'var(--accent)' : 'var(--primary)',
                                            fontSize: '10px'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.isBlocked ? 'badge-error' : 'badge-success'}`}>
                                            {user.isBlocked ? 'Blocked' : 'Active Access'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                            <Calendar size={14} color="var(--primary)" /> {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => toggleBlock(user._id)}
                                                disabled={processingId === user._id}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: processingId === user._id ? 'not-allowed' : 'pointer', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '8px',
                                                    color: user.isBlocked ? 'var(--success)' : 'var(--warning)',
                                                    fontWeight: '600',
                                                    fontSize: '12px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.01em',
                                                    opacity: processingId === user._id ? 0.6 : 1
                                                }}
                                            >
                                                {processingId === user._id ? (
                                                    <Loader2 className="animate-spin" size={14} />
                                                ) : (
                                                    user.isBlocked ? <ShieldCheck size={14} /> : <ShieldOff size={14} />
                                                )}
                                                {user.isBlocked ? 'Enable' : 'Restrict'}
                                            </button>
                                            
                                            <button 
                                                onClick={() => confirmDelete(user)}
                                                disabled={processingId === user._id}
                                                style={{ 
                                                    background: 'rgba(239, 68, 68, 0.1)', 
                                                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                                                    cursor: processingId === user._id ? 'not-allowed' : 'pointer', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '6px',
                                                    color: '#dc2626',
                                                    fontWeight: '600',
                                                    fontSize: '12px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.01em',
                                                    opacity: processingId === user._id ? 0.6 : 1,
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    if (!processingId) {
                                                        e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                                                    }
                                                }}
                                                onMouseOut={(e) => {
                                                    if (!processingId) {
                                                        e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                                    }
                                                }}
                                            >
                                                <Trash2 size={14} />
                                                Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '480px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <AlertTriangle size={24} color="var(--danger)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>Remove User Account</h3>
                                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '14px' }}>This action cannot be undone</p>
                            </div>
                        </div>
                        
                        <div style={{
                            background: 'rgba(0, 0, 0, 0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>User to be removed:</div>
                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{deleteConfirm.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{deleteConfirm.email}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Role: {deleteConfirm.role}</div>
                        </div>
                        
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
                            <strong>Warning:</strong> This will permanently delete the user account and all associated data. The user will lose access to their bookings, tickets, and wallet balance.
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={cancelDelete}
                                disabled={processingId === deleteConfirm._id}
                                style={{
                                    padding: '12px 24px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-main)',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: processingId === deleteConfirm._id ? 'not-allowed' : 'pointer',
                                    opacity: processingId === deleteConfirm._id ? 0.6 : 1
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteUser(deleteConfirm._id)}
                                disabled={processingId === deleteConfirm._id}
                                style={{
                                    padding: '12px 24px',
                                    border: 'none',
                                    background: 'var(--danger)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: processingId === deleteConfirm._id ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: processingId === deleteConfirm._id ? 0.6 : 1
                                }}
                            >
                                {processingId === deleteConfirm._id ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Deleting Permanently...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
