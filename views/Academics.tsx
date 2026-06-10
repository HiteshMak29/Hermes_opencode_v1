
import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Award, 
  FileText, 
  ArrowUpRight,
  Filter,
  Clock,
  BookOpen,
  GraduationCap,
  Terminal,
  Database,
  Info,
  X,
  Sliders
} from 'lucide-react';
import { SEMESTERS_MOCK, STUDENT_MOCK } from '../constants';
import ContactSection from '../components/ContactSection';

interface QueryResult {
  columns: string[];
  rows: string[][];
}

const executeSQL = async (sql: string): Promise<QueryResult> => {
  const res = await fetch('/api/sis/staging/execute-sql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  const data = await res.json();
  if (!data.columns || !data.rows) throw new Error('Invalid response shape');
  return data as QueryResult;
};

const getRowValue = (result: QueryResult, colName: string, rowIndex = 0): string | undefined => {
  const idx = result.columns.findIndex(c => c.toLowerCase() === colName.toLowerCase());
  if (idx === -1 || !result.rows[rowIndex]) return undefined;
  return result.rows[rowIndex][idx];
};

const Academics: React.FC = () => {
  const [selectedTermId, setSelectedTermId] = useState<string>('all');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(SEMESTERS_MOCK[0]?.id || null);

  const [dynamicGpa, setDynamicGpa] = useState<string | null>(null);
  const [dynamicCredits, setDynamicCredits] = useState<string | null>(null);
  const [dynamicMajor, setDynamicMajor] = useState<string | null>(null);
  const [dynamicMinor, setDynamicMinor] = useState<string | null>(null);
  const [dynamicProgram, setDynamicProgram] = useState<string | null>(null);
  const [dynamicTerms, setDynamicTerms] = useState<{ id: string; term: string; year: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Query Mappings bindings state
  const [bindings, setBindings] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('juc_card_sql_queries');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [
      {
        cardId: 'gpa',
        cardName: 'GPA Summary Metric Card',
        connectionId: 'sis-production',
        sqlQuery: "SELECT ROUND(SUM(gpa * credits) / NULLIF(SUM(credits), 0), 2) AS current_gpa\nFROM student_enrolment\nWHERE student_id = @StudentId AND grade_status = 'FINAL'"
      },
      {
        cardId: 'credits',
        cardName: 'Completed Credits Card',
        connectionId: 'sis-production',
        sqlQuery: "SELECT SUM(CASE WHEN grade NOT IN ('F', 'W', 'I') THEN credits ELSE 0 END) AS completed_credits,\n       120 AS required_credits\nFROM student_courses\nWHERE student_id = @StudentId"
      },
      {
        cardId: 'program',
        cardName: 'Program Details Descriptor',
        connectionId: 'sis-production',
        sqlQuery: "SELECT p.program_name AS major, p.minor_name AS minor, d.dept_name AS programName\nFROM student_programs p\nINNER JOIN departments d ON p.dept_id = d.dept_id\nWHERE p.student_id = @StudentId AND p.status = 'ACTIVE'"
      },
      {
        cardId: 'terms',
        cardName: 'Academic Term List Filter',
        connectionId: 'sis-production',
        sqlQuery: "SELECT DISTINCT term_id, term_name AS term, term_year AS year\nFROM academic_terms\nWHERE start_date <= GETDATE()\nORDER BY term_year DESC, term_name DESC"
      }
    ];
  });

  // Execute SQL bindings to populate dynamic data
  useEffect(() => {
    const fetchBinding = async (cardId: string) => {
      const binding = bindings.find(b => b.cardId === cardId);
      if (!binding) return null;
      try {
        return await executeSQL(binding.sqlQuery);
      } catch (e) {
        console.warn(`Failed to fetch binding "${cardId}":`, e);
        return null;
      }
    };

    const fetchData = async () => {
      setLoading(true);

      const [gpaResult, creditsResult, programResult, termsResult] = await Promise.all([
        fetchBinding('gpa'),
        fetchBinding('credits'),
        fetchBinding('program'),
        fetchBinding('terms'),
      ]);

      if (gpaResult) {
        const val = getRowValue(gpaResult, 'current_gpa') || getRowValue(gpaResult, 'gpa');
        if (val) setDynamicGpa(val);
      }

      if (creditsResult) {
        const val = getRowValue(creditsResult, 'completed_credits') || getRowValue(creditsResult, 'credits');
        if (val) setDynamicCredits(val);
      }

      if (programResult) {
        const major = getRowValue(programResult, 'major') || getRowValue(programResult, 'program_name');
        const minor = getRowValue(programResult, 'minor') || getRowValue(programResult, 'minor_name');
        const program = getRowValue(programResult, 'programName') || getRowValue(programResult, 'program_name');
        if (major) setDynamicMajor(major);
        if (minor) setDynamicMinor(minor);
        if (program) setDynamicProgram(program);
      }

      if (termsResult && termsResult.rows.length > 0) {
        const terms = termsResult.rows.map((row, i) => ({
          id: getRowValue(termsResult, 'term_id', i) || `term-${i}`,
          term: getRowValue(termsResult, 'term', i) || getRowValue(termsResult, 'term_name', i) || `Term ${i}`,
          year: parseInt(getRowValue(termsResult, 'year', i) || getRowValue(termsResult, 'term_year', i) || '2024'),
        }));
        setDynamicTerms(terms);
      }

      setLoading(false);
    };
    fetchData();
  }, [bindings]);

  const [connections, setConnections] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('juc_rdbms_connections');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    return [];
  });

  // Toggle state for "Developer Mode" overlay
  const [devModeActive, setDevModeActive] = useState<boolean>(() => {
    return localStorage.getItem('juc_academic_dev_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('juc_academic_dev_mode', String(devModeActive));
  }, [devModeActive]);

  // Handle active card SQL overlay inspection popups
  const [inspectingBinding, setInspectingBinding] = useState<any | null>(null);

  // Connection metadata display mapper label
  const getConnectionLabel = (connId: string) => {
    if (connId === 'sis-production') {
      return 'Jericho SIS Production (Default Postgres Bridge)';
    }
    const found = connections.find(c => c.id === connId);
    return found ? `${found.name} (${found.dbType.toUpperCase()})` : 'Jericho SIS Production (Default Postgres Bridge)';
  };

  const displayTerms = dynamicTerms.length > 0 ? dynamicTerms : SEMESTERS_MOCK;
  const filteredSemesters = selectedTermId === 'all' 
    ? SEMESTERS_MOCK 
    : SEMESTERS_MOCK.filter(sem => sem.id === selectedTermId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-left">
      
      {/* Dev Mode Sticky Subheader or toggle banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 p-4 bg-purple-50/60 border border-purple-100 rounded-3xl animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-2xl">
            <Terminal size={18} className="animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 bg-purple-100/40 px-2 py-0.5 rounded-full block w-max">
              Developer SQL Sandbox Tool
            </span>
            <p className="text-xs font-black text-slate-800 mt-1">Database Queries Visual Overlay</p>
            <p className="text-[10px] text-slate-500">View real-time database queries & connection mappings bound to your UI cards.</p>
          </div>
        </div>
        <button
          onClick={() => setDevModeActive(!devModeActive)}
          className={`w-full sm:w-auto p-1.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            devModeActive 
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
              : 'bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 shadow-xs'
          }`}
        >
          {devModeActive ? '🔴 Disable Overlay' : '⚙️ Toggle SQL Overlay'}
        </button>
      </div>

      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Academic History</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Updated: Oct 20, 2024
            </span>
          </div>
          <p className="text-gray-500 text-sm">View your grades, transcripts, and degree progress.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end md:items-center gap-4">
          
          {/* Term Filter */}
          <div className={`relative inline-block text-left w-full sm:w-48 p-1.5 rounded-2xl transition-all ${
            devModeActive ? 'border-2 border-dashed border-purple-300 bg-purple-50/10' : ''
          }`}>
            {devModeActive && (
              <button
                onClick={() => setInspectingBinding(bindings.find(b => b.cardId === 'terms'))}
                className="absolute -top-3.5 right-2 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-[8px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 cursor-pointer z-20 whitespace-nowrap"
              >
                <Terminal size={8} />
                <span>SPEC</span>
              </button>
            )}
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Academic Term</label>
            <div className="relative group">
              <select 
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="appearance-none w-full bg-white border border-gray-200 rounded-xl px-4 py-2 pr-8 font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-505 cursor-pointer text-sm"
              >
                <option value="all">All Terms</option>
                {displayTerms.map(sem => (
                  <option key={sem.id} value={sem.id}>{sem.term} {sem.year}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
            {devModeActive && (
              <span 
                className="text-[8px] font-semibold text-purple-700 font-mono block text-left mt-1 whitespace-nowrap truncate cursor-help"
                title={getConnectionLabel(bindings.find(b => b.cardId === 'terms')?.connectionId)}
              >
                🔗 {getConnectionLabel(bindings.find(b => b.cardId === 'terms')?.connectionId)}
              </span>
            )}
          </div>

          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 shadow-sm transition-all whitespace-nowrap">
            <FileText size={14} />
            <span>Official Transcript</span>
          </button>
        </div>
      </header>

      {/* Summary Card with Dev Mode indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-3xl border border-gray-150/80 shadow-md">
        
        {/* GPA Summary */}
        <div className={`relative group p-4 rounded-2xl flex flex-col justify-between text-center transition-all min-h-[125px] ${
          devModeActive ? 'border-2 border-dashed border-purple-300 bg-purple-50/15' : 'md:border-r border-gray-150/70'
        }`}>
          {devModeActive && (
            <button
              onClick={() => setInspectingBinding(bindings.find(b => b.cardId === 'gpa'))}
              className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 px-2.5 bg-purple-600 hover:bg-purple-750 text-white rounded-full text-[8px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 cursor-pointer z-10"
            >
              <Terminal size={9} />
              <span>SQL INSPECT</span>
            </button>
          )}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total GPA</p>
          <div className="flex items-center justify-center space-x-2 my-2">
            <span className="text-3xl font-black text-indigo-600">{dynamicGpa || STUDENT_MOCK.currentGpa}</span>
            <span className="text-green-500 flex items-center text-xs font-bold">
              <ArrowUpRight size={14} /> +0.05
            </span>
          </div>
          {devModeActive ? (
            <span className="text-[8.5px] font-bold text-purple-700 font-mono block whitespace-nowrap truncate" title={getConnectionLabel(bindings.find(b => b.cardId === 'gpa')?.connectionId)}>
              🔗 {getConnectionLabel(bindings.find(b => b.cardId === 'gpa')?.connectionId)}
            </span>
          ) : (
            <span className="text-[9.5px] text-gray-400 font-mono">Weighted score</span>
          )}
        </div>

        {/* Credits Earned */}
        <div className={`relative group p-4 rounded-2xl flex flex-col justify-between text-center transition-all min-h-[125px] ${
          devModeActive ? 'border-2 border-dashed border-purple-300 bg-purple-50/15' : 'md:border-r border-gray-150/70'
        }`}>
          {devModeActive && (
            <button
              onClick={() => setInspectingBinding(bindings.find(b => b.cardId === 'credits'))}
              className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 px-2.5 bg-purple-600 hover:bg-purple-750 text-white rounded-full text-[8px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 cursor-pointer z-10"
            >
              <Terminal size={9} />
              <span>SQL INSPECT</span>
            </button>
          )}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Completed Credits</p>
          <p className="text-3xl font-black text-gray-900 mt-1">{dynamicCredits || STUDENT_MOCK.totalCredits} <span className="text-sm font-normal text-gray-400">/ 120</span></p>
          {devModeActive ? (
            <span className="text-[8.5px] font-bold text-purple-700 font-mono block whitespace-nowrap truncate" title={getConnectionLabel(bindings.find(b => b.cardId === 'credits')?.connectionId)}>
              🔗 {getConnectionLabel(bindings.find(b => b.cardId === 'credits')?.connectionId)}
            </span>
          ) : (
            <span className="text-[9.5px] text-gray-400 font-mono">Hours Earned</span>
          )}
        </div>

        {/* Academic Program Details */}
        <div className={`relative group p-4 rounded-2xl flex flex-col justify-between text-center transition-all min-h-[125px] ${
          devModeActive ? 'border-2 border-dashed border-purple-300 bg-purple-50/15' : ''
        }`}>
          {devModeActive && (
            <button
              onClick={() => setInspectingBinding(bindings.find(b => b.cardId === 'program'))}
              className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 px-2.5 bg-purple-600 hover:bg-purple-750 text-white rounded-full text-[8px] font-black uppercase tracking-wider shadow-md flex items-center gap-1 cursor-pointer z-10"
            >
              <Terminal size={9} />
              <span>SQL INSPECT</span>
            </button>
          )}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1">
             <GraduationCap size={12} />
             Program Details
          </p>
          <div className="my-1 text-center">
            <h3 className="text-xs font-black text-indigo-600 leading-tight truncate">{dynamicMajor || STUDENT_MOCK.major}</h3>
            <p className="text-[9.5px] font-bold text-gray-500 mt-0.5">Minor: {dynamicMinor || STUDENT_MOCK.minor || 'None'}</p>
          </div>
          {devModeActive ? (
            <span className="text-[8.5px] font-bold text-purple-700 font-mono block whitespace-nowrap truncate" title={getConnectionLabel(bindings.find(b => b.cardId === 'program')?.connectionId)}>
              🔗 {getConnectionLabel(bindings.find(b => b.cardId === 'program')?.connectionId)}
            </span>
          ) : (
            <span className="text-[9.5px] text-gray-400 font-mono truncate">{dynamicProgram || STUDENT_MOCK.programName}</span>
          )}
        </div>
      </div>

      {/* Semester Accordion / List */}
      <div className="space-y-4">
        {filteredSemesters.map((sem) => (
          <div key={sem.id} className="bg-white rounded-3xl shadow-sm border border-gray-150/70 overflow-hidden">
            <button 
              onClick={() => setExpandedTerm(expandedTerm === sem.id ? null : sem.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4 text-left">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{sem.term} {sem.year}</h3>
                  <p className="text-xs text-gray-500 font-medium">Term GPA: <span className="text-indigo-600">{sem.gpa}</span> • {sem.courses.length} Courses</p>
                </div>
              </div>
              {expandedTerm === sem.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            
            {expandedTerm === sem.id && (
              <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100">
                        <th className="py-3 px-1">Code</th>
                        <th className="py-3 px-2">Course Name</th>
                        <th className="py-3 px-2 text-center">Division</th>
                        <th className="py-3 px-2 text-center">Attendance</th>
                        <th className="py-3 px-2 text-center">Credits</th>
                        <th className="py-3 px-2 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sem.courses.map((course) => (
                        <tr key={course.id} className="text-sm">
                          <td className="py-4 px-1 font-bold text-indigo-600">{course.code}</td>
                          <td className="py-4 px-2 font-medium text-gray-800">{course.name}</td>
                          <td className="py-4 px-2 text-center">
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-black rounded-md uppercase">
                              {course.division}
                            </span>
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <span className={`text-[10px] font-bold ${
                                    (course.attendance || 0) >= 90 ? 'text-green-600' : 
                                    (course.attendance || 0) >= 75 ? 'text-blue-600' : 
                                    'text-orange-600'
                                }`}>
                                    {course.attendance}%
                                </span>
                                <div className="w-16 bg-gray-100 h-1 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${
                                            (course.attendance || 0) >= 90 ? 'bg-green-500' : 
                                            (course.attendance || 0) >= 75 ? 'bg-blue-500' : 
                                            'bg-orange-500'
                                        }`} 
                                        style={{ width: `${course.attendance || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center text-gray-500">{course.credits}</td>
                          <td className="py-4 px-2 text-right">
                            <span className={`inline-block w-8 h-8 leading-8 text-center rounded-lg font-bold ${
                              course.grade?.startsWith('A') ? 'bg-green-100 text-green-700' :
                              course.grade?.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {course.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🔮 Developer SQL Inspector Overlay Modal */}
      {inspectingBinding && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-left">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center font-mono">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-purple-400" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider">
                  SQL Source Binding Inspector
                </h3>
              </div>
              <button
                onClick={() => setInspectingBinding(null)}
                className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Information Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block animate-fade-in">Component Target Card</span>
                <p className="text-sm font-black text-slate-900">{inspectingBinding.cardName}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-xs">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Bounded Connection</span>
                  <span className="font-black text-indigo-650 truncate block" title={getConnectionLabel(inspectingBinding.connectionId)}>
                    {getConnectionLabel(inspectingBinding.connectionId)}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-xs text-left">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block mb-1">Binding Mode</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    <span>Dynamic SQL Map</span>
                  </span>
                </div>
              </div>

              {/* SQL console block */}
              <div className="space-y-1 text-left relative">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block mb-1">
                  Active SQL Credentials Query Statement
                </span>
                <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-850 font-mono text-xs overflow-x-auto select-all shadow-inner leading-relaxed max-h-[160px] overflow-y-auto">
                  <pre className="font-mono">{inspectingBinding.sqlQuery}</pre>
                </div>
              </div>

              {/* Variable bindings helpful advice card */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-[11px] text-indigo-950">
                <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-snug text-slate-650">
                  This SQL statement is mapped to target your localized MSSQL server instance schemas. 
                  You can update this code syntax anytime in the **Source Connectivity** developer manager console page.
                </p>
              </div>

              {/* Footer action button */}
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setInspectingBinding(null)}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Confirm & Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <ContactSection department="academics" />
    </div>
  );
};

export default Academics;
