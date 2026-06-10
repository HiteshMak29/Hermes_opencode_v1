
import React, { useState, useEffect } from 'react';
import { 
  SmartphoneNfc, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  ScanLine, 
  Zap,
  Lock,
  Unlock,
  History,
  Info
} from 'lucide-react';
import { STUDENT_MOCK, CURRENT_USER_ROLE, ACCESS_ZONES, INITIAL_ACCESS_LOGS } from '../constants';
import { AccessLog, UserRole } from '../types';
import ContactSection from '../components/ContactSection';

const AccessCard: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState(ACCESS_ZONES[0].id);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(INITIAL_ACCESS_LOGS);
  const [showResult, setShowResult] = useState<{ status: 'Granted' | 'Denied', location: string } | null>(null);

  const roleOrder: UserRole[] = ['Student', 'Faculty', 'Admin'];

  const hasAccess = (minRole: UserRole) => {
    return roleOrder.indexOf(CURRENT_USER_ROLE) >= roleOrder.indexOf(minRole);
  };

  const simulateScan = () => {
    setIsScanning(true);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

    setTimeout(() => {
      const zone = ACCESS_ZONES.find(z => z.id === selectedZoneId)!;
      const granted = hasAccess(zone.minRole);
      const newStatus = granted ? 'Granted' : 'Denied';
      
      const newLog: AccessLog = {
        id: `l-${Date.now()}`,
        location: zone.name,
        timestamp: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: newStatus,
        reason: !granted ? `Requires ${zone.minRole} clearance` : undefined
      };

      setAccessLogs(prev => [newLog, ...prev]);
      setShowResult({ status: newStatus, location: zone.name });
      setIsScanning(false);
      
      if (navigator.vibrate) {
        if (granted) navigator.vibrate(200);
        else navigator.vibrate([300, 100, 300]);
      }

      // Hide result modal after 3 seconds
      setTimeout(() => setShowResult(null), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Digital ID & Access</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Pulse Active: Oct 22, 2024
            </span>
          </div>
          <p className="text-gray-500">Your secure campus credentials. Tap to simulate NFC door entry.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Digital Access Card Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="perspective-1000">
            <div className="relative w-full aspect-[1.58/1] rounded-[2rem] shadow-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white transform-gpu transition-transform hover:scale-[1.02] duration-500">
              {/* Glassmorphism Accents */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative h-full p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                      <SmartphoneNfc size={22} className="text-indigo-100" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 leading-none mb-1">Access Pass</p>
                      <h3 className="text-sm font-bold leading-none">Jericho University</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none mb-1">Status</p>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-400/20 text-green-300 border border-green-400/30 text-[9px] font-black uppercase tracking-tighter">
                      <Zap size={10} className="fill-green-400" />
                      Active
                    </span>
                  </div>
                </div>

                <div className="flex items-end gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-inner">
                    <img src={STUDENT_MOCK.profileImage} alt="ID" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black truncate">{STUDENT_MOCK.name}</h2>
                    <p className="text-xs text-indigo-100 font-bold font-mono opacity-80">{STUDENT_MOCK.studentId}</p>
                    <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mt-1">{CURRENT_USER_ROLE} Account</p>
                  </div>
                </div>
              </div>

              {/* NFC Pulse Animation Overlay */}
              {isScanning && (
                <div className="absolute inset-0 z-20 bg-indigo-900/40 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150"></div>
                    <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-10 scale-[2] delay-300"></div>
                    <ScanLine size={48} className="text-white relative z-30 drop-shadow-lg" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <Lock size={16} />
              <p className="text-xs font-bold uppercase tracking-widest">Reader Simulation</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider px-1">Nearby Door / Gate</label>
                <select 
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  disabled={isScanning}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 pr-10 font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 appearance-none"
                >
                  {ACCESS_ZONES.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 bottom-4 text-gray-400 pointer-events-none" />
              </div>

              <button 
                onClick={simulateScan}
                disabled={isScanning}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 overflow-hidden group"
              >
                {isScanning ? (
                  <>
                    <Zap size={20} className="animate-spin" />
                    <span className="tracking-widest uppercase text-xs">Transmitting...</span>
                  </>
                ) : (
                  <>
                    <SmartphoneNfc size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="tracking-widest uppercase text-xs">Simulate NFC Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Access History & Audit Report */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <History className="text-indigo-600" size={24} />
                <h3 className="font-bold text-gray-800">Campus Entry Audit Trail</h3>
              </div>
              <button className="text-xs font-bold text-indigo-600 hover:underline">Export Report (PDF)</button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-gray-50">
              {accessLogs.map((log) => (
                <div key={log.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors animate-in slide-in-from-left-2 duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl shrink-0 ${
                      log.status === 'Granted' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {log.status === 'Granted' ? <Unlock size={24} /> : <Lock size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-gray-900">{log.location}</h4>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          log.status === 'Granted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                        <Clock size={12} className="opacity-60" />
                        {log.timestamp}
                      </p>
                      {log.reason && (
                        <p className="text-[10px] text-red-400 font-bold mt-1 uppercase italic">{log.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Sensor</p>
                    <p className="text-xs font-bold text-gray-500">Reader-{log.location.substring(0,2).toUpperCase()}-94</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Authorization List Section */}
            <div className="p-8 bg-indigo-50/50 border-t border-indigo-50 mt-auto">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck size={14} />
                Your Authorization Zones
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ACCESS_ZONES.map(zone => (
                  <div key={zone.id} className="flex items-center gap-2 text-xs">
                    {hasAccess(zone.minRole) ? (
                      <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-gray-300 shrink-0" />
                    )}
                    <span className={`truncate ${hasAccess(zone.minRole) ? 'text-gray-700 font-bold' : 'text-gray-400 font-medium'}`}>
                      {zone.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal Overlay */}
      {showResult && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in slide-in-from-bottom-8 duration-500">
          <div className={`p-6 rounded-[2rem] shadow-2xl backdrop-blur-md flex items-center gap-5 border ${
            showResult.status === 'Granted' ? 'bg-green-600/90 text-white border-green-500' : 'bg-red-600/90 text-white border-red-500'
          }`}>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center animate-bounce">
              {showResult.status === 'Granted' ? <Unlock size={32} /> : <Lock size={32} />}
            </div>
            <div>
              <h4 className="text-xl font-black leading-none mb-1">Access {showResult.status}</h4>
              <p className="text-sm opacity-80 font-medium">{showResult.location}</p>
            </div>
          </div>
        </div>
      )}

      <ContactSection department="security" />
    </div>
  );
};

export default AccessCard;

function ChevronDown(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
