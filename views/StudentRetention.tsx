
import React from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  UserX, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ChevronRight,
  Target,
  Mail,
  Calendar,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { RETENTION_MOCK, STUDENT_MOCK, CURRENT_USER_ROLE } from '../constants';
import ContactSection from '../components/ContactSection';

const StudentRetention: React.FC = () => {
  if (CURRENT_USER_ROLE === 'Student') {
    return (
      <div className="flex items-center justify-center h-full text-center p-12">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md">
          <ShieldAlert className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-black text-red-900 mb-2">Access Restricted</h2>
          <p className="text-red-700 text-sm">
            This analytical section is only available to Faculty and Admin accounts. 
            Please contact IT if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const { confidence, riskLevel, factors, trend } = RETENTION_MOCK;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Student Retention Analytics</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Updated: Oct 22, 2024
            </span>
          </div>
          <p className="text-gray-500">Predictive dropout risk analysis for {STUDENT_MOCK.name}.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all">
            <Target size={18} />
            <span>Update Profile</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Score Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">Dropout Risk Confidence</p>
          
          <div className="relative w-40 h-40 flex items-center justify-center mb-6 z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * confidence) / 100}
                className={`${
                  riskLevel === 'Low' ? 'text-green-500' : 
                  riskLevel === 'Medium' ? 'text-amber-500' : 'text-red-500'
                } transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-gray-900">{confidence}%</span>
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                riskLevel === 'Low' ? 'text-green-600' : 'text-amber-600'
              }`}>
                {riskLevel} Risk
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-8 relative z-10">
            Based on current academic performance, financial status, and behavioral data.
          </p>
          
          <div className="w-full grid grid-cols-2 gap-4 relative z-10">
            <button className="flex items-center justify-center space-x-2 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <Mail size={16} className="text-indigo-600" />
              <span className="text-xs font-bold text-gray-700">Message</span>
            </button>
            <button className="flex items-center justify-center space-x-2 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <Calendar size={16} className="text-indigo-600" />
              <span className="text-xs font-bold text-gray-700">Intervene</span>
            </button>
          </div>

          {/* Background decoration */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50/30 rounded-full blur-2xl"></div>
        </div>

        {/* Confidence Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-gray-800 flex items-center space-x-2">
              <TrendingUp size={20} className="text-indigo-600" />
              <span>Risk Probability Trend</span>
            </h3>
            <span className="text-xs font-medium text-gray-400">Past 90 Days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value}%`, 'Dropout Risk']}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-xs text-center text-gray-400 italic">
            Risk increased slightly in October due to unresolved financial holds.
          </p>
        </div>
      </div>

      {/* Analysis Factors */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center space-x-2">
            <Info size={18} className="text-indigo-600" />
            <span>Contributing Risk Factors</span>
          </h3>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Engine v4.2</span>
        </div>
        <div className="divide-y divide-gray-50">
          {factors.map((factor, i) => (
            <div key={i} className="p-8 flex items-start space-x-6 hover:bg-gray-50/30 transition-colors">
              <div className={`p-3 rounded-2xl ${
                factor.impact === 'Positive' ? 'bg-green-100 text-green-600' :
                factor.impact === 'Negative' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {factor.impact === 'Positive' ? <CheckCircle2 size={24} /> : 
                 factor.impact === 'Negative' ? <UserX size={24} /> : <AlertCircle size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-gray-900">{factor.name}</h4>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                    factor.impact === 'Positive' ? 'bg-green-50 text-green-700' :
                    factor.impact === 'Negative' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                  }`}>
                    {factor.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{factor.description}</p>
              </div>
              <button className="text-gray-300 hover:text-indigo-600 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Guidance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
          <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <ShieldAlert size={20} className="text-indigo-400" />
            <span>Recommended Actions</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-sm text-indigo-100">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
              <p>Schedule a bursar meeting to discuss the $8,420 balance.</p>
            </div>
            <div className="flex items-start space-x-3 text-sm text-indigo-100">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
              <p>Monitor "Ethics in Tech" attendance (currently 78% in Graph Theory).</p>
            </div>
            <div className="flex items-start space-x-3 text-sm text-indigo-100">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
              <p>Advise on internship opportunities to reinforce career connection.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Retention Benchmark</h3>
          <p className="text-sm text-gray-500 mb-6">
            Alex is currently 15% <span className="text-green-600 font-bold">below</span> the average risk threshold for Computer Science Juniors.
          </p>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div className="bg-indigo-600 h-full w-[12.5%]" style={{ width: '12.5%' }}></div>
          </div>
          <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Student Risk</span>
            <span>Program Avg (28%)</span>
          </div>
        </div>
      </div>

      <ContactSection department="advising" />
    </div>
  );
};

export default StudentRetention;
