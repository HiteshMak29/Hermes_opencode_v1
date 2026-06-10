
import { StudentProfile, Semester, Advisor, Appointment, FeeItem, FinancialAid, HousingInfo, MedicalInfo, LibraryTerm, MealPlanInfo, Penalty, UserRole, RetentionScore, EBook, AccessZone, AccessLog, ScholarshipOpportunity } from './types';

// Role simulation: Set to 'Admin' to see the Retention section, 'Student' to hide it.
export const CURRENT_USER_ROLE: UserRole = 'Admin';

export const STUDENT_MOCK: StudentProfile = {
  name: "Alex Johnson",
  studentId: "2024-8842-JU",
  major: "Computer Science & Engineering",
  minor: "Mathematics",
  programName: "Bachelor of Science",
  year: 3,
  currentGpa: 3.82,
  totalCredits: 92,
  admissionProgress: 100,
  profileImage: "https://picsum.photos/seed/alex/200/200"
};

export const ADVISOR_MOCK: Advisor = {
  name: "Dr. Sarah Mitchell",
  department: "School of Engineering",
  email: "s.mitchell@jericho.edu",
  office: "Engineering Hall, Room 402",
  avatar: "https://picsum.photos/seed/advisor/200/200"
};

export const CONTACTS_MOCK = {
  admissions: {
    email: "admissions@jericho.edu",
    phone: "+1 (555) 101-2000",
    dept: "Admissions Office"
  },
  academics: {
    email: "registrar@jericho.edu",
    phone: "+1 (555) 101-3000",
    dept: "Registrar's Office"
  },
  finances: {
    email: "bursar@jericho.edu",
    phone: "+1 (555) 101-4000",
    dept: "Bursar & Financial Aid"
  },
  advising: {
    email: "advising.eng@jericho.edu",
    phone: "+1 (555) 101-5000",
    dept: "Engineering Advising Center"
  },
  housing: {
    email: "reslife@jericho.edu",
    phone: "+1 (555) 101-6000",
    dept: "Residential Life"
  },
  medical: {
    email: "healthcenter@jericho.edu",
    phone: "+1 (555) 101-7000",
    dept: "University Health Services"
  },
  library: {
    email: "library@jericho.edu",
    phone: "+1 (555) 101-8000",
    dept: "Main Library Services"
  },
  meals: {
    email: "dining@jericho.edu",
    phone: "+1 (555) 101-9000",
    dept: "Dining & Meal Plan Services"
  },
  security: {
    email: "security@jericho.edu",
    phone: "+1 (555) 101-0000",
    dept: "Public Safety & Access"
  }
};

export const ACCESS_ZONES: AccessZone[] = [
  { id: 'z1', name: 'Campus Main Gate', minRole: 'Student', description: 'Primary university entrance.' },
  { id: 'z2', name: 'Engineering Hall', minRole: 'Student', description: 'Main academic building access.' },
  { id: 'z3', name: 'Robotics Research Lab', minRole: 'Faculty', description: 'Restricted research area.' },
  { id: 'z4', name: 'Data Center / Server Room', minRole: 'Admin', description: 'High-security IT facility.' },
  { id: 'z5', name: 'Main Library', minRole: 'Student', description: '24/7 library access.' },
  { id: 'z6', name: 'Evergreen Commons (Dorms)', minRole: 'Student', description: 'Residential entry.' },
  { id: 'z7', name: 'Faculty Lounge', minRole: 'Faculty', description: 'Staff private area.' }
];

export const INITIAL_ACCESS_LOGS: AccessLog[] = [
  { id: 'l1', location: 'Campus Main Gate', timestamp: 'Oct 22, 2024 08:30 AM', status: 'Granted' },
  { id: 'l2', location: 'Engineering Hall', timestamp: 'Oct 22, 2024 08:45 AM', status: 'Granted' },
  { id: 'l3', location: 'Robotics Research Lab', timestamp: 'Oct 22, 2024 10:15 AM', status: 'Denied', reason: 'Higher clearance required' },
  { id: 'l4', location: 'Main Library', timestamp: 'Oct 22, 2024 02:20 PM', status: 'Granted' }
];

export const LIBRARY_MOCK: LibraryTerm[] = [
  {
    id: "f24",
    term: "Fall",
    year: 2024,
    books: [
      { id: "b1", title: "Introduction to Algorithms", author: "Cormen et al.", issueDate: "Sept 10, 2024", dueDate: "Sept 24, 2024", returnDate: "Sept 22, 2024", status: "Returned" },
      { id: "b2", title: "Clean Code", author: "Robert C. Martin", issueDate: "Oct 01, 2024", dueDate: "Oct 15, 2024", status: "Issued" },
      { id: "b3", title: "Artificial Intelligence: A Modern Approach", author: "Russell & Norvig", issueDate: "Oct 05, 2024", dueDate: "Oct 19, 2024", status: "Issued" }
    ]
  },
  {
    id: "s24",
    term: "Spring",
    year: 2024,
    books: [
      { id: "b4", title: "The Pragmatic Programmer", author: "Hunt & Thomas", issueDate: "Jan 15, 2024", dueDate: "Jan 29, 2024", returnDate: "Feb 01, 2024", status: "Returned" },
      { id: "b5", title: "Design Patterns", author: "Gang of Four", issueDate: "Feb 10, 2024", dueDate: "Feb 24, 2024", returnDate: "Feb 24, 2024", status: "Returned" }
    ]
  }
];

export const EBOOKS_MOCK: EBook[] = [
  {
    id: 'eb1',
    title: "Relativity: The Special and General Theory",
    author: "Albert Einstein",
    coverUrl: "https://standardebooks.org/ebooks/albert-einstein/relativity/downloads/cover.jpg",
    readerUrl: "https://standardebooks.org/ebooks/albert-einstein/relativity/text/single-page",
    category: "Physics",
    description: "Einstein's definitive work explaining the principles of special and general relativity for a broader audience.",
    termId: 'f24'
  },
  {
    id: 'eb2',
    title: "The Wealth of Nations",
    author: "Adam Smith",
    coverUrl: "https://standardebooks.org/ebooks/adam-smith/the-wealth-of-nations/downloads/cover.jpg",
    readerUrl: "https://standardebooks.org/ebooks/adam-smith/the-wealth-of-nations/text/single-page",
    category: "Economics",
    description: "The foundational work in modern economics and a landmark in the history of economic thought.",
    termId: 's24'
  },
  {
    id: 'eb3',
    title: "The Chemical History of a Candle",
    author: "Michael Faraday",
    coverUrl: "https://standardebooks.org/ebooks/michael-faraday/the-chemical-history-of-a-candle/downloads/cover.jpg",
    readerUrl: "https://standardebooks.org/ebooks/michael-faraday/the-chemical-history-of-a-candle/text/single-page",
    category: "Chemistry",
    description: "Faraday's famous series of lectures explaining basic chemical principles through the observation of a burning candle.",
    termId: 'f24'
  },
  {
    id: 'eb4',
    title: "Calculus Made Easy",
    author: "Silvanus P. Thompson",
    coverUrl: "https://standardebooks.org/ebooks/silvanus-p-thompson/calculus-made-easy/downloads/cover.jpg",
    readerUrl: "https://standardebooks.org/ebooks/silvanus-p-thompson/calculus-made-easy/text/single-page",
    category: "Mathematics",
    description: "One of the most popular introductions to calculus, emphasizing simplicity and clear explanation.",
    termId: 's24'
  },
  {
    id: 'eb5',
    title: "The Elements of Statistical Method",
    author: "Horace Secrist",
    coverUrl: "https://picsum.photos/seed/stats/300/400",
    readerUrl: "https://www.gutenberg.org/files/65578/65578-h/65578-h.htm",
    category: "Statistics",
    description: "A comprehensive guide to statistical analysis and the systematic gathering of data for social and physical sciences.",
    termId: 'f24'
  }
];

export const LIBRARY_PENALTIES: Penalty[] = [
  { id: "lp1", description: "Late Return: The Pragmatic Programmer", amount: 15, date: "Feb 01, 2024" }
];

export const MEAL_PLAN_MOCK: MealPlanInfo = {
  planName: "Diamond Unlimited Plan",
  planType: "Full Board",
  openingBalance: 2500,
  currentBalance: 1420.50,
  walletId: "JU-WALLET-8842",
  lastTopUp: "Aug 15, 2024",
  transactions: [
    { id: "t1", location: "Main Cafeteria", amount: 12.50, date: "Oct 21, 2024", time: "12:30 PM" },
    { id: "t2", location: "Starbucks Library", amount: 6.75, date: "Oct 21, 2024", time: "09:15 AM" },
    { id: "t3", location: "Evening Grill", amount: 18.00, date: "Oct 20, 2024", time: "07:45 PM" },
    { id: "t4", location: "Main Cafeteria", amount: 11.20, date: "Oct 20, 2024", time: "01:10 PM" }
  ]
};

export const HOUSING_MOCK: HousingInfo = {
  buildingName: "Evergreen Commons",
  roomName: "402-B (North Wing)",
  partnerName: "Jordan Smith",
  status: "Occupied",
  semesterCharges: 4500,
  moveInDate: "Aug 22, 2024",
  moveOutDate: "May 18, 2025",
  penalties: [
    { id: "p1", description: "Unreturned Laundry Key", amount: 25, date: "Sept 12, 2024" },
    { id: "p2", description: "Quiet Hours Violation (Warning)", amount: 0, date: "Oct 05, 2024" }
  ]
};

export const MEDICAL_MOCK: MedicalInfo = {
  status: "Action Required",
  requirements: [
    { id: "m1", name: "MMR (Measles, Mumps, Rubella)", status: "Uploaded", uploadDate: "July 12, 2024", dueDate: "Aug 15, 2024", description: "Proof of two doses of MMR vaccine." },
    { id: "m2", name: "Meningococcal Vaccine", status: "Uploaded", uploadDate: "July 14, 2024", dueDate: "Aug 15, 2024", description: "Proof of Meningitis ACWY vaccine." },
    { id: "m3", name: "Physical Exam Form", status: "Pending", dueDate: "Nov 15, 2024", description: "Signed physical evaluation from a licensed physician." },
    { id: "m4", name: "Health Insurance Proof", status: "Uploaded", uploadDate: "Aug 01, 2024", dueDate: "Sept 01, 2024", description: "Scan of your current insurance card." }
  ]
};

export const SEMESTERS_MOCK: Semester[] = [
  {
    id: "f23",
    term: "Fall",
    year: 2023,
    gpa: 3.9,
    courses: [
      { id: "cs301", name: "Data Structures", code: "CS301", credits: 4, grade: "A", points: 4.0, status: "Completed", attendance: 95, division: 'UG' },
      { id: "ma202", name: "Linear Algebra", code: "MA202", credits: 3, grade: "A-", points: 3.7, status: "Completed", attendance: 88, division: 'UG' },
      { id: "cs305", name: "Database Systems", code: "CS305", credits: 4, grade: "A", points: 4.0, status: "Completed", attendance: 100, division: 'UG' }
    ]
  },
  {
    id: "s24",
    term: "Spring",
    year: 2024,
    gpa: 3.75,
    courses: [
      { id: "cs401", name: "Algorithm Design", code: "CS401", credits: 4, grade: "B+", points: 3.3, status: "Completed", attendance: 82, division: 'UG' },
      { id: "cs405", name: "Operating Systems", code: "CS405", credits: 4, grade: "A", points: 4.0, status: "Completed", attendance: 91, division: 'UG' },
      { id: "hu101", name: "Ethics in Tech", code: "HU101", credits: 2, grade: "A", points: 4.0, status: "Completed", attendance: 98, division: 'UG' }
    ]
  }
];

export const CURRENT_COURSES: Semester = {
  id: "f24",
  term: "Fall",
  year: 2024,
  gpa: 0,
  courses: [
    { id: "cs501", name: "Artificial Intelligence", code: "CS501", credits: 4, status: "In Progress", attendance: 85, division: 'GR' },
    { id: "cs505", name: "Computer Networks", code: "CS505", credits: 4, status: "In Progress", attendance: 92, division: 'GR' },
    { id: "ma401", name: "Graph Theory", code: "MA401", credits: 3, status: "In Progress", attendance: 78, division: 'UG' }
  ]
};

export const APPOINTMENTS_MOCK: Appointment[] = [
  { id: "1", type: "Academic Advising", date: "Oct 24, 2024", time: "10:30 AM", location: "Room 402 / Zoom", status: "Confirmed" },
  { id: "2", type: "Career Fair Sync", date: "Oct 28, 2024", time: "2:00 PM", location: "Career Center", status: "Pending" }
];

export const FEES_MOCK: FeeItem[] = [
  { id: "tuition", description: "Tuition Fees Fall 2024", amount: 12500, type: "Tuition" },
  { id: "lab", description: "Engineering Lab Access", amount: 450, type: "Lab" },
  { id: "insurance", description: "Student Health Insurance", amount: 1200, type: "Insurance" }
];

export const AID_MOCK: FinancialAid[] = [
  { id: "merit", source: "Excellence Merit Scholarship", amount: 5000, status: "Awarded" },
  { id: "grant", source: "Federal Pell Grant", amount: 3200, status: "Disbursed" }
];

export const RETENTION_MOCK: RetentionScore = {
  confidence: 12.5, 
  riskLevel: 'Low',
  factors: [
    { name: 'Academic Record', impact: 'Positive', description: 'Strong GPA (3.82) indicates high engagement with coursework.' },
    { name: 'Financial Status', impact: 'Negative', description: 'Pending balance of $8,420 and academic hold are potential friction points.' },
    { name: 'Campus Life', impact: 'Neutral', description: 'Regular library and cafeteria usage indicates steady campus presence.' },
    { name: 'Medical Compliance', impact: 'Neutral', description: 'Pending forms for current term orientation.' }
  ],
  trend: [
    { month: 'Aug', score: 5 },
    { month: 'Sep', score: 8 },
    { month: 'Oct', score: 12.5 },
  ]
};

export const MODULE_USAGE_MOCK = [
  { name: 'Dashboard', views: 4500, avgTime: 120, bounceRate: 5 },
  { name: 'Admissions', views: 1200, avgTime: 300, bounceRate: 15 },
  { name: 'Academics', views: 3800, avgTime: 450, bounceRate: 8 },
  { name: 'Financial Aid', views: 2100, avgTime: 600, bounceRate: 12 },
  { name: 'Degree Tracker', views: 2300, avgTime: 550, bounceRate: 6 },
  { name: 'Careers & Jobs', views: 1950, avgTime: 420, bounceRate: 9 },
  { name: 'Wellness Hub', views: 2750, avgTime: 380, bounceRate: 5 },
  { name: 'Campus Map', views: 3400, avgTime: 240, bounceRate: 4 },
  { name: 'Advising', views: 900, avgTime: 400, bounceRate: 20 },
  { name: 'Housing', views: 1500, avgTime: 350, bounceRate: 18 },
  { name: 'Medical', views: 800, avgTime: 200, bounceRate: 25 },
  { name: 'Library', views: 2500, avgTime: 800, bounceRate: 10 },
  { name: 'Meal Wallet', views: 3200, avgTime: 90, bounceRate: 4 },
  { name: 'Access Card', views: 1800, avgTime: 150, bounceRate: 7 },
  { name: 'Student Retention', views: 150, avgTime: 500, bounceRate: 2 },
  { name: 'Predictive Risk', views: 80, avgTime: 700, bounceRate: 1 },
  { name: 'System Status', views: 1600, avgTime: 110, bounceRate: 3 },
  { name: 'Source Connectivity', views: 310, avgTime: 480, bounceRate: 2 },
];

export const HOURLY_ENGAGEMENT_MOCK = [
  { hour: '00:00', users: 120 },
  { hour: '04:00', users: 45 },
  { hour: '08:00', users: 850 },
  { hour: '12:00', users: 1500 },
  { hour: '16:00', users: 1200 },
  { hour: '20:00', users: 600 },
  { hour: '23:59', users: 200 },
];

export const RECENT_ACTIVITY_MOCK = [
  { id: 'a1', user: 'Dr. Sarah Mitchell', action: 'Accessed Predictive Risk', module: 'Predictive Risk', time: '2 mins ago' },
  { id: 'a2', user: 'Alex Johnson', action: 'Checked Grades', module: 'Academics', time: '15 mins ago' },
  { id: 'a3', user: 'Jordan Smith', action: 'Topped up Meal Wallet', module: 'Meal Wallet', time: '45 mins ago' },
  { id: 'a4', user: 'Admin User', action: 'Updated Retention Rules', module: 'Student Retention', time: '1 hour ago' },
];

export const SYSTEM_STATUS_MOCK = [
  { id: 's1', name: 'Student Portal', status: 'Operational', uptime: '99.99%', lastIncident: 'None' },
  { id: 's2', name: 'Learning Management (LMS)', status: 'Operational', uptime: '99.95%', lastIncident: '2 days ago' },
  { id: 's3', name: 'Library Resources', status: 'Degraded Performance', uptime: '98.50%', lastIncident: 'Ongoing' },
  { id: 's4', name: 'Campus Wi-Fi', status: 'Operational', uptime: '99.20%', lastIncident: '1 week ago' },
  { id: 's5', name: 'Financial Systems', status: 'Operational', uptime: '99.90%', lastIncident: 'None' },
  { id: 's6', name: 'Email Services', status: 'Operational', uptime: '100%', lastIncident: 'None' },
];

export const INCIDENTS_MOCK = [
  { 
    id: 'inc-001', 
    title: 'Library Database Latency', 
    tier: 'P3', 
    status: 'Investigating', 
    team: 'IT Infrastructure', 
    startTime: '2026-03-30T10:15:00Z',
    description: 'Users reporting slow response times when searching the digital library catalog.'
  },
  { 
    id: 'inc-002', 
    title: 'LMS Login Issues', 
    tier: 'P2', 
    status: 'Resolved', 
    team: 'Software Engineering', 
    startTime: '2026-03-28T08:00:00Z',
    endTime: '2026-03-28T10:30:00Z',
    description: 'Intermittent 500 errors on the login page due to database connection pool exhaustion.'
  },
  { 
    id: 'inc-003', 
    title: 'Campus-wide Power Outage', 
    tier: 'P1', 
    status: 'Resolved', 
    team: 'Facilities & IT', 
    startTime: '2026-03-15T14:00:00Z',
    endTime: '2026-03-15T16:45:00Z',
    description: 'Major power failure affecting North Campus. All systems were failed over to secondary data center.'
  },
];

export const DEPARTMENTS = [
  'IT Support',
  'Admissions',
  'Registrar',
  'Finance',
  'Housing',
  'Student Life',
  'Medical Center'
];

export const TICKET_STATUSES = ['Open', 'In Progress', 'Pending Student', 'Resolved', 'Closed'];

export const TICKETS_MOCK = [
  {
    id: 'TKT-1001',
    subject: 'Cannot access student email',
    department: 'IT Support',
    status: 'Open',
    priority: 'High',
    studentId: '2024001',
    studentName: 'Alex Johnson',
    createdAt: '2026-03-30T09:00:00Z',
    assignedTo: 'Unassigned',
    messages: [
      { sender: 'Alex Johnson', text: 'I am getting an invalid password error even after reset.', timestamp: '2026-03-30T09:00:00Z' }
    ]
  },
  {
    id: 'TKT-1002',
    subject: 'Tuition payment confirmation',
    department: 'Finance',
    status: 'In Progress',
    priority: 'Medium',
    studentId: '2024001',
    studentName: 'Alex Johnson',
    createdAt: '2026-03-29T14:30:00Z',
    assignedTo: 'Sarah Miller',
    messages: [
      { sender: 'Alex Johnson', text: 'I paid my tuition yesterday but it still shows as unpaid in the portal.', timestamp: '2026-03-29T14:30:00Z' },
      { sender: 'Sarah Miller', text: 'Hello Alex, I am checking with the bank. It usually takes 24-48 hours to reflect.', timestamp: '2026-03-29T16:00:00Z' }
    ]
  },
  {
    id: 'TKT-1003',
    subject: 'Room change request',
    department: 'Housing',
    status: 'Resolved',
    priority: 'Low',
    studentId: '2024005',
    studentName: 'Jordan Smith',
    createdAt: '2026-03-25T10:00:00Z',
    assignedTo: 'Mike Ross',
    messages: [
      { sender: 'Jordan Smith', text: 'I would like to move to a single room if available.', timestamp: '2026-03-25T10:00:00Z' },
      { sender: 'Mike Ross', text: 'Your request has been approved. Please visit the housing office for keys.', timestamp: '2026-03-27T09:00:00Z' }
    ]
  }
];

export const SCHOLARSHIPS_MOCK: ScholarshipOpportunity[] = [
  {
    id: "SCH-001",
    name: "STEM Excellence Fellowship",
    description: "Awarded to high-achieving undergraduates in computer science and engineering disciplines. Minimum 3.5 GPA required.",
    amount: 7500,
    deadline: "2026-07-15",
    category: "STEM",
    minGpa: 3.5,
    majors: ["Computer Science & Engineering", "Software Engineering", "Mathematics"],
    smartMatchScore: 98,
    status: "Apply Now",
    sourceSystem: "SIS"
  },
  {
    id: "SCH-002",
    name: "Alumni Association Legacy Grant",
    description: "Supporting third-year and fourth-year students with leadership accomplishments. Generous funding provided by alumni donors.",
    amount: 4000,
    deadline: "2026-08-01",
    category: "Academic",
    minGpa: 3.0,
    smartMatchScore: 85,
    status: "Applied",
    sourceSystem: "CRM"
  },
  {
    id: "SCH-003",
    name: "Grace Hopper Women in Tech Grant",
    description: "Promoting diversity and inclusion in computer science, software engineering, and data science disciplines.",
    amount: 5000,
    deadline: "2026-06-30",
    category: "Diversity",
    minGpa: 3.2,
    majors: ["Computer Science & Engineering", "Software Engineering", "Data Science"],
    smartMatchScore: 92,
    status: "In Progress",
    sourceSystem: "External API"
  },
  {
    id: "SCH-004",
    name: "Jericho Community Need-Based Scholarship",
    description: "Designed for full-time students showing financial need based on standard scholarship application evaluation.",
    amount: 3500,
    deadline: "2026-07-10",
    category: "Need-Based",
    minGpa: 2.5,
    smartMatchScore: 70,
    status: "Apply Now",
    sourceSystem: "SIS"
  },
  {
    id: "SCH-005",
    name: "President's Honors Circle Scholar",
    description: "Our highest recognition, given to students maintaining a 3.9 GPA or above. Exceptional performance requirement.",
    amount: 10000,
    deadline: "2026-06-15",
    category: "Academic",
    minGpa: 3.9,
    smartMatchScore: 65, // Alex GPA is 3.82, so < 3.9 minGpa requirements
    status: "Closed",
    sourceSystem: "SIS"
  }
];
