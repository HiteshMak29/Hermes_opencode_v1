
import React from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  MousePointer2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity,
  History,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { 
  MODULE_USAGE_MOCK, 
  HOURLY_ENGAGEMENT_MOCK, 
  RECENT_ACTIVITY_MOCK, 
  CURRENT_USER_ROLE 
} from '../constants';
import ContactSection from '../components/ContactSection';

const ModuleAnalytics: React.FC = () => {
  if (CURRENT_USER_ROLE !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-full text-center p-12">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md">
          <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-black text-red-900 mb-2">Admin Access Only</h2>
          <p className="text-red-700 text-sm">
            This module contains sensitive engagement data and is restricted to Admin accounts only.
          </p>
        </div>
      </div>
    );
  }

  const totalViews = MODULE_USAGE_MOCK.reduce((acc, curr) => acc + curr.views, 0);
  const avgBounceRate = (MODULE_USAGE_MOCK.reduce((acc, curr) => acc + curr.bounceRate, 0) / MODULE_USAGE_MOCK.length).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 className="text-indigo-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">Module Usage & Engagement</h1>
            <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Activity size={10} className="mr-1" />
              Live Tracking
            </span>
          </div>
          <p className="text-gray-500">Real-time analysis of student and faculty interaction across the portal.</p>
        </div>
      </header>

      {/* High-level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <MousePointer2 size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600">
              <ArrowUpRight size={14} className="mr-1" />
              12%
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">{totalViews.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-medium">Total Module Views</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600">
              <ArrowUpRight size={14} className="mr-1" />
              8%
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">1,240</p>
          <p className="text-xs text-gray-500 font-medium">Active Users (24h)</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-red-600">
              <ArrowDownRight size={14} className="mr-1" />
              3%
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">5.4m</p>
          <p className="text-xs text-gray-500 font-medium">Avg Session Duration</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <TrendingDown size={20} />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600">
              <ArrowDownRight size={14} className="mr-1" />
              1.2%
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">{avgBounceRate}%</p>
          <p className="text-xs text-gray-500 font-medium">Avg Bounce Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Module Popularity */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-gray-800 flex items-center space-x-2">
              <TrendingUp size={20} className="text-indigo-600" />
              <span>Module Popularity (Views)</span>
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MODULE_USAGE_MOCK} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="views" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                  {MODULE_USAGE_MOCK.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.views > 3000 ? '#6366f1' : entry.views > 1000 ? '#818cf8' : '#c7d2fe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Engagement */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-gray-800 flex items-center space-x-2">
              <History size={20} className="text-indigo-600" />
              <span>Peak Times</span>
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_ENGAGEMENT_MOCK}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-xs text-indigo-700 font-bold flex items-center">
              <AlertTriangle size={14} className="mr-2" />
              Peak load detected at 12:00 PM.
            </p>
          </div>
        </div>
      </div>

      {/* RENDER IN-PORTAL SATISFACTION FEEDBACK NPS */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">Feedback Survey Pulse</span>
            </div>
            <h3 className="font-black text-gray-800 text-lg mt-1">In-Portal Module Satisfaction & net promoter score</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-gray-400">Total net promoter score</span>
            <p className="text-3xl font-black text-green-600">+78</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { module: 'AI Assistant', score: 92, status: 'Excellent', rating: '+88 NPS' },
            { module: 'Support Center', score: 85, status: 'Excellent', rating: '+75 NPS' },
            { module: 'Financial Aid Finder', score: 89, status: 'Strong', rating: '+81 NPS' },
            { module: 'Degree Tracker', score: 91, status: 'Excellent', rating: '+84 NPS' },
            { module: 'Career Internship', score: 87, status: 'Strong', rating: '+79 NPS' },
            { module: 'Wellness Hub', score: 94, status: 'Exceptional', rating: '+90 NPS' }
          ].map((item, id) => (
            <div key={id} className="p-5 rounded-2xl bg-gray-50/50 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{item.module}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-gray-800">{item.rating}</span>
                  <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.2 rounded">{item.status}</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-white border border-gray-150 rounded-xl flex items-center justify-center font-black text-xs text-indigo-600">
                {item.score}%
              </div>
            </div>
          ))}
        </div>

        {/* Live Survey comments */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Micro-Survey Comments</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50/20 p-4 rounded-xl border border-indigo-50/50 text-xs">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Computer Science major (Yr 3)</span>
                <span className="text-green-650 font-black">Thumbs Up</span>
              </div>
              <p className="text-gray-500 mt-1 leading-relaxed">
                "The what-if tool in Degree Progress made switching focus simulation super intuitive. No counseling lag!"
              </p>
            </div>
            <div className="bg-indigo-50/20 p-4 rounded-xl border border-indigo-50/50 text-xs">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Software Engineering major (Yr 2)</span>
                <span className="text-green-650 font-black">Thumbs Up</span>
              </div>
              <p className="text-gray-500 mt-1 leading-relaxed">
                "Crisis helpline trigger is perfect. Kept as a persistent link in Wellness, feels safe."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration, Reliability & Wayfinding Telemetry */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <div className="border-b border-gray-50 pb-4">
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">Infrastructure & Platform Analytics</span>
          <h3 className="font-black text-gray-800 text-lg mt-1">Cross-System Reliability & Feature Rollout Performance</h3>
          <p className="text-xs text-gray-400">Tracking real-time latency, incident routing, and user navigation metrics for newly integrated services.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase font-mono">Performance Monitoring</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">99.8% Uptime</span>
              </div>
              <h4 className="font-extrabold text-sm text-gray-900 mt-3">Network & Application Connection</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Real-time API latency tracking, system error rates, and uptime monitoring per university source (SIS, CRM, LMS). Enables proactive IT team intervention before students encounter checkout or login outages.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-400 flex justify-between font-mono">
              <span>Avg Latency: <strong className="text-slate-700">114ms</strong></span>
              <span>Err Rate: <strong className="text-rose-600">0.03%</strong></span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase font-mono">Operations & Safety</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">-40% Inquiries</span>
              </div>
              <h4 className="font-extrabold text-sm text-gray-900 mt-3">Proactive Alerting & Incidents</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Hierarchical tiered alerting (P1–P4) dynamically routes failures to designated on-call squads instantly. The student-facing self-declared status page diverts redundant tickets, reducing helpdesk overhead by 30–40%.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-400 flex justify-between font-mono">
              <span>MTTR Score: <strong className="text-slate-700">42 mins</strong></span>
              <span>Diverted: <strong className="text-indigo-650">1,420 logs</strong></span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase font-mono">Wayfinding</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">3,400 Views</span>
              </div>
              <h4 className="font-extrabold text-sm text-gray-900 mt-3">Interactive Campus Map</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Centralized gateway mapping live classroom locations, real-time library occupancy sensors, study room booking status, and dining hall menus. Zero-latency client-side rendering with fluid container resizing has elevated student utility metrics.
              </p>
            </div>
            <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-400 flex justify-between font-mono">
              <span>Occupancy: <strong className="text-slate-700">Moderate</strong></span>
              <span>Saves Ticket: <strong className="text-indigo-650">Yes</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Dead Zones & Disengagement */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <TrendingDown size={20} className="text-red-500" />
            <span>Disengagement Signals</span>
          </h3>
          <div className="space-y-4">
            {MODULE_USAGE_MOCK.filter(m => m.bounceRate > 15).map((module, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{module.name}</p>
                  <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">Bounce Rate: {module.bounceRate}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Avg Time</p>
                  <p className="text-sm font-bold text-gray-900">{module.avgTime}s</p>
                </div>
              </div>
            ))}
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-bold text-gray-700">Insight:</span> High bounce rates in Medical and Advising suggest UI friction or slow loading times.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center space-x-2">
              <Activity size={18} className="text-indigo-600" />
              <span>Real-time Activity Log</span>
            </h3>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View Full Logs</button>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_ACTIVITY_MOCK.map((activity) => (
              <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activity.time}</span>
                  <div className="mt-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full uppercase">
                      {activity.module}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ContactSection department="security" />
    </div>
  );
};

export default ModuleAnalytics;
