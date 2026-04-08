import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const SalesAnalytics = () => {
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Re-using the trend endpoint but for area chart
                const trendRes = await fetch('http://localhost:5000/api/analytics/sales-trend');
                const trend = await trendRes.json();
                
                setTrendData(trend.map(item => ({
                    date: item._id,
                    revenue: item.revenue,
                    tickets: item.tickets
                })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // Dummy data for breakdown
    const categoryData = [
        { name: 'VIP', revenue: 14250 },
        { name: 'General', revenue: 32500 },
        { name: 'Standard', revenue: 20000 },
        { name: 'All Access', revenue: 15000 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Sales Analytics</h2>
                <p className="text-muted-foreground mt-1">Deep dive into your revenue and ticket performance.</p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading Analytics...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Area Chart */}
                    <div className="bg-card border border-border shadow-sm rounded-xl p-6">
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg text-foreground">Revenue Trend (Area)</h3>
                            <p className="text-sm text-muted-foreground">Visualizing cumulative revenue growth over the last 7 days.</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}/>
                                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-card border border-border shadow-sm rounded-xl p-6">
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg text-foreground">Revenue by Category</h3>
                            <p className="text-sm text-muted-foreground">Which ticket types generate the most revenue?</p>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                    <RechartsTooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}/>
                                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesAnalytics;
