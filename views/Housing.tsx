
import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  ShieldAlert,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Clock
} from 'lucide-react';
import { HOUSING_MOCK, SEMESTERS_MOCK } from '../constants';
import ContactSection from '../components/ContactSection';

const Housing: React.FC = () => {
  const [selectedTermId, setSelectedTermId] = useState<string>('f24');
  const totalPenalties = HOUSING_MOCK.penalties.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Campus Housing</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Updated: Oct 19, 2024
            </span>
          </div>
          <p className="text-gray-500">View your room assignment, roommate details, and residential financials.</p>
        </div>
        
        {/* Term Filter */}
        <div className="relative inline-block text-left w-full md:w-64">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Housing Period</label>
          <div className="relative group">
            <select 
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="appearance-none w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="f24">Fall 2024 (Active)</option>
              {SEMESTERS_MOCK.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.term} {sem.year}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Room Assignment Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-indigo-600 p-8 text-white relative">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black mb-1">{HOUSING_MOCK.buildingName}</h2>
                  <p className="text-indigo-100 font-medium">Room {HOUSING_MOCK.roomName}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Home size={28} />
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Move-In</p>
                  <p className="text-sm font-bold">{HOUSING_MOCK.moveInDate}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Move-Out</p>
                  <p className="text-sm font-bold">{HOUSING_MOCK.moveOutDate}</p>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 h-full w-32 bg-indigo-500/10 skew-x-[-20deg] translate-x-12"></div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Room Partner</p>
                    <p className="font-bold text-gray-900">{HOUSING_MOCK.partnerName}</p>
                  </div>
                </div>
                <button className="text-indigo-600 text-sm font-bold hover:underline">Message</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors text-left group">
                  <div className="flex items-center space-x-3">
                    <MapPin className="text-gray-400 group-hover:text-indigo-600" size={18} />
                    <span className="text-sm font-medium text-gray-700">Campus Maps</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
                <button className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors text-left group">
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="text-gray-400 group-hover:text-indigo-600" size={18} />
                    <span className="text-sm font-medium text-gray-700">Resident Handbook</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Penalty & Incident History */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center space-x-2">
                <AlertTriangle size={18} className="text-orange-500" />
                <span>Pending Room Charges & Penalties</span>
              </h3>
              {totalPenalties > 0 && (
                <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
                  ACTION REQUIRED
                </span>
              )}
            </div>
            
            {HOUSING_MOCK.penalties.length > 0 ? (
              <div className="space-y-4">
                {HOUSING_MOCK.penalties.map((penalty) => (
                  <div key={penalty.id} className="flex justify-between items-center p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${penalty.amount > 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                        <ShieldAlert size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{penalty.description}</p>
                        <p className="text-xs text-gray-400">{penalty.date}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${penalty.amount > 0 ? 'text-red-600' : 'text-gray-400 italic'}`}>
                      {penalty.amount > 0 ? `$${penalty.amount.toLocaleString()}` : 'No fine'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={32} />
                </div>
                <p className="font-bold text-gray-800">Clear Record</p>
                <p className="text-sm text-gray-400">You have no pending room charges or disciplinary fines.</p>
              </div>
            )}
          </div>
        </div>

        {/* Financials Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <DollarSign size={18} className="text-indigo-600" />
              <span>Financial Summary</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Base Room Charge</span>
                <span className="font-bold text-gray-900">${HOUSING_MOCK.semesterCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Utilities</span>
                <span className="font-bold text-gray-900">Included</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900">Semester Total</span>
                <span className="text-lg font-black text-indigo-600">
                  ${(HOUSING_MOCK.semesterCharges + totalPenalties).toLocaleString()}
                </span>
              </div>
            </div>
            {selectedTermId === 'f24' && (
              <button className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                Pay Room Fees
              </button>
            )}
          </div>
        </div>
      </div>

      <ContactSection department="housing" />
    </div>
  );
};

export default Housing;
