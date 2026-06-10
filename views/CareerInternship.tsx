import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  FileText, 
  Users, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  Award, 
  UploadCloud, 
  Target, 
  TrendingUp, 
  BookOpen, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { STUDENT_MOCK } from '../constants';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  majorMatchScore: number;
  salary: string;
  description: string;
  tags: string[];
}

interface AlumniPath {
  id: string;
  alumniName: string;
  gradYear: number;
  currentRole: string;
  company: string;
  careerJourney: string[];
  recommendedCertifications: string[];
  mentorshipAvailable: boolean;
}

const CareerInternship: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'board' | 'resume' | 'paths'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  
  // Resume Reviewer State
  const [resumeText, setResumeText] = useState('');
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const jobsMock: Job[] = [
    {
      id: "JOB-101",
      title: "Junior Full Stack Developer (Intern)",
      company: "Stripe",
      location: "San Francisco, CA (Hybrid)",
      type: "Internship",
      majorMatchScore: 97,
      salary: "$45 - $55 / hr",
      description: "Join the core billing infrastructure team to design, test, and release reliable APIs powering millions of global transactions.",
      tags: ["React", "Node.js", "TypeScript", "SQL"]
    },
    {
      id: "JOB-102",
      title: "Software Engineering Intern - Cloud Platforms",
      company: "Google Cloud",
      location: "Sunnyvale, CA (Onsite)",
      type: "Internship",
      majorMatchScore: 94,
      salary: "$52 - $60 / hr",
      description: "Contribute to serverless orchestration tooling and Kubernetes integration networks. Perfect match for core Computer Science majors.",
      tags: ["Go", "Kubernetes", "gRPC", "Docker"]
    },
    {
      id: "JOB-103",
      title: "Associate Data Scientist",
      company: "Salesforce CRM",
      location: "Remote (US)",
      type: "Full-Time",
      majorMatchScore: 88,
      salary: "$115,000 / yr",
      description: "Leverage big data platforms, Python architectures, and business intelligence models to support sales prediction telemetry.",
      tags: ["Python", "Pandas", "Scikit-Learn", "Einstein Analytics"]
    },
    {
      id: "JOB-104",
      title: "Security Analyst Apprentice",
      company: "CrowdStrike Security",
      location: "Austin, TX (Remote)",
      type: "Apprenticeship",
      majorMatchScore: 81,
      salary: "$35 - $40 / hr",
      description: "Monitor cyber threat vectors, evaluate intrusion trends, and draft reactive reports for enterprise customers.",
      tags: ["Linux", "Python", "Networking", "SOC"]
    },
    {
      id: "JOB-105",
      title: "UI/UX Front End Engineer",
      company: "Figma",
      location: "San Francisco, CA (Hybrid)",
      type: "Internship",
      majorMatchScore: 76,
      salary: "$42 - $48 / hr",
      description: "Design and implement beautiful responsive canvas systems. Knowledge of component architectures and web vector tools required.",
      tags: ["Figma API", "React", "CSS Modules", "WASM"]
    }
  ];

  const alumniPathsMock: AlumniPath[] = [
    {
      id: "ALUM-01",
      alumniName: "Devon Carter",
      gradYear: 23,
      currentRole: "Lead Cloud Engineer",
      company: "AWS",
      careerJourney: [
        "JU B.S. Computer Science",
        "Cloud Engineering Intern at Capital One",
        "Systems Analyst at Rackspace",
        "SDE II (Cloud) at Amazon Web Services"
      ],
      recommendedCertifications: [
        "AWS Solutions Architect Associate",
        "Certified Kubernetes Administrator (CKA)",
        "Terraform Certified Associate"
      ],
      mentorshipAvailable: true
    },
    {
      id: "ALUM-02",
      alumniName: "Sarah Finch",
      gradYear: 22,
      currentRole: "Senior Tech Consultant",
      company: "Deloitte Digital",
      careerJourney: [
        "JU B.S. Software Engineering",
        "CRM Analyst Internship with Jericho University",
        "IT Consultant at Ernst & Young",
        "Senior Digital Architect at Deloitte"
      ],
      recommendedCertifications: [
        "Salesforce Certified Administrator",
        "ITIL Foundation Certification v4",
        "Certified ScrumMaster (CSM)"
      ],
      mentorshipAvailable: true
    }
  ];

  // AI-Job Filtering major calculation
  const getMajorMatchExplanation = (score: number) => {
    if (score >= 95) return "Exceptional fit based on CSE academic credits.";
    if (score >= 90) return "Strong alignment with core engineering courses.";
    if (score >= 80) return "Good overlap. Meets prerequisite logic.";
    return "Partial match. Recommended elective completion.";
  };

  const handleAnalyzeResume = () => {
    if (!resumeText.trim()) return;
    setResumeAnalyzing(true);
    setAnalysisResult(null);

    // Dynamic Mock AI assessment logic
    setTimeout(() => {
      setResumeAnalyzing(false);
      setAnalysisResult({
        overallScore: 82,
        atsCompatibility: "High",
        majorRelevanceMatch: "94%",
        strengths: [
          "Strong core algorithms and data structures vocabulary.",
          "Good integration of modern React and API structures.",
          "Excellent quantitative metric focus under GPA parameters."
        ],
        improvementsNeeded: [
          "Specify database optimization concepts and storage index queries.",
          "Integrate Docker, Kubernetes, or cloud deployment pipelines explicitly.",
          "Reduce lengthy intro paragraphs into structured impact lines."
        ]
      });
    }, 1800);
  };

  const handlePasteSample = () => {
    setResumeText(
      `Alex Johnson | hiteshmakky@gmail.com\n` +
      `B.S. Computer Science & Engineering - Current GPA: 3.82\n\n` +
      `PROFESSIONAL EXPERIENCE:\n` +
      `- Student Developer, Jericho Tech Desk: Built responsive ticket layouts using React and Tailwind.\n` +
      `- Web Intern, Sandbox Dev: Developed client components, implemented responsive CSS modules.\n\n` +
      `SKILLS:\n` +
      `JavaScript, TypeScript, React, Vite, Node.js, Express, Postgres, Git`
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header and Controller */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Career & Internships</h1>
            <span className="flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">
              <TrendingUp size={10} className="mr-1" />
              Portal Career Engine
            </span>
          </div>
          <p className="text-gray-500 font-medium">Explore AI-curated internship opportunities, optimize your resume keywords, and access alumni recommendations.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Briefcase size={14} />
            <span>Smart Job Board</span>
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'resume' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileText size={14} />
            <span>Resume Reviewer</span>
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'paths' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users size={14} />
            <span>Alumni Career Paths</span>
          </button>
        </div>
      </header>

      {/* TAB 1: SMART JOB BOARD */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
              <Sparkles size={180} />
            </div>
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-200 text-[10px] font-black uppercase tracking-widest w-fit px-3 py-1 rounded-full border border-indigo-400/20">
                <Sparkles size={12} className="text-indigo-300" />
                AI-Powered Major Filter
              </span>
              <h2 className="text-2xl font-black">Curated for {STUDENT_MOCK.major}</h2>
              <p className="text-indigo-200 text-sm leading-relaxed">
                These listings are matched to your live academic credentials, completed courses, and core strengths dynamically evaluated in the Student Portal databases.
              </p>
            </div>
          </div>

          {/* Search Controls */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search jobs, sponsors, technologies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-gray-800 font-medium"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Internship', 'Full-Time', 'Apprenticeship'].map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedType === t ? 'bg-gray-950 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {jobsMock
              .filter(j => {
                if (selectedType !== 'All' && j.type !== selectedType) return false;
                if (searchQuery) {
                  const q = searchQuery.toLowerCase();
                  return j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.tags.some(t => t.toLowerCase().includes(q));
                }
                return true;
              })
              .map(job => (
                <div key={job.id} className="bg-white p-6 rounded-3xl border border-gray-150 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 text-xs font-black">
                        <Sparkles size={11} className="text-indigo-500" />
                        <span>{job.majorMatchScore}% AI Match</span>
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">
                        {job.type}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        {job.id}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                        <span className="font-bold text-gray-700">{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        <span>•</span>
                        <span className="font-mono text-indigo-600 py-0.5 px-1.5 bg-indigo-50/50 rounded-md font-bold">{job.salary}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">{job.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {job.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex md:flex-col justify-end items-end w-full md:w-auto border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                    <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black tracking-widest uppercase transition-all w-full md:w-auto flex items-center justify-center space-x-2">
                      <span>Apply Instantly</span>
                      <ArrowRight size={14} />
                    </button>
                    <span className="hidden md:inline text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
                      {getMajorMatchExplanation(job.majorMatchScore)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: RESUME REVIEWER */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-black text-gray-800 text-lg">AI Resume Feedback</h3>
                <p className="text-xs text-gray-500">Paste your structured text resume to scan against ATS keywords.</p>
              </div>
              <button 
                onClick={handlePasteSample}
                className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-widest hover:bg-indigo-150 transition-colors"
              >
                Use Simulated Student Resume
              </button>
            </div>

            <textarea
              rows={12}
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste plain text resume details (e.g., Contact, Experience, Skills)..."
              className="w-full p-4 bg-gray-50 border border-gray-150 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-xs font-mono text-gray-700 resize-none leading-relaxed"
            />

            <button
              onClick={handleAnalyzeResume}
              disabled={resumeAnalyzing || !resumeText.trim()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black tracking-widest uppercase shadow-md shadow-indigo-100 transition-all flex items-center justify-center space-x-2"
            >
              {resumeAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                  <span>Scrutinizing Keywords...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze ATS Match</span>
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {analysisResult ? (
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Analysis Result</span>
                    <h3 className="font-black text-gray-800 text-lg">AI Feedback Summary</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase font-black">ATS Score</p>
                    <p className="text-3xl font-black text-green-600">{analysisResult.overallScore}/100</p>
                  </div>
                </div>

                {/* Score indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-gray-400 text-[10px] font-bold uppercase">Compatibility</p>
                    <p className="font-black text-sm text-gray-850 mt-1">{analysisResult.atsCompatibility}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-gray-400 text-[10px] font-bold uppercase">Major Relevance</p>
                    <p className="font-black text-sm text-indigo-600 mt-1">{analysisResult.majorRelevanceMatch}</p>
                  </div>
                </div>

                {/* Strengths */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-900 tracking-wider uppercase flex items-center gap-1.5 text-green-700">
                    <CheckCircle size={14} />
                    ATS Keyword Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.strengths.map((s: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black text-gray-900 tracking-wider uppercase flex items-center gap-1.5 text-amber-700">
                    <Target size={14} />
                    Keyword & Detail Enhancements
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.improvementsNeeded.map((s: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 leading-relaxed flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center">
                <UploadCloud size={40} className="text-gray-300 mb-4 animate-pulse" />
                <h4 className="font-bold text-gray-800 text-sm mb-1">Upload or Paste Resume</h4>
                <p className="text-gray-500 text-xs max-w-xs">Provide your plain resume structure in the editor to evaluate ATS scoring criteria instantly.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ALUMNI CAREER PATHS */}
      {activeTab === 'paths' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {alumniPathsMock.map(path => (
              <div key={path.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{path.alumniName}</h3>
                    <p className="text-xs text-indigo-600 font-bold mt-1">
                      JU Class of '20{path.gradYear} • {path.currentRole} at {path.company}
                    </p>
                  </div>
                  {path.mentorshipAvailable && (
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-black border border-green-150 uppercase tracking-widest rounded-lg">
                      Mentoring Available
                    </span>
                  )}
                </div>

                {/* Journey Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp size={12} />
                    Career Path Roadmap
                  </h4>
                  <div className="space-y-3 relative pl-4 border-l border-indigo-50">
                    {path.careerJourney.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white" />
                        <p className="text-xs font-bold text-gray-800">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3 mt-auto pt-4 border-t border-gray-50">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Award size={12} />
                    Recommended Professional Credentials
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {path.recommendedCertifications.map(cert => (
                      <span key={cert} className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Request Mentorship button */}
                <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2">
                  <MessageSquare size={14} />
                  <span>Request Mentorship Callback</span>
                </button>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-amber-900 mt-6 flex items-start space-x-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl mt-0.5">
              <HelpCircle size={20} />
            </div>
            <div className="space-y-1 max-w-3xl">
              <h3 className="font-black text-sm tracking-tight">Understanding Data Flow for Job boards & Paths</h3>
              <p className="text-xs text-amber-850 leading-relaxed">
                Matches are compiled across core student directories and SIS registrar outputs securely. External job tags connect with certified partner networks using secure REST interfaces to protect student identity details completely.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerInternship;
