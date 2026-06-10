import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { FEES_MOCK, AID_MOCK, SEMESTERS_MOCK, SCHOLARSHIPS_MOCK, STUDENT_MOCK } from '../constants';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import ContactSection from '../components/ContactSection';

const FinanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'billing' | 'scholarships'>('billing');
  const [selectedTermId, setSelectedTermId] = useState<string>('f24'); // Defaulting to current
  
  // Scholarship Finder State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [scholarshipList, setScholarshipList] = useState(SCHOLARSHIPS_MOCK);
  const [showDataSourceInfo, setShowDataSourceInfo] = useState(true);

  // Billing calculation
  const totalFees = FEES_MOCK.reduce((acc, curr) => acc + curr.amount, 0);
  const totalAid = AID_MOCK.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalFees - totalAid;

  const chartData = [
    { name: 'Tuition', value: 12500, color: '#6366f1' },
    { name: 'Housing', value: 4500, color: '#8b5cf6' },
    { name: 'Other', value: 1650, color: '#c7d2fe' },
  ];

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

      {/* RENDER BILLING TAB */}
      {activeTab === 'billing' && (
        <>
          {/* Term Filter only applicable for account statement */}
          <div className="flex justify-end">
            <div className="relative inline-block text-left w-full md:w-64">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Billing Period</label>
              <div className="relative group">
                <select 
                  value={selectedTermId}
                  onChange={(e) => setSelectedTermId(e.target.value)}
                  className="appearance-none w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="f24">Fall 2024 (Current)</option>
                  {SEMESTERS_MOCK.map(sem => (
                    <option key={sem.id} value={sem.id}>{sem.term} {sem.year}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 bg-indigo-900 text-white">
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
                  <button className="flex-1 bg-white text-indigo-900 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                    Make a Payment
                  </button>
                  <button className="flex-1 bg-indigo-800 text-white py-3 rounded-xl font-bold border border-indigo-700 hover:bg-indigo-700 transition-colors">
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
                  {FEES_MOCK.map((fee) => (
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
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center space-x-2">
                  <PieChart size={18} className="text-indigo-600" />
                  <span>Cost Distribution</span>
                </h3>
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

              <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                <div className="flex items-center space-x-2 text-green-700 mb-4">
                  <ShieldCheck size={20} />
                  <h3 className="font-bold">Financial Aid Awarded</h3>
                </div>
                <div className="space-y-4">
                  {AID_MOCK.map((aid) => (
                    <div key={aid.id} className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-green-900">{aid.source}</p>
                        <p className="text-[10px] text-green-600 font-bold uppercase">{aid.status}</p>
                      </div>
                      <span className="font-bold text-green-800">${aid.amount.toLocaleString()}</span>
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

      {/* Main Office Contact section */}
      <ContactSection department="finances" />
    </div>
  );
};

export default FinanceDashboard;
