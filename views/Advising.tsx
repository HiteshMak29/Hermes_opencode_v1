
import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Send,
  ExternalLink,
  Check,
  ChevronDown
} from 'lucide-react';
import { ADVISOR_MOCK, APPOINTMENTS_MOCK, SEMESTERS_MOCK } from '../constants';
import ContactSection from '../components/ContactSection';

const Advising: React.FC = () => {
  const [selectedTermId, setSelectedTermId] = useState<string>('f24');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Academic Advising</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Updated: Oct 21, 2024
            </span>
          </div>
          <p className="text-gray-500">Connect with your faculty advisors for guidance.</p>
        </div>
        
        {/* Term Filter */}
        <div className="relative inline-block text-left w-full md:w-64">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Advising History</label>
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
        {/* Advisor Profile */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="relative inline-block mb-6">
            <img 
              src={ADVISOR_MOCK.avatar} 
              alt={ADVISOR_MOCK.name} 
              className="w-32 h-32 rounded-full border-4 border-indigo-50 shadow-inner"
            />
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{ADVISOR_MOCK.name}</h2>
          <p className="text-indigo-600 font-semibold text-sm mb-4">{ADVISOR_MOCK.department}</p>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <MapPin size={16} />
              <span>{ADVISOR_MOCK.office}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
              <Clock size={16} />
              <span>Mon, Wed • 2pm - 5pm</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
              <Send size={16} />
              <span>Message</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-colors">
              <User size={16} />
              <span>Profile</span>
            </button>
          </div>
        </div>

        {/* Existing Appointments & Notes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Appointments</h3>
              {selectedTermId === 'f24' && (
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md transition-all"
                >
                  Book Meeting
                </button>
              )}
            </div>
            <div className="space-y-4">
              {APPOINTMENTS_MOCK.map((appt) => (
                <div key={appt.id} className="p-5 border border-gray-100 rounded-2xl hover:border-indigo-100 transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      {appt.location.includes('Zoom') ? <Video size={20} /> : <MapPin size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{appt.type}</h4>
                      <p className="text-xs text-gray-500">{appt.date} @ {appt.time} • {appt.location}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 p-8 rounded-3xl shadow-lg text-white">
            <h3 className="font-bold text-lg mb-4">Advising Notes: {selectedTermId === 'f24' ? 'Fall 2024' : 'Historical'}</h3>
            <div className="space-y-4">
              {[
                "Reviewed major requirement sheet.",
                "Discussed potential Internship opportunities.",
                "Academic roadmap updated for next year."
              ].map((note, i) => (
                <div key={i} className="flex items-start space-x-3 opacity-90">
                  <div className="mt-1 flex-shrink-0 bg-indigo-500/30 p-1 rounded">
                    <Check size={12} className="text-white" />
                  </div>
                  <p className="text-sm italic">"{note}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ContactSection department="advising" />

      {/* Scheduling Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Schedule Meeting</h3>
              <button onClick={() => setShowScheduleModal(false)}>
                <Check className="rotate-45" size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Meeting Reason</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Degree Audit</option>
                  <option>Career Guidance</option>
                  <option>Course Overload Request</option>
                  <option>Personal Matters</option>
                </select>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black mt-4 hover:bg-indigo-700 transition-colors"
              >
                REQUEST APPOINTMENT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advising;
