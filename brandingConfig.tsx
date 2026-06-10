import React, { createContext, useContext, useState, useEffect } from 'react';

// Unified college branding configuration interface
export interface CollegeBranding {
  id: string;
  name: string;
  shortName: string;
  slogan: string;
  domain: string;
  logoStyle: 'crest' | 'tech' | 'modern' | 'shield';
  logoInitials: string;
  
  // Theme styling declarations (Tailwind utility class mappings)
  colors: {
    sidebarBg: string;             // Sidebar container background (e.g., bg-indigo-900)
    sidebarActiveBg: string;       // Background of active nav items (e.g., bg-indigo-800)
    sidebarHoverBg: string;        // Hover state of sidebar items
    sidebarText: string;           // Text color of inactive navigation items
    sidebarTextActive: string;     // Text color of active navigation items
    sidebarBorder: string;         // Borders within sidebar (e.g., border-indigo-800)
    sidebarBadgeText: string;      // Indicator lists colors
    
    // UI Button & Badge overrides
    primaryButtonBg: string;       // Accent buttons background (e.g., bg-indigo-600 hover:bg-indigo-700)
    primaryText: string;           // Primary highlighted text indicators (e.g., text-indigo-600)
    primaryBg: string;             // Ambient light backgrounds (e.g., bg-indigo-50)
    primaryBorder: string;         // Light border highlights (e.g., border-indigo-100)
    gradientHero: string;          // Main dashboard hero card background (e.g., from-indigo-600 to-violet-700)
    ringColor: string;             // Focus indicator rings (e.g., focus:ring-indigo-500)
  };

  // Dynamically populated department contacts based on college domain
  contacts: {
    admissions: { email: string; phone: string; dept: string };
    academics: { email: string; phone: string; dept: string };
    finances: { email: string; phone: string; dept: string };
    advising: { email: string; phone: string; dept: string };
    housing: { email: string; phone: string; dept: string };
    medical: { email: string; phone: string; dept: string };
    library: { email: string; phone: string; dept: string };
    meals: { email: string; phone: string; dept: string };
    security: { email: string; phone: string; dept: string };
  };
}

export const COLLEGES_DB: Record<string, CollegeBranding> = {
  JERICHO: {
    id: 'JERICHO',
    name: 'Jericho University',
    shortName: 'Jericho Uni',
    slogan: 'Excelsior et Veritas — Veritas Vincit',
    domain: 'jericho.edu',
    logoStyle: 'crest',
    logoInitials: 'JU',
    colors: {
      sidebarBg: 'bg-indigo-950',
      sidebarActiveBg: 'bg-indigo-900',
      sidebarHoverBg: 'hover:bg-indigo-900/40',
      sidebarText: 'text-indigo-200',
      sidebarTextActive: 'text-white',
      sidebarBorder: 'border-indigo-900',
      sidebarBadgeText: 'text-indigo-400',
      primaryButtonBg: 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-indigo-100',
      primaryText: 'text-indigo-600',
      primaryBg: 'bg-indigo-50',
      primaryBorder: 'border-indigo-120',
      gradientHero: 'from-indigo-650 to-indigo-950',
      ringColor: 'focus:ring-indigo-500'
    },
    contacts: {
      admissions: { email: 'admissions@jericho.edu', phone: '+1 (555) 101-2000', dept: 'Admissions Office' },
      academics: { email: 'registrar@jericho.edu', phone: '+1 (555) 101-3000', dept: "Registrar's Office" },
      finances: { email: 'bursar@jericho.edu', phone: '+1 (555) 101-4000', dept: 'Bursar & Financial Aid' },
      advising: { email: 'advising.eng@jericho.edu', phone: '+1 (555) 101-5000', dept: 'Engineering Advising Center' },
      housing: { email: 'reslife@jericho.edu', phone: '+1 (555) 101-6000', dept: 'Residential Life' },
      medical: { email: 'healthcenter@jericho.edu', phone: '+1 (555) 101-7000', dept: 'University Health Services' },
      library: { email: 'library@jericho.edu', phone: '+1 (555) 101-8000', dept: 'Main Library Services' },
      meals: { email: 'dining@jericho.edu', phone: '+1 (555) 101-9000', dept: 'Dining & Meal Plan Services' },
      security: { email: 'security@jericho.edu', phone: '+1 (555) 101-0000', dept: 'Public Safety & Access' }
    }
  },
  PROMETHEUS: {
    id: 'PROMETHEUS',
    name: 'Prometheus Tech',
    shortName: 'PromTech',
    slogan: 'Igniting Innovation, Designing the Future',
    domain: 'promtech.edu',
    logoStyle: 'tech',
    logoInitials: 'PT',
    colors: {
      sidebarBg: 'bg-slate-900',
      sidebarActiveBg: 'bg-amber-600',
      sidebarHoverBg: 'hover:bg-slate-800',
      sidebarText: 'text-slate-400',
      sidebarTextActive: 'text-white',
      sidebarBorder: 'border-slate-800',
      sidebarBadgeText: 'text-amber-500',
      primaryButtonBg: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold',
      primaryText: 'text-amber-500',
      primaryBg: 'bg-amber-500/10',
      primaryBorder: 'border-amber-500/20',
      gradientHero: 'from-slate-950 via-slate-900 to-amber-950/40',
      ringColor: 'focus:ring-amber-500'
    },
    contacts: {
      admissions: { email: 'admissions@promtech.edu', phone: '+1 (555) 202-3000', dept: 'Admissions & Fellowships' },
      academics: { email: 'registrar@promtech.edu', phone: '+1 (555) 202-3100', dept: 'Office of Records & Scheduling' },
      finances: { email: 'bursar@promtech.edu', phone: '+1 (555) 202-3200', dept: 'Accounts Receivable & Billing' },
      advising: { email: 'advising@promtech.edu', phone: '+1 (555) 202-3300', dept: 'STEM Academic Advising Center' },
      housing: { email: 'housing@promtech.edu', phone: '+1 (555) 202-3400', dept: 'Campus Innovation Dorms' },
      medical: { email: 'wellness@promtech.edu', phone: '+1 (555) 202-3500', dept: 'Prometheus Health & Wellness Shield' },
      library: { email: 'library@promtech.edu', phone: '+1 (555) 202-3600', dept: 'Robotics & Knowledge Commons' },
      meals: { email: 'dining@promtech.edu', phone: '+1 (555) 202-3700', dept: 'Smart Eatery Services' },
      security: { email: 'threat-response@promtech.edu', phone: '+1 (555) 202-9111', dept: 'Platform Security & Core Control' }
    }
  },
  HORIZON: {
    id: 'HORIZON',
    name: 'Horizon Green College',
    shortName: 'Horizon',
    slogan: 'Nurturing Mind, Body, and Sustainable Horizons',
    domain: 'horizon.edu',
    logoStyle: 'modern',
    logoInitials: 'HG',
    colors: {
      sidebarBg: 'bg-emerald-950',
      sidebarActiveBg: 'bg-emerald-800',
      sidebarHoverBg: 'hover:bg-emerald-900/60',
      sidebarText: 'text-emerald-300',
      sidebarTextActive: 'text-white',
      sidebarBorder: 'border-emerald-900',
      sidebarBadgeText: 'text-emerald-400',
      primaryButtonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      primaryText: 'text-emerald-600',
      primaryBg: 'bg-emerald-50',
      primaryBorder: 'border-emerald-100',
      gradientHero: 'from-emerald-800 to-teal-950',
      ringColor: 'focus:ring-emerald-500'
    },
    contacts: {
      admissions: { email: 'join@horizon.edu', phone: '+1 (555) 303-4000', dept: 'Admissions & Earth Services' },
      academics: { email: 'coursework@horizon.edu', phone: '+1 (555) 303-4100', dept: 'Registrar for Sustainability Systems' },
      finances: { email: 'financial@horizon.edu', phone: '+1 (555) 303-4200', dept: 'Ecology Grants & Student Accounts' },
      advising: { email: 'advisors@horizon.edu', phone: '+1 (555) 303-4311', dept: 'Mindfulness & Academic Mentors' },
      housing: { email: 'ecolofts@horizon.edu', phone: '+1 (555) 303-4400', dept: 'Sustainable Residential Lofts' },
      medical: { email: 'clinic@horizon.edu', phone: '+1 (555) 303-4500', dept: 'Holistic Health & Medical Services' },
      library: { email: 'reading@horizon.edu', phone: '+1 (555) 303-4600', dept: 'Evergreen Botanical Archives' },
      meals: { email: 'organic@horizon.edu', phone: '+1 (555) 303-4700', dept: 'Farm-to-Table Dining Cooperative' },
      security: { email: 'safety@horizon.edu', phone: '+1 (555) 303-4800', dept: 'Eco-Sentries & Campus Wayfinding' }
    }
  },
  VANGUARD: {
    id: 'VANGUARD',
    name: 'Vanguard Academy',
    shortName: 'Vanguard',
    slogan: 'Laying the Vanguard of Leadership and Commerce',
    domain: 'vanguard.edu',
    logoStyle: 'shield',
    logoInitials: 'VA',
    colors: {
      sidebarBg: 'bg-purple-950',
      sidebarActiveBg: 'bg-indigo-600',
      sidebarHoverBg: 'hover:bg-indigo-900/50',
      sidebarText: 'text-indigo-200',
      sidebarTextActive: 'text-white',
      sidebarBorder: 'border-purple-900',
      sidebarBadgeText: 'text-indigo-400',
      primaryButtonBg: 'bg-indigo-650 hover:bg-indigo-750 text-white',
      primaryText: 'text-indigo-700',
      primaryBg: 'bg-indigo-50/70',
      primaryBorder: 'border-indigo-150',
      gradientHero: 'from-purple-900 to-indigo-950',
      ringColor: 'focus:ring-indigo-650'
    },
    contacts: {
      admissions: { email: 'executive.admissions@vanguard.edu', phone: '+1 (555) 404-5000', dept: 'Executive Admissions Circle' },
      academics: { email: 'registrar@vanguard.edu', phone: '+1 (555) 404-5100', dept: 'Vanguard Registrar Consortium' },
      finances: { email: 'treasury@vanguard.edu', phone: '+1 (555) 404-5200', dept: 'Office of Treasury & Financial Trusts' },
      advising: { email: 'advising@vanguard.edu', phone: '+1 (555) 404-5300', dept: 'Global Leadership Strategy Council' },
      housing: { email: 'vanguard.house@vanguard.edu', phone: '+1 (555) 404-5400', dept: 'Board of Residential Regents' },
      medical: { email: 'concierge.health@vanguard.edu', phone: '+1 (555) 404-5500', dept: 'Vanguard Concierge Health Services' },
      library: { email: 'archives@vanguard.edu', phone: '+1 (555) 404-5600', dept: 'Historical Founders Terminal' },
      meals: { email: 'dining.hall@vanguard.edu', phone: '+1 (555) 404-5700', dept: 'Sovereign Dining Club' },
      security: { email: 'regent.security@vanguard.edu', phone: '+1 (555) 404-5800', dept: 'Regent Public Safeguards & Access' }
    }
  }
};

// CRITICAL EXPORT: Centralized configuration selector to easily change branding of the application in one file!
// Swapping this variable updates all pages, styling classes, logo motifs, and campus-wide structures.
export const DEFAULT_ACTIVE_COLLEGE_ID: keyof typeof COLLEGES_DB = 'JERICHO';

// -------------------------------------------------------------
// College Logo Dynamic Vector Component (Professional Design)
// -------------------------------------------------------------
interface CollegeLogoProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark'; // 'light' is for light text/icon on dark sidebar, 'dark' is for dark text/icon on white background
  branding?: CollegeBranding;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({ className = '', size = 32, variant = 'light', branding }) => {
  const brand = branding || COLLEGES_DB[DEFAULT_ACTIVE_COLLEGE_ID];
  const style = brand.logoStyle;

  // Premium, highly readable text labeling
  const textColor = variant === 'light' ? '#FFFFFF' : '#111827';
  const subtextColor = variant === 'light' ? 'rgba(255, 255, 255, 0.45)' : '#4B5563';

  // Render highly-crafted premium gold vector shapes
  const renderIcon = () => {
    switch (style) {
      case 'crest':
        // Academic Shield Crest (Double bordered, open study book, and star)
        return (
          <g>
            {/* Outer golden shield */}
            <path 
              d="M12 2 L21 5.5 V14 C21 18.5 12 22 12 22 C12 22 3 18.5 3 14 V5.5 Z" 
              fill="url(#goldGradient)" 
              stroke="url(#deepGoldGradient)" 
              strokeWidth="0.8"
            />
            {/* Inner dark center shield accent */}
            <path 
              d="M12 3.5 L19.2 6.3 V13 C19.2 16.8 12 19.8 12 19.8 C12 19.8 4.8 16.8 4.8 13 V6.3 Z" 
              fill={variant === 'light' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.95)'} 
              stroke="url(#brightGoldGradient)" 
              strokeWidth="1" 
            />
            {/* Premium Open Book */}
            <path 
              d="M8.5 11 C8.5 11, 10.5 10.2 12 11.2 C13.5 10.2 15.5 11 15.5 11 V14.5 C15.5 14.5 13.5 13.7 12 14.7 C10.5 13.7 8.5 14.5 8.5 14.5 Z" 
              fill="none" 
              stroke="url(#goldGradient)" 
              strokeWidth="1.2" 
              strokeLinejoin="round" 
            />
            <line x1="12" y1="11.2" x2="12" y2="14.7" stroke="url(#goldGradient)" strokeWidth="1.2" />
            {/* Academic Star of Excellence */}
            <polygon 
              points="12,5.5 12.8,7.3 14.8,7.3 13.2,8.5 13.8,10.3 12,9.1 10.2,10.3 10.8,8.5 9.2,7.3 11.2,7.3" 
              fill="url(#goldGradient)" 
            />
          </g>
        );
      case 'tech':
        // Modern Interlinking Quantum Hexagon
        return (
          <g>
            {/* Double outer golden crystalline hexagons */}
            <polygon 
              points="12,2 22,7.5 22,18.5 12,24 2,18.5 2,7.5" 
              fill="none" 
              stroke="url(#goldGradient)" 
              strokeWidth="1.8" 
              strokeLinejoin="round" 
            />
            <polygon 
              points="12,4.8 19.8,9 19.8,17 12,21.2 4.2,17 4.2,9" 
              fill={variant === 'light' ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.9)'} 
              stroke="url(#deepGoldGradient)" 
              strokeWidth="1" 
              strokeDasharray="2 1.5" 
              strokeLinejoin="round" 
            />
            {/* Tech core nucleus */}
            <circle cx="12" cy="13" r="3" fill="url(#brightGoldGradient)" />
            {/* High-tech orbit node dots */}
            <circle cx="12" cy="4.8" r="1.5" fill="url(#goldGradient)" />
            <circle cx="4.2" cy="17" r="1.5" fill="url(#goldGradient)" />
            <circle cx="19.8" cy="17" r="1.5" fill="url(#goldGradient)" />
            {/* Node connectors */}
            <line x1="12" y1="4.8" x2="12" y2="10" stroke="url(#goldGradient)" strokeWidth="1" />
            <line x1="4.2" y1="17" x2="9.4" y2="14.2" stroke="url(#goldGradient)" strokeWidth="1" />
            <line x1="19.8" y1="17" x2="14.6" y2="14.2" stroke="url(#goldGradient)" strokeWidth="1" />
          </g>
        );
      case 'modern':
        // Minimalist Sustainable Organic Globe / Crown Leaf
        return (
          <g>
            {/* Premium layered orbit rings */}
            <circle cx="12" cy="12" r="9.5" fill="none" stroke="url(#deepGoldGradient)" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="8" fill={variant === 'light' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.93)'} stroke="url(#goldGradient)" strokeWidth="1.5" />
            {/* Sustainable golden core leaves leaf shape */}
            <path 
              d="M12 4.5 C15.5 8, 15.5 16, 12 19.5 C8.5 16, 8.5 8, 12 4.5 Z" 
              fill="url(#goldGradient)" 
              opacity="0.85" 
            />
            <path 
              d="M12 4.5 C13.5 8, 13.5 16, 12 19.5" 
              fill="none" 
              stroke="url(#brightGoldGradient)" 
              strokeWidth="0.8" 
            />
            <circle cx="12" cy="12" r="1.5" fill="url(#brightGoldGradient)" />
          </g>
        );
      case 'shield':
        // Prestigious Guild Chevron Shield & Crown
        return (
          <g>
            {/* Bold Golden Shield silhouette */}
            <path 
              d="M4.5 2 H19.5 V12.5 C19.5 18 12 22 12 22 C12 22 4.5 18 4.5 12.5 Z" 
              fill={variant === 'light' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.95)'} 
              stroke="url(#goldGradient)" 
              strokeWidth="2" 
              strokeLinejoin="round" 
            />
            {/* Executive Crown on top */}
            <path 
              d="M8.5 4.5 L9.5 6.5 L12 4.5 L14.5 6.5 L15.5 4.5 L15 8 H9 Z" 
              fill="url(#goldGradient)" 
              stroke="url(#deepGoldGradient)" 
              strokeWidth="0.5" 
            />
            {/* Imperial Chevrons */}
            <path d="M7.5 11.5 L12 14.5 L16.5 11.5" fill="none" stroke="url(#goldGradient)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M7.5 14 L12 17 L16.5 14" fill="none" stroke="url(#brightGoldGradient)" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-all duration-300 transform hover:scale-105"
      >
        <defs>
          {/* Real-metallic gold premium multi-stop linear gradient */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="25%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#AA7C11" />
            <stop offset="75%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#F9E282" />
          </linearGradient>
          {/* Deep gold outline/contour gradient */}
          <linearGradient id="deepGoldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F2C542" />
            <stop offset="50%" stopColor="#8A5A00" />
            <stop offset="100%" stopColor="#5C3B00" />
          </linearGradient>
          {/* Mirror specular bright highlight gradient */}
          <linearGradient id="brightGoldGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#FFECA1" />
            <stop offset="70%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9C6B0D" />
          </linearGradient>
        </defs>
        {renderIcon()}
      </svg>

      {/* College text badge, perfectly aligned */}
      <div className="flex flex-col text-left">
        <span 
          className="text-base font-black tracking-tight leading-tight uppercase"
          style={{ color: textColor }}
        >
          {brand.name}
        </span>
        <span 
          className="text-[9px] font-extrabold uppercase tracking-widest leading-none mt-0.5 truncate max-w-[150px] drop-shadow-sm"
          style={{ 
            color: subtextColor,
            letterSpacing: '0.08em'
          }}
        >
          {brand.slogan}
        </span>
      </div>
    </div>
  );
};


// -------------------------------------------------------------
// Interactive State Context Support (Allows live-testing brand styles instantly)
// -------------------------------------------------------------
export interface CollegeContextType {
  activeCollege: CollegeBranding;
  setActiveCollegeById: (id: keyof typeof COLLEGES_DB) => void;
  allColleges: CollegeBranding[];
}

const CollegeBrandingContext = createContext<CollegeContextType | undefined>(undefined);

export const CollegeBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCollege, setActiveCollege] = useState<CollegeBranding>(COLLEGES_DB[DEFAULT_ACTIVE_COLLEGE_ID]);

  // Persist branding choice in localstorage for delightful continuity
  useEffect(() => {
    const saved = localStorage.getItem('ju_active_college_branding');
    if (saved && COLLEGES_DB[saved]) {
      setActiveCollege(COLLEGES_DB[saved]);
    }
  }, []);

  // Update HTML header title immediately when activeCollege state changes
  useEffect(() => {
    document.title = `${activeCollege.name} - Student Portal`;
  }, [activeCollege]);

  const setActiveCollegeById = (id: keyof typeof COLLEGES_DB) => {
    if (COLLEGES_DB[id]) {
      setActiveCollege(COLLEGES_DB[id]);
      localStorage.setItem('ju_active_college_branding', id as string);
    }
  };

  return (
    <CollegeBrandingContext.Provider 
      value={{ 
        activeCollege, 
        setActiveCollegeById, 
        allColleges: Object.values(COLLEGES_DB) 
      }}
    >
      {children}
    </CollegeBrandingContext.Provider>
  );
};

export const useCollegeBranding = () => {
  const context = useContext(CollegeBrandingContext);
  if (!context) {
    // Graceful fallback if Context provider is omitted to ensure zero breaking compilation errors
    return {
      activeCollege: COLLEGES_DB[DEFAULT_ACTIVE_COLLEGE_ID],
      setActiveCollegeById: () => {},
      allColleges: Object.values(COLLEGES_DB)
    };
  }
  return context;
};
