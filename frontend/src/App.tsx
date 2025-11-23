import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, Server, Database } from 'lucide-react';
import { format } from 'date-fns';

// Types matching your API response
interface StatSummary {
  type: string;
  count: string;
}

interface TimelineItem {
  minute: string;
  count: string;
}

interface DashboardData {
  summary: StatSummary[];
  timeline: TimelineItem[];
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-refresh every 5 seconds to see live updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pointing to your NestJS Backend
        const res = await axios.get('http://localhost:3000/stats');
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        Loading PulseStream...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-blue-500 flex items-center gap-2">
              <Activity /> PulseStream
            </h1>
            <p className="text-slate-400">High-Throughput Ingestion Engine</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center gap-3">
              <Server className="text-green-500" />
              <div>
                <div className="text-xs text-slate-500">System Status</div>
                <div className="font-bold text-green-400">Operational</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.summary.map((stat) => (
            <div
              key={stat.type}
              className="bg-slate-900 p-6 rounded-xl border border-slate-800"
            >
              <div className="text-slate-500 text-sm uppercase tracking-wider mb-2">
                Event: {stat.type}
              </div>
              <div className="text-4xl font-bold text-white">
                {parseInt(stat.count).toLocaleString()}
              </div>
            </div>
          ))}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-sm uppercase tracking-wider mb-2">
              Backend Tech
            </div>
            <div className="flex gap-2 text-2xl font-bold text-white">
              <span className="text-red-500">Redis</span> +{' '}
              <span className="text-blue-400">Postgres</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Database className="text-purple-500" /> Ingestion Traffic (Last
            Hour)
          </h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeline}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="minute"
                  tickFormatter={(str) => format(new Date(str), 'HH:mm')}
                  stroke="#64748b"
                />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f1f5f9',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
