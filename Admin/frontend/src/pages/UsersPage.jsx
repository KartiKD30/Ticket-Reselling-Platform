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
    Calendar
} from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch users');
            setLoading(false);
        }
    };

    const toggleBlock = async (id) => {
        try {
            const res = await api.patch(`/admin/users/block/${id}`);
            toast.success(res.data.msg);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Error updating status');
        }
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
                            <th>SECURITY CONTROL</th>
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
                                        <button 
                                            onClick={() => toggleBlock(user._id)}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '8px',
                                                color: user.isBlocked ? 'var(--success)' : 'var(--error)',
                                                fontWeight: '800',
                                                fontSize: '12px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.01em'
                                            }}
                                        >
                                            {user.isBlocked ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                                            {user.isBlocked ? 'Enable Access' : 'Restrict Account'}
                                        </button>
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

export default UsersPage;
