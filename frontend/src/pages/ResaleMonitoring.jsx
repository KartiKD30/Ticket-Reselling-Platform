import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ResaleMonitoring = () => {
    // Dummy Data for demonstration
    const [resaleListings] = useState([
        { id: 1, event: 'Neon Nights Music Fest', originalPrice: 150, resalePrice: 180, cap: 195, status: 'listed' },
        { id: 2, event: 'Neon Nights Music Fest', originalPrice: 150, resalePrice: 200, cap: 195, status: 'flagged' },
        { id: 3, event: 'Tech Innovators Summit', originalPrice: 100, resalePrice: 120, cap: 130, status: 'sold' },
        { id: 4, event: 'Tech Innovators Summit', originalPrice: 300, resalePrice: 350, cap: 390, status: 'listed' },
    ]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Resale Monitoring</h2>
                <p className="text-muted-foreground mt-1">Track secondary market sales and enforce price caps (130% max).</p>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Event</th>
                            <th className="px-6 py-4">Original Price</th>
                            <th className="px-6 py-4">Resale Price</th>
                            <th className="px-6 py-4">Max Cap (130%)</th>
                            <th className="px-6 py-4">Compliance Status</th>
                            <th className="px-6 py-4 text-right">Listing Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {resaleListings.map((item) => {
                            const isCompliant = item.resalePrice <= item.cap;
                            return (
                                <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{item.event}</td>
                                    <td className="px-6 py-4 text-muted-foreground">₹{item.originalPrice}</td>
                                    <td className="px-6 py-4 font-medium">₹{item.resalePrice}</td>
                                    <td className="px-6 py-4 text-muted-foreground">₹{item.cap}</td>
                                    <td className="px-6 py-4">
                                        {isCompliant ? (
                                            <span className="flex items-center gap-1.5 text-green-500 font-medium">
                                                <CheckCircle2 className="w-4 h-4" /> Compliant
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-destructive font-medium">
                                                <AlertCircle className="w-4 h-4" /> Flagged
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                            item.status === 'listed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            item.status === 'flagged' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                            'bg-green-500/10 text-green-500 border-green-500/20'
                                        }`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Notification alert example */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-sm">Resale Policy Violation detected</h4>
                    <p className="text-sm mt-1 opacity-90">1 listing for 'Neon Nights Music Fest' has exceeded the 130% price cap and has been automatically flagged. Review action required.</p>
                </div>
            </div>
        </div>
    );
};

export default ResaleMonitoring;
