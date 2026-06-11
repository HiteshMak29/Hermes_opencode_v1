import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  PieChart, 
  Download, 
  Info,
  ChevronRight,
  ShieldCheck,
  ChevronDown,
  Clock,
  Search,
  Filter,
  Sparkles,
  Award,
  Database,
  ArrowRight,
  HelpCircle,
  Check,
  Lock,
  Compass,
  FileText,
  Terminal
} from 'lucide-react';
import { SCHOLARSHIPS_MOCK, STUDENT_MOCK } from '../constants';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import ContactSection from '../components/ContactSection';

interface QueryResult {
  columns: string[];
  rows: string[][];
}

const executeCardQuery = async (binding: any, connections: any[]): Promise<QueryResult | null> => {
  const connection = connections.find((c: any) => c.id === binding.connectionId);
  try {
    const res = await fetch('/api/sis/staging/execute-card-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection: connection || null, sqlQuery: binding.sqlQuery }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.columns || !data.rows) return null;
    const cols: string[] = data.columns;
    const rows: string[][] = data.rows.map((row: any) => cols.map((col: string) => String(row[col] ?? '')));
    return { columns: cols, rows };
  } catch {
    return null;
  }
};

const getRowValue = (result: QueryResult, colName: string, rowIndex = 0): string | undefined => {
  const idx = result.columns.findIndex(c => c.toLowerCase() === colName.toLowerCase());
  if (idx === -1 || !result.rows[rowIndex]) return undefined;
  return result.rows[rowIndex][idx];
};

const FinanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'billing' | 'scholarships'>('billing');
  const [selectedTermId, setSelectedTermId] = useState<string>('f24');
  
  // Dynamic data states
  const [bindings, setBindings] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('juc_card_sql_queries');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [connections, setConnections] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('juc_rdbms_connections');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [dynamicFees, setDynamicFees] = useState<any[]>([]);
  const [dynamicAid, setDynamicAid] = useState<any[]>([]);
  const [dynamicBalance, setDynamicBalance] = useState<number | null>(null);
  const [dynamicChartData, setDynamicChartData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [dynamicTerms, setDynamicTerms] = useState<{ id: string; term: string; year: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const [devModeActive, setDevModeActive] = useState<boolean>(() => {
    return localStorage.getItem('juc_finance_dev_mode') === 'true';
  });
  const [inspectingBinding, setInspectingBinding] = useState<any | null>(null);

  useEffect(() => {
    localStorage.setItem('juc_finance_dev_mode', String(devModeActive));
  }, [devModeActive]);

  const getConnectionLabel = (connId: string) => {
    if (connId === 'sis-production') {
      return 'Jericho SIS Production (Default Postgres Bridge)';
    }
    const found = connections.find(c => c.id === connId);
    return found ? `${found.name} (${found.dbType.toUpperCase()})` : 'Jericho SIS Production (Default Postgres Bridge)';
  };

  // Fetch dynamic data
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      const [feesResult, aidResult, balanceResult, costResult, termsResult] = await Promise.all([
        executeCardQuery(bindings.find(b => b.cardId === 'fin-fees'), connections),
        executeCardQuery(bindings.find(b => b.cardId === 'fin-aid'), connections),
        executeCardQuery(bindings.find(b => b.cardId === 'fin-balance'), connections),
        executeCardQuery(bindings.find(b => b.cardId === 'fin-cost-dist'), connections),
        executeCardQuery(bindings.find(b => b.cardId === 'terms'), connections),
      ]);

      if (feesResult && feesResult.rows.length > 0) {
        setDynamicFees(feesResult.rows.map((row, i) => ({
          id: `fee-${i}`,
          description: getRowValue(feesResult, 'description', i) || getRowValue(feesResult, 'fee_type', i) || '',
          type: getRowValue(feesResult, 'fee_type', i) || getRowValue(feesResult, 'description', i) || '',
          amount: parseFloat(getRowValue(feesResult, 'amount', i) || '0'),
        })));
      }

      if (aidResult && aidResult.rows.length > 0) {
        setDynamicAid(aidResult.rows.map((row, i) => ({
          id: `aid-${i}`,
          source: getRowValue(aidResult, 'aid_type', i) || getRowValue(aidResult, 'source', i) || '',
          status: getRowValue(aidResult, 'status', i) || '',
          amount: parseFloat(getRowValue(aidResult, 'amount', i) || '0'),
        })));
      }

      if (balanceResult && balanceResult.rows.length > 0) {
        const val = parseFloat(getRowValue(balanceResult, 'total_balance', 0) || getRowValue(balanceResult, 'outstanding_balance', 0) || '0');
        setDynamicBalance(val);
      }

      if (costResult && costResult.rows.length > 0) {
        const colors = ['#6366f1', '#8b5cf6', '#c7d2fe', '#a78bfa', '#818cf8'];
        setDynamicChartData(costResult.rows.map((row, i) => ({
          name: getRowValue(costResult, 'name', i) || getRowValue(costResult, 'fee_type', i) || '',
          value: parseFloat(getRowValue(costResult, 'value', i) || getRowValue(costResult, 'amount', i) || '0'),
          color: colors[i % colors.length],
        })));
      }

      if (termsResult && termsResult.rows.length > 0) {
        const terms = termsResult.rows.map((row, i) => ({
          id: getRowValue(termsResult, 'term_id', i) || `term-${i}`,
          term: getRowValue(termsResult, 'term', i) || getRowValue(termsResult, 'term_name', i) || `Term ${i}`,
          year: parseInt(getRowValue(termsResult, 'year', i) || getRowValue(termsResult, 'term_year', i) || '2024'),
        }));
        setDynamicTerms(terms);
      }
      setLoading(false);
    };
    fetchAll();
  }, [bindings, connections]);
  
  // Scholarship Finder State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [scholarshipList, setScholarshipList] = useState(SCHOLARSHIPS_MOCK);
  const [showDataSourceInfo, setShowDataSourceInfo] = useState(true);

  // Billing calculation
  const fees = dynamicFees;
  const aid = dynamicAid;
  const totalFees = fees.reduce((acc, curr) => acc + curr.amount, 0);
  const totalAid = aid.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = dynamicBalance !== null ? dynamicBalance : totalFees - totalAid;
  const chartData = dynamicChartData.length > 0 ? dynamicChartData : [];

  // Scholarship filter logic
  const filteredScholarships = scholarshipList.filter(sch => {
    // 1. Category match
    if (selectedCategory !== 'All' && sch.category !== selectedCategory) {
      return false;
    }
    // 2. Search query match
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = sch.name.toLowerCase().includes(query);
      const descMatch = sch.description.toLowerCase().includes(query);
      if (!nameMatch && !descMatch) return false;
    }
    // 3. Eligibility criteria toggle
    if (onlyEligible) {
      // GPA check
      if (STUDENT_MOCK.currentGpa < sch.minGpa) return false;
      // Major check (if specified)
      if (sch.majors && !sch.majors.includes(STUDENT_MOCK.major)) return false;
    }
    return true;
  });

  const handleApply = (id: string) => {
    setScholarshipList(prev => prev.map(sch => {
      if (sch.id === id) {
        return { ...sch, status: sch.status === 'Apply Now' ? 'Applied' : sch.status };
      }
      return sch;
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header and Tab Selection */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Finances & Scholarship</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Updated: June 05, 2026
            </span>
          </div>
          <p className="text-gray-500">Manage outstanding balances, view disbursements, and run smart scholarship matching.</p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex bg-gray-150 p-1 rounded-2xl border border-gray-200">
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'billing' 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <CreditCard size={14} />
            <span>Billing & Aid</span>
          </button>
          <button
            onClick={() => setActiveTab('scholarships')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'scholarships' 
                ? 'bg-white text-indigo-600 shadow-md' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Sparkles size={14} />
            <span>Smart Match Finder</span>
          </button>
        </div>
      </header>

      {/* Dev Mode Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 p-4 bg-purple-50/60 border border-purple-100 rounded-3xl animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-2xl">
            <Terminal size={18} className="animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 bg-purple-100/40 px-2 py-0.5 rounded-full block w-max">
              Developer SQL Sandbox Tool
            </span>
            <p className="text-xs font-black text-slate-800 mt-1">Database Queries Visual Overlay</p>
            <p className="text-[10px] text-slate-500">View real-time database queries & connection mappings bound to your UI cards.</p>
          </div>
        </div>
        <button
          onClick={() => setDevModeActive(!devModeActive)}
          className={`w-full sm:w-auto p-1.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            devModeActive 
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
              : 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-xs'
          }`}
        >
          {devModeActive ? 'Disable Overlay' : 'Toggle SQL Overlay'}
        </button>
      </div>

      {/* RENDER BILLING TAB */}
      {activeTab === 'billing' && (
        <>
          {/* Term Filter only applicable for account statement */}
          <div className={`flex justify-end ${devModeActive ? 'border-2 border-dashed border-purple-300 bg-purple-50/10 p-1.5 rounded-2xl' : ''}`}>
            <div className="relative inline-block text-left w-full md:w-64">
              {devModeActive && (
                <button
                  onClick={() => setInspectingBinding(bindings.find(b => b.cardId === 'terms'))}
                  className="absolute -top-3.5 right-2 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 cursor-pointer z-20 whitespace-nowrap"
                >
                  <Terminal size={8} />
                  <span>SPEC</span>
                </button>
              )}
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Billing Period</label>
              <div className="relative group">
                <select 
                  value={selectedTermId}
                  onChange={(e) => setSelectedTermId(e.target.value)}
                  className="appearance-none w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {dynamicTerms.length > 0 ? (
                    dynamicTerms.map(sem => (
                      <option key={sem.id} value={sem.id}>{sem.term} {sem.year}</option>
                    ))
                  ) : (
                    <option value="f24">Fall 2024 (Current)</option>
                  )}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
              {devModeActive && (
                <span 
                  className="text-[8px] font-semibold text-purple-700 font-mono block text-left mt-1 whitespace-nowrap truncate cursor-help"
                  title={getConnectionLabel(bindings.find(b => b.cardId === 'terms')?.connectionId)}
                >
                  {getConnectionLabel(bindings.find(b => b.cardId === 'terms')?.connectionId)}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden ${devModeActive ? 'ring-2 ring-purple-300 ring-dashed' : ''}`}>
              {devModeActive && (
                <button
                  onClick={() => setInspectingBinding(bindings.find(b => b.cardId === 'fin-balance'))}
                  className="absolute mt-2 ml-2 p-1 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[8px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 cursor-pointer z-10"
                >
                  <Terminal size={9} />
                  <span>SQL INSPECT</span>
                </button>
              )}
              <div className="p-8 bg-indigo-900 text-white">
                {devModeActive && (
                  <span className="text-[8px] font-bold text-purple-300 font-mono block mb-2">
                    {getConnectionLabel(bindings.find(b => b.cardId === 'fin-balance')?.connectionId)}
                  </span>
                )}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Total Outstanding Balance</p>
                    <p className="text-4xl font-black">${balance.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <CreditCard size={28} />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button disabled className="flex-1 bg-white/30 text-indigo-300 py-3 rounded-xl font-bold cursor-not-allowed opacity-50">
                    Make a Payment
                  </button>
                  <button disabled className="flex-1 bg-indigo-800/30 text-white/50 py-3 rounded-xl font-bold border border-indigo-700/30 cursor-not-allowed opacity-50">
                    Payment Plans
                  </button>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Fee Breakdown</h3>
                  <button className="text-indigo-600 text-sm font-semibold flex items-center space-x-1 hover:underline">
                    <Download size={14} />
                    <span>Statement</span>
                  </button>
                </div>
                <div className="space-y-4">
                  {fees.map((fee) => (
                    <div key={fee.id} className="flex justify-between items-center py-2 border-b border-gray-50">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{fee.description}</p>
                        <p className="text-xs text-gray-400">{fee.type}</p>
                      </div>
                      <span className="font-bold text-gray-900">${fee.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4">
                    <span className="font-black text-gray-400">TOTAL CHARGES</span>
                    <span className="text-xl font-black text-gray-900">${totalFees.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Aid Breakdown */}
            <div className="space-y-6">
              <div className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative ${devModeActive ? 'ring-2 ring-purple-300 ring-dashed' : ''}`}>
                {devModeActive && (
                  <button
                    onClick={() => setInspectingBinding(bindings.find(b => b.cardId === 'fin-cost-dist'))}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[8px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 cursor-pointer z-10"
                  >
                    <Terminal size={9} />
                    <span>SQL INSPECT</span>
                  </button>
                )}
                <h3 className="font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <PieChart size={18} className="text-indigo-600" />
                  <span>Cost Distribution</span>
                </h3>
                {devModeActive && (
                  <span className="text-[8px] font-bold text-purple-700 font-mono block mb-2">
                    {getConnectionLabel(bindings.find(b => b.cardId === 'fin-cost-dist')?.connectionId)}
                  </span>
                )}
                <div className="h-48 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {chartData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-gray-500">{item.name}</span>
                      </div>
                      <span className="font-bold">${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`bg-green-50 p-6 rounded-3xl border border-green-100 relative ${devModeActive ? 'ring-2 ring-purple-300 ring-dashed' : ''}`}>
                {devModeActive && (
                  <button
                    onClick={() => setInspectingBinding(bindings.find(b => b.cardId === 'fin-aid'))}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[8px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 cursor-pointer z-10"
                  >
                    <Terminal size={9} />
                    <span>SQL INSPECT</span>
                  </button>
                )}
                <div className="flex items-center space-x-2 text-green-700 mb-4">
                  <ShieldCheck size={20} />
                  <h3 className="font-bold">Financial Aid Awarded</h3>
                </div>
                {devModeActive && (
                  <span className="text-[8px] font-bold text-purple-700 font-mono block mb-2">
                    {getConnectionLabel(bindings.find(b => b.cardId === 'fin-aid')?.connectionId)}
                  </span>
                )}
                <div className="space-y-4">
                  {aid.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-green-900">{item.source}</p>
                        <p className="text-[10px] text-green-600 font-bold uppercase">{item.status}</p>
                      </div>
                      <span className="font-bold text-green-800">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-green-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-green-700">TOTAL AID</span>
                    <span className="text-lg font-black text-green-900">${totalAid.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Helpful Tips / Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Tax Forms (1098-T)', desc: 'View and print your annual tax forms.', icon: DollarSign },
              { title: 'Refund Status', desc: 'Track any pending tuition refunds.', icon: Info },
              { title: 'Direct Deposit', desc: 'Manage where your aid is disbursed.', icon: CreditCard },
            ].map((item, i) => (
              <button key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl transition-colors">
                    <item.icon size={20} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* RENDER SCHOLARSHIPS & FINDER TAB */}
      {activeTab === 'scholarships' && (
        <div className="space-y-8">
          
          {/* Real-time Dynamic Student Merit Profile Summary Card */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
              <Sparkles size={200} />
            </div>
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex items-center space-x-2 bg-indigo-500/20 w-fit px-3.5 py-1.5 rounded-full border border-indigo-400/20">
                <Sparkles size={14} className="text-indigo-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">AI-Powered Smart Match Profile</span>
              </div>
              <h2 className="text-2xl font-black">Find Scholarships Tailored To You</h2>
              <p className="text-indigo-200 text-sm max-w-xl">
                The smart search matches your live academic profile against available internal funds, donor endowments, and certified exterior programs.
              </p>

              {/* Verified Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-indigo-700/50">
                <div>
                  <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Student Name</p>
                  <p className="font-bold text-sm">{STUDENT_MOCK.name}</p>
                </div>
                <div>
                  <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Current GPA</p>
                  <div className="flex items-center space-x-1">
                    <p className="font-bold text-sm">{STUDENT_MOCK.currentGpa}</p>
                    <span className="text-[10px] px-1.5 py-0.2 bg-green-500/20 text-green-300 font-bold rounded">High Merit</span>
                  </div>
                </div>
                <div>
                  <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Primary Major</p>
                  <p className="font-bold text-sm truncate" title={STUDENT_MOCK.major}>{STUDENT_MOCK.major}</p>
                </div>
                <div>
                  <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider">Degree Division</p>
                  <p className="font-bold text-sm">Undergraduate (Yr {STUDENT_MOCK.year})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Search & Categories Controller Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Query search input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by keywords, sponsors, or criteria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all tracking-normal font-medium text-gray-800"
                />
              </div>

              {/* Strict matching eligibility check controller */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setOnlyEligible(!onlyEligible)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-2xl border transition-all text-xs font-bold leading-none ${
                    onlyEligible 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Filter size={14} />
                  <span>Only Show My Perfect Fits</span>
                </button>
              </div>
            </div>

            {/* Quick Categories Bar */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
              {['All', 'Academic', 'STEM', 'Need-Based', 'Diversity'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Source System / Data Lineage explanation card */}
          {showDataSourceInfo && (
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 text-amber-900 relative">
              <button 
                onClick={() => setShowDataSourceInfo(false)} 
                className="absolute top-4 right-4 text-xs font-bold hover:underline text-amber-700 hover:text-amber-950 uppercase tracking-widest"
              >
                Dismiss
              </button>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl mt-0.5">
                  <Database size={20} />
                </div>
                <div className="space-y-2 max-w-3xl">
                  <h3 className="font-black text-sm tracking-tight">Interactive Scholarship Data Source Guide</h3>
                  <p className="text-xs text-amber-850 leading-relaxed">
                    This finder demonstrates true data integration by pulling opportunities securely across three core institutional data realms:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="bg-white/50 p-3 rounded-xl border border-amber-200/50">
                      <p className="font-bold text-xs text-amber-950 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        1. SIS Database
                      </p>
                      <p className="text-[10px] text-amber-800 leading-tight mt-1">
                        Pulls internal merit awards, tuition cuts, and GPA threshold metrics directly from student record databases.
                      </p>
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl border border-amber-200/50">
                      <p className="font-bold text-xs text-amber-950 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                        2. CRM System
                      </p>
                      <p className="text-[10px] text-amber-800 leading-tight mt-1">
                        Queries active private donor allocations, corporate sponsorships, and alumni endowment portfolios.
                      </p>
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl border border-amber-200/50">
                      <p className="font-bold text-xs text-amber-950 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        3. External APIs
                      </p>
                      <p className="text-[10px] text-amber-800 leading-tight mt-1">
                        Connects with state education boards and federal scholarship boards using real-time secure network requests.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Opportunities List */}
          <div className="space-y-4">
            <h3 className="font-black text-gray-900 text-sm tracking-widest uppercase">
              Available Opportunities ({filteredScholarships.length})
            </h3>

            {filteredScholarships.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredScholarships.map((opportunity) => {
                  const meetsGpa = STUDENT_MOCK.currentGpa >= opportunity.minGpa;
                  const meetsMajor = !opportunity.majors || opportunity.majors.includes(STUDENT_MOCK.major);
                  const isFullyEligible = meetsGpa && meetsMajor;

                  return (
                    <div 
                      key={opportunity.id} 
                      className={`bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden ${
                        !isFullyEligible ? 'opacity-80 bg-gray-50/50' : ''
                      }`}
                    >
                      {/* Left Block: Match Score & Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          
                          {/* Smart Match score accent */}
                          <div className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 text-xs font-black">
                            <Sparkles size={12} className="text-indigo-500" />
                            <span>{opportunity.smartMatchScore}% Score Match</span>
                          </div>

                          {/* Source Tag identifier */}
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                            opportunity.sourceSystem === 'SIS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            opportunity.sourceSystem === 'CRM' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            'bg-green-50 text-green-600 border-green-100'
                          }`}>
                            via {opportunity.sourceSystem}
                          </span>

                          {/* Category Tag */}
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded">
                            {opportunity.category}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-gray-900 leading-snug">{opportunity.name}</h4>
                          <p className="text-xs text-gray-500 leading-relaxed mt-1 max-w-2xl">{opportunity.description}</p>
                        </div>

                        {/* Eligibility details list */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <span className="flex items-center">
                            <Award size={12} className="mr-1 text-gray-400" />
                            Min GPA: {opportunity.minGpa} 
                            {meetsGpa ? (
                              <span className="ml-1.5 text-green-600 bg-green-50 px-1 rounded font-black">✓ Handled</span>
                            ) : (
                              <span className="ml-1.5 text-red-600 bg-red-50 px-1 rounded font-black">Requires {opportunity.minGpa}</span>
                            )}
                          </span>

                          {opportunity.majors && (
                            <span className="flex items-center">
                              <Compass size={12} className="mr-1 text-gray-400" />
                              Target: {opportunity.majors.join(', ')}
                              {meetsMajor ? (
                                <span className="ml-1.5 text-green-600 bg-green-50 px-1 rounded font-black">✓ Matches</span>
                              ) : (
                                <span className="ml-1.5 text-red-600 bg-red-50 px-1 rounded font-black">No Match</span>
                              )}
                            </span>
                          )}

                          <span className="flex items-center">
                            <Clock size={12} className="mr-1 text-gray-400" />
                            Deadline: {new Date(opportunity.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                          </span>
                        </div>
                      </div>

                      {/* Right Block: Amount & CTA */}
                      <div className="flex sm:flex-row md:flex-col items-start md:items-end md:text-right justify-between w-full md:w-fit gap-4 border-t md:border-t-0 border-gray-105 pt-4 md:pt-0 self-stretch md:self-auto">
                        <div>
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Estimated Value</p>
                          <p className="text-2xl font-black text-indigo-700">${opportunity.amount.toLocaleString()}</p>
                        </div>

                        <div>
                          {opportunity.status === 'Applied' ? (
                            <span className="flex items-center justify-center space-x-1.5 px-6 py-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl w-full text-xs font-black tracking-widest uppercase">
                              <Check size={14} />
                              <span>Applied</span>
                            </span>
                          ) : opportunity.status === 'In Progress' ? (
                            <span className="flex items-center justify-center space-x-1.5 px-6 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl w-full text-xs font-black tracking-widest uppercase">
                              <Clock size={14} className="animate-pulse" />
                              <span>In Progress</span>
                            </span>
                          ) : opportunity.status === 'Closed' ? (
                            <span className="flex items-center justify-center space-x-1.5 px-6 py-3 bg-gray-150 text-gray-400 border border-gray-200 rounded-2xl w-full text-xs font-black tracking-widest uppercase">
                              <Lock size={12} />
                              <span>Closed</span>
                            </span>
                          ) : isFullyEligible ? (
                            <button
                              onClick={() => handleApply(opportunity.id)}
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black tracking-widest uppercase shadow-md shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center space-x-2 w-full"
                            >
                              <span>Apply Now</span>
                              <ArrowRight size={14} />
                            </button>
                          ) : (
                            <span className="flex items-center justify-center space-x-1.5 px-4 py-3 bg-red-50 text-red-700 border border-red-100 rounded-2xl w-full text-[10px] font-black tracking-wider uppercase" title="You do not meet GPA/major requirements">
                              <Lock size={12} />
                              <span>Not Eligible</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center flex flex-col items-center">
                <HelpCircle size={48} className="text-gray-300 mb-4 animate-bounce" />
                <h4 className="font-bold text-gray-800 text-base mb-1">No Matching Scholarships Found</h4>
                <p className="text-gray-500 text-xs max-w-sm">Try broadening your search keyword or switching categories.</p>
              </div>
            )}
          </div>

          {/* Quick FAQ / Info Board */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black text-gray-900">How is my match score calculated?</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                  Our system evaluates your live cumulative GPA, active major, minor, and credit count from the SIS against scholarship criteria defined by academic leaders and global donor circles.
                </p>
              </div>
              <div>
                <p className="text-xs font-black text-gray-900">Where can I check exterior scholarship details?</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                  Private external program data is gathered securely using our federal integration API pipelines. Applications are routed through the college's secure aid terminal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Inspector Overlay Modal */}
      {inspectingBinding && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-left">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center font-mono">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-purple-400" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">
                  SQL Source Binding Inspector
                </h3>
              </div>
              <button
                onClick={() => setInspectingBinding(null)}
                className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block animate-fade-in">Component Target Card</span>
                <p className="text-sm font-black text-slate-900">{inspectingBinding.cardName}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-xs">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Bounded Connection</span>
                  <span className="font-black text-indigo-650 truncate block" title={getConnectionLabel(inspectingBinding.connectionId)}>
                    {getConnectionLabel(inspectingBinding.connectionId)}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-xs text-left">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Binding Mode</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    <span>Dynamic SQL Map</span>
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-left relative">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block mb-1">
                  Active SQL Credentials Query Statement
                </span>
                <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-850 font-mono text-xs overflow-x-auto select-all shadow-inner leading-relaxed max-h-[160px] overflow-y-auto">
                  <pre className="font-mono">{inspectingBinding.sqlQuery}</pre>
                </div>
              </div>
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-[11px] text-indigo-950">
                <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-snug text-slate-650">
                  This SQL statement is mapped to target your localized MSSQL server instance schemas. 
                  You can update this code syntax anytime in the <strong>Source Connectivity</strong> developer manager console page.
                </p>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setInspectingBinding(null)}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Confirm & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Office Contact section */}
      <ContactSection department="finances" />
    </div>
  );
};

export default FinanceDashboard;
