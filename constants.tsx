
import { StudentProfile, Semester, Advisor, Appointment, FeeItem, FinancialAid, HousingInfo, MedicalInfo, LibraryTerm, MealPlanInfo, Penalty, UserRole, RetentionScore, EBook, AccessZone, AccessLog, ScholarshipOpportunity } from './types';

export const CURRENT_USER_ROLE: UserRole = 'Admin';

export const STUDENT_MOCK: StudentProfile = {
  name: '',
  studentId: '',
  major: '',
  minor: '',
  programName: '',
  year: 0,
  currentGpa: 0,
  totalCredits: 0,
  admissionProgress: 0,
  profileImage: ''
};

export const ADVISOR_MOCK: Advisor = {
  name: '',
  department: '',
  email: '',
  office: '',
  avatar: ''
};

export const CONTACTS_MOCK = {
  admissions: { email: '', phone: '', dept: '' },
  academics: { email: '', phone: '', dept: '' },
  finances: { email: '', phone: '', dept: '' },
  advising: { email: '', phone: '', dept: '' },
  housing: { email: '', phone: '', dept: '' },
  medical: { email: '', phone: '', dept: '' },
  library: { email: '', phone: '', dept: '' },
  meals: { email: '', phone: '', dept: '' },
  security: { email: '', phone: '', dept: '' }
};

export const ACCESS_ZONES: AccessZone[] = [];
export const INITIAL_ACCESS_LOGS: AccessLog[] = [];
export const LIBRARY_MOCK: LibraryTerm[] = [];
export const EBOOKS_MOCK: EBook[] = [];
export const LIBRARY_PENALTIES: Penalty[] = [];

export const MEAL_PLAN_MOCK: MealPlanInfo = {
  planName: '',
  planType: '',
  openingBalance: 0,
  currentBalance: 0,
  walletId: '',
  lastTopUp: '',
  transactions: []
};

export const HOUSING_MOCK: HousingInfo = {
  buildingName: '',
  roomName: '',
  partnerName: '',
  status: '' as any,
  semesterCharges: 0,
  moveInDate: '',
  moveOutDate: '',
  penalties: []
};

export const MEDICAL_MOCK: MedicalInfo = {
  status: '' as any,
  requirements: []
};

export const SEMESTERS_MOCK: Semester[] = [];

export const CURRENT_COURSES: Semester = {
  id: '',
  term: '',
  year: 0,
  gpa: 0,
  courses: []
};

export const APPOINTMENTS_MOCK: Appointment[] = [];
export const FEES_MOCK: FeeItem[] = [];
export const AID_MOCK: FinancialAid[] = [];

export const RETENTION_MOCK: RetentionScore = {
  confidence: 0,
  riskLevel: '' as any,
  factors: [],
  trend: []
};

export const MODULE_USAGE_MOCK: { name: string; views: number; avgTime: number; bounceRate: number }[] = [];
export const HOURLY_ENGAGEMENT_MOCK: { hour: string; users: number }[] = [];
export const RECENT_ACTIVITY_MOCK: { id: string; user: string; action: string; module: string; time: string }[] = [];
export const SYSTEM_STATUS_MOCK: { id: string; name: string; status: string; uptime: string; lastIncident: string }[] = [];
export const INCIDENTS_MOCK: { id: string; title: string; tier: string; status: string; team: string; startTime: string; endTime?: string; description: string }[] = [];
export const DEPARTMENTS: string[] = [];
export const TICKET_STATUSES: string[] = [];
export const TICKETS_MOCK: { id: string; subject: string; department: string; status: string; priority: string; studentId: string; studentName: string; createdAt: string; assignedTo: string; messages: { sender: string; text: string; timestamp: string }[] }[] = [];
export const SCHOLARSHIPS_MOCK: ScholarshipOpportunity[] = [];
