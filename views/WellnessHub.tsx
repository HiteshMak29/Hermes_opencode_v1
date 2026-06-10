import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  PhoneCall, 
  Smile, 
  HelpCircle, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  User,
  Activity,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface Slot {
  id: string;
  time: string;
  counselorName: string;
  type: string;
  available: boolean;
}

const WellnessHub: React.FC = () => {
  const [mood, setMood] = useState<number | null>(null);
  const [checkInDone, setCheckedInDone] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Slots lists
  const [slots, setSlots] = useState<Slot[]>([
    { id: "SLOT-01", time: "Monday, 10:00 AM", counselorName: "Dr. Laura Vance", type: "In-Person (Room 204)", available: true },
    { id: "SLOT-02", time: "Monday, 2:00 PM", counselorName: "Dr. Laura Vance", type: "Virtual (Tele-health)", available: true },
    { id: "SLOT-03", time: "Tuesday, 11:30 AM", counselorName: "Marcus Sterling, LCSW", type: "In-Person (Room 205)", available: true },
    { id: "SLOT-04", time: "Wednesday, 9:00 AM", counselorName: "Dr. Laura Vance", type: "Virtual (Tele-health)", available: true },
    { id: "SLOT-05", time: "Thursday, 3:30 PM", counselorName: "Marcus Sterling, LCSW", type: "In-Person (Room 204)", available: false }
  ]);

  const moodLevels = [
    { rating: 1, label: 'Very Low', color: 'bg-red-500' },
    { rating: 2, label: 'Low', color: 'bg-orange-500' },
    { rating: 3, label: 'Neutral', color: 'bg-amber-500' },
    { rating: 4, label: 'Good', color: 'bg-teal-500' },
    { rating: 5, label: 'Excellent', color: 'bg-green-500' }
  ];

  const handleMoodSubmit = () => {
    if (mood === null) return;
    setCheckedInDone(true);
  };

  const handleBookSlot = (id: string) => {
    setSelectedSlot(id);
    setBookingConfirmed(true);
    setSlots(prev => prev.map(s => s.id === id ? { ...s, available: false } : s));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header and Crisis line one tap away */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Heart className="text-red-500 animate-pulse fill-red-500" size={28} />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mental Health & Wellness</h1>
          </div>
          <p className="text-gray-500 max-w-xl font-medium">
            Your well-being is our utmost priority. Access anonymous mood check-ins, register telehealth sessions, and query emergency support pipelines instantly.
          </p>
        </div>

        {/* CRISIS LINE: Always one tap away */}
        <div className="shrink-0 w-full md:w-auto">
          <a 
            href="#emergency-hotlines"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('emergency-hotlines')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full md:w-auto flex items-center justify-center space-x-3 px-8 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-200 duration-150 animate-bounce cursor-pointer"
          >
            <PhoneCall size={20} className="animate-spin" />
            <span>24/7 Crisis Helpline Direct</span>
          </a>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Weekly Wellness Check-In */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Weekly Self Care</span>
            <h3 className="text-xl font-black text-gray-900">Anonymous Wellness Check-In</h3>
            <p className="text-xs text-gray-400 font-medium">Your input is purely anonymous, used only to calculate institution-wide student net wellness parameters.</p>
          </div>

          {!checkInDone ? (
            <div className="space-y-6 py-4">
              <p className="text-sm font-bold text-gray-800">How would you describe your balance state today?</p>
              
              <div className="flex justify-between gap-2">
                {moodLevels.map(m => (
                  <button
                    key={m.rating}
                    onClick={() => setMood(m.rating)}
                    className={`flex-1 py-4 px-2 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 ${
                      mood === m.rating 
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg font-bold">{m.rating}</span>
                    <span className="text-[10px] font-black uppercase text-gray-400">{m.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleMoodSubmit}
                disabled={mood === null}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black tracking-widest uppercase transition-all"
              >
                Submit Anonymously
              </button>
            </div>
          ) : (
            <div className="bg-teal-50 border border-teal-100 text-teal-900 p-6 rounded-2xl space-y-3 animate-fade-in my-4">
              <div className="flex items-center gap-2 text-teal-700">
                <CheckCircle size={20} />
                <h4 className="font-bold text-sm">Thank You for Checking In!</h4>
              </div>
              <p className="text-xs text-teal-850 leading-relaxed">
                Your mood has been logged. We suggest registering regular counseling updates to boost retention and minimize program overwhelm.
              </p>
              <div className="pt-2">
                <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Suggested Reading Today:</p>
                <div className="flex items-center justify-between text-[11px] font-bold text-teal-800 mt-1 hover:underline cursor-pointer">
                  <span>Managing STEM Workload & Exam Stress</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            </div>
          )}

          <div className="text-[10px] text-gray-400 font-medium italic border-t border-gray-55 pt-4">
            * We encrypt check-in payloads internally. No staff can associate wellness ratings with individual profiles.
          </div>
        </div>

        {/* Counselling self-scheduling */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6 flex flex-col">
          <div className="space-y-3">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">Scheduling Tool</span>
            <h3 className="text-xl font-black text-gray-900">Self-Schedule Counselling</h3>
            <p className="text-xs text-gray-405">Configure either in-person sessions at Student Affairs or tele-health virtual slots.</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-76 flex-1 pr-1">
            {slots.map(slot => (
              <div 
                key={slot.id} 
                className={`p-4 rounded-2xl border border-gray-100 flex justify-between items-center ${
                  !slot.available ? 'bg-gray-50/50' : 'hover:border-indigo-100 shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800">{slot.time}</span>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {slot.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <User size={12} className="text-gray-400" />
                    {slot.counselorName}
                  </p>
                </div>

                <div>
                  {slot.available ? (
                    <button
                      onClick={() => handleBookSlot(slot.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Book Slot
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-black uppercase">Unavailable</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {bookingConfirmed && (
            <div className="bg-green-50 text-green-900 border border-green-150 p-4 rounded-2xl mt-4 animate-fade-in flex items-start gap-3">
              <CheckCircle size={16} className="text-green-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Booking Confirmed Successfully!</p>
                <p className="text-[10px] text-green-700">A calendar request and security access entry have been synced onto your Profile dashboard.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Crisis hotline details always visible */}
      <div id="emergency-hotlines" className="bg-red-50 rounded-3xl p-8 border border-red-100 text-red-950 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] uppercase tracking-wider text-red-950">Campus Emergency Counseling Contact Array</h3>
            <p className="text-xs text-red-800">Available 24 hours a day, 365 days a year. Tap to initiate encrypted secure callbacks.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-red-200/50 flex flex-col justify-between h-full">
            <div>
              <p className="font-extrabold text-xs text-red-950 uppercase tracking-widest mb-1">Campus Mental Crisis Line</p>
              <p className="text-indigo-600 text-lg font-black">+1 (800) 273-TALK</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug mt-4">Immediate connection with certified peer specialists trained under medical oversight.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-red-200/50 flex flex-col justify-between h-full">
            <div>
              <p className="font-extrabold text-xs text-red-950 uppercase tracking-widest mb-1">Campus Physical Security</p>
              <p className="text-indigo-600 text-lg font-black">+1 (555) 911-JU99</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug mt-4">Local campus response division dispatch for immediate spatial safety operations.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-red-200/50 flex flex-col justify-between h-full">
            <div>
              <p className="font-extrabold text-xs text-red-950 uppercase tracking-widest mb-1">Text Counseling Relay</p>
              <p className="text-indigo-600 text-lg font-black">TEXT "HOME" to 741741</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug mt-4">Confidential support over text chat networks for campus students feeling overwhelmed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessHub;
