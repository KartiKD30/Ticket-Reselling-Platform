import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Users, Ticket, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import api from '../utils/api';

const StatCard = ({ title, value, icon: Icon, percentage }) => (
  <div className="bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between gap-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="p-2 bg-primary/10 text-primary rounded-lg">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      {percentage !== undefined && (
        <div className="mt-2 text-sm text-muted-foreground">
          <span className={percentage >= 50 ? 'text-green-500 font-medium' : 'text-primary font-medium'}>
            {percentage.toFixed(1)}%
          </span> capacity sold
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }} />
          </div>
        </div>
      )}
    </div>
  </div>
);

const DashboardOverview = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, trendRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/sales-trend')
        ]);
        
        setData(overviewRes.data);
        setChartData(trendRes.data.map(item => ({
          date: item._id,
          revenue: item.revenue,
          tickets: item.tickets
        })));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground mt-1">Here's your sales snapshot for the active events.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${(data?.totalRevenue || 0).toLocaleString()}`} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Tickets Sold" 
          value={(data?.ticketsSold || 0).toLocaleString()} 
          icon={Ticket} 
          percentage={data?.sellThroughRate || 0}
        />
        <StatCard 
          title="Total Seats" 
          value={(data?.totalSeats || 0).toLocaleString()} 
          icon={Users} 
        />
        <StatCard 
          title="Upcoming Events" 
          value={data?.upcomingEvents || 0} 
          icon={CalendarIcon} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Sales Trend (Last 7 Days)</h3>
            <p className="text-muted-foreground text-sm">Revenue generated over time.</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  cursor={{stroke: 'hsl(var(--muted))', strokeWidth: 1}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 flex items-center justify-center flex-col text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
               <DollarSign className="w-8 h-8"/>
            </div>
            <h3 className="font-semibold text-xl mb-2">Ready for Payout</h3>
            <p className="text-muted-foreground text-sm mb-6">Your earnings are ready to be transferred to your bank account.</p>
            <button onClick={() => navigate('/earnings')} className="bg-primary text-primary-foreground w-full py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Request Payout
            </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
