
export type UserRole = 'Student' | 'Faculty' | 'Admin';

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade?: string;
  points?: number;
  midTermGrade?: string;
  finalGrade?: string;
  status: 'In Progress' | 'Completed' | 'Registered';
  attendance?: number; // Percentage
  division: 'UG' | 'GR';
}

export interface Semester {
  id: string;
  term: string;
  year: number;
  courses: Course[];
  gpa: number;
}

export interface Advisor {
  name: string;
  department: string;
  email: string;
  office: string;
  avatar: string;
}

export interface Appointment {
  id: string;
  type: string;
  date: string;
  time: string;
  location: string;
  status: 'Confirmed' | 'Pending' | 'Canceled';
}

export interface FeeItem {
  id: string;
  description: string;
  amount: number;
  type: 'Tuition' | 'Lab' | 'Housing' | 'Insurance' | 'Other';
}

export interface FinancialAid {
  id: string;
  source: string;
  amount: number;
  status: 'Applied' | 'Awarded' | 'Disbursed';
}

export interface StudentProfile {
  name: string;
  studentId: string;
  major: string;
  minor?: string;
  programName: string;
  year: number;
  currentGpa: number;
  totalCredits: number;
  admissionProgress: number; // Percentage
  profileImage: string;
}

export interface Penalty {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface HousingInfo {
  buildingName: string;
  roomName: string;
  partnerName: string;
  status: 'Occupied' | 'Vacant' | 'Pending';
  semesterCharges: number;
  penalties: Penalty[];
  moveInDate: string;
  moveOutDate: string;
}

export interface MedicalRequirement {
  id: string;
  name: string;
  status: 'Uploaded' | 'Pending' | 'Expired';
  dueDate: string;
  uploadDate?: string;
  description: string;
}

export interface MedicalInfo {
  status: 'Complete' | 'Action Required';
  requirements: MedicalRequirement[];
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Issued' | 'Returned' | 'Overdue';
}

export interface EBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  readerUrl: string;
  category: string;
  description: string;
  termId: string;
}

export interface LibraryTerm {
  id: string;
  term: string;
  year: number;
  books: LibraryBook[];
}

export interface MealPlanInfo {
  planName: string;
  planType: string;
  openingBalance: number;
  currentBalance: number;
  walletId: string;
  lastTopUp: string;
  transactions: {
    id: string;
    location: string;
    amount: number;
    date: string;
    time: string;
  }[];
}

export interface RetentionScore {
  confidence: number; 
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  factors: {
    name: string;
    impact: 'Negative' | 'Neutral' | 'Positive';
    description: string;
  }[];
  trend: { month: string; score: number }[];
}

export interface AccessLog {
  id: string;
  location: string;
  timestamp: string;
  status: 'Granted' | 'Denied';
  reason?: string;
}

export interface AccessZone {
  id: string;
  name: string;
  minRole: UserRole;
  description: string;
}

export interface ScholarshipOpportunity {
  id: string;
  name: string;
  description: string;
  amount: number;
  deadline: string;
  category: 'Academic' | 'STEM' | 'Need-Based' | 'Diversity' | 'Other';
  minGpa: number;
  majors?: string[];
  smartMatchScore: number; // calculated percentage
  status: 'Apply Now' | 'Applied' | 'In Progress' | 'Closed';
  sourceSystem: 'SIS' | 'CRM' | 'External API';
}
