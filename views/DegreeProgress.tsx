import React, { useState } from 'react';
import { 
  GraduationCap, 
  Map, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle, 
  ChevronRight, 
  BookOpen, 
  Calendar, 
  Award,
  ListTodo
} from 'lucide-react';
import { STUDENT_MOCK, SEMESTERS_MOCK } from '../constants';

interface CourseNode {
  code: string;
  name: string;
  credits: number;
  status: 'Completed' | 'In-Progress' | 'Planned' | 'Prereq-Conflict';
  prereqs?: string[];
  termCompleted?: string;
  grade?: string;
}

const DegreeProgress: React.FC = () => {
  const [targetMajor, setTargetMajor] = useState<string>('Computer Science & Engineering');
  const [checkedConflict, setCheckedConflict] = useState(true);

  // Core requirements for current or planned majors
  const [courses, setCourses] = useState<CourseNode[]>([
    { code: "CS-101", name: "Intro to Computer Science", credits: 4, status: "Completed", termCompleted: "Fall 2023", grade: "A" },
    { code: "CS-102", name: "Data Structures & Algorithms", credits: 4, status: "Completed", termCompleted: "Spring 2024", prereqs: ["CS-101"], grade: "B+" },
    { code: "MATH-151", name: "Calculus I", credits: 4, status: "Completed", termCompleted: "Fall 2023", grade: "A-" },
    { code: "MATH-152", name: "Calculus II", credits: 4, status: "Completed", termCompleted: "Spring 2024", prereqs: ["MATH-151"], grade: "B" },
    { code: "CS-201", name: "Object-Oriented Programming", credits: 4, status: "Completed", termCompleted: "Fall 2024", prereqs: ["CS-102"], grade: "A" },
    { code: "CS-202", name: "Systems Programming", credits: 4, status: "In-Progress", prereqs: ["CS-102"] },
    { code: "CS-301", name: "Database Systems", credits: 4, status: "In-Progress", prereqs: ["CS-102"] },
    { code: "CS-401", name: "Software Engineering Core", credits: 4, status: "Planned", prereqs: ["CS-201", "CS-202"] },
    { code: "CS-499", name: "Senior Capstone Design", credits: 4, status: "Planned", prereqs: ["CS-401"] },
    // Conflict demo course
    { code: "CS-451", name: "Advanced Artificial Intelligence", credits: 4, status: "Prereq-Conflict", prereqs: ["CS-302 (Not Taken)", "MATH-201 (Not Taken)"] }
  ]);

  // Major electives map for what-if tool
  const whatIfMajorRequirements: Record<string, { total: number; coursesNeeded: string[]; description: string }> = {
    'Computer Science & Engineering': {
      total: 120,
      coursesNeeded: ["CS-401 Software Engineering", "CS-499 Senior Capstone", "CSE Elective Tech II"],
      description: "Requires advanced algorithmics, discrete optimization, and cyber security certificates."
    },
    'Software Engineering': {
      total: 118,
      coursesNeeded: ["SE-302 Agile Methodologies", "SE-410 Software Testing", "CS-499 Senior Capstone"],
      description: "Focuses heavily on lifecycle management, systems architecture, design patterns, and test suites."
    },
    'Data Science & Analytics': {
      total: 122,
      coursesNeeded: ["DS-201 Intro to Data Science", "DS-305 Machine Learning", "MATH-310 Linear Algebra II"],
      description: "Requires advanced calculus, regression profiling, statistical modeling arrays, and predictive forecasting."
    },
    'Mathematics & Statistics': {
      total: 115,
      coursesNeeded: ["MATH-301 Abstract Algebra", "MATH-310 Linear Algebra II", "MATH-450 Advanced Topology"],
      description: "Concentrated on theoretical algebraic equations, statistical inferences, and core geometry structures."
    }
  };

  const currentWhatIf = whatIfMajorRequirements[targetMajor] || whatIfMajorRequirements['Computer Science & Engineering'];
  const totalCompletedCredits = courses
    .filter(c => c.status === 'Completed')
    .reduce((sum, curr) => sum + curr.credits, 0);

  const totalInProgressCredits = courses
    .filter(c => c.status === 'In-Progress')
    .reduce((sum, curr) => sum + curr.credits, 0);

  const completionPercent = Math.min(100, Math.round((totalCompletedCredits / currentWhatIf.total) * 100));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header element */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Degree Progress Tracker</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full uppercase tracking-tighter">
              <Calendar size={10} className="mr-1" />
              Live Academic audit
            </span>
          </div>
          <p className="text-gray-500 font-medium">Verify your registered credits, analyze prerequisites, and run hypothetical major switches instantly.</p>
        </div>
      </header>

      {/* Credit Map & completion visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Progress Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Academic Summary Audit</span>
              <h3 className="text-xl font-black text-gray-900">Total Degree Progress Map</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-700">{completionPercent}%</span>
              <p className="text-[10px] font-black text-gray-400 uppercase">Degree Done</p>
            </div>
          </div>

          {/* Progress bar container */}
          <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500" style={{ width: `${completionPercent}%` }} />
            <div className="bg-indigo-300 transition-all duration-500" style={{ width: `${(totalInProgressCredits / currentWhatIf.total) * 100}%` }} title="In Progress Credits" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50 text-center">
            <div>
              <p className="text-2xl font-black text-gray-900">{totalCompletedCredits}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Credits</p>
            </div>
            <div>
              <p className="text-2xl font-black text-indigo-500">{totalInProgressCredits}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">In-Progress</p>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-400">{currentWhatIf.total - totalCompletedCredits - totalInProgressCredits}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Credits Needed</p>
            </div>
          </div>
        </div>

        {/* What-If Planning controller */}
        <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 bg-white/10 w-fit px-3 py-1 rounded-full">
              <RefreshCw size={12} className="text-indigo-200 animate-spin" />
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">What-If Major Planner</span>
            </div>
            <h3 className="text-lg font-black leading-tight">Switch / Simulate Major Pathway</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Instantly view required remaining courses and compatibility percentage if you switched your current curriculum focus.
            </p>

            <select
              value={targetMajor}
              onChange={e => setTargetMajor(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-semibold text-xs text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white cursor-pointer mt-2"
            >
              {Object.keys(whatIfMajorRequirements).map(major => (
                <option key={major} value={major} className="text-gray-900 uppercase font-black text-xs">{major}</option>
              ))}
            </select>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 space-y-2">
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Simulated Requirements</p>
            <p className="text-xs text-indigo-100 font-medium italic">"{currentWhatIf.description}"</p>
            <div className="bg-white/10 p-3 rounded-xl border border-white/5 space-y-1 mt-2">
              <p className="text-[9px] font-black uppercase tracking-wider text-indigo-300">New Courses To Pick Up:</p>
              {currentWhatIf.coursesNeeded.map((course, i) => (
                <p key={i} className="text-[11px] font-bold text-indigo-150 flex items-center gap-1.5">
                  <BookOpen size={10} />
                  {course}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prerequisite checker Conflict flags */}
      {checkedConflict && (
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-red-900 relative">
          <button 
            onClick={() => setCheckedConflict(false)} 
            className="absolute top-4 right-4 text-xs font-black text-red-600 hover:underline uppercase tracking-wide"
          >
            Acknowledge Conflict
          </button>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1.5 max-w-3xl">
              <h3 className="font-black text-sm tracking-tight flex items-center gap-1.5 uppercase text-red-950">
                Prerequisite Conflict Flag Triggered
                <span className="text-[9px] font-black bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full uppercase">Action Needed</span>
              </h3>
              <p className="text-xs text-red-800 leading-relaxed">
                You have registered or planned `CS-451 Advanced Artificial Intelligence` for the next term, but you are currently missing the following prerequisite structures:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 bg-white border border-red-200 text-red-700 text-[10px] font-black rounded-lg">
                  CS-302 Formal Languages & Automata
                </span>
                <span className="px-2.5 py-1 bg-white border border-red-200 text-red-700 text-[10px] font-black rounded-lg">
                  MATH-201 Linear Algebra
                </span>
              </div>
              <p className="text-[10px] text-red-600 font-bold italic pt-1">Please register for prerequisite terms or chat with your advisor first.</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Roadmap list */}
      <div className="space-y-4">
        <h3 className="font-black text-gray-900 text-sm tracking-widest uppercase">
          Curriculum Pathways & Course Sequence List
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div 
              key={course.code} 
              className={`p-6 bg-white rounded-3xl border border-gray-100 flex justify-between items-center relative overflow-hidden transition-all ${
                course.status === 'Completed' ? 'bg-indigo-50/10' : 
                course.status === 'In-Progress' ? 'border-indigo-100 hover:border-indigo-200 shadow-sm' :
                course.status === 'Prereq-Conflict' ? 'bg-red-50/20 border-red-100' : ''
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black text-gray-400 uppercase">{course.code}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    course.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-100' :
                    course.status === 'In-Progress' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                    course.status === 'Planned' ? 'bg-gray-100 text-gray-600' :
                    'bg-red-200/50 text-red-700 border border-red-300'
                  }`}>
                    {course.status}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">{course.credits} Credits</span>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{course.name}</h4>
                  {course.prereqs && (
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-0.5">
                      Prereq: {course.prereqs.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* End parameters */}
              <div className="text-right ml-4 shrink-0">
                {course.status === 'Completed' ? (
                  <div>
                    <span className="text-lg font-black text-green-600 tracking-tight">{course.grade ?? 'B'}</span>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{course.termCompleted ?? 'Completed'}</p>
                  </div>
                ) : course.status === 'In-Progress' ? (
                  <span className="text-xs text-indigo-500 font-semibold uppercase tracking-widest flex items-center gap-1">
                    <Activity size={12} className="animate-pulse" />
                    <span>Active</span>
                  </span>
                ) : course.status === 'Planned' ? (
                  <button className="text-xs text-indigo-600 hover:underline font-bold">Register</button>
                ) : (
                  <span className="text-[9px] text-red-600 font-black border border-red-200 bg-red-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Conflict</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Source system note */}
      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-amber-950 flex items-start space-x-4">
        <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
          <HelpCircle size={20} />
        </div>
        <div className="space-y-1">
          <h3 className="font-black text-sm tracking-tight text-amber-950 uppercase">Data Lineage & Registrar API Integration</h3>
          <p className="text-xs text-amber-850 leading-relaxed">
            Degree progression models and audit logs sync directly with Jericho University's SIS database systems to match program blueprints instantly on any curriculum change simulation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DegreeProgress;
