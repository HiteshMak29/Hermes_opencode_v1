import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Users, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Send,
  CornerDownRight,
  Wifi,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { INCIDENTS_MOCK, CURRENT_USER_ROLE } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface Incident {
  id: string;
  title: string;
  tier: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'Investigating' | 'Resolved' | 'Identified';
  team: string;
  startTime: string;
  endTime?: string;
  description: string;
}

const IncidentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Resolved'>('Active');
  const [incidents, setIncidents] = useState<Incident[]>([
    { 
      id: 'inc-001', 
      title: 'Library Database Latency Spike', 
      tier: 'P3', 
      status: 'Investigating', 
      team: 'IT Infrastructure', 
      startTime: '2026-03-30T10:15:00Z',
      description: 'Users reporting slow response times when searching the digital library catalog.'
    },
    { 
      id: 'inc-002', 
      title: 'LMS SSO Login Issues', 
      tier: 'P2', 
      status: 'Resolved', 
      team: 'Software Engineering', 
      startTime: '2026-03-28T08:00:00Z',
      endTime: '2026-03-28T10:30:00Z',
      description: 'Intermittent 500 errors on the login page due to database connection pool exhaustion.'
    },
    { 
      id: 'inc-003', 
      title: 'North Campus-wide Power Failure', 
      tier: 'P1', 
      status: 'Resolved', 
      team: 'Facilities & IT', 
      startTime: '2026-03-15T14:00:00Z',
      endTime: '2026-03-15T16:45:00Z',
      description: 'Major power failure affecting North Campus. All systems were failed over to secondary data center.'
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDeclareOpen, setIsDeclareOpen] = useState(false);

  // Form State parameters
  const [title, setTitle] = useState('');
  const [tier, setTier] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P3');
  const [team, setTeam] = useState('Software Engineering');
  const [description, setDescription] = useState('');

  // Simulation Dispatch transmission logs
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([
    'System initialization: Automated Operations Router Online.',
    'SLA monitoring is armed for all active P1 and P2 alert routes.'
  ]);

  const addDispatchLog = (msg: string) => {
    setDispatchLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 5)]);
  };

  const handleDeclareIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newInc: Incident = {
      id: `inc-00${incidents.length + 1}`,
      title,
      tier,
      status: 'Investigating',
      team,
      startTime: new Date().toISOString(),
      description
    };

    setIncidents(prev => [newInc, ...prev]);
    setIsDeclareOpen(false);

    // Simulate Automated Dispatch Alerts per user instructions
    addDispatchLog(`🚨 Declared ${tier} Incident: "${title}"`);
    if (tier === 'P1') {
      addDispatchLog('📲 P1 DISPATCH: SMS/Call route triggered to CIO & DevOps Lead (+1 555-0911).');
      addDispatchLog('📢 P1 ROUTE: Intercom Banner initialized on Public Student Portal.');
    } else if (tier === 'P2') {
      addDispatchLog('💬 P2 DISPATCH: Slack Opsgenie broadcast pushed to #infrastructure-leads channel.');
      addDispatchLog('📧 P2 ROUTE: Secondary backup systems standby mode loaded.');
    } else if (tier === 'P3') {
      addDispatchLog('📋 P3 DISPATCH: Jira incident board ticket auto-created and assigned to Frontline Helpdesk.');
    } else {
      addDispatchLog('📁 P4 DISPATCH: Bug routed directly to secondary engineering backlog sprint.');
    }

    // Reset Form
    setTitle('');
    setDescription('');
  };

  if (CURRENT_USER_ROLE !== 'Admin' && CURRENT_USER_ROLE !== 'Faculty') {
    return (
      <div className="flex items-center justify-center h-full text-center p-12">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md">
          <ShieldAlert className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-black text-red-900 mb-2">Restricted Access</h2>
          <p className="text-red-700 text-sm">
            Incident management tools are restricted to authorized university administrative agents only.
          </p>
        </div>
      </div>
    );
  }

  const filteredIncidents = incidents.filter(inc => {
    const matchesTab = activeTab === 'Active' ? inc.status !== 'Resolved' : inc.status === 'Resolved';
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const countByTier = (targetTier: string) => incidents.filter(i => i.tier === targetTier && i.status !== 'Resolved').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      
      {/* Top Header Section */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Proactive Alerting & Incidents</h1>
            <span className="flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Activity size={10} className="mr-1" />
              Automated Operations Dispatcher
            </span>
          </div>
          <p className="text-gray-500 font-medium">Coordinate tiered alerts (P1–P4), route dispatches instantly, and monitor student-facing statuses.</p>
        </div>
        
        <button 
          onClick={() => setIsDeclareOpen(!isDeclareOpen)}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-100 shrink-0"
        >
          <Plus size={18} />
          <span>{isDeclareOpen ? 'Collapse Form' : 'Declare New Incident'}</span>
        </button>
      </header>

      {/* SLA Metrics block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-200">
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert size={20} className="animate-pulse" />
            </div>
            <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-2.5 py-0.5 rounded-full font-bold">Active</span>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{countByTier('P1')}</p>
            <h4 className="text-xs font-bold text-gray-400 mt-1">Active P1 Major Outages</h4>
            <p className="text-[10px] text-gray-500 mt-2">Critical core gateways dispatch SMS on-call teams automatically within 3 seconds.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-0.5 rounded-full font-bold">Active</span>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{countByTier('P2')}</p>
            <h4 className="text-xs font-bold text-gray-400 mt-1">Active P2 Major Latencies</h4>
            <p className="text-[10px] text-gray-500 mt-2">Slack & Opsgenie routing alerts relevant platform squads on-call.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Activity size={20} />
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full font-bold">Target SLA</span>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">42m</p>
            <h4 className="text-xs font-bold text-gray-400 mt-1">Mean Time to Resolve (MTTR)</h4>
            <p className="text-[10px] text-gray-500 mt-2">15% reduction in operations settling cycle due to auto route telemetry.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold">SLA Bound</span>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">100%</p>
            <h4 className="text-xs font-bold text-gray-400 mt-1">Automatic Dispatch Success</h4>
            <p className="text-[10px] text-gray-500 mt-2">Zero missed alarms. Escalation routing verified on fallback communication lines.</p>
          </div>
        </div>

      </div>

      {/* Main Operations Block layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left main area: lists of incidents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* DECLARE NEW INCIDENT COLLAPSIBLE FORM BLOCK */}
          <AnimatePresence>
            {isDeclareOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form 
                  onSubmit={handleDeclareIncident}
                  className="bg-zinc-50 border border-zinc-200 p-8 rounded-3xl space-y-6 animate-in slide-in-from-top duration-300"
                >
                  <div className="border-b border-zinc-200 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-zinc-900 text-base">Declare Live Portal Outage / Incident Ticket</h3>
                      <p className="text-xs text-zinc-400 font-sans mt-1">Submit tickets to automatically evaluate dispatch channels.</p>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">P1-P4 DECISION ENGINE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5Col">
                      <label className="text-[10px] font-black uppercase text-zinc-500">Incident Header / Title</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. Bursar payment database gateway fail"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500 font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Tier Priority</label>
                        <select 
                          value={tier}
                          onChange={e => setTier(e.target.value as any)}
                          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500 font-bold font-mono"
                        >
                          <option value="P1">P1 - Critical Outage</option>
                          <option value="P2">P2 - Major Degradation</option>
                          <option value="P3">P3 - Minor Performance</option>
                          <option value="P4">P4 - Low Backlog Bug</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-zinc-500">Assigned Team Squad</label>
                        <select 
                          value={team}
                          onChange={e => setTeam(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"
                        >
                          <option value="Software Engineering">Software Eng</option>
                          <option value="IT Infrastructure">IT Infrastructure</option>
                          <option value="Facilities & IT">Facilities & IT</option>
                          <option value="Bursar Financial Admin">Finance Team</option>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-500">Full Incident Description</label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="Detail specific server logs or user endpoints failing to assist developers in mitigation trials."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-red-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end border-t border-zinc-205 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsDeclareOpen(false)}
                      className="px-5 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold"
                    >
                      Cancel Declaration
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm"
                    >
                      Dispatch Auto Alerts Now
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Incident Listings Table Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Tab toggler */}
              <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-100 shrink-0 self-start">
                {['Active', 'Resolved'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === tab ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Searching filters */}
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <div className="relative w-full md:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <input 
                    type="text" 
                    placeholder="Filter incidents..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs w-full focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* List entries */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident metadata</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority Tier</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dispatched Team</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredIncidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-gray-50/20 transition-colors group text-xs text-gray-600">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-extrabold text-gray-950 text-sm leading-tight">{incident.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{incident.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                          incident.tier === 'P1' ? 'bg-red-50 text-red-700 border border-red-100' :
                          incident.tier === 'P2' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                          incident.tier === 'P3' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          'bg-zinc-50 text-zinc-700 border border-zinc-100'
                        }`}>
                          {incident.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${incident.status === 'Resolved' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                          {incident.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {incident.team}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 font-medium">Started: {new Date(incident.startTime).toLocaleTimeString()}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredIncidents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-gray-400 font-medium font-sans">
                        No active incidents filed in this registry. Zero student outages in effect.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Right operations pager console */}
        <div className="space-y-6">
          
          {/* Radio Paging dispatch monitor logs */}
          <div className="bg-slate-950 p-6 rounded-3xl border-4 border-slate-900 text-slate-300 font-mono relative overflow-hidden flex flex-col justify-between min-h-80">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Radio size={120} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] text-red-500 font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Radio size={13} /> Active Dispatch Pagers
                </span>
                <span className="text-[9px] text-slate-500">LIVE FEED</span>
              </div>

              <div className="space-y-3">
                {dispatchLogs.map((log, index) => (
                  <p key={index} className="text-[10px] leading-relaxed select-all text-slate-450 border-l border-zinc-850 pl-2">
                    {log}
                  </p>
                ))}
              </div>
            </div>

            <p className="text-[9px] text-slate-600 mt-6 border-t border-slate-800 pt-3">
              Automated pager logs clear when incidents are resolved in administration databases.
            </p>
          </div>

          {/* Quick reference guide info block */}
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-3xl space-y-4">
            <h4 className="font-black text-gray-850 text-xs uppercase tracking-wider">
              Automatic alert dispatches
            </h4>
            <div className="text-[11px] leading-relaxed text-gray-500 space-y-3 font-medium">
              <div className="flex items-start gap-1.5">
                <span className="text-red-600 font-black text-xs shrink-0 font-mono">P1</span>
                <span>Immediate text & voice dispatch via PagerDuty to DevOps engineers & CIO. Full incident public panel toggling enabled.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-orange-600 font-black text-xs shrink-0 font-mono">P2</span>
                <span>Immediate Slack message pushes to engineering workspace channels with dynamic logs and latency markers.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-indigo-600 font-black text-xs shrink-0 font-mono">P3</span>
                <span>Backlog ticket automatically drafted in IT service desk registries. Notification badges loaded for advisor dashboard.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default IncidentManagement;
