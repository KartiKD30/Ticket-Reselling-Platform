import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Clock,
    ShieldAlert,
    AtSign,
    User,
    Database,
    Terminal,
    ChevronDown,
    Loader2
} from 'lucide-react';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/admin/audit-logs');
                setLogs(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching audit logs:', err);
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        </div>
    );

    return (
        <div className="animate-slide-up">
            <header style={{ marginBottom: '48px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-0.02em' }}>Audit Logs</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '16px' }}>Detailed history of administrative actions on the platform.</p>
            </header>

            <div className="table-container premium-shadow" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <table>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            <th>ACTION TIMESTAMP</th>
                            <th>ADMINISTRATOR</th>
                            <th>OPERATION CATEGORY</th>
                            <th>DETAILED DESCRIPTION</th>
                            <th>TARGET OBJECT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No logs available yet.</td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                            <Clock size={14} />
                                            {new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white' }}>
                                                {log.admin?.name?.charAt(0) || 'A'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{log.admin?.name || 'Unknown'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{log.admin?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge" style={{
                                            background: log.action.includes('DELETE') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(129, 140, 248, 0.1)',
                                            color: log.action.includes('DELETE') ? 'var(--error)' : 'var(--primary)'
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px' }}>{log.details}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: '600', fontSize: '12px' }}>
                                            <Database size={14} /> {log.targetType}
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

export default AuditLog;
