
import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  GraduationCap, 
  AlertCircle,
  TrendingUp,
  Clock,
  ExternalLink,
  ShieldCheck,
  Ban,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { STUDENT_MOCK, APPOINTMENTS_MOCK, CURRENT_COURSES, MEDICAL_MOCK, CONTACTS_MOCK, AID_MOCK } from '../constants';
import { useCollegeBranding } from '../brandingConfig';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

const gpaData = [
  { term: 'F22', gpa: 3.2 },
  { term: 'S23', gpa: 3.5 },
  { term: 'F23', gpa: 3.9 },
  { term: 'S24', gpa: 3.75 },
];

const Dashboard: React.FC = () => {
  const { activeCollege } = useCollegeBranding();
  const missingMedical = MEDICAL_MOCK.requirements.filter(r => r.status === 'Pending').length;
  const totalAid = AID_MOCK.reduce((acc, curr) => acc + curr.amount, 0);

  // Custom theme variables
  const chartColor = activeCollege.id === 'PROMETHEUS' ? '#f59e0b' : activeCollege.id === 'HORIZON' ? '#10b981' : activeCollege.id === 'VANGUARD' ? '#a855f7' : '#6366f1';
  const chartBg = activeCollege.id === 'PROMETHEUS' ? '#fde68a' : activeCollege.id === 'HORIZON' ? '#a7f3d0' : activeCollege.id === 'VANGUARD' ? '#e9d5ff' : '#c7d2fe';

  const heroStats = [
    { label: 'Cumulative GPA', value: STUDENT_MOCK.currentGpa, subtext: 'Overall', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Credits Earned', value: STUDENT_MOCK.totalCredits, subtext: 'Total', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { 
      label: 'Admissions Status', 
      value: 'Admitted', 
      subtext: `${CURRENT_COURSES.term} ${CURRENT_COURSES.year}`, 
      icon: AlertCircle, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'Total Financial Aid', 
      value: `$${totalAid.toLocaleString()}`, 
      subtext: `${CURRENT_COURSES.term} ${CURRENT_COURSES.year}`, 
      icon: Wallet, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {STUDENT_MOCK.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500">Here's what's happening with your academic profile today.</p>
        </div>
        <div className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100/50 px-3 py-1.5 rounded-full uppercase tracking-widest self-start md:self-center">
          <Clock size={12} className="mr-1.5" />
          Last Updated: Oct 21, 2024
        </div>
      </header>

      {/* Global Alerts Section */}
      <div className="space-y-4">
        {/* Academic Hold Alert */}
        <div className="bg-rose-50 border border-rose-200 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center space-x-4 text-left">
            <div className="bg-rose-100 p-3 rounded-xl">
              <Ban className="text-rose-600" size={28} />
            </div>
            <div>
              <h3 className="font-bold text-rose-900 text-lg leading-tight">Academic Hold Detected</h3>
              <p className="text-rose-700 text-sm">
                A hold was placed on your account starting <span className="font-bold">Oct 15, 2024</span>. 
                Please contact the <span className="font-bold underline decoration-rose-300">{activeCollege.contacts.academics.dept}</span> to resolve this.
              </p>
            </div>
          </div>
          <button className="w-full md:w-auto px-8 bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition-colors shadow-md whitespace-nowrap text-center">
            View Hold Details
          </button>
        </div>

        {/* School Fee Alert */}
        <div className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-2xl shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Subtle colored ambient glow at the corner */}
          <div className={`absolute right-0 top-0 w-32 h-32 opacity-25 blur-3xl rounded-full pointer-events-none ${
            activeCollege.id === 'PROMETHEUS' ? 'bg-amber-500' : activeCollege.id === 'HORIZON' ? 'bg-emerald-500' : activeCollege.id === 'VANGUARD' ? 'bg-purple-500' : 'bg-indigo-500'
          }`}></div>
          
          <div className="flex items-center space-x-4 text-left z-10">
            <div className={`p-3 rounded-xl ${
              activeCollege.id === 'PROMETHEUS' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 
              activeCollege.id === 'HORIZON' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 
              activeCollege.id === 'VANGUARD' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 
              'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
            }`}>
              <AlertCircle size={28} />
            </div>
            <div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                activeCollege.id === 'PROMETHEUS' ? 'text-amber-400' : activeCollege.id === 'HORIZON' ? 'text-emerald-400' : activeCollege.id === 'VANGUARD' ? 'text-purple-400' : 'text-indigo-400'
              }`}>Financial Action Required &bull; Account Balance</span>
              <h3 className="font-extrabold text-lg text-white mt-0.5">Outstanding Tuition & Fees</h3>
              <p className="text-slate-300 text-sm mt-1">You have an outstanding balance of <span className="font-bold text-white">$8,420</span>. Pay before Oct 30 to prevent administrative hold in your {activeCollege.shortName} account.</p>
            </div>
          </div>
          <Link 
            to="/finances" 
            className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-200 shadow-md hover:scale-[1.02] text-center z-10 ${
              activeCollege.id === 'PROMETHEUS' ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/10' : 
              activeCollege.id === 'HORIZON' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10' : 
              activeCollege.id === 'VANGUARD' ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/10' : 
              'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
            }`}
          >
            Review & Pay Now
          </Link>
        </div>

        {/* Medical Document Alert */}
        {missingMedical > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 md:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 text-left">
              <div className="bg-amber-100 p-3 rounded-xl">
                <ShieldCheck className="text-amber-600" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-lg leading-tight">Medical Clearance Required</h3>
                <p className="text-amber-700 text-sm">You have {missingMedical} pending medical/vaccination form(s). Please upload them to avoid registration holds.</p>
              </div>
            </div>
            <Link to="/medical" className="w-full md:auto px-8 bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-700 transition-colors shadow-md whitespace-nowrap text-center">
              Complete Profile
            </Link>
          </div>
        )}
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {heroStats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 min-w-0">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl shrink-0`}>
              <stat.icon size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight truncate">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 truncate">{stat.value}</p>
              <p className={`text-[10px] font-semibold ${activeCollege.colors.primaryText} truncate`}>{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA Progress Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center space-x-2">
              <TrendingUp size={18} className="text-indigo-600" />
              <span>Academic Performance</span>
            </h3>
            <select className="text-sm border-none bg-gray-50 rounded-lg px-2 py-1 outline-none text-gray-600 focus:ring-0">
              <option>Last 4 Semesters</option>
              <option>Full History</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gpaData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis domain={[0, 4.5]} hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="gpa" radius={[6, 6, 0, 0]} barSize={40}>
                  <LabelList 
                    dataKey="gpa" 
                    position="top" 
                    offset={10}
                    style={{ fill: chartColor, fontSize: '12px', fontWeight: 'bold' }} 
                  />
                  {gpaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === gpaData.length - 1 ? chartColor : chartBg} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Up Next / Notifications */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Calendar size={18} className="text-indigo-600" />
              <span>Upcoming Schedule</span>
            </h3>
            <div className="space-y-4">
              {APPOINTMENTS_MOCK.map((appt) => (
                <div key={appt.id} className="group p-3 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 cursor-pointer">
                  <p className="text-xs font-medium text-indigo-600 mb-1">{appt.date} • {appt.time}</p>
                  <p className="text-sm font-bold text-gray-800">{appt.type}</p>
                  <p className="text-xs text-gray-500">{appt.location}</p>
                </div>
              ))}
              <button className="w-full text-center py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 border-t border-gray-100 mt-2 pt-4">
                View Full Calendar
              </button>
            </div>
          </div>
          
          {/* Quick Support / Reminder Box */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">Campus Tip</h3>
            <p className="text-sm text-gray-500">Registration for Spring 2025 begins in 3 weeks. Check your degree audit today.</p>
            <button className={`mt-4 text-sm font-bold hover:underline ${activeCollege.colors.primaryText}`}>Degree Audit Link</button>
          </div>
        </div>
      </div>

      {/* Current Courses */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800">In-Progress Courses ({CURRENT_COURSES.term} {CURRENT_COURSES.year})</h3>
          <button className={`text-sm font-semibold flex items-center space-x-1 hover:underline ${activeCollege.colors.primaryText}`}>
            <span>Course Catalog</span>
            <ExternalLink size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CURRENT_COURSES.courses.map((course) => (
            <div key={course.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className={`${activeCollege.colors.primaryBg} ${activeCollege.colors.primaryText} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase`}>{course.code}</span>
                <span className="text-gray-400 text-xs">{course.credits} Credits</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{course.name}</h4>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="h-full rounded-full w-2/3" style={{ backgroundColor: chartColor }}></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium">65% Progress</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
