
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Info,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { MEDICAL_MOCK, SEMESTERS_MOCK } from '../constants';
import ContactSection from '../components/ContactSection';

const Medical: React.FC = () => {
  const [selectedTermId, setSelectedTermId] = useState<string>('f24');
  const isComplete = MEDICAL_MOCK.status === 'Complete';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Medical Clearance</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Updated: Oct 15, 2024
            </span>
          </div>
          <p className="text-gray-500">Track and upload required health documentation for Jericho University.</p>
        </div>

        {/* Term Filter */}
        <div className="relative inline-block text-left w-full md:w-64">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Entry/Review Term</label>
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

      {/* Compliance Status Card */}
      <div className={`p-6 rounded-3xl border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} flex items-center justify-between`}>
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-2xl ${isComplete ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
            {isComplete ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isComplete ? 'text-green-900' : 'text-amber-900'}`}>
              Status: {isComplete ? 'Complete' : 'Action Required'}
            </h2>
            <p className={isComplete ? 'text-green-700' : 'text-amber-700'}>
              {isComplete 
                ? "You have fulfilled all university health requirements for this term." 
                : "Some documents are missing or pending review."}
            </p>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Clearance Items</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {MEDICAL_MOCK.requirements.map((req) => (
            <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-bold text-gray-900">{req.name}</h4>
                  {req.status === 'Uploaded' ? (
                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Verified</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Pending</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-3">{req.description}</p>
                <div className="flex flex-wrap gap-4 text-xs font-medium">
                   <div className="flex items-center text-gray-400">
                     <Clock size={14} className="mr-1" />
                     Due: {req.dueDate}
                   </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {req.status === 'Uploaded' ? (
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-white shadow-sm transition-all">
                    <FileText size={16} />
                    <span>View Form</span>
                  </button>
                ) : (
                  <button className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all">
                    <Upload size={16} />
                    <span>Upload Now</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ContactSection department="medical" />
    </div>
  );
};

export default Medical;
