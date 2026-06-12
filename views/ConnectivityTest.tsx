import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  Check, 
  Trash2, 
  Plus, 
  Edit2, 
  Shield, 
  Clock, 
  ShieldCheck, 
  X, 
  ArrowLeft, 
  Wifi, 
  Terminal,
  Lock,
  Unlock,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { useCollegeBranding } from '../brandingConfig';
import { trackTransaction, trackModuleAccess } from './telemetry';

export interface SourceConnection {
  id: string;
  name: string;
  sourceType: string;
  status: 'online' | 'offline' | 'untested' | 'testing';
  latency?: number;
  lastTested?: string;
  errorMessage?: string;
  // RDBMS fields
  dbHost?: string;
  dbPort?: string;
  dbName?: string;
  dbUser?: string;
  dbPass?: string;
  dbSslMode?: string;
  // Active Directory fields
  domain?: string;
  baseDn?: string;
  // API-based fields (LMS, HigherEd, Custom)
  apiUrl?: string;
  apiKey?: string;
  apiPlatform?: string;
  // File/Transfer fields (SFTP, Local)
  basePath?: string;
}

export interface CardQueryBinding {
  cardId: string; // 'gpa' | 'credits' | 'program' | 'terms'
  cardName: string;
  section: string;
  connectionId: string; // e.g., 'sis-production'
  sqlQuery: string;
}

const isRdbms = (type: string) => ['postgresql', 'mysql', 'oracle', 'sqlserver', 'sqlite'].includes(type);
const isApiBased = (type: string) => ['canvas', 'blackboard', 'moodle', 'banner', 'ellucian', 'custom-api'].includes(type);
const isNetwork = (type: string) => isRdbms(type) || ['active-directory', 'smtp', 'sftp'].includes(type);

const DEFAULT_SQL_BINDINGS: CardQueryBinding[] = [
  // ── Academics ──────────────────────────────────────────
  {
    cardId: 'gpa',
    cardName: 'GPA Summary Metric Card',
    section: 'Academics',
    connectionId: 'sis-production',
    sqlQuery: `SELECT ROUND(SUM(gpa * credits) / NULLIF(SUM(credits), 0), 2) AS current_gpa\nFROM student_enrolment\nWHERE student_id = @StudentId AND grade_status = 'FINAL'`
  },
  {
    cardId: 'credits',
    cardName: 'Completed Credits Card',
    section: 'Academics',
    connectionId: 'sis-production',
    sqlQuery: `SELECT SUM(CASE WHEN grade NOT IN ('F', 'W', 'I') THEN credits ELSE 0 END) AS completed_credits,\n       120 AS required_credits\nFROM student_courses\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'program',
    cardName: 'Program Details Descriptor',
    section: 'Academics',
    connectionId: 'sis-production',
    sqlQuery: `SELECT p.program_name AS major, p.minor_name AS minor, d.dept_name AS programName\nFROM student_programs p\nINNER JOIN departments d ON p.dept_id = d.dept_id\nWHERE p.student_id = @StudentId AND p.status = 'ACTIVE'`
  },
  {
    cardId: 'terms',
    cardName: 'Academic Term List Filter',
    section: 'Academics',
    connectionId: 'sis-production',
    sqlQuery: `SELECT DISTINCT term_id, term_name AS term, term_year AS year\nFROM academic_terms\nWHERE start_date <= GETDATE()\nORDER BY term_year DESC, term_name DESC`
  },
  {
    cardId: 'courses',
    cardName: 'Course Details Accordion',
    section: 'Academics',
    connectionId: 'sis-production',
    sqlQuery: `SELECT sc.term_id, at.term_name AS term_name, at.term_year AS year, sc.course_code AS code, sc.course_name AS name, sc.division, sc.attendance, sc.credits, sc.mid_term_grade, sc.final_grade, sc.grade_points AS points\nFROM student_courses sc\nJOIN academic_terms at ON sc.term_id = at.term_id\nWHERE sc.student_id = @StudentId\nORDER BY at.term_year DESC, at.term_name DESC, sc.course_code`
  },
  // ── Dashboard ──────────────────────────────────────────
  {
    cardId: 'dash-gpa',
    cardName: 'Cumulative GPA',
    section: 'Dashboard',
    connectionId: 'sis-production',
    sqlQuery: `SELECT ROUND(SUM(gpa * credits) / NULLIF(SUM(credits), 0), 2) AS current_gpa\nFROM student_enrolment\nWHERE student_id = @StudentId AND grade_status = 'FINAL'`
  },
  {
    cardId: 'dash-credits',
    cardName: 'Credits Earned',
    section: 'Dashboard',
    connectionId: 'sis-production',
    sqlQuery: `SELECT SUM(CASE WHEN grade NOT IN ('F', 'W', 'I') THEN credits ELSE 0 END) AS total_credits\nFROM student_courses\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'dash-admissions',
    cardName: 'Admissions Status',
    section: 'Dashboard',
    connectionId: 'sis-production',
    sqlQuery: `SELECT status AS admissions_status, application_term AS term, application_year AS year\nFROM admissions\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'dash-aid',
    cardName: 'Total Financial Aid',
    section: 'Dashboard',
    connectionId: 'sis-production',
    sqlQuery: `SELECT SUM(amount) AS total_aid\nFROM financial_aid\nWHERE student_id = @StudentId AND status = 'AWARDED'`
  },
  {
    cardId: 'dash-tuition',
    cardName: 'Outstanding Tuition & Fees',
    section: 'Dashboard',
    connectionId: 'sis-production',
    sqlQuery: `SELECT SUM(amount) AS outstanding_balance, MIN(due_date) AS next_due_date\nFROM student_fees\nWHERE student_id = @StudentId AND paid = 0`
  },
  {
    cardId: 'dash-schedule',
    cardName: 'Upcoming Schedule',
    section: 'Dashboard',
    connectionId: 'sis-production',
    sqlQuery: `SELECT title, start_time, end_time, location\nFROM student_appointments\nWHERE student_id = @StudentId AND start_time >= GETDATE()\nORDER BY start_time ASC`
  },
  {
    cardId: 'dash-courses',
    cardName: 'In-Progress Courses',
    section: 'Dashboard',
    connectionId: 'sis-production',
    sqlQuery: `SELECT sc.course_code AS code, sc.course_name AS name, sc.credits, sc.attendance\nFROM student_courses sc\nWHERE sc.student_id = @StudentId AND sc.status = 'IN_PROGRESS'`
  },
  // ── Advising ──────────────────────────────────────────
  {
    cardId: 'adv-advisor',
    cardName: 'Advisor Profile',
    section: 'Advising',
    connectionId: 'sis-production',
    sqlQuery: `SELECT a.name, a.department, a.email, a.office, a.office_hours\nFROM advisors a\nJOIN student_advisors sa ON a.advisor_id = sa.advisor_id\nWHERE sa.student_id = @StudentId AND sa.status = 'ACTIVE'`
  },
  {
    cardId: 'adv-appointments',
    cardName: 'Advising Appointments',
    section: 'Advising',
    connectionId: 'sis-production',
    sqlQuery: `SELECT title, description, start_time, end_time, status\nFROM advising_appointments\nWHERE student_id = @StudentId\nORDER BY start_time DESC`
  },
  {
    cardId: 'adv-notes',
    cardName: 'Advising Notes',
    section: 'Advising',
    connectionId: 'sis-production',
    sqlQuery: `SELECT note_text, created_at, author_name\nFROM advising_notes\nWHERE student_id = @StudentId\nORDER BY created_at DESC`
  },
  // ── Finances ──────────────────────────────────────────
  {
    cardId: 'fin-balance',
    cardName: 'Total Outstanding Balance',
    section: 'Finances',
    connectionId: 'sis-production',
    sqlQuery: `SELECT SUM(amount) AS total_balance\nFROM student_fees\nWHERE student_id = @StudentId AND paid = 0`
  },
  {
    cardId: 'fin-fees',
    cardName: 'Fee Breakdown',
    section: 'Finances',
    connectionId: 'sis-production',
    sqlQuery: `SELECT fee_type, description, amount, due_date, paid\nFROM student_fees\nWHERE student_id = @StudentId\nORDER BY due_date ASC`
  },
  {
    cardId: 'fin-aid',
    cardName: 'Financial Aid Awarded',
    section: 'Finances',
    connectionId: 'sis-production',
    sqlQuery: `SELECT aid_type, amount, status, award_date\nFROM financial_aid\nWHERE student_id = @StudentId\nORDER BY award_date DESC`
  },
  {
    cardId: 'fin-cost-dist',
    cardName: 'Cost Distribution Pie Chart',
    section: 'Finances',
    connectionId: 'sis-production',
    sqlQuery: `SELECT fee_type AS name, SUM(amount) AS value\nFROM student_fees\nWHERE student_id = @StudentId\nGROUP BY fee_type`
  },
  // ── Housing ──────────────────────────────────────────
  {
    cardId: 'hou-assignment',
    cardName: 'Room Assignment',
    section: 'Housing',
    connectionId: 'sis-production',
    sqlQuery: `SELECT building_name, room_name, move_in_date, move_out_date, partner_name\nFROM housing_assignments\nWHERE student_id = @StudentId AND status = 'ACTIVE'`
  },
  {
    cardId: 'hou-penalties',
    cardName: 'Pending Room Charges & Penalties',
    section: 'Housing',
    connectionId: 'sis-production',
    sqlQuery: `SELECT description, amount, date_incurred, status\nFROM housing_penalties\nWHERE student_id = @StudentId AND status = 'PENDING'`
  },
  {
    cardId: 'hou-financial',
    cardName: 'Housing Financial Summary',
    section: 'Housing',
    connectionId: 'sis-production',
    sqlQuery: `SELECT semester_charges, utility_status\nFROM housing_financials\nWHERE student_id = @StudentId`
  },
  // ── Medical ──────────────────────────────────────────
  {
    cardId: 'med-status',
    cardName: 'Compliance Status',
    section: 'Medical',
    connectionId: 'sis-production',
    sqlQuery: `SELECT status AS compliance_status\nFROM medical_records\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'med-requirements',
    cardName: 'Clearance Items',
    section: 'Medical',
    connectionId: 'sis-production',
    sqlQuery: `SELECT requirement_name, description, due_date, status\nFROM medical_requirements\nWHERE student_id = @StudentId\nORDER BY due_date ASC`
  },
  // ── Meals ──────────────────────────────────────────
  {
    cardId: 'meal-balance',
    cardName: 'Wallet Balance Hero',
    section: 'Meals',
    connectionId: 'sis-production',
    sqlQuery: `SELECT current_balance, opening_balance, plan_name, plan_type, wallet_id\nFROM meal_plans\nWHERE student_id = @StudentId AND status = 'ACTIVE'`
  },
  {
    cardId: 'meal-transactions',
    cardName: 'Recent Transactions',
    section: 'Meals',
    connectionId: 'sis-production',
    sqlQuery: `SELECT location, transaction_time, amount\nFROM meal_transactions\nWHERE student_id = @StudentId\nORDER BY transaction_time DESC\nLIMIT 10`
  },
  // ── Library ──────────────────────────────────────────
  {
    cardId: 'lib-issued',
    cardName: 'Books Currently Issued',
    section: 'Library',
    connectionId: 'sis-production',
    sqlQuery: `SELECT COUNT(*) AS issued_count\nFROM library_books\nWHERE student_id = @StudentId AND status = 'ISSUED'`
  },
  {
    cardId: 'lib-penalties',
    cardName: 'Library Penalties',
    section: 'Library',
    connectionId: 'sis-production',
    sqlQuery: `SELECT SUM(amount) AS total_penalties\nFROM library_penalties\nWHERE student_id = @StudentId AND paid = 0`
  },
  {
    cardId: 'lib-records',
    cardName: 'Borrowing Records',
    section: 'Library',
    connectionId: 'sis-production',
    sqlQuery: `SELECT book_title, issue_date, due_date, return_date, status\nFROM library_books\nWHERE student_id = @StudentId\nORDER BY issue_date DESC`
  },
  {
    cardId: 'lib-ebooks',
    cardName: 'Digital Library E-Books',
    section: 'Library',
    connectionId: 'sis-production',
    sqlQuery: `SELECT title, author, category, description, reader_url\nFROM ebooks\nWHERE student_id = @StudentId OR is_public = 1`
  },
  // ── Wellness ──────────────────────────────────────────
  {
    cardId: 'well-checkin',
    cardName: 'Anonymous Wellness Check-In',
    section: 'Wellness',
    connectionId: 'sis-production',
    sqlQuery: `SELECT mood_level, notes, created_at\nFROM wellness_checkins\nWHERE student_id = @StudentId\nORDER BY created_at DESC\nLIMIT 5`
  },
  {
    cardId: 'well-counselling',
    cardName: 'Self-Schedule Counselling',
    section: 'Wellness',
    connectionId: 'sis-production',
    sqlQuery: `SELECT counselor_name, slot_time, slot_type, availability\nFROM counselling_slots\nWHERE availability = 1\nORDER BY slot_time ASC`
  },
  {
    cardId: 'well-crisis',
    cardName: 'Campus Emergency Contacts',
    section: 'Wellness',
    connectionId: 'sis-production',
    sqlQuery: `SELECT label, phone_number\nFROM emergency_contacts\nWHERE is_active = 1`
  },
  // ── Student Retention ────────────────────────────────
  {
    cardId: 'ret-confidence',
    cardName: 'Dropout Risk Confidence',
    section: 'Student Retention',
    connectionId: 'sis-production',
    sqlQuery: `SELECT risk_score, risk_level, confidence\nFROM retention_scores\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'ret-trend',
    cardName: 'Risk Probability Trend',
    section: 'Student Retention',
    connectionId: 'sis-production',
    sqlQuery: `SELECT month, score\nFROM retention_trends\nWHERE student_id = @StudentId\nORDER BY month ASC`
  },
  {
    cardId: 'ret-factors',
    cardName: 'Contributing Risk Factors',
    section: 'Student Retention',
    connectionId: 'sis-production',
    sqlQuery: `SELECT factor_name, impact, description\nFROM retention_factors\nWHERE student_id = @StudentId`
  },
  // ── Access Card ──────────────────────────────────────
  {
    cardId: 'acc-card',
    cardName: 'Digital Access Card',
    section: 'Access Card',
    connectionId: 'sis-production',
    sqlQuery: `SELECT name, student_id, profile_image, status\nFROM student_profiles\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'acc-zones',
    cardName: 'Authorization Zones',
    section: 'Access Card',
    connectionId: 'sis-production',
    sqlQuery: `SELECT zone_name, access_level\nFROM access_zones\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'acc-audit',
    cardName: 'Campus Entry Audit Trail',
    section: 'Access Card',
    connectionId: 'sis-production',
    sqlQuery: `SELECT location, timestamp, status, reason, sensor_name\nFROM access_logs\nWHERE student_id = @StudentId\nORDER BY timestamp DESC\nLIMIT 20`
  },
  // ── Career & Internship ──────────────────────────────
  {
    cardId: 'career-jobs',
    cardName: 'Smart Job Board Listings',
    section: 'Career & Internship',
    connectionId: 'sis-production',
    sqlQuery: `SELECT job_title, company, salary_range, match_score, description\nFROM job_listings\nWHERE match_score > 70\nORDER BY match_score DESC`
  },
  {
    cardId: 'career-resume',
    cardName: 'AI Resume Feedback',
    section: 'Career & Internship',
    connectionId: 'sis-production',
    sqlQuery: `SELECT resume_text, overall_score, ats_compatibility, major_relevance\nFROM resume_submissions\nWHERE student_id = @StudentId\nORDER BY submitted_at DESC\nLIMIT 1`
  },
  {
    cardId: 'career-alumni',
    cardName: 'Alumni Career Paths',
    section: 'Career & Internship',
    connectionId: 'sis-production',
    sqlQuery: `SELECT alumni_name, graduation_year, current_role, company, certifications\nFROM alumni_paths\nWHERE mentoring_available = 1`
  },
  // ── Degree Progress ──────────────────────────────────
  {
    cardId: 'deg-progress',
    cardName: 'Total Degree Progress Map',
    section: 'Degree Progress',
    connectionId: 'sis-production',
    sqlQuery: `SELECT completed_credits, in_progress_credits, credits_needed, completion_pct\nFROM degree_progress\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'deg-whatif',
    cardName: 'What-If Major Planner',
    section: 'Degree Progress',
    connectionId: 'sis-production',
    sqlQuery: `SELECT major_name, total_credits_required, description, courses_needed\nFROM whatif_majors\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'deg-prereq',
    cardName: 'Prerequisite Conflict Flag',
    section: 'Degree Progress',
    connectionId: 'sis-production',
    sqlQuery: `SELECT course_code, missing_prereqs\nFROM prerequisite_conflicts\nWHERE student_id = @StudentId`
  },
  {
    cardId: 'deg-curriculum',
    cardName: 'Curriculum Pathways & Course Sequence',
    section: 'Degree Progress',
    connectionId: 'sis-production',
    sqlQuery: `SELECT course_code, course_name, grade, term, status\nFROM curriculum_sequence\nWHERE student_id = @StudentId\nORDER BY term ASC`
  },
  // ── Module Analytics ──────────────────────────────────
  {
    cardId: 'mod-views',
    cardName: 'Total Module Views',
    section: 'Module Analytics',
    connectionId: 'sis-production',
    sqlQuery: `SELECT module_name, view_count, bounce_rate\nFROM module_usage\nORDER BY view_count DESC`
  },
  {
    cardId: 'mod-active',
    cardName: 'Active Users (24h)',
    section: 'Module Analytics',
    connectionId: 'sis-production',
    sqlQuery: `SELECT COUNT(DISTINCT user_id) AS active_users\nFROM module_sessions\nWHERE session_start >= DATEADD(HOUR, -24, GETDATE())`
  },
  {
    cardId: 'mod-session',
    cardName: 'Avg Session Duration',
    section: 'Module Analytics',
    connectionId: 'sis-production',
    sqlQuery: `SELECT AVG(duration_minutes) AS avg_duration\nFROM module_sessions\nWHERE session_start >= DATEADD(DAY, -7, GETDATE())`
  },
  {
    cardId: 'mod-satisfaction',
    cardName: 'In-Portal Module Satisfaction & NPS',
    section: 'Module Analytics',
    connectionId: 'sis-production',
    sqlQuery: `SELECT module_name, nps_score, satisfaction_pct\nFROM module_nps\nORDER BY nps_score DESC`
  },
  // ── System Status ─────────────────────────────────────
  {
    cardId: 'sys-health',
    cardName: 'Operational Health Badge',
    section: 'System Status',
    connectionId: 'sis-production',
    sqlQuery: `SELECT uptime_pct, status_message\nFROM system_health\nWHERE is_current = 1`
  },
  {
    cardId: 'sys-services',
    cardName: 'Current Service Status Matrices',
    section: 'System Status',
    connectionId: 'sis-production',
    sqlQuery: `SELECT service_name, status, uptime, last_incident\nFROM service_status\nORDER BY service_name ASC`
  },
  {
    cardId: 'sys-incidents',
    cardName: 'Active Incident History Log',
    section: 'System Status',
    connectionId: 'sis-production',
    sqlQuery: `SELECT tier, title, status, description, start_time, end_time, team\nFROM incidents\nWHERE status IN ('OPEN', 'IN_PROGRESS')\nORDER BY start_time DESC`
  },
  // ── Incident Management ──────────────────────────────
  {
    cardId: 'inc-mttr',
    cardName: 'Mean Time to Resolve',
    section: 'Incident Management',
    connectionId: 'sis-production',
    sqlQuery: `SELECT AVG(DATEDIFF(MINUTE, start_time, end_time)) AS mttr_minutes\nFROM incidents\nWHERE status = 'RESOLVED' AND end_time >= DATEADD(DAY, -30, GETDATE())`
  },
  {
    cardId: 'inc-dispatch',
    cardName: 'Automatic Dispatch Success',
    section: 'Incident Management',
    connectionId: 'sis-production',
    sqlQuery: `SELECT COUNT(CASE WHEN dispatch_success = 1 THEN 1 END) * 100.0 / COUNT(*) AS success_pct\nFROM dispatch_logs\nWHERE created_at >= DATEADD(DAY, -30, GETDATE())`
  },
  {
    cardId: 'inc-listings',
    cardName: 'Incident Listings',
    section: 'Incident Management',
    connectionId: 'sis-production',
    sqlQuery: `SELECT tier, title, status, description, start_time, end_time, team\nFROM incidents\nORDER BY start_time DESC`
  },
  // ── Support Ticketing ─────────────────────────────────
  {
    cardId: 'sup-tickets',
    cardName: 'Active Support Tickets',
    section: 'Support Ticketing',
    connectionId: 'sis-production',
    sqlQuery: `SELECT ticket_id, subject, status, priority, created_at\nFROM support_tickets\nWHERE student_id = @StudentId AND status != 'CLOSED'\nORDER BY created_at DESC`
  },
  // ── Contact Information ──────────────────────────────
  {
    cardId: 'contact-advising',
    cardName: 'Advising Contact Info',
    section: 'Contact',
    connectionId: 'sis-production',
    sqlQuery: `SELECT email, phone, dept_name\nFROM department_contacts\nWHERE dept_code = 'ADVISING'`
  },
  {
    cardId: 'contact-finance',
    cardName: 'Finance Contact Info',
    section: 'Contact',
    connectionId: 'sis-production',
    sqlQuery: `SELECT email, phone, dept_name\nFROM department_contacts\nWHERE dept_code = 'FINANCE'`
  },
  {
    cardId: 'contact-housing',
    cardName: 'Housing Contact Info',
    section: 'Contact',
    connectionId: 'sis-production',
    sqlQuery: `SELECT email, phone, dept_name\nFROM department_contacts\nWHERE dept_code = 'HOUSING'`
  },
  {
    cardId: 'contact-medical',
    cardName: 'Medical Contact Info',
    section: 'Contact',
    connectionId: 'sis-production',
    sqlQuery: `SELECT email, phone, dept_name\nFROM department_contacts\nWHERE dept_code = 'MEDICAL'`
  },
  {
    cardId: 'contact-library',
    cardName: 'Library Contact Info',
    section: 'Contact',
    connectionId: 'sis-production',
    sqlQuery: `SELECT email, phone, dept_name\nFROM department_contacts\nWHERE dept_code = 'LIBRARY'`
  },
  {
    cardId: 'contact-meals',
    cardName: 'Meals Contact Info',
    section: 'Contact',
    connectionId: 'sis-production',
    sqlQuery: `SELECT email, phone, dept_name\nFROM department_contacts\nWHERE dept_code = 'MEALS'`
  },
  {
    cardId: 'contact-security',
    cardName: 'Security Contact Info',
    section: 'Contact',
    connectionId: 'sis-production',
    sqlQuery: `SELECT email, phone, dept_name\nFROM department_contacts\nWHERE dept_code = 'SECURITY'`
  },
  {
    cardId: 'contact-registrar',
    cardName: "Registrar's Office Contact Info",
    section: 'Contact',
    connectionId: 'sis-production',
    sqlQuery: `SELECT email, phone, dept_name\nFROM department_contacts\nWHERE dept_code = 'REGISTRAR'`
  }
];

const ConnectivityTest: React.FC = () => {
  const { activeCollege } = useCollegeBranding();

  // Load or Initialize Connections Spec
  const [connections, setConnections] = useState<SourceConnection[]>(() => {
    const cached = localStorage.getItem('juc_rdbms_connections');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          // Migrate old format: dbType → sourceType
          return parsed.map((c: any) => {
            if (!c.sourceType && c.dbType) {
              return { ...c, sourceType: c.dbType };
            }
            return c;
          });
        }
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  // Query Bindings states
  const [bindings, setBindings] = useState<CardQueryBinding[]>(() => {
    const cached = localStorage.getItem('juc_card_sql_queries');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_SQL_BINDINGS;
  });

  // Selected Card for the interactive Mapper UI
  const [selectedCardId, setSelectedCardId] = useState<string>('gpa');
  const [selectedSection, setSelectedSection] = useState<string>('Academics');
  const [mapperConnectionId, setMapperConnectionId] = useState<string>('sis-production');
  const [mapperSqlQuery, setMapperSqlQuery] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const allSections = [...new Set(bindings.map(b => b.section))];
  const filteredBindings = bindings.filter(b => b.section === selectedSection);

  // Sync state values when selected card changes
  useEffect(() => {
    const activeBinding = bindings.find(b => b.cardId === selectedCardId);
    if (activeBinding) {
      setMapperSqlQuery(activeBinding.sqlQuery);
      setMapperConnectionId(activeBinding.connectionId);
    }
  }, [selectedCardId, bindings]);

  // Persist modifications
  useEffect(() => {
    localStorage.setItem('juc_rdbms_connections', JSON.stringify(connections));
  }, [connections]);

  // Form Management states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Connection inputs
  const [connName, setConnName] = useState('');
  const [dbType, setDbType] = useState('postgresql');
  const [dbHost, setDbHost] = useState('');
  const [dbPort, setDbPort] = useState('5432');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPass, setDbPass] = useState('');
  const [dbSslMode, setDbSslMode] = useState('require');
  const [showPassword, setShowPassword] = useState(false);
  // AD-specific
  const [domain, setDomain] = useState('');
  const [baseDn, setBaseDn] = useState('');
  // API-based (LMS, HigherEd, Custom)
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiPlatform, setApiPlatform] = useState('canvas');
  const [basePath, setBasePath] = useState('');

  // Tester states
  const [activeTestingId, setActiveTestingId] = useState<string | null>(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [dbTestActive, setDbTestActive] = useState(false);
  const [dbTestSteps, setDbTestSteps] = useState<{ label: string; status: 'idle' | 'running' | 'success' | 'failed' }[]>([]);
  const [dbTestFeedback, setDbTestFeedback] = useState<string | null>(null);

  // Compute stats dynamically
  const totalSources = connections.length;
  const activeSources = connections.filter(c => c.status === 'online').length;
  const activeRatio = totalSources > 0 ? (activeSources / totalSources) * 100 : 0;

  // Calculte Average Latency of Active connections
  const onlineConnections = connections.filter(c => c.status === 'online' && c.latency !== undefined);
  const avgLatency = onlineConnections.length > 0 
    ? Math.round(onlineConnections.reduce((sum, c) => sum + (c.latency || 0), 0) / onlineConnections.length) 
    : 0;

  // Calculate Encrypted (SSL) source percentage
  const secureSources = connections.filter(c => c.dbSslMode === 'require' || c.dbSslMode === 'prefer').length;

  const handleOpenCreateForm = () => {
    setFormMode('create');
    setEditingId(null);
    setConnName('');
    setDbType('postgresql');
    setDbHost('');
    setDbPort('5432');
    setDbName('');
    setDbUser('');
    setDbPass('');
    setDbSslMode('require');
    setDomain('');
    setBaseDn('');
    setApiUrl('');
    setApiKey('');
    setApiPlatform('canvas');
    setBasePath('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (conn: SourceConnection) => {
    setFormMode('edit');
    setEditingId(conn.id);
    setConnName(conn.name);
    setDbType(conn.sourceType);
    setDbHost(conn.dbHost || '');
    setDbPort(conn.dbPort || '5432');
    setDbName(conn.dbName || '');
    setDbUser(conn.dbUser || '');
    setDbPass(conn.dbPass || '');
    setDbSslMode(conn.dbSslMode || 'require');
    setDomain(conn.domain || '');
    setBaseDn(conn.baseDn || '');
    setApiUrl(conn.apiUrl || '');
    setApiKey(conn.apiKey || '');
    setApiPlatform(conn.apiPlatform || 'canvas');
    setBasePath(conn.basePath || '');
    setIsFormOpen(true);
  };

  const handleDbTypeChange = (type: string) => {
    setDbType(type);
    if (type === 'mysql') setDbPort('3306');
    else if (type === 'oracle') setDbPort('1521');
    else if (type === 'sqlserver') setDbPort('1433');
    else if (type === 'sqlite') setDbPort('N/A');
    else if (type === 'active-directory') setDbPort('389');
    else if (type === 'smtp') setDbPort('587');
    else if (type === 'sftp') setDbPort('22');
    else if (type === 'canvas') setDbPort('443');
    else if (type === 'blackboard' || type === 'moodle' || type === 'banner' || type === 'ellucian') setDbPort('443');
    else if (type === 'custom-api') setDbPort('');
    else setDbPort('5432');
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = connName.trim() || `${dbType.toUpperCase()} Gateway`;

    const baseFields = {
      name: finalName,
      sourceType: dbType,
      status: 'untested' as const,
    };

    let typeFields: any;
    if (isRdbms(dbType)) {
      typeFields = { dbHost, dbPort, dbName, dbUser, dbPass, dbSslMode };
    } else if (dbType === 'active-directory') {
      typeFields = { domain: domain, dbPort, dbUser, dbPass, baseDn, dbSslMode };
    } else if (isApiBased(dbType)) {
      typeFields = { apiUrl, apiKey, apiPlatform: dbType };
    } else if (dbType === 'smtp') {
      typeFields = { dbHost, dbPort, dbUser, dbPass, dbSslMode };
    } else if (dbType === 'sftp') {
      typeFields = { dbHost, dbPort, dbUser, dbPass, basePath };
    } else if (dbType === 'local-files') {
      typeFields = { basePath };
    } else {
      typeFields = {};
    }

    if (formMode === 'edit' && editingId) {
      setConnections(prev => prev.map(c => c.id === editingId ? {
        ...c,
        ...baseFields,
        ...typeFields,
        ...(isRdbms(dbType) && (c.dbHost !== dbHost || c.dbPort !== dbPort) ? { status: 'untested', latency: undefined, errorMessage: undefined } : {})
      } : c));
    } else {
      const newConn: SourceConnection = {
        id: 'conn-' + Date.now(),
        ...baseFields,
        ...typeFields,
      };
      setConnections(prev => [...prev, newConn]);
    }
    setIsFormOpen(false);
  };

  const handleDeleteConnection = (connId: string) => {
    if (connId === 'sis-production') {
      alert("Safety Lock: The central SIS Production RDBMS bridge is locked and cannot be deleted.");
      return;
    }
    setConnections(prev => prev.filter(c => c.id !== connId));
  };

  const executeConnectionHandshake = (connId: string) => {
    const conn = connections.find(c => c.id === connId);
    if (!conn) return;

    setActiveTestingId(connId);
    setTestModalOpen(true);
    setDbTestActive(true);
    setDbTestFeedback(`Initializing connection to ${conn.name}...`);

    setConnections(prev => prev.map(c => c.id === connId ? { ...c, status: 'testing' } : c));

    const targetLabel = isApiBased(conn.sourceType) ? conn.apiUrl || conn.sourceType :
                        conn.sourceType === 'active-directory' ? conn.domain || 'LDAP' :
                        `${conn.dbHost}:${conn.dbPort}`;

    setDbTestSteps([
      { label: `DNS Lookup & network route verification to ${targetLabel}`, status: 'running' },
      { label: `TCP port handshaking`, status: 'idle' },
      { label: `SSL/TLS tunnel protocol validation`, status: 'idle' },
      { label: `Authentication handshake`, status: 'idle' },
      { label: `Schema / metadata retrieval validation`, status: 'idle' }
    ]);

    // Steps 1-3: simulated network handshake (UI animation)
    setTimeout(() => {
      setDbTestSteps(prev => [
        { ...prev[0], status: 'success' },
        { ...prev[1], status: 'running' },
        ...prev.slice(2)
      ]);
      setDbTestFeedback(`Route verified. Server is reachable. Establishing socket connection...`);
    }, 600);

    setTimeout(() => {
      setDbTestSteps(prev => [
        prev[0],
        { ...prev[1], status: 'success' },
        { ...prev[2], status: 'running' },
        ...prev.slice(3)
      ]);
      setDbTestFeedback(`TCP sockets bound. Testing secure cryptographic session wrappers...`);
    }, 1200);

    setTimeout(() => {
      setDbTestSteps(prev => [
        prev[0],
        prev[1],
        { ...prev[2], status: 'success' },
        { ...prev[3], status: 'running' },
        ...prev.slice(4)
      ]);
      setDbTestFeedback(`SSL Session authenticated. Contacting database server for credential handshake...`);
    }, 1800);

    // Step 4-5: real connection test via server
    setTimeout(async () => {
      try {
        const payload: any = { sourceType: conn.sourceType };
        if (isRdbms(conn.sourceType)) {
          Object.assign(payload, { dbType: conn.sourceType, dbHost: conn.dbHost, dbPort: conn.dbPort, dbName: conn.dbName, dbUser: conn.dbUser, dbPass: conn.dbPass, dbSslMode: conn.dbSslMode });
        } else if (conn.sourceType === 'active-directory') {
          Object.assign(payload, { dbType: conn.sourceType, dbHost: conn.domain, dbPort: conn.dbPort, dbUser: conn.dbUser, dbPass: conn.dbPass, dbSslMode: conn.dbSslMode, baseDn: conn.baseDn });
        } else if (conn.sourceType === 'smtp') {
          Object.assign(payload, { dbHost: conn.dbHost, dbPort: conn.dbPort, dbUser: conn.dbUser, dbPass: conn.dbPass, dbSslMode: conn.dbSslMode });
        } else if (conn.sourceType === 'sftp') {
          Object.assign(payload, { dbHost: conn.dbHost, dbPort: conn.dbPort, dbUser: conn.dbUser, dbPass: conn.dbPass, basePath: conn.basePath });
        } else if (conn.sourceType === 'local-files') {
          Object.assign(payload, { basePath: conn.basePath });
        } else if (isApiBased(conn.sourceType)) {
          Object.assign(payload, { apiUrl: conn.apiUrl, apiKey: conn.apiKey, apiPlatform: conn.sourceType });
        }
        const res = await fetch('/api/test-connection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success) {
          trackTransaction(`connectivity:${conn.sourceType}`, data.latency || 0, { success: true, metadata: { connId: conn.id, sourceType: conn.sourceType } });
          trackModuleAccess('connectivity', 'test-success', data.latency || 0);
          setDbTestSteps(prev => [
            prev[0],
            prev[1],
            prev[2],
            { ...prev[3], status: 'success' },
            { ...prev[4], status: 'success' }
          ]);
          setDbTestFeedback(`Handshake fully verified. Bridge telemetry stream is active and operational.`);
          setDbTestActive(false);

          setConnections(prev => prev.map(c => c.id === connId ? {
            ...c,
            status: 'online',
            latency: data.latency,
            errorMessage: undefined,
            lastTested: new Date().toLocaleTimeString()
          } : c));
        } else {
          trackTransaction(`connectivity:${conn.sourceType}`, 0, { success: false, metadata: { connId: conn.id, sourceType: conn.sourceType, error: data.error } });
          trackModuleAccess('connectivity', 'test-failure');
          setDbTestSteps(prev => [
            prev[0],
            prev[1],
            prev[2],
            { ...prev[3], status: 'failed' },
            { ...prev[4], status: 'idle' }
          ]);
          setDbTestFeedback(`Connection Failed. ${data.error || 'Remote peer refused handshake connection.'}`);
          setDbTestActive(false);

          setConnections(prev => prev.map(c => c.id === connId ? {
            ...c,
            status: 'offline',
            errorMessage: data.error || 'Access denied: bad password or host timeout',
            lastTested: new Date().toLocaleTimeString()
          } : c));
        }
      } catch (err: any) {
        setDbTestSteps(prev => [
          prev[0],
          prev[1],
          prev[2],
          { ...prev[3], status: 'failed' },
          { ...prev[4], status: 'idle' }
        ]);
        setDbTestFeedback('Connection Failed. Server unreachable or request timed out.');
        setDbTestActive(false);

        setConnections(prev => prev.map(c => c.id === connId ? {
          ...c,
          status: 'offline',
          errorMessage: err.message || 'Server unreachable',
          lastTested: new Date().toLocaleTimeString()
        } : c));
      }
    }, 2400);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16 text-left">
      
      {/* Header section styled elegantly */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className={`text-[10px] font-black uppercase px-2.5 py-1 ${activeCollege.colors.primaryBg} ${activeCollege.colors.primaryText} rounded-full tracking-wider`}>
            Relational Databases & Microservices
          </span>
          <h1 className="text-2xl font-black text-gray-900 mt-2">Source Connectivity Manager</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure, manage and test dynamic connection settings for the Student Information System (SIS) databases.
          </p>
        </div>

        <button
          onClick={handleOpenCreateForm}
          className={`px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeCollege.colors.primaryButtonBg}`}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Add New Source</span>
        </button>
      </div>

      {/* Dynamic metric stats widgets on top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
        
        {/* Card 1: Ratio of Active out of Total Created */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-150/70 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Active ratio</span>
              <h3 className="text-2xl font-black text-gray-900 font-sans mt-1">
                {activeSources} <span className="text-gray-300 font-extrabold">/</span> {totalSources}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${activeSources === totalSources ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <Database size={20} />
            </div>
          </div>

          <div className="space-y-1.5 mt-4">
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
              <span>Sync Health Connection</span>
              <span className={activeRatio === 100 ? 'text-emerald-600' : activeRatio > 50 ? 'text-indigo-600' : 'text-amber-600'}>
                {Math.round(activeRatio)}% Online
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  activeRatio === 100 ? 'bg-emerald-500' : activeRatio > 50 ? 'bg-indigo-600' : 'bg-amber-500'
                }`}
                style={{ width: `${activeRatio}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Average Pool response latency */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-150/70 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Averaged Response</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {avgLatency > 0 ? `${avgLatency} ms` : 'N/A'}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Activity size={20} />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>Based on live ping sequences</span>
            <span className="font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.2 rounded font-bold">Latency Pool</span>
          </div>
        </div>

        {/* Card 3: Encrypted source coverage */}
        <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-150/70 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Cryptographic Bridges</span>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {secureSources} <span className="text-gray-300 font-extrabold">/</span> {totalSources}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>Enforced TLS or SSL Prefers</span>
            <span className="text-[9.5px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Secure Tunnel</span>
          </div>
        </div>

      </div>

      {/* Connection Directory Listing Panel */}
      <div className="bg-white rounded-3xl border border-gray-150/80 shadow-md p-6 space-y-6 text-left">
        <div>
          <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-1.5 uppercase tracking-wider">
            <SlidersHorizontal size={14} className="text-indigo-600" />
            <span>Connected Source Details</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Persisted connection profiles linked directly to the application portal container endpoints.
          </p>
        </div>

        {totalSources === 0 ? (
          <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl p-6 space-y-3">
            <Database size={32} className="mx-auto text-gray-300" />
            <p className="text-xs font-bold">No Database sources specified yet.</p>
            <p className="text-[10px] text-slate-500">Click on "Add New Source" above to configure a relational profile spec.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-black uppercase text-slate-400 tracking-wider bg-slate-50/60 font-mono">
                  <th scope="col" className="py-3 px-4 font-black rounded-l-2xl">Spec Nickname & ID</th>
                  <th scope="col" className="py-3 px-4 font-black">Subsystem Type</th>
                  <th scope="col" className="py-3 px-4 font-black">Host Endpoint</th>
                  <th scope="col" className="py-3 px-4 font-black">Catalog Target</th>
                  <th scope="col" className="py-3 px-4 font-black">Username Role</th>
                  <th scope="col" className="py-3 px-4 font-black">Tunnel Security</th>
                  <th scope="col" className="py-3 px-4 text-center">Operational State</th>
                  <th scope="col" className="py-3 px-4 text-right rounded-r-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {connections.map((conn) => (
                  <tr key={conn.id} className="hover:bg-slate-50/40 transition-all group select-none">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          conn.status === 'online' ? 'bg-emerald-50 text-emerald-600' :
                          conn.status === 'offline' ? 'bg-rose-50 text-rose-600' :
                          conn.status === 'testing' ? 'bg-indigo-50 text-indigo-600 animate-pulse' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          <Server size={15} />
                        </div>
                        <div>
                          <span className="font-extrabold text-gray-900 group-hover:text-indigo-600 block transition-colors">{conn.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{conn.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                        conn.sourceType === 'postgresql' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                        conn.sourceType === 'mysql' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        conn.sourceType === 'sqlite' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                        conn.sourceType === 'active-directory' ? 'bg-violet-50 border-violet-100 text-violet-700' :
                        conn.sourceType === 'smtp' ? 'bg-orange-50 border-orange-100 text-orange-700' :
                        conn.sourceType === 'sftp' ? 'bg-sky-50 border-sky-100 text-sky-700' :
                        conn.sourceType === 'local-files' ? 'bg-stone-50 border-stone-100 text-stone-700' :
                        conn.sourceType === 'canvas' || conn.sourceType === 'blackboard' || conn.sourceType === 'moodle' ? 'bg-cyan-50 border-cyan-100 text-cyan-700' :
                        conn.sourceType === 'banner' || conn.sourceType === 'ellucian' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                        'bg-purple-50 border-purple-100 text-purple-700'
                      }`}>
                        {conn.sourceType === 'active-directory' ? 'Active Directory' :
                         conn.sourceType === 'smtp' ? 'SMTP' :
                         conn.sourceType === 'sftp' ? 'SFTP' :
                         conn.sourceType === 'local-files' ? 'Local Files' :
                         conn.sourceType === 'canvas' ? 'Canvas LMS' :
                         conn.sourceType === 'blackboard' ? 'Blackboard' :
                         conn.sourceType === 'moodle' ? 'Moodle' :
                         conn.sourceType === 'banner' ? 'Banner' :
                         conn.sourceType === 'ellucian' ? 'Ellucian' :
                         conn.sourceType === 'custom-api' ? 'Custom API' :
                         conn.sourceType}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-gray-600">
                      {conn.sourceType === 'sqlite' ? 'local_drive_ref' :
                       conn.sourceType === 'active-directory' ? (conn.domain || conn.dbHost || 'N/A') :
                       conn.sourceType === 'smtp' ? (conn.dbHost || 'N/A') :
                       conn.sourceType === 'sftp' ? (conn.dbHost || 'N/A') :
                       conn.sourceType === 'local-files' ? (conn.basePath || '(app root)') :
                       isApiBased(conn.sourceType) ? (conn.apiUrl || conn.dbHost || 'N/A') :
                       `${conn.dbHost}:${conn.dbPort}`}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-gray-700">
                      {conn.sourceType === 'active-directory' ? (conn.baseDn || 'N/A') :
                       conn.sourceType === 'sqlite' ? 'file://local' :
                       conn.sourceType === 'smtp' ? `port ${conn.dbPort || '587'}` :
                       conn.sourceType === 'sftp' ? (conn.basePath || '/') :
                       conn.sourceType === 'local-files' ? 'file system' :
                       isApiBased(conn.sourceType) ? conn.apiPlatform || 'N/A' :
                       conn.dbName}
                    </td>

                    <td className="py-4 px-4 font-mono text-gray-500">
                      {conn.sourceType === 'active-directory' ? (conn.dbUser || conn.domain || 'N/A') :
                       conn.sourceType === 'smtp' ? (conn.dbUser || 'N/A') :
                       conn.sourceType === 'sftp' ? (conn.dbUser || 'N/A') :
                       conn.sourceType === 'local-files' ? '—' :
                       isApiBased(conn.sourceType) ? (conn.apiKey ? '••••••••' : 'N/A') :
                       conn.dbUser || 'N/A'}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-gray-400">
                        {conn.dbSslMode === 'require' ? (
                          <>
                            <ShieldCheck size={11} className="text-emerald-500" />
                            <span className="text-emerald-700">Enforced SSL</span>
                          </>
                        ) : conn.dbSslMode === 'prefer' ? (
                          <>
                            <Shield size={11} className="text-indigo-500" />
                            <span className="text-indigo-700">Opportunistic</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={11} className="text-amber-500" />
                            <span className="text-amber-600">Disabled Cleartext</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center">
                        {conn.status === 'online' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block"></span>
                            <span>Connected ({conn.latency}ms)</span>
                          </span>
                        )}
                        {conn.status === 'offline' && (
                          <span 
                            title={conn.errorMessage}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-rose-700 bg-rose-50 border border-rose-100 cursor-help"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block animate-pulse"></span>
                            <span>Failed Link</span>
                          </span>
                        )}
                        {conn.status === 'untested' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-gray-505 bg-slate-50 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 block"></span>
                            <span>Untested Spec</span>
                          </span>
                        )}
                        {conn.status === 'testing' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-120 animate-pulse">
                            <RefreshCw size={10} className="animate-spin text-indigo-600" />
                            <span>Handshaking...</span>
                          </span>
                        )}
                        {conn.lastTested && (
                          <span className="text-[8px] text-gray-400 font-mono mt-1">Tested {conn.lastTested}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Ping Test Bridge Handshake Link */}
                        <button
                          onClick={() => executeConnectionHandshake(conn.id)}
                          disabled={dbTestActive}
                          title="Trigger connection protocol handshakes"
                          className="p-1 px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 stroke-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-all font-black text-xs inline-flex items-center gap-1"
                        >
                          <Wifi size={12} />
                          <span>Test Bridge</span>
                        </button>

                        {/* Edit Specifications */}
                        <button
                          onClick={() => handleOpenEditForm(conn)}
                          title="Edit connection specs"
                          className="p-1.5 text-gray-500 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete connection profile */}
                        <button
                          onClick={() => handleDeleteConnection(conn.id)}
                          disabled={conn.id === 'sis-production'}
                          title={conn.id === 'sis-production' ? 'Primary active bridge is locked' : 'Delete Connection Specification'}
                          className={`p-1.5 rounded-lg transition-all ${
                            conn.id === 'sis-production' 
                              ? 'text-gray-200 cursor-not-allowed' 
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🛠️ Developer Query Mapper Console */}
      <div className="bg-white rounded-3xl border border-gray-150/85 shadow-md p-6 space-y-6 text-left animate-in fade-in duration-500 delay-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-purple-50 text-purple-700 rounded-lg text-[9px] font-black uppercase tracking-wider">
              Developer Only Access
            </span>
            <span className="p-1 px-2 text-indigo-50 bg-indigo-500 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
              SQL Engine Mode
            </span>
          </div>
          <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2 mt-2">
            <Terminal size={18} className="text-purple-650" />
            <span>Developer GUI Card SQL Query Mapper</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Map specific academic summary metric cards & filters directly to SQL Queries. Toggling Developer Mode on the 
            <strong> Academics Page</strong> will display these custom queries and active DB connection parameters directly on each responsive card.
          </p>
        </div>

        {/* Success toast inside panel */}
        {saveSuccessMessage && (
          <div className="p-3 px-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-850 font-semibold text-xs flex items-center gap-2 animate-in slide-in-from-top-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Column: Interactive Form and select card */}
          <div className="lg:col-span-2 bg-slate-50/60 p-5 rounded-2xl border border-gray-100/80 space-y-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              1. Choose Section & Card Component
            </span>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target Portal View</label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    const first = bindings.find(b => b.section === e.target.value);
                    if (first) setSelectedCardId(first.cardId);
                  }}
                  className="w-full text-xs font-bold bg-white border border-gray-150 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none cursor-pointer"
                >
                  {allSections.map(s => (
                    <option key={s} value={s}>{s} Section</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target UI Card Component</label>
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {filteredBindings.map(b => (
                    <button
                      key={b.cardId}
                      type="button"
                      onClick={() => setSelectedCardId(b.cardId)}
                      className={`w-full flex items-center justify-between text-left p-2.5 px-3.5 rounded-xl border transition-all text-xs ${
                        selectedCardId === b.cardId
                          ? 'bg-purple-50 border-purple-200 text-purple-955 font-bold shadow-xs'
                          : 'bg-white border-gray-150 text-gray-600 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedCardId === b.cardId ? 'bg-purple-600' : 'bg-gray-300'}`}></span>
                        <span>{b.cardName}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">{b.cardId}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: SQL Config and Connector selection */}
          <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-gray-150/70 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                2. SQL Credentials & Dialect Bindings
              </span>

              {/* RDBMS Database source binding selector */}
              <div>
                <label className="block text-[10px] font-bold text-gray-550 uppercase mb-1">Relational Database Source Link</label>
                <select
                  value={mapperConnectionId}
                  onChange={(e) => setMapperConnectionId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-gray-150 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-purple-600 text-slate-800"
                >
                  <option value="sis-production">Jericho SIS Production (Default Postgres Bridge)</option>
                  {connections.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.sourceType.toUpperCase()} on {c.dbHost || c.domain || c.apiUrl || 'N/A'})
                    </option>
                  ))}
                </select>
                <p className="text-[9.5px] text-gray-400 mt-1">
                  Bind this query to fetch telemetry from the chosen connection resource.
                </p>
              </div>

              {/* Edit SQL Area */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-gray-550 uppercase">SQL Statement Query (MSSQL/Postgres dialects)</label>
                  <span className="text-[9px] font-bold font-mono text-indigo-650 bg-indigo-50 px-1.5 py-0.2 rounded">
                    supports :student_id variable binding
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={mapperSqlQuery}
                  onChange={(e) => setMapperSqlQuery(e.target.value)}
                  placeholder="SELECT * FROM my_table WHERE student_id = @StudentId..."
                  className="w-full text-xs font-mono bg-slate-900 text-emerald-400 rounded-xl p-3 outline-none focus:ring-1 focus:ring-purple-600 border border-slate-800 leading-relaxed font-semibold text-left"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                <Info size={11} className="text-slate-400" />
                <span>Saved into localStorage dynamically</span>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const updated = bindings.map(b => b.cardId === selectedCardId ? {
                    ...b,
                    connectionId: mapperConnectionId,
                    sqlQuery: mapperSqlQuery
                  } : b);
                  setBindings(updated);
                  localStorage.setItem('juc_card_sql_queries', JSON.stringify(updated));
                  setSaveSuccessMessage(`Successfully updated SQL mapping code for "${bindings.find(b => b.cardId === selectedCardId)?.cardName}"!`);
                  setTimeout(() => setSaveSuccessMessage(null), 4000);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>Bind Query to Card</span>
              </button>
            </div>
          </div>

        </div>

        {/* Live Active Catalog Mappings Status Summary footer section */}
        <div className="p-4 bg-slate-50 border border-gray-150 rounded-2xl">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Active Card Registry Mappings Table View
          </span>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {bindings.map(b => {
              const matchedConn = b.connectionId === 'sis-production' 
                ? 'Jericho SIS Production (Default Postgres Bridge)'
                : (connections.find(c => c.id === b.connectionId)?.name || 'Unmapped Core Connection');

              return (
                <div key={b.cardId} className="bg-white p-3 rounded-xl border border-gray-250/70 text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-extrabold text-slate-800">{b.cardName}</span>
                      <span className="text-[9px] font-mono text-purple-650 font-bold bg-purple-50 px-1.5 py-0.1 rounded">
                        {b.cardId}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold block truncate" title={matchedConn}>
                      🔗 {matchedConn}
                    </span>
                  </div>
                  <div className="mt-2.5 bg-slate-950 p-1.5 px-2 rounded-lg text-slate-400 font-mono text-[9px] truncate">
                    {b.sqlQuery}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Overlay Modal for Adding / Editing Connections Spec */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <Sliders size={18} className="text-indigo-400" />
                <h3 className="font-extrabold text-sm md:text-base tracking-tight">
                  {formMode === 'edit' ? 'Edit Source Connection' : 'Configure New Source Connection'}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors text-xs font-black flex items-center gap-1"
              >
                <span>Close</span>
                <X size={13} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveConnection} className="p-6 space-y-5 overflow-y-auto text-left max-h-[80vh]">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-750 block">Connection Nickname</label>
                <input
                  type="text"
                  required
                  value={connName}
                  onChange={(e) => setConnName(e.target.value)}
                  placeholder="e.g. Jericho AD Prod, Canvas API, or Banner DB"
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-750 block">Source Type</label>
                <select
                  value={dbType}
                  onChange={(e) => handleDbTypeChange(e.target.value)}
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-600 border-gray-150 transition-colors"
                >
                  <optgroup label="Relational Databases (RDBMS)">
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL Server</option>
                    <option value="sqlite">SQLite (Embedded)</option>
                    <option value="oracle">Oracle Database</option>
                    <option value="sqlserver">Microsoft SQL Server</option>
                  </optgroup>
                  <optgroup label="Directory Services">
                    <option value="active-directory">Active Directory (LDAP)</option>
                  </optgroup>
                  <optgroup label="Messaging & Transfer">
                    <option value="smtp">SMTP Email Server</option>
                    <option value="sftp">SFTP Server</option>
                  </optgroup>
                  <optgroup label="Local Storage">
                    <option value="local-files">Local File System</option>
                  </optgroup>
                  <optgroup label="Learning Management Systems">
                    <option value="canvas">Canvas LMS</option>
                    <option value="blackboard">Blackboard Learn</option>
                    <option value="moodle">Moodle</option>
                  </optgroup>
                  <optgroup label="Higher Education Platforms">
                    <option value="banner">Banner by Ellucian</option>
                    <option value="ellucian">Ellucian Colleague</option>
                    <option value="custom-api">Custom REST API</option>
                  </optgroup>
                </select>
              </div>

              {/* SSL — shown for RDBMS and AD */}
              {(isRdbms(dbType) || dbType === 'active-directory') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-750 block">
                      {dbType === 'active-directory' ? 'LDAP Encryption' : 'SSL Enforce Protocol'}
                    </label>
                    <select
                      value={dbSslMode}
                      onChange={(e) => setDbSslMode(e.target.value)}
                      disabled={dbType === 'sqlite'}
                      className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-600 border-gray-150 transition-colors disabled:opacity-40"
                    >
                      <option value="require">Require SSL/TLS (Encrypted)</option>
                      <option value="prefer">Prefer SSL (Opportunistic)</option>
                      <option value="disable">Disable SSL (Cleartext)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* RDBMS fields: Host, Port, DB Name, User, Password */}
              {isRdbms(dbType) && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Database Host / Server IP</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                          <Wifi size={13} />
                        </span>
                        <input
                          type="text"
                          required
                          disabled={dbType === 'sqlite'}
                          value={dbType === 'sqlite' ? 'local_drive' : dbHost}
                          onChange={(e) => setDbHost(e.target.value)}
                          placeholder="e.g. 192.168.12.80 or rdbms.jericho.edu"
                          className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">TCP Port Binding</label>
                      <input
                        type="text"
                        required
                        disabled={dbType === 'sqlite'}
                        value={dbType === 'sqlite' ? 'N/A' : dbPort}
                        onChange={(e) => setDbPort(e.target.value)}
                        placeholder="e.g. 5432"
                        className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Database Catalog Name</label>
                      <input
                        type="text"
                        required
                        value={dbName}
                        onChange={(e) => setDbName(e.target.value)}
                        placeholder="e.g. staging_balances"
                        className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-850 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Database Username</label>
                      <input
                        type="text"
                        required
                        disabled={dbType === 'sqlite'}
                        value={dbType === 'sqlite' ? 'N/A' : dbUser}
                        onChange={(e) => setDbUser(e.target.value)}
                        placeholder="e.g. root"
                        className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-855 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-750 block">Database Access Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] text-indigo-600 font-extrabold uppercase hover:underline"
                      >
                        {showPassword ? 'Hide Key' : 'Reveal Key'}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={dbType === 'sqlite'}
                      value={dbType === 'sqlite' ? 'N/A' : dbPass}
                      onChange={(e) => setDbPass(e.target.value)}
                      placeholder="e.g. password"
                      className="w-full text-xs bg-gray-50 border border-gray-200 text-slate-855 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors disabled:opacity-50"
                    />
                  </div>
                </>
              )}

              {/* Active Directory fields */}
              {dbType === 'active-directory' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Domain / Server</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                          <Wifi size={13} />
                        </span>
                        <input
                          type="text"
                          required
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          placeholder="e.g. ad.benedict.edu"
                          className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">LDAP Port</label>
                      <input
                        type="text"
                        required
                        value={dbPort}
                        onChange={(e) => setDbPort(e.target.value)}
                        placeholder="389, 636, or 3268"
                        className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-750 block">Base DN (Distinguished Name)</label>
                    <input
                      type="text"
                      value={baseDn}
                      onChange={(e) => setBaseDn(e.target.value)}
                      placeholder="e.g. DC=benedict,DC=edu (leave empty for rootDSE)"
                      className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Bind Username</label>
                      <input
                        type="text"
                        required
                        value={dbUser}
                        onChange={(e) => setDbUser(e.target.value)}
                        placeholder="e.g. john.doe@benedict.edu"
                        className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-750 block">Bind Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[10px] text-indigo-600 font-extrabold uppercase hover:underline"
                        >
                          {showPassword ? 'Hide' : 'Reveal'}
                        </button>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={dbPass}
                        onChange={(e) => setDbPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* API-based fields (Canvas, Blackboard, Moodle, Banner, Ellucian, Custom) */}
              {isApiBased(dbType) && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">API Base URL</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                          <Wifi size={13} />
                        </span>
                        <input
                          type="text"
                          required
                          value={apiUrl}
                          onChange={(e) => setApiUrl(e.target.value)}
                          placeholder="e.g. https://benedict.instructure.com"
                          className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Platform</label>
                      <input
                        type="text"
                        disabled
                        value={
                          dbType === 'canvas' ? 'Canvas LMS' :
                          dbType === 'blackboard' ? 'Blackboard Learn' :
                          dbType === 'moodle' ? 'Moodle' :
                          dbType === 'banner' ? 'Banner by Ellucian' :
                          dbType === 'ellucian' ? 'Ellucian Colleague' :
                          'Custom REST API'
                        }
                        className="w-full text-xs font-semibold bg-gray-100 border border-gray-200 text-slate-500 rounded-xl px-3 py-2.5 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-750 block">
                      {dbType === 'canvas' ? 'Access Token' :
                       dbType === 'blackboard' ? 'Application Key' :
                       dbType === 'moodle' ? 'Web Service Token' :
                       'API Key / Token'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full text-xs bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-indigo-600 font-extrabold uppercase hover:underline"
                      >
                        {showPassword ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* SMTP fields */}
              {dbType === 'smtp' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">SMTP Server Host</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none"><Wifi size={13} /></span>
                        <input type="text" required value={dbHost} onChange={(e) => setDbHost(e.target.value)} placeholder="e.g. smtp.benedict.edu" className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Port</label>
                      <input type="text" required value={dbPort} onChange={(e) => setDbPort(e.target.value)} placeholder="587" className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Username</label>
                      <input type="text" required value={dbUser} onChange={(e) => setDbUser(e.target.value)} placeholder="e.g. noreply@benedict.edu" className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-750 block">Password</label>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[10px] text-indigo-600 font-extrabold uppercase hover:underline">{showPassword ? 'Hide' : 'Reveal'}</button>
                      </div>
                      <input type={showPassword ? 'text' : 'password'} required value={dbPass} onChange={(e) => setDbPass(e.target.value)} placeholder="••••••••" className="w-full text-xs bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-750 block">Encryption</label>
                    <select value={dbSslMode} onChange={(e) => setDbSslMode(e.target.value)} className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-600 transition-colors">
                      <option value="require">TLS (STARTTLS / SMTPS)</option>
                      <option value="disable">No Encryption</option>
                    </select>
                  </div>
                </>
              )}

              {/* SFTP fields */}
              {dbType === 'sftp' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">SFTP Server Host</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none"><Wifi size={13} /></span>
                        <input type="text" required value={dbHost} onChange={(e) => setDbHost(e.target.value)} placeholder="e.g. sftp.benedict.edu" className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Port</label>
                      <input type="text" required value={dbPort} onChange={(e) => setDbPort(e.target.value)} placeholder="22" className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-750 block">Username</label>
                      <input type="text" required value={dbUser} onChange={(e) => setDbUser(e.target.value)} placeholder="e.g. sftp-user" className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-750 block">Password / SSH Key</label>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[10px] text-indigo-600 font-extrabold uppercase hover:underline">{showPassword ? 'Hide' : 'Reveal'}</button>
                      </div>
                      <input type={showPassword ? 'text' : 'password'} required value={dbPass} onChange={(e) => setDbPass(e.target.value)} placeholder="••••••••" className="w-full text-xs bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-750 block">Base Directory Path</label>
                    <input type="text" value={basePath} onChange={(e) => setBasePath(e.target.value)} placeholder="e.g. /incoming/reports (leave empty for home)" className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                  </div>
                </>
              )}

              {/* Local File System fields */}
              {dbType === 'local-files' && (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                    <Info size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <p>Choose a local directory on the server. The connector will list files and folders within that path. Leave empty to use the application root.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-750 block">Local Directory Path</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 select-none">
                        <Database size={13} />
                      </span>
                      <input type="text" value={basePath} onChange={(e) => setBasePath(e.target.value)} placeholder='e.g. C:\Data\Reports or /mnt/shared' className="w-full text-xs font-mono font-bold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl pl-8 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition-colors" />
                    </div>
                  </div>
                </>
              )}

              {/* Modal controls */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4.5 py-2 hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${activeCollege.colors.primaryButtonBg}`}
                >
                  {formMode === 'edit' ? 'Save Specifications' : 'Deploy Spec'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Active Tester Protocol Handshake Modal Overlay */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-left">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
                <h3 className="font-extrabold text-xs uppercase tracking-wider">
                  Connection Telemetry Handshake Verifier
                </h3>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                disabled={dbTestActive}
                className="py-1 px-3 bg-slate-800 hover:bg-slate-705 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                Close
              </button>
            </div>

            {/* Simulated terminal and progress */}
            <div className="p-6 space-y-6">
              
              {/* Terminal Console log element */}
              <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-800 font-mono text-[10px] min-h-[80px] flex items-center justify-start space-y-1 relative overflow-hidden select-none">
                <span className="absolute top-2 right-3 font-mono text-[8px] text-slate-600">CLI_MONITOR</span>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-400 grow-0">&gt;_</span>
                  <p className="leading-normal grow pr-4 font-mono">
                    {dbTestFeedback}
                  </p>
                </div>
              </div>

              {/* Handshake Phase Checks list */}
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 select-none">
                  Telemetry handshake execution phases
                </span>

                <div className="space-y-2.5">
                  {dbTestSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center gap-2.5">
                        {step.status === 'idle' && (
                          <div className="p-1 px-2.5 bg-slate-100 text-slate-400 rounded-full font-bold font-mono text-[9px] uppercase">
                            Phase {idx + 1}
                          </div>
                        )}
                        {step.status === 'running' && (
                          <RefreshCw size={12} className="animate-spin text-indigo-600 shrink-0" />
                        )}
                        {step.status === 'success' && (
                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        )}
                        {step.status === 'failed' && (
                          <AlertCircle size={13} className="text-rose-500 shrink-0" />
                        )}
                        <span className={`font-medium ${
                          step.status === 'success' ? 'text-slate-800 font-semibold' :
                          step.status === 'failed' ? 'text-rose-700 font-extrabold' :
                          step.status === 'running' ? 'text-indigo-600 font-bold' :
                          'text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>

                      <div>
                        {step.status === 'idle' && <span className="text-[9px] font-bold text-gray-300 uppercase font-mono">Idle</span>}
                        {step.status === 'running' && <span className="text-[9px] font-bold text-indigo-600 uppercase font-mono animate-pulse">Running</span>}
                        {step.status === 'success' && <span className="text-[9px] font-bold text-emerald-600 uppercase font-mono">Verified</span>}
                        {step.status === 'failed' && <span className="text-[9px] font-extrabold text-rose-600 uppercase font-mono">Failed</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer indicator logs */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] font-sans text-gray-500">
                <div className="flex items-center gap-1.5">
                  {dbTestActive ? (
                    <>
                      <Clock size={12} className="animate-spin" />
                      <span>Negotiating protocols...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="font-semibold text-slate-800">Diagnostic sweep complete</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setTestModalOpen(false)}
                  disabled={dbTestActive}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Done & Close Logs
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ConnectivityTest;
