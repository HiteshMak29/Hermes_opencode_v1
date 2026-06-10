import React, { useState } from 'react';
import { 
  Map, 
  MapPin, 
  Compass, 
  Search, 
  Clock, 
  Coffee, 
  BookOpen, 
  Users, 
  ChevronRight, 
  CheckCircle, 
  Key, 
  Layers, 
  DollarSign, 
  UtensilsCrossed, 
  Flame, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Classroom {
  id: string;
  name: string;
  building: string;
  floor: number;
  currentClass: string;
  professor: string;
  occupancy: string;
  status: 'active' | 'empty' | 'exam';
  routeInstructions: string[];
}

interface StudyRoom {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  occupancyRate: number;
  availableSlots: string[];
}

interface DiningHall {
  id: string;
  name: string;
  hours: string;
  crowdLevel: 'low' | 'medium' | 'high';
  waitTime: string;
  menu: {
    meal: string;
    items: { name: string; price: string; cals: number; tags: string[] }[];
  }[];
}

const CampusMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'classrooms' | 'library' | 'dining'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  
  // Wayfinding states
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Library Booking states
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingPass, setBookingPass] = useState<{ room: string; time: string; pin: string; qr: string } | null>(null);

  // Classroom Live Database
  const classrooms: Classroom[] = [
    {
      id: 'CR-102',
      name: 'Seminar Room 102',
      building: 'Engineering Hall',
      floor: 1,
      currentClass: 'CS501: Applied Machine Learning',
      professor: 'Dr. Sarah Mitchell',
      occupancy: '32 / 45 Stations',
      status: 'active',
      routeInstructions: [
        'Enter through the Engineering Hall Main Glass Atrium entrance.',
        'Locate the registration desk directly opposite. Turn left.',
        'Pass the cybernetics showcase lab corridor.',
        'Room 102 is the third door on your right, framed by wooden panels.'
      ]
    },
    {
      id: 'CR-204',
      name: 'Collaborative Lab 204',
      building: 'Student Affairs Center',
      floor: 2,
      currentClass: 'No active session (Self Study Permitted)',
      professor: 'N/A',
      occupancy: '8 / 30 Desks',
      status: 'empty',
      routeInstructions: [
        'Enter Student Affairs main archway on North Plaza.',
        'Head towards the central glass elevator core.',
        'Ascend to Level 2.',
        'Turn right on exiting the elevator; Lab 204 is at the end of the east balcony.'
      ]
    },
    {
      id: 'CR-310',
      name: 'Advanced Science Auditorium 310',
      building: 'Evergreen Biotech Tower',
      floor: 3,
      currentClass: 'BIO441: Molecular Genomics Exam',
      professor: 'Dr. Marcus Vance',
      occupancy: '58 / 60 Seats',
      status: 'exam',
      routeInstructions: [
        'Enter the Biotech Tower via the revolving doors.',
        'Present student card at the turnstiles.',
        'Take the High-Speed Elevators to Floor 3.',
        'Exit and turn left; Auditorium 310 is the triple-door entrance.'
      ]
    },
    {
      id: 'CR-105',
      name: 'Virtual Reality Hub 105',
      building: 'Engineering Hall',
      floor: 1,
      currentClass: 'CS341: Computer Graphics & Shaders',
      professor: 'Prof. Helen Diaz',
      occupancy: '18 / 20 Headsets',
      status: 'active',
      routeInstructions: [
        'Enter through the Engineering Hall Main Glass Atrium entrance.',
        'Turn right towards the hardware technology wing.',
        'Proceed past the automated robotics testing cage.',
        'Room 105 is the high-security steel door with the VR blue LED indicator.'
      ]
    }
  ];

  // Study Rooms Mock List
  const studyRooms: StudyRoom[] = [
    {
      id: 'SR-A',
      name: 'Interactive Sandbox Pod A',
      capacity: 6,
      equipment: ['65" Interactive Board', 'Apple Airplay Receiver', 'Whiteboard'],
      occupancyRate: 85,
      availableSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
    },
    {
      id: 'SR-B',
      name: 'Quantum Quiet Pod B',
      capacity: 2,
      equipment: ['Dual 4K Monitors', 'Acoustic Soundproofing'],
      occupancyRate: 30,
      availableSlots: ['10:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '06:00 PM']
    },
    {
      id: 'SR-C',
      name: 'Multimedia Design Suite C',
      capacity: 8,
      equipment: ['VR Test Bench', 'Pro-Logic Sound Array', 'Wacom Studio Display'],
      occupancyRate: 90,
      availableSlots: ['08:00 AM', '12:00 PM', '07:00 PM']
    }
  ];

  // Dining Hall Gourmet Menus
  const diningHalls: DiningHall[] = [
    {
      id: 'DH-COMMONS',
      name: 'Evergreen Commons Buffet',
      hours: '07:00 AM - 09:00 PM',
      crowdLevel: 'medium',
      waitTime: '8 mins wait',
      menu: [
        {
          meal: 'Breakfast Specials',
          items: [
            { name: 'Organic Steel-Cut Oats (Berries & Local Honey)', price: '$4.50', cals: 310, tags: ['🌱 Vegan', '🌾 Gluten-Free'] },
            { name: 'Smashed Avocado & Heirloom Tom Toast', price: '$5.75', cals: 420, tags: ['🌱 Vegan'] }
          ]
        },
        {
          meal: 'Lunch Favorites',
          items: [
            { name: 'Jericho Organic Kale & Roasted Quinoa Salmon Bowl', price: '$11.50', cals: 580, tags: ['🌾 Gluten-Free'] },
            { name: 'Slow-Smoked Portobello Burger & Truffle Fries', price: '$9.25', cals: 650, tags: ['🌱 Vegan'] }
          ]
        },
        {
          meal: 'Gourmet Dinner Specials',
          items: [
            { name: 'Parmesan Herb Crusted Sea Bass with Lemon Orzo', price: '$14.99', cals: 620, tags: [] },
            { name: 'Spiced Indian Red Lentil Dal with Basmati Rice', price: '$10.25', cals: 490, tags: ['🌱 Vegan', '🌾 Gluten-Free'] }
          ]
        }
      ]
    },
    {
      id: 'DH-SKYLINE',
      name: 'Skyline Terrace Cafeteria',
      hours: '11:00 AM - 10:00 PM',
      crowdLevel: 'high',
      waitTime: '22 mins wait',
      menu: [
        {
          meal: 'All-Day Fast Casual',
          items: [
            { name: 'Crispy Sriracha Tofu Bao Buns (Set of 3)', price: '$7.50', cals: 480, tags: ['🌱 Vegan'] },
            { name: 'Angus Gold Beef Sliders with Caramelized Onions', price: '$8.50', cals: 720, tags: ['⚠️ Contains Gluten'] },
            { name: 'Zesty Thai Peanut Zoodle Salad', price: '$8.00', cals: 350, tags: ['🌱 Vegan', '🌾 Gluten-Free', '🥜 Peanut Allergy Warning'] }
          ]
        }
      ]
    },
    {
      id: 'DH-OASIS',
      name: 'Oasis Tech-Bites Express',
      hours: '08:00 AM - 05:00 PM',
      crowdLevel: 'low',
      waitTime: '1 min wait',
      menu: [
        {
          meal: 'Grab & Go Refreshments',
          items: [
            { name: 'Antioxidant Super-Berry Smoothie (16 oz)', price: '$5.50', cals: 240, tags: ['🌱 Vegan', '🌾 Gluten-Free'] },
            { name: 'Cold Brew Coffee & Vegan Oat Cookie', price: '$4.75', cals: 320, tags: ['🌱 Vegan'] },
            { name: 'Artisanal Falafel Wrap with Beet Hummus', price: '$6.95', cals: 410, tags: ['🌱 Vegan'] }
          ]
        }
      ]
    }
  ];

  const handleBookRoom = () => {
    if (!selectedRoom || !selectedSlot) return;
    const mockPIN = Math.floor(1000 + Math.random() * 9000).toString();
    setBookingPass({
      room: selectedRoom.name,
      time: selectedSlot,
      pin: mockPIN,
      qr: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BOOKING_${selectedRoom.id}_${selectedSlot}_PIN_${mockPIN}`
    });
    setSelectedRoom(null);
    setSelectedSlot(null);
  };

  const getStatusBadge = (status: Classroom['status']) => {
    switch (status) {
      case 'active':
        return <span className="text-[10px] bg-red-50 text-red-700 border border-red-100 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">● Class in Session</span>;
      case 'empty':
        return <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">● Free for Study</span>;
      case 'exam':
        return <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">⚠️ Active Exam Guard</span>;
    }
  };

  const filteredClassrooms = classrooms.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.currentClass.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Dynamic Campus Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex-1 space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <Compass size={28} className="text-indigo-600 animate-spin-slow" />
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Campus Life, Map & Wayfinding</h1>
          </div>
          <p className="text-gray-500 max-w-xl font-medium">
            Locate lecture halls instantly, view real-time crowd occupancy indexes within libraries, reserve private design sandbox units, and query campus restaurant daily menus unified.
          </p>
        </div>

        {/* Global Tab Navigation */}
        <div className="flex flex-wrap gap-2 bg-gray-50 border border-gray-100 p-1.5 rounded-2xl shrink-0 self-start md:mt-2 relative z-10">
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'map' ? 'bg-white text-indigo-600 shadow-sm border border-gray-150' : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            Virtual Blueprint
          </button>
          <button 
            onClick={() => setActiveTab('classrooms')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'classrooms' ? 'bg-white text-indigo-600 shadow-sm border border-gray-150' : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            Live Classrooms
          </button>
          <button 
            onClick={() => setActiveTab('library')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'library' ? 'bg-white text-indigo-600 shadow-sm border border-gray-150' : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            Library Study Pods
          </button>
          <button 
            onClick={() => setActiveTab('dining')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === 'dining' ? 'bg-white text-indigo-600 shadow-sm border border-gray-150' : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            Dining Menus
          </button>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/10 rounded-full blur-3xl pointer-events-none"></div>
      </header>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Interactive Panel Area - 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: INTERACTIVE BLUEPRINT MAP */}
            {activeTab === 'map' && (
              <motion.div 
                key="map-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6"
              >
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <div>
                    <h3 className="font-black text-gray-800 text-lg">Jericho Main Plaza Blueprint</h3>
                    <p className="text-xs text-gray-400 font-medium">Click on any campus facility grid to load dynamic logistics parameters.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">GPS ground calibrated</span>
                </div>

                {/* Styled Map Canvas representing campus */}
                <div className="relative bg-slate-900 border-4 border-slate-950 rounded-3xl p-6 h-96 shadow-inner overflow-hidden flex flex-col justify-between">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                  
                  {/* Decorative elements representing coordinates */}
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>GRID COORDINATES: 44.532-N // 12.804-E</span>
                    <span>W-WIFI BEACON CORE: ONLINE</span>
                  </div>

                  {/* SVG Blueprint of Buildings */}
                  <div className="relative w-full h-64 flex items-center justify-center">
                    
                    {/* Science / Biotech */}
                    <button 
                      onClick={() => setSelectedBuilding('Biotech Sector')}
                      className={`absolute top-4 left-6 w-36 h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-2 text-center shadow-lg ${
                        selectedBuilding === 'Biotech Sector' 
                          ? 'bg-indigo-600 border-indigo-400 text-white scale-105' 
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Layers size={18} className="mb-1" />
                      <span className="text-xs font-black">Biotech Tower</span>
                      <span className="text-[8px] opacity-75 font-mono">Floor 1-8 // Live</span>
                    </button>

                    {/* Engineering Hall */}
                    <button 
                      onClick={() => setSelectedBuilding('Engineering Sector')}
                      className={`absolute top-28 right-8 w-40 h-24 rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-2 text-center shadow-lg ${
                        selectedBuilding === 'Engineering Sector' 
                          ? 'bg-indigo-600 border-indigo-400 text-white scale-105' 
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Compass size={18} className="mb-1 text-sky-400" />
                      <span className="text-xs font-black">Engineering Hall</span>
                      <span className="text-[8px] opacity-75 font-mono">Room 102 & VR Hub</span>
                    </button>

                    {/* Student Union / Dining */}
                    <button 
                      onClick={() => setSelectedBuilding('Student Center')}
                      className={`absolute bottom-4 left-20 w-44 h-20 rounded-2xl border-2 transition-all flex flex-col items-center justify-center p-2 text-center shadow-lg ${
                        selectedBuilding === 'Student Center' 
                          ? 'bg-indigo-600 border-indigo-400 text-white scale-105' 
                          : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Coffee size={18} className="mb-1 text-red-400" />
                      <span className="text-xs font-black">Student Center & Food Plaza</span>
                      <span className="text-[8px] opacity-75 font-mono">Dining & 204 Self Study</span>
                    </button>

                    {/* Central Plaza Waypoint Indicator */}
                    <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full animate-ping pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-white pointer-events-none"></div>
                    <span className="absolute top-1/2 left-1/3 translate-x-4 -translate-y-1/3 font-mono text-[9px] text-slate-400">Alexander Gate Plaza</span>

                  </div>

                  <div className="text-[9px] font-mono text-slate-400 border-t border-slate-800 pt-2 flex justify-between">
                    <span>* TAP BUILDINGS TO VIEW DYNAMIC ENTRANCE REQUIREMENTS</span>
                    <span>SCALE 1 : 1200 METERS</span>
                  </div>
                </div>

                {/* Building Details Drawer */}
                {selectedBuilding ? (
                  <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50 flex flex-col md:flex-row gap-6 justify-between items-start animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">Zone Clearance Verified</span>
                      <h4 className="font-black text-gray-800">{selectedBuilding} Context Parameters</h4>
                      <div className="text-xs text-gray-500 space-y-1 pl-4 list-disc">
                        {selectedBuilding === 'Engineering Sector' && (
                          <>
                            <li>Includes <span className="font-bold text-gray-700">Room 102</span> & <span className="font-bold text-gray-700">Virtual Reality Suite 105</span>.</li>
                            <li>Current Net Access Frequency: <span className="font-bold text-indigo-600">High (102 students present)</span>.</li>
                            <li>Smart Access Status: <span className="text-emerald-600 font-bold">Standard RFID Entrance Enabled</span>.</li>
                          </>
                        )}
                        {selectedBuilding === 'Biotech Sector' && (
                          <>
                            <li>Houses high-spec labs and science classrooms. Close exam guards detected in <span className="font-bold text-gray-700">Auditorium 310</span>.</li>
                            <li>Current Net Access Frequency: <span className="font-bold text-indigo-600">Moderate</span>.</li>
                            <li>Clearance Required: Faculty-led classes or biometric access passes on active student keys.</li>
                          </>
                        )}
                        {selectedBuilding === 'Student Center' && (
                          <>
                            <li>Houses the <span className="font-bold text-gray-700">Evergreen Buffet & Skyline Terrences</span> alongside self-schedule spaces.</li>
                            <li>Current Net Access Frequency: <span className="font-semibold text-rose-600">Peak dining rush incoming</span>.</li>
                            <li>Access: Pure open zone, no entrance checks today.</li>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (selectedBuilding === 'Engineering Sector') setActiveTab('classrooms');
                        else if (selectedBuilding === 'Student Center') setActiveTab('dining');
                        else setActiveTab('classrooms');
                      }}
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shrink-0"
                    >
                      Enter Deeper Logs
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-gray-400 font-medium">
                    No building selected. Click a block on the virtual layout above to parse active classrooms or queues.
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: LIVE CLASSROOMS & WAYFINDING */}
            {activeTab === 'classrooms' && (
              <motion.div 
                key="classrooms-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-50">
                  <div>
                    <h3 className="font-black text-gray-800 text-lg">Active Lectures & Wayfinding Router</h3>
                    <p className="text-xs text-gray-400 font-medium font-sans">Find where your class is occurring and load real-time step instructions.</p>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input 
                      type="text" 
                      placeholder="Search lecture..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-56"
                    />
                  </div>
                </div>

                {/* Classroom Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredClassrooms.map(c => (
                    <div 
                      key={c.id} 
                      className={`p-5 rounded-2xl border transition-all ${
                        selectedClassroom?.id === c.id 
                          ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                          : 'bg-white hover:bg-gray-50/50 border-gray-100 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{c.building}</span>
                          <h4 className="font-black text-gray-800 text-sm mt-0.5">{c.name}</h4>
                        </div>
                        {getStatusBadge(c.status)}
                      </div>

                      <div className="space-y-4 pt-3 border-t border-gray-50">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Class Block:</span>
                          <span className="text-gray-800 font-bold text-right max-w-44 truncate">{c.currentClass}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Lecturer:</span>
                          <span className="text-gray-700 font-semibold">{c.professor}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Current Occupancy:</span>
                          <span className="text-gray-700 font-bold font-mono">{c.occupancy}</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedClassroom(c);
                            setIsRouting(true);
                          }}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Compass size={13} />
                          Extract Route Steps
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Drawer for Routesteps */}
                {isRouting && selectedClassroom && (
                  <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 border border-slate-950 animate-in slide-in-from-bottom duration-200">
                    <div className="flex justify-between items-start border-b border-white/10 pb-3">
                      <div>
                        <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest">Active Wayfinder Navigation Payload</span>
                        <h4 className="font-black text-sm">Path to {selectedClassroom.name}</h4>
                      </div>
                      <button 
                        onClick={() => {
                          setIsRouting(false);
                          setSelectedClassroom(null);
                        }} 
                        className="text-gray-400 hover:text-white text-xs font-bold p-1"
                      >
                        Cancel Route
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedClassroom.routeInstructions.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 text-xs leading-relaxed">
                          <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-slate-300">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
                      <Clock size={12} className="text-indigo-400" />
                      <span>Estimated walk distance: <span className="font-bold text-white">4 mins</span> from current core campus radius. All fire escape portals cleared.</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: LIBRARY STUDY PODS & BOOKINGS */}
            {activeTab === 'library' && (
              <motion.div 
                key="library-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 pb-4 border-b border-gray-50">
                  <div>
                    <h3 className="font-black text-gray-800 text-lg">Main Library private study suite booking</h3>
                    <p className="text-xs text-gray-400 font-medium">Real-time occupancy indexes and automated smart-access credentialing.</p>
                  </div>
                  <div className="bg-indigo-50 px-5 py-3 rounded-2xl border border-indigo-100 text-right flex flex-col justify-center shrink-0">
                    <span className="text-[10px] font-black uppercase text-indigo-700">Total Library Load Factor</span>
                    <p className="text-lg font-black text-indigo-900">54% Occupied <span className="text-xs font-normal text-indigo-650">(Normal)</span></p>
                  </div>
                </div>

                {/* Rooms selection lists */}
                <div className="space-y-4">
                  {studyRooms.map(room => (
                    <div key={room.id} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-indigo-100 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">CLEARANCE LEVEL 1</span>
                          <span className="text-xs font-bold text-gray-400">• Max Capt: {room.capacity} students</span>
                        </div>
                        <h4 className="font-black text-gray-800 text-base">{room.name}</h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {room.equipment.map((eq, id) => (
                            <span key={id} className="text-[9px] font-bold bg-gray-50 text-gray-500 px-2 py-0.5 rounded border border-gray-100">{eq}</span>
                          ))}
                        </div>
                      </div>

                      {/* Right Booking Column */}
                      <div className="space-y-3 shrink-0 w-full md:w-64 text-right flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-xs mb-1 font-semibold">
                            <span className="text-gray-400">Live Traffic Meter:</span>
                            <span className={room.occupancyRate > 80 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{room.occupancyRate}% busy</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full transition-all" style={{ width: `${room.occupancyRate}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase text-left md:text-right mb-1">Available slots today:</p>
                          <div className="flex flex-wrap justify-start md:justify-end gap-1.5">
                            {room.availableSlots.map(slot => (
                              <button 
                                key={slot}
                                onClick={() => {
                                  setSelectedRoom(room);
                                  setSelectedSlot(slot);
                                }}
                                className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border transition-all ${
                                  selectedRoom?.id === room.id && selectedSlot === slot
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                    : 'bg-white hover:bg-gray-50 border-gray-150 text-gray-600'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confirm Active Booking Button Section */}
                {selectedRoom && selectedSlot && (
                  <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in duration-200">
                    <div>
                      <h4 className="font-bold text-indigo-900 text-sm">Lock in selection in progress...</h4>
                      <p className="text-xs text-indigo-700 mt-1">Room: <span className="font-extrabold">{selectedRoom.name}</span> at <span className="font-extrabold">{selectedSlot}</span> today.</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedRoom(null);
                          setSelectedSlot(null);
                        }}
                        className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-xl text-xs font-bold transition-all"
                      >
                        Cancel Selection
                      </button>
                      <button 
                        onClick={handleBookRoom}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        Finalize Reservation
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: DINING HALLS & GOURMET MENUS */}
            {activeTab === 'dining' && (
              <motion.div 
                key="dining-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6"
              >
                <div className="pb-4 border-b border-gray-50">
                  <h3 className="font-black text-gray-800 text-lg">Daily Gourmet Menus & Wait Times</h3>
                  <p className="text-xs text-gray-400 font-medium">Query nutritional details, calorie parameters, and allergen warnings live.</p>
                </div>

                {/* Dinigs cards loop */}
                <div className="space-y-8">
                  {diningHalls.map((hall) => (
                    <div key={hall.id} className="border border-gray-100 rounded-2xl p-6 bg-slate-50/50 space-y-4">
                      
                      {/* Dining Hall metadata */}
                      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center pb-4 border-b border-gray-200/50">
                        <div>
                          <h4 className="font-black text-gray-800 text-base">{hall.name}</h4>
                          <span className="text-[11px] text-gray-500 font-semibold uppercase">{hall.hours}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            hall.crowdLevel === 'low' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            hall.crowdLevel === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            Crowds: {hall.crowdLevel}
                          </span>
                          <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                            <Clock size={13} className="text-indigo-600" />
                            {hall.waitTime}
                          </span>
                        </div>
                      </div>

                      {/* Menu Meals mapping */}
                      <div className="space-y-4">
                        {hall.menu.map((category, index) => (
                          <div key={index} className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 block bg-indigo-50 px-2 py-0.5 rounded self-start inline-block">{category.meal}</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {category.items.map((item, id) => (
                                <div key={id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-start shadow-sm hover:border-indigo-100 transition-all">
                                  <div className="space-y-1">
                                    <p className="text-xs font-bold text-gray-800">{item.name}</p>
                                    <div className="flex flex-wrap gap-1 items-center">
                                      <span className="text-[10px] font-mono text-gray-400">{item.cals} Cals</span>
                                      {item.tags.map((tag, tagId) => (
                                        <span key={tagId} className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.2 rounded border border-gray-100 font-semibold">{tag}</span>
                                      ))}
                                    </div>
                                  </div>
                                  <span className="font-extrabold text-sm text-indigo-600">{item.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>

              </motion.div>
            )}
            
          </AnimatePresence>
        </div>

        {/* Right Collateral Widgets - 1 Col */}
        <div className="space-y-6">
          
          {/* Active booking pass */}
          {bookingPass && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl border border-indigo-950 text-white shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center text-xs border-b border-white/10 pb-4">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-300 bg-white/10 px-2 py-0.5 rounded">Smart Pass Active</span>
                  <h4 className="font-black text-sm mt-1">Study Room Booking Receipt</h4>
                </div>
                <button 
                  onClick={() => setBookingPass(null)} 
                  className="bg-white/10 text-white rounded-lg p-1.5 hover:bg-white/20 transition-all text-[10px] font-black uppercase"
                >
                  Dismiss
                </button>
              </div>

              <div className="flex justify-center py-2 bg-white rounded-2xl border border-indigo-100 p-4">
                <img src={bookingPass.qr} alt="Booking QR Pass" className="w-36 h-36 border-2 border-slate-50 rounded-lg p-1" referrerPolicy="no-referrer" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-t border-b border-white/10 py-4">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Reserved Unit</p>
                  <p className="font-black text-white mt-0.5">{bookingPass.room}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Scheduled Time</p>
                  <p className="font-black text-white mt-0.5">{bookingPass.time} today</p>
                </div>
              </div>

              <div className="bg-indigo-950 p-4 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="text-indigo-300 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Key size={10} /> Room Entrance Pin
                  </p>
                  <p className="text-lg font-black text-white font-mono tracking-widest">{bookingPass.pin}</p>
                </div>
                <span className="text-[9px] text-indigo-400 font-semibold max-w-28 text-right">Enter this PIN on pod's digital handle pad to initiate RFID check-in.</span>
              </div>
            </div>
          )}

          {/* Quick Stats & Transit Widgets */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h4 className="font-black text-gray-800 text-sm flex items-center gap-1.5">
              <Compass size={16} className="text-indigo-600" />
              Active Shuttle Services
            </h4>
            <div className="space-y-2.5">
              {[
                { route: 'Route Blue (North Dorms Core)', arrives: '5 mins', delay: 'On Time', speed: 'Moderate' },
                { route: 'Route Red (Athletics & Bio sector)', arrives: '12 mins', delay: '3m Delay', speed: 'Slow' },
                { route: 'Faculty Executive Commute', arrives: '2 mins', delay: 'On Time', speed: 'Fast' }
              ].map((shuttle, id) => (
                <div key={id} className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-extrabold text-gray-800">{shuttle.route}</h5>
                    <div className="flex gap-1.5 items-center mt-1 text-[9px]">
                      <span className="text-gray-400">Logistics status:</span>
                      <span className={`font-bold ${shuttle.delay === 'On Time' ? 'text-emerald-600' : 'text-orange-600'}`}>{shuttle.delay}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-gray-800 block">{shuttle.arrives}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Arival</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Safety Protocol Info */}
          <div className="bg-red-50 p-6 rounded-3xl border border-red-150 shadow-sm space-y-3 text-red-950">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} className="animate-pulse" />
              <h4 className="font-black text-sm uppercase tracking-wider">Safety & Assembly Zones</h4>
            </div>
            <p className="text-xs leading-relaxed text-red-900">
              In case of emergency, safety sirens automatically display designated campus triage exit structures. Alexander Gate is the primary assembly center for all STEM divisions.
            </p>
            <div className="pt-2 border-t border-red-200/50">
              <a 
                href="#/wellness" 
                className="text-[10px] font-black text-indigo-650 hover:underline uppercase tracking-wider block text-center"
              >
                Access Campus Security Helpline &rarr;
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CampusMap;
