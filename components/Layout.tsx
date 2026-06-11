
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  Users, 
  GraduationCap, 
  Menu, 
  X,
  Bell,
  Search,
  MessageSquare,
  Home,
  ShieldCheck,
  Library as LibraryIcon,
  Coffee,
  UserCheck,
  SmartphoneNfc,
  BarChart3,
  Bot,
  MessageCircle,
  CheckCircle2,
  ShieldAlert,
  LifeBuoy,
  Database,
  Briefcase,
  Heart,
  Map,
  Compass,
  ThumbsUp,
  ThumbsDown,
  Check
} from 'lucide-react';
import { CURRENT_USER_ROLE } from '../constants';
import { useCollegeBranding, CollegeLogo } from '../brandingConfig';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeCollege, setActiveCollegeById, allColleges } = useCollegeBranding();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Feedback widget states
  const [feedbackVote, setFeedbackVote] = useState<'up' | 'down' | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(true);

  const navItems = [
    // { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    // { name: 'Admissions', icon: BookOpen, path: '/admissions' },
    { name: 'Academics', icon: GraduationCap, path: '/academics' },
    { name: 'Financial Aid', icon: Wallet, path: '/finances' },
    // { name: 'Degree Progress', icon: Map, path: '/degree-tracker' },
    // { name: 'Advising', icon: Users, path: '/advising' },
    // { name: 'Housing', icon: Home, path: '/housing' },
    // { name: 'Medical', icon: ShieldCheck, path: '/medical' },
    // { name: 'Library', icon: LibraryIcon, path: '/library' },
    // { name: 'Meal Wallet', icon: Coffee, path: '/meals' },
    // { name: 'Access Card', icon: SmartphoneNfc, path: '/access' },
    // { name: 'AI Assistant', icon: Bot, path: '/assistant' },
    // { name: 'Campus Map', icon: Compass, path: '/map' },
    // { name: 'Careers & Jobs', icon: Briefcase, path: '/careers' },
    // { name: 'Wellness Hub', icon: Heart, path: '/wellness' },
    // { name: 'Support Center', icon: LifeBuoy, path: '/support' },
  ];

  const currentModule = navItems.find(item => item.path === location.pathname)?.name || 'Dashboard';

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      // Auto dismiss after a short delay
      setIsFeedbackOpen(false);
      // Reset state for next navigation
      setFeedbackVote(null);
      setFeedbackComment('');
      setFeedbackSubmitted(false);
    }, 3000);
  };

  // Faculty/Admin only items
  const internalItems = [
    // { name: 'User Directory & AD', icon: Users, path: '/user-directory', roles: ['Admin'] },
    // { name: 'Student Retention', icon: UserCheck, path: '/retention', roles: ['Faculty', 'Admin'] },
    // { name: 'Predictive Risk', icon: ShieldCheck, path: '/predictive-risk', roles: ['Faculty', 'Admin'] },
    // { name: 'Module Analytics', icon: BarChart3, path: '/analytics', roles: ['Admin'] },
    // { name: 'Incident Management', icon: ShieldAlert, path: '/incidents', roles: ['Faculty', 'Admin'] },
    // { name: 'System Status', icon: CheckCircle2, path: '/status', roles: ['Faculty', 'Admin'] },
    { name: 'Source Connectivity', icon: Database, path: '/connectivity', roles: ['Faculty', 'Admin'] },
  ];

  const allowedInternalItems = internalItems.filter(item => 
    item.roles.includes(CURRENT_USER_ROLE)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 ${activeCollege.colors.sidebarBg} text-white fixed h-full shadow-xl z-30`}>
        {/* Top Left Professional Logo container */}
        <div className="p-6 border-b border-white/5 flex items-center">
          <CollegeLogo variant="light" size={32} branding={activeCollege} />
        </div>
        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto sleek-scrollbar">
          <div className={`text-[10px] font-black ${activeCollege.colors.sidebarBadgeText} uppercase tracking-widest px-3 mb-2`}>Student Portal</div>
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? `${activeCollege.colors.sidebarActiveBg} text-white shadow-md` 
                  : `${activeCollege.colors.sidebarText} ${activeCollege.colors.sidebarHoverBg} hover:text-white`
              }`}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          ))}

          {allowedInternalItems.length > 0 && (
            <>
              <div className={`text-[10px] font-black ${activeCollege.colors.sidebarBadgeText} uppercase tracking-widest px-3 mb-2 mt-8`}>Admin Section</div>
              {allowedInternalItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    location.pathname === item.path 
                      ? `${activeCollege.colors.sidebarActiveBg} text-white shadow-md` 
                      : `${activeCollege.colors.sidebarText} ${activeCollege.colors.sidebarHoverBg} hover:text-white`
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              ))}
            </>
          )}
        </nav>
        
        {/* Dynamic active college branding instant selection switcher & Profile details */}
        <div className={`p-4 bg-black/25 border-t ${activeCollege.colors.sidebarBorder}`}>
          <div className="mb-4">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-white/50 block mb-1">Campus Brand Presets</span>
            <select
              value={activeCollege.id}
              onChange={(e) => setActiveCollegeById(e.target.value as any)}
              className="w-full text-[11px] font-bold bg-white/15 text-white rounded-lg px-2 py-1.5 border border-white/10 hover:border-white/20 focus:outline-none appearance-none cursor-pointer outline-none transition-colors"
              style={{ colorScheme: 'dark' }}
            >
              {allColleges.map((col) => (
                <option key={col.id} value={col.id} className="text-slate-900 bg-white font-semibold">
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <img src="https://picsum.photos/seed/alex/100/100" className="w-10 h-10 rounded-full border-2 border-white/20" alt="Alex Profile" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">Alex Johnson</p>
              <p className="text-[10px] text-white/70 capitalize">{CURRENT_USER_ROLE.toLowerCase()} Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`md:hidden flex items-center justify-between p-4 ${activeCollege.colors.sidebarBg} text-white sticky top-0 z-50 shadow-md`}>
        <div className="flex items-center space-x-2">
          <CollegeLogo variant="light" size={24} branding={activeCollege} />
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:opacity-80 transition-opacity">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Sidebar (Overlay) */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-3/4 max-w-xs h-full bg-white flex flex-col p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center mb-6 border-b pb-4">
              <CollegeLogo variant="dark" size={28} branding={activeCollege} />
            </div>
            
            {/* College Swapper inside mobile slide out */}
            <div className="mb-4 px-1">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-400 block mb-1">Campus Brand Presets</span>
              <select
                value={activeCollege.id}
                onChange={(e) => setActiveCollegeById(e.target.value as any)}
                className="w-full text-xs font-bold bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-none appearance-none cursor-pointer outline-none"
              >
                {allColleges.map((col) => (
                  <option key={col.id} value={col.id} className="text-slate-900 bg-white font-semibold flex">
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto sleek-scrollbar-light">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-medium transition-colors ${
                    location.pathname === item.path ? `bg-gray-100 ${activeCollege.colors.primaryText} font-bold` : 'text-gray-600 hover:bg-gray-55'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
              {allowedInternalItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-xl font-medium transition-colors ${
                    location.pathname === item.path ? `bg-gray-100 ${activeCollege.colors.primaryText} font-bold` : 'text-gray-600 hover:bg-gray-55'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
            </nav>
            <div className="pt-6 border-t border-gray-100 mt-auto">
              <div className="flex items-center space-x-3">
                <img src="https://picsum.photos/seed/alex/100/100" className="w-12 h-12 rounded-full border-2 border-indigo-600" alt="Profile" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Alex Johnson</p>
                  <p className="text-xs text-gray-500 capitalize">{CURRENT_USER_ROLE.toLowerCase()} Access</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen">
        {/* Dynamic Page Content */}
        <div className="animate-in fade-in duration-500">
          {children}
        </div>

        {/* Floating NPS Micro-Survey Pulse Widget */}
        {isFeedbackOpen && !feedbackSubmitted && (
          <div className="fixed bottom-6 left-6 md:left-72 w-80 bg-white p-5 rounded-2xl shadow-xl border border-gray-150 z-40 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Satisfaction Pulse</span>
                <h4 className="text-xs font-black text-gray-800 mt-1">Rate the {currentModule} Module</h4>
              </div>
              <button onClick={() => setIsFeedbackOpen(false)} className="text-gray-300 hover:text-gray-500 font-bold text-xs p-1">✕</button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFeedbackVote('up')}
                  className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    feedbackVote === 'up' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span className="text-[10px] font-black uppercase">Thumbs Up</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackVote('down')}
                  className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    feedbackVote === 'down' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 hover:bg-gray-50 text-gray-500'
                  }`}
                >
                  <ThumbsDown size={14} />
                  <span className="text-[10px] font-black uppercase">Thumbs Down</span>
                </button>
              </div>

              {feedbackVote && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="Any quick improvement logs?"
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[11px] focus:outline-none focus:ring-1 ${activeCollege.colors.ringColor} text-gray-800`}
                  />
                  <button
                    type="submit"
                    className={`w-full py-2 ${activeCollege.colors.primaryButtonBg} rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm`}
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {isFeedbackOpen && feedbackSubmitted && (
          <div className="fixed bottom-6 left-6 md:left-72 w-80 bg-teal-50 border border-teal-150 p-5 rounded-2xl shadow-xl z-40 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2.5 text-teal-800">
              <Check size={16} className="text-teal-600 shrink-0" />
              <div>
                <p className="text-xs font-black">Satisfaction logged!</p>
                <p className="text-[10px] text-teal-600 font-medium leading-snug mt-0.5">
                  Your review has been piped safely into the local Admin net promoter score logs. Thanks!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Assistant Button */}
        <Link 
          to="/assistant" 
          className={`fixed bottom-6 right-6 w-14 h-14 ${activeCollege.colors.primaryButtonBg} rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group`}
        >
          <div className="absolute -top-12 right-0 bg-white text-slate-800 text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-100">
            Need help? Ask me!
          </div>
          <MessageCircle size={28} />
          <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        </Link>
      </main>
    </div>
  );
};

export default Layout;
