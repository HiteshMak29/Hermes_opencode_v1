
import React, { useState, useEffect } from 'react';
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
  Clock,
  BrainCircuit,
  Activity,
  DollarSign,
  GraduationCap,
  Loader2
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
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  STUDENT_MOCK, 
  CURRENT_USER_ROLE, 
  SEMESTERS_MOCK, 
  CURRENT_COURSES, 
  FEES_MOCK, 
  AID_MOCK 
} from '../constants';
import ContactSection from '../components/ContactSection';


interface RiskFactor {
  name: string;
  impact: string;
  description: string;
  category?: string;
  details?: string;
}

interface RiskAnalysis {
  confidence: number;
  riskLevel: string;
  riskScore: number;
  summary: string;
  factors: RiskFactor[];
  trend: { month: string; score: number }[];
  recommendations: string[];
}

const DEFAULT_ANALYSIS: RiskAnalysis = {
  confidence: 0,
  riskLevel: '',
  riskScore: 0,
  summary: '',
  factors: [],
  trend: [],
  recommendations: []
};

const PredictiveDetection: React.FC = () => {
  const [analysis, setAnalysis] = useState<RiskAnalysis>(DEFAULT_ANALYSIS);
  const [loading, setLoading] = useState(false);

  if (CURRENT_USER_ROLE === 'Student') {
    return (
      <div className="flex items-center justify-center h-full text-center p-12">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 max-w-md">
          <ShieldAlert className="text-red-600 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-black text-red-900 mb-2">Access Restricted</h2>
          <p className="text-red-700 text-sm">
            This predictive analysis module is only available to Faculty and Admin accounts. 
            Please contact IT if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">Running ML Model...</h3>
          <p className="text-sm text-gray-500">Analyzing GPA trends, attendance patterns, and financial stress indicators.</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-500';
      case 'Medium': return 'text-amber-500';
      case 'High': return 'text-orange-500';
      case 'Critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'Positive': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'Negative': return <UserX className="text-red-500" size={20} />;
      default: return <AlertCircle className="text-amber-500" size={20} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <BrainCircuit className="text-indigo-600" size={28} />
            <h1 className="text-2xl font-bold text-gray-900">Predictive At-Risk Detection</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Activity size={10} className="mr-1" />
              Live AI Inference
            </span>
          </div>
          <p className="text-gray-500">Advanced ML model flagging students likely to drop out based on multi-dimensional data.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
          >
            <Clock size={16} />
            <span>Re-run Analysis</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all">
            <Target size={18} />
            <span>Intervention Plan</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Risk Score Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">Risk Probability Score</p>
          
          <div className="relative w-48 h-48 flex items-center justify-center mb-6 z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="85"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="96"
                cy="96"
                r="85"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={534}
                strokeDashoffset={534 - (534 * analysis.riskScore) / 100}
                className={`${getRiskColor(analysis.riskLevel)} transition-all duration-1000 ease-out`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-gray-900">{analysis.riskScore}%</span>
              <span className={`text-xs font-black uppercase tracking-wider ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel} Risk
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 w-full mb-6 relative z-10">
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "{analysis.summary}"
            </p>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-3 relative z-10">
            <button className="flex items-center justify-center space-x-2 py-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
              <Mail size={16} className="text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700">Email Student</span>
            </button>
            <button className="flex items-center justify-center space-x-2 py-3 bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
              <Calendar size={16} className="text-white" />
              <span className="text-xs font-bold text-white">Schedule Meeting</span>
            </button>
          </div>

          {/* Background decoration */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-50/30 rounded-full blur-3xl"></div>
        </div>

        {/* Factors & Insights */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <GraduationCap size={20} />
                </div>
                <h4 className="font-bold text-gray-800">Academic Trend</h4>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SEMESTERS_MOCK}>
                    <Line type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-black mt-2">GPA Stability: High</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Activity size={20} />
                </div>
                <h4 className="font-bold text-gray-800">Attendance Rate</h4>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CURRENT_COURSES.courses}>
                    <Bar dataKey="attendance" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-black mt-2">Avg Attendance: 85%</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-xl">
                  <DollarSign size={20} />
                </div>
                <h4 className="font-bold text-gray-800">Financial Stress</h4>
              </div>
              <div className="flex flex-col justify-center h-32">
                <div className="text-2xl font-black text-gray-900">$8,420</div>
                <p className="text-xs text-gray-500">Outstanding Balance</p>
                <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[65%]"></div>
                </div>
                <p className="text-[10px] text-red-500 font-black mt-1 uppercase">High Priority</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center space-x-2">
                <Info size={18} className="text-indigo-600" />
                <span>AI-Driven Risk Factors</span>
              </h3>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model: Gemini-3-Flash</span>
            </div>
            <div className="divide-y divide-gray-50">
              {analysis.factors.map((factor, i) => (
                <div key={i} className="p-6 flex items-start space-x-4 hover:bg-gray-50/30 transition-colors">
                  <div className="mt-1">{getImpactIcon(factor.impact)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-gray-900">{factor.category}</h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                        factor.impact === 'Positive' ? 'bg-green-50 text-green-700' :
                        factor.impact === 'Negative' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                      }`}>
                        {factor.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{factor.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
          <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
            <ShieldAlert size={20} className="text-indigo-400" />
            <span>Recommended Interventions</span>
          </h3>
          <div className="space-y-4">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                  0{i + 1}
                </div>
                <p className="text-sm text-indigo-100">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <TrendingUp size={20} className="text-indigo-600" />
            <span>Peer Benchmark Analysis</span>
          </h3>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">GPA vs Program Average</span>
                <span className="font-bold text-green-600">+0.42 Above</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Attendance vs Program Average</span>
                <span className="font-bold text-amber-600">-4% Below</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[78%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Financial Aid Coverage</span>
                <span className="font-bold text-red-600">Low (45%)</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactSection department="advising" />
    </div>
  );
};

export default PredictiveDetection;
