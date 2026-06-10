
import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText, 
  HelpCircle,
  ChevronDown,
  CreditCard,
  Plus,
  X,
  UploadCloud,
  Lock,
  Trash2,
  Unlock,
  AlertCircle,
  FileSpreadsheet,
  Eye,
  Check,
  Ban
} from 'lucide-react';
import { STUDENT_MOCK } from '../constants';
import ContactSection from '../components/ContactSection';

interface AdmissionStep {
  id: number;
  name: string;
  status: 'completed' | 'current' | 'upcoming';
  date: string;
}

interface AdmissionTerm {
  id: string;
  termName: string;
  program: string;
  steps: AdmissionStep[];
}

const ADMISSION_HISTORY: AdmissionTerm[] = [
  {
    id: 'f24',
    termName: 'Fall 2024',
    program: 'Computer Science (Major Entry)',
    steps: [
      { id: 1, name: 'Major Application Submitted', status: 'completed', date: 'Jan 15, 2024' },
      { id: 2, name: 'Prerequisites Verified', status: 'completed', date: 'Feb 10, 2024' },
      { id: 3, name: 'Department Interview', status: 'completed', date: 'Mar 02, 2024' },
      { id: 4, name: 'Major Acceptance Sent', status: 'completed', date: 'Mar 15, 2024' },
      { id: 5, name: 'Advisor Assignment', status: 'completed', date: 'Apr 01, 2024' },
      { id: 6, name: 'Fall Course Registration', status: 'current', date: 'Ongoing' },
      { id: 7, name: 'Department Orientation', status: 'upcoming', date: 'Scheduled' },
    ]
  },
  {
    id: 'f22',
    termName: 'Fall 2022',
    program: 'General Engineering (Initial Entry)',
    steps: [
      { id: 1, name: 'University Application', status: 'completed', date: 'Nov 12, 2021' },
      { id: 2, name: 'Official Transcripts Received', status: 'completed', date: 'Dec 05, 2021' },
      { id: 3, name: 'SAT/ACT Scores Verified', status: 'completed', date: 'Dec 20, 2021' },
      { id: 4, name: 'Offer of Admission', status: 'completed', date: 'Feb 14, 2022' },
      { id: 5, name: 'Financial Aid Package', status: 'completed', date: 'Mar 01, 2022' },
      { id: 6, name: 'Enrollment Deposit Paid', status: 'completed', date: 'May 01, 2022' },
      { id: 7, name: 'First Year Orientation', status: 'completed', date: 'Aug 15, 2022' },
    ]
  }
];

interface AdmissionPayment {
  id: string;
  termId: string;
  termName: string;
  itemName: string;
  amount: number;
  paymentType: string;
  date: string;
  status: 'Paid';
  transactionId: string;
}

const INITIAL_PAYMENTS: AdmissionPayment[] = [
  {
    id: 'pay-4',
    termId: 'f24',
    termName: 'Fall 2024',
    itemName: 'Seat Deposit & Acceptance Fee',
    amount: 300,
    paymentType: 'Credit Card (Visa *4242)',
    date: '2024-04-10',
    status: 'Paid',
    transactionId: 'TXN-77391-OP'
  },
  {
    id: 'pay-3',
    termId: 'f22',
    termName: 'Fall 2022',
    itemName: 'Housing Security Deposit',
    amount: 250,
    paymentType: 'Debit Card (Mastercard *9812)',
    date: '2022-05-15',
    status: 'Paid',
    transactionId: 'TXN-55219-HS'
  },
  {
    id: 'pay-2',
    termId: 'f22',
    termName: 'Fall 2022',
    itemName: 'Enrollment Deposit',
    amount: 500,
    paymentType: 'Electronic Check (ACH)',
    date: '2022-05-01',
    status: 'Paid',
    transactionId: 'TXN-41120-EN'
  },
  {
    id: 'pay-1',
    termId: 'f22',
    termName: 'Fall 2022',
    itemName: 'Undergraduate Application Fee',
    amount: 75,
    paymentType: 'Credit Card (Amex *1001)',
    date: '2021-11-12',
    status: 'Paid',
    transactionId: 'TXN-09923-AP'
  }
];

interface AdmissionDocument {
  id: string;
  name: string;
  status: 'Approved' | 'Under Review' | 'Action Required' | 'Pending Submission';
  submittedDate?: string;
  category: string;
  required: boolean;
  notes?: string;
}

const INITIAL_DOCUMENTS: AdmissionDocument[] = [
  {
    id: 'doc-1',
    name: 'Official High School Transcript',
    status: 'Approved',
    submittedDate: '2022-04-18',
    category: 'Academic Records',
    required: true,
    notes: 'Verified directly via electronic Parchment clearinghouse.'
  },
  {
    id: 'doc-2',
    name: 'SAT / ACT Official Score Reports',
    status: 'Approved',
    submittedDate: '2022-04-22',
    category: 'Academic Records',
    required: true,
    notes: 'Scores verified by official College Board agency.'
  },
  {
    id: 'doc-3',
    name: 'Proof of Immunization Form',
    status: 'Action Required',
    submittedDate: '2024-05-15',
    category: 'Medical Compliance',
    required: true,
    notes: 'Missing signature from authorized clinician. Please re-upload.'
  },
  {
    id: 'doc-4',
    name: 'Government Issued Photo ID / Passport Copy',
    status: 'Under Review',
    submittedDate: '2024-06-03',
    category: 'Identification',
    required: true,
    notes: 'Received copy. Currently checking image legibility.'
  },
  {
    id: 'doc-5',
    name: 'Letters of Academic Recommendation',
    status: 'Approved',
    submittedDate: '2022-05-01',
    category: 'Admissions Requirements',
    required: true,
    notes: 'Two faculty letters uploaded.'
  },
  {
    id: 'doc-6',
    name: 'Financial Support Statement / Sponsor Letter',
    status: 'Pending Submission',
    category: 'Financial Clearance',
    required: true,
    notes: 'Please submit a bank statement dated within 6 months.'
  },
  {
    id: 'doc-7',
    name: 'Major Elective Course Entry Essay',
    status: 'Pending Submission',
    category: 'Admissions Requirements',
    required: false,
    notes: 'Optional personal statement for the Computer Science track.'
  }
];

const Admissions: React.FC = () => {
  const [selectedTermId, setSelectedTermId] = useState(ADMISSION_HISTORY[0].id);
  const selectedTerm = ADMISSION_HISTORY.find(t => t.id === selectedTermId) || ADMISSION_HISTORY[0];

  const [payments, setPayments] = useState<AdmissionPayment[]>(INITIAL_PAYMENTS);

  /* 
   * COMMENTED OUT: Submit Fee Payment option states and submission logic
   * 
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [newPaymentItem, setNewPaymentItem] = useState('Seat Deposit & Acceptance Fee');
  const [newPaymentType, setNewPaymentType] = useState('Credit Card (Visa *4242)');
  const [newPaymentAmount, setNewPaymentAmount] = useState('300');
  const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().substring(0, 10));
  const [newPaymentTermId, setNewPaymentTermId] = useState('f24');

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTerm = ADMISSION_HISTORY.find(t => t.id === newPaymentTermId);
    const newRecord: AdmissionPayment = {
      id: `pay-${Date.now()}`,
      termId: newPaymentTermId,
      termName: targetTerm ? targetTerm.termName : 'Fall 2024',
      itemName: newPaymentItem,
      amount: parseFloat(newPaymentAmount) || 0,
      paymentType: newPaymentType,
      date: newPaymentDate,
      status: 'Paid',
      transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}-OP`
    };
    
    setPayments([newRecord, ...payments]);
    setIsPaymentFormOpen(false);
    
    // Reset inputs
    setNewPaymentItem('Seat Deposit & Acceptance Fee');
    setNewPaymentAmount('300');
    setNewPaymentDate(new Date().toISOString().substring(0, 10));
  };
  */

  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Admission Documents State
  const [admissionDocs, setAdmissionDocs] = useState<AdmissionDocument[]>(INITIAL_DOCUMENTS);
  const [documentUploadProgress, setDocumentUploadProgress] = useState<string | null>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  
  // Custom interactive document modal/viewer state parameters
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<AdmissionDocument | null>(null);
  const [customDenialReason, setCustomDenialReason] = useState<string>('');

  const triggerDocumentUpload = (id: string) => {
    setActiveUploadId(id);
    docFileInputRef.current?.click();
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && activeUploadId) {
      const file = e.target.files[0];
      const docId = activeUploadId;
      
      // Simulate file upload progress
      setDocumentUploadProgress(docId);
      
      setTimeout(() => {
        setAdmissionDocs(prev => prev.map(doc => {
          if (doc.id === docId) {
            return {
              ...doc,
              status: 'Under Review',
              submittedDate: new Date().toISOString().substring(0, 10),
              notes: `Successfully uploaded: ${file.name}. Verification in progress.`
            };
          }
          return doc;
        }));
        setDocumentUploadProgress(null);
        setActiveUploadId(null);
        if (docFileInputRef.current) docFileInputRef.current.value = '';
      }, 1000);
    }
  };

  // Resources state for dynamic user & admin interactions
  const [resources, setResources] = useState([
    { id: 'res-1', name: 'Onboarding Checklist', icon: FileText, size: '1.2 MB', date: 'Oct 10, 2024' },
    { id: 'res-2', name: 'Application FAQ', icon: HelpCircle, size: '420 KB', date: 'Sep 28, 2024' },
    { id: 'res-3', name: 'Program Curriculum', icon: FileText, size: '2.4 MB', date: 'Oct 05, 2024' },
  ]);

  // Admin and Upload States for Resources Section
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingName, setUploadingName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selector for click-to-upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileUpload(e.target.files[0]);
    }
  };

  // Drag and drop event processors
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileUpload(e.dataTransfer.files[0]);
    }
  };

  // High quality simulated upload progress bar
  const processFileUpload = (file: File) => {
    setUploadingName(file.name);
    setUploadProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          // Compute size descriptor
          const sizeStr = file.size > 1024 * 1024 
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
            : `${Math.round(file.size / 1024)} KB`;

          const cleanName = file.name.replace(/\.[^/.]+$/, ""); // Strip file format extension
          const newResource = {
            id: `res-${Date.now()}`,
            name: cleanName,
            icon: FileText,
            size: sizeStr,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          };

          setResources(prev => [newResource, ...prev]);
          setUploadProgress(null);
          setUploadingName('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }, 150);
      }
    }, 100);
  };

  const handleDeleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Admission Progress</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Updated: Oct 18, 2024
            </span>
          </div>
          <p className="text-gray-500">Track your journey and historical program entries at Jericho University.</p>
        </div>
        
        {/* Term Filter */}
        <div className="relative inline-block text-left w-full md:w-64">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Select Academic Entry</label>
          <div className="relative group">
            <select 
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="appearance-none w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {ADMISSION_HISTORY.map(term => (
                <option key={term.id} value={term.id}>{term.termName} - {term.program}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-gray-800">Onboarding Timeline: {selectedTerm.termName}</h3>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">
                {selectedTerm.program}
              </span>
            </div>
            
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-100"></div>
              
              <div className="space-y-8 relative">
                {selectedTerm.steps.map((step) => (
                  <div key={step.id} className="flex items-start space-x-6 group">
                    <div className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      step.status === 'completed' ? 'bg-indigo-600 border-indigo-600 text-white' :
                      step.status === 'current' ? 'bg-white border-indigo-600 text-indigo-600' :
                      'bg-white border-gray-200 text-gray-300'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      {step.status === 'current' && <div className="absolute -inset-1 bg-indigo-600/20 rounded-full animate-ping"></div>}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-bold transition-colors ${step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-800'}`}>
                          {step.name}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 flex items-center bg-gray-50 px-2 py-0.5 rounded-lg">
                          <Clock size={10} className="mr-1" />
                          {step.date}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 max-w-md">
                        {step.status === 'completed' ? 'This milestone was successfully finalized during the review process.' :
                         step.status === 'current' ? 'Actively processing this requirement. Please check your email for updates.' :
                         'This phase will be unlocked once previous requirements are satisfied.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admissions Verification Documents Board */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6 text-left">
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <FileSpreadsheet className="text-indigo-600" size={20} />
                    <span>Admissions Verification Documents</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage and view critical documents submitted for admission review. Switch to Admin mode on the right to approve or request document revisions as a registrar administrator.
                  </p>
                </div>
              </div>
            </div>

            {/* Document stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="text-center sm:text-left">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Approved</span>
                <span className="text-lg font-black text-emerald-600">
                  {admissionDocs.filter(d => d.status === 'Approved').length}
                </span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Under Review</span>
                <span className="text-lg font-black text-amber-500">
                  {admissionDocs.filter(d => d.status === 'Under Review').length}
                </span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Action Req.</span>
                <span className="text-lg font-black text-rose-500">
                  {admissionDocs.filter(d => d.status === 'Action Required').length}
                </span>
              </div>
              <div className="text-center sm:text-left">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pending Submission</span>
                <span className="text-lg font-black text-slate-500">
                  {admissionDocs.filter(d => d.status === 'Pending Submission').length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-black uppercase text-slate-400 tracking-wider bg-slate-50/50">
                    <th scope="col" className="py-3 px-4 font-extrabold rounded-l-2xl">Document Name</th>
                    <th scope="col" className="py-3 px-4 font-extrabold text-center">Submission Status</th>
                    <th scope="col" className="py-3 px-4 font-extrabold text-center">Review Decision</th>
                    <th scope="col" className="py-3 px-4 font-extrabold text-right rounded-r-2xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {admissionDocs.map((doc) => {
                    const isSubmitted = doc.status !== 'Pending Submission';
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/40 transition-all group">
                        <td className="py-4 px-4 font-medium text-gray-900 max-w-xs sm:max-w-md">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                              <span>📄</span>
                              <span>{doc.name}</span>
                              {doc.required && (
                                <span className="text-[8px] text-rose-600 bg-rose-50 border border-rose-100 font-extrabold px-1.5 py-0.2 rounded shrink-0 uppercase tracking-wide">
                                  Required
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                              {doc.category} {doc.submittedDate && `• Logged on ${new Date(doc.submittedDate + 'T12:00:00').toLocaleDateString('en-US', {month:'short', day:'2-digit', year:'numeric'})}`}
                            </span>
                            {doc.notes && (
                              <span className="text-[10px] text-indigo-600 bg-indigo-50/40 px-2 py-0.5 rounded-md italic mt-1.5 inline-block w-fit font-medium">
                                Memo: {doc.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>Submitted</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100/60">
                              <Clock size={12} className="text-amber-600 animate-pulse" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          {doc.status === 'Approved' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Accepted
                            </span>
                          )}
                          {doc.status === 'Action Required' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                              Denied
                            </span>
                          )}
                          {doc.status === 'Under Review' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200">
                              Under Review
                            </span>
                          )}
                          {doc.status === 'Pending Submission' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-400 border border-slate-200/50">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2.5 flex-wrap">
                            {/* Student Upload/Re-upload Trigger Link */}
                            {documentUploadProgress === doc.id ? (
                              <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg animate-pulse">
                                Uploading File...
                              </span>
                            ) : (
                              <button
                                onClick={() => triggerDocumentUpload(doc.id)}
                                className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] inline-flex items-center gap-1 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-all cursor-pointer"
                                title="Upload document file attachment"
                              >
                                <UploadCloud size={13} />
                                <span>{isSubmitted ? 'Re-upload' : 'Upload Link'}</span>
                              </button>
                            )}

                            {/* Viewer Trigger Link */}
                            {isSubmitted && (
                              <button
                                onClick={() => {
                                  setSelectedDocForViewer(doc);
                                  setCustomDenialReason('');
                                }}
                                className="text-slate-600 hover:text-indigo-600 font-bold text-[11px] inline-flex items-center gap-1 bg-slate-100/50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-all cursor-pointer"
                                title="Inspect document and view decisions"
                              >
                                <Eye size={13} />
                                <span>{isAdminMode ? 'Review & Decide' : 'View File'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Hidden Input element to support dynamic files uploading */}
            <input
              type="file"
              ref={docFileInputRef}
              onChange={handleDocFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            />

            {/* Completed Board Message when all requirements are Approved/Accepted */}
            {admissionDocs.every(d => d.status === 'Approved') && (
              <div className="py-5 text-center text-emerald-600 font-bold text-xs bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex flex-col items-center justify-center gap-2 p-4 mt-2">
                <span>✓ All admissions checklist requirements successfully accepted and approved by the registrar office</span>
                <p className="text-[10px] text-slate-500 font-normal">Your matriculation dossier is complete. Welcome to Jericho University College!</p>
              </div>
            )}
          </div>

          {/* Document Preview & Review Action Modal Overlay */}
          {selectedDocForViewer && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📄</span>
                      <h3 className="font-extrabold text-sm md:text-base tracking-tight">
                        {selectedDocForViewer.name}
                      </h3>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-0.5 font-medium">
                      Category: <span className="font-bold text-slate-300">{selectedDocForViewer.category}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedDocForViewer(null)}
                    className="p-1 px-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <span>Close</span>
                    <X size={14} />
                  </button>
                </div>

                {/* Modal Body: Two-panel split layout */}
                <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-y-auto flex-1">
                  
                  {/* Left panel: Simulated Document Preview Core */}
                  <div className="md:col-span-3 p-6 bg-slate-50 flex flex-col items-center justify-start min-h-[300px]">
                    <div className="w-full flex justify-between items-center pb-2.5 border-b border-slate-200/60 mb-4 text-left">
                      <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        Virtual Document Preview • {selectedDocForViewer.name.replace(/\s+/g, '_')}_sys.pdf
                      </span>
                      <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        Page 1 of 1
                      </span>
                    </div>

                    {/* High-fidelity simulation placeholder */}
                    <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-5 relative select-none font-sans text-left text-[11px] text-slate-600 space-y-4 min-h-[380px] flex flex-col justify-between">
                      
                      {/* Document Stamp Marker */}
                      <div className="absolute top-4 right-4 border border-emerald-500/40 text-emerald-600 rounded-lg p-1 text-[8px] font-black uppercase rotate-6 tracking-widest bg-emerald-50/80">
                        Verified Electronic Copy
                      </div>
                      
                      <div className="space-y-4">
                        {/* Header of simulated document */}
                        <div className="text-center pb-3 border-b border-slate-100 shrink-0">
                          <h4 className="font-black text-[12px] text-slate-800 uppercase tracking-tight">
                            Official Registry Verification Dossier
                          </h4>
                          <p className="text-[8px] text-slate-400 font-medium font-mono">
                            JERICHO UNIVERSITY COLLEGE ADMISSIONS PORTAL (ONLINE CHECKPOINT)
                          </p>
                        </div>

                        {/* Simulated Content Based on Document Type */}
                        {selectedDocForViewer.id === 'doc-1' && (
                          <div className="space-y-2.5">
                            <p className="font-bold text-slate-800 text-[11px]">STUDENT: {STUDENT_MOCK.name.toUpperCase()}</p>
                            <p className="text-[10px] text-slate-500 font-medium italic">High School Academic Record Summary:</p>
                            <div className="border border-slate-200 rounded-lg overflow-hidden font-mono text-[9px] bg-slate-50">
                              <div className="grid grid-cols-4 bg-slate-200/50 p-1.5 font-bold text-slate-700">
                                <span>Course</span>
                                <span className="text-center">Term</span>
                                <span className="text-center">Credit</span>
                                <span className="text-right">Grade</span>
                              </div>
                              <div className="p-1.5 space-y-1 text-slate-600">
                                <div className="grid grid-cols-4"><span>AP Calculus AB</span><span className="text-center">F21</span><span className="text-center">1.0</span><span className="text-right text-emerald-600 font-bold">A</span></div>
                                <div className="grid grid-cols-4"><span>Physics Honor</span><span className="text-center">F21</span><span className="text-center">1.0</span><span className="text-right text-emerald-600 font-bold">A-</span></div>
                                <div className="grid grid-cols-4"><span>English Lit 12</span><span className="text-center">S22</span><span className="text-center">1.0</span><span className="text-right text-emerald-600 font-bold">A</span></div>
                                <div className="grid grid-cols-4"><span>Chemistry AP</span><span className="text-center">S22</span><span className="text-center">1.0</span><span className="text-right text-emerald-600 font-bold">A+</span></div>
                              </div>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-2 text-[9px] text-emerald-700 border border-emerald-100">
                              <strong>Cumulative GPA: 3.92 (Weighted 4.14)</strong> / Top 5% ranking confirmed.
                            </div>
                          </div>
                        )}

                        {selectedDocForViewer.id === 'doc-2' && (
                          <div className="space-y-3">
                            <p className="font-bold text-slate-800 text-[11px]">COLLEGE BOARD STANDARDIZED SCORES</p>
                            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                              <div className="flex justify-between items-center border-b border-indigo-100/60 pb-1.5">
                                <span className="font-bold text-slate-700 text-[10px]">SAT Evidence-Based Reading & Writing</span>
                                <span className="text-xs font-black text-indigo-700">710</span>
                              </div>
                              <div className="flex justify-between items-center border-b border-indigo-100/60 pb-1.5">
                                <span className="font-bold text-slate-700 text-[10px]">SAT Mathematics Score</span>
                                <span className="text-xs font-black text-indigo-700">760</span>
                              </div>
                              <div className="flex justify-between items-center font-bold text-slate-800 pt-0.5">
                                <span>SAT Total Cumulative Score</span>
                                <span className="bg-indigo-600 text-white rounded px-1.5 py-0.2 text-[10px]">1470 / 1600</span>
                              </div>
                            </div>
                            <p className="text-[9px] text-slate-400 font-semibold text-center italic">
                              Transmitted electronically from testing clearinghouse.
                            </p>
                          </div>
                        )}

                        {selectedDocForViewer.id === 'doc-3' && (
                          <div className="space-y-2.5">
                            <p className="font-bold text-slate-800 text-[11px]">IMMUNIZATION COMPLIANCE CHECKLIST</p>
                            <div className="space-y-2 text-[10px]">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                <span className="font-semibold text-slate-700 text-[9px]">Measles, Mumps, Rubella (MMR)</span>
                                <span className="text-emerald-600 font-bold text-[9px]">✓ Dose 1 & 2 Completed</span>
                              </div>
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                <span className="font-semibold text-slate-700 text-[9px]">Tetanus-Diphtheria-Pertussis (Tdap)</span>
                                <span className="text-emerald-600 font-bold text-[9px]">✓ Booster Date 2019-10</span>
                              </div>
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                                <span className="font-semibold text-slate-700 text-[9px]">Hepatitis B Series</span>
                                <span className="text-emerald-600 font-bold text-[9px]">✓ 3 Doses Verified</span>
                              </div>
                              <div className="flex items-center justify-between text-rose-600 border-b border-slate-100 pb-1 bg-rose-50 p-1 rounded text-[9px]">
                                <span className="font-black">Clinician Signature / Seal Validation</span>
                                <span className="font-black flex items-center gap-1">⚠ SIGNATURE CHECK FAILED</span>
                              </div>
                            </div>
                            <div className="text-[9px] text-slate-500 bg-amber-50 p-2 border border-amber-200 rounded-lg">
                              <strong>Clinician Remark:</strong> "Upload lacks stamp verification from physician office. Please re-submit signed health form with authentic doctor credentials."
                            </div>
                          </div>
                        )}

                        {selectedDocForViewer.id === 'doc-4' && (
                          <div className="space-y-3">
                            <p className="font-bold text-slate-800 text-[11px]">GOVERNMENT PHOTO ID / PASSPORT SCAN</p>
                            <div className="w-full h-28 border border-slate-300 rounded-xl bg-slate-100/50 flex flex-col items-center justify-center relative p-2 border-dashed">
                              <div className="w-full h-full border border-slate-300 bg-white shadow-2xs rounded-lg flex items-center p-2.5 gap-2.5">
                                <div className="w-12 h-16 bg-slate-200 rounded flex items-center justify-center text-[8px] text-slate-400 font-bold uppercase select-none border">
                                  Portrait
                                </div>
                                <div className="flex-1 space-y-0.5 text-[8px] text-slate-500 font-mono">
                                  <p className="font-black text-[9px] text-slate-700 font-sans">UNITED STATES OF AMERICA</p>
                                  <p>PASSPORT NO: L839201A9</p>
                                  <p>SURNAME: {STUDENT_MOCK.name.split(' ').pop()?.toUpperCase()}</p>
                                  <p>GIVEN NAMES: {STUDENT_MOCK.name.split(' ').slice(0, -1).join(' ').toUpperCase()}</p>
                                  <p>NATIONALITY: UNITED STATES OF AMERICA</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-[9px] text-emerald-600 font-extrabold text-center">
                              ✓ Photocopy verified under registrar OCR inspection.
                            </p>
                          </div>
                        )}

                        {/* Fallback for other uploaded file materials */}
                        {!['doc-1', 'doc-2', 'doc-3', 'doc-4'].includes(selectedDocForViewer.id) && (
                          <div className="space-y-3">
                            <div className="h-32 flex flex-col items-center justify-center bg-slate-100 border border-slate-200 border-dashed rounded-xl p-4 text-center">
                              <span className="text-3xl">📄</span>
                              <p className="text-xs font-bold text-slate-700 mt-1.5">{selectedDocForViewer.name}</p>
                              <span className="px-2 py-0.5 rounded-full text-[8px] bg-slate-200 text-slate-600 font-bold uppercase tracking-wider mt-2">
                                Submitted Attachment File
                              </span>
                            </div>
                            <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 text-[9px] space-y-0.5">
                              <p className="font-bold text-slate-800">Metadata Payload:</p>
                              <p className="font-mono text-slate-500">File Format: PDF Document • Checksum: SHA-256 Verified</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom footer seal */}
                      <div className="pt-2 border-t border-slate-100 text-center shrink-0">
                        <span className="font-mono text-[7px] text-slate-400 font-bold tracking-widest uppercase">
                          CONFIDENTIAL RECORD • JERICHO UNIVERSITY PORTAL ARCHIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right panel: Controls and Decision Center */}
                  <div className="md:col-span-2 p-6 flex flex-col justify-between space-y-6 text-left">
                    <div>
                      <div className="pb-3 border-b border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                          Document Audit Trail
                        </span>
                        <h4 className="font-black text-slate-800 text-xs">
                          {selectedDocForViewer.name}
                        </h4>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            Submission Log
                          </label>
                          <p className="text-xs text-slate-800 font-semibold mt-1">
                            {selectedDocForViewer.submittedDate ? (
                              `Submitted on ${new Date(selectedDocForViewer.submittedDate + 'T12:00:00').toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})}`
                            ) : (
                              'Waiting for file submission...'
                            )}
                          </p>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            Requirement Check
                          </label>
                          <p className="text-xs mt-1">
                            {selectedDocForViewer.required ? (
                              <span className="text-rose-600 bg-rose-50 border border-rose-100 font-bold px-2 py-0.5 rounded-md text-[10px]">
                                Mandatory Matriculation Check
                              </span>
                            ) : (
                              <span className="text-slate-500 bg-slate-100 font-medium px-2 py-0.5 rounded-md text-[10px]">
                                Optional Supplementary Item
                              </span>
                            )}
                          </p>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            Review Decision Status
                          </label>
                          <div className="mt-1.5">
                            {selectedDocForViewer.status === 'Approved' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                Accepted / Approved
                              </span>
                            )}
                            {selectedDocForViewer.status === 'Action Required' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider">
                                Denied / Action Req.
                              </span>
                            )}
                            {selectedDocForViewer.status === 'Under Review' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wider">
                                Under active review
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                            Review Comments
                          </label>
                          <p className="text-[11px] text-slate-500 font-medium italic mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            "{selectedDocForViewer.notes || 'No review comments logged by the credentials committee.'}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Admin Decision Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 space-y-3 shrink-0">
                      {isAdminMode ? (
                        <>
                          <div className="space-y-1 flex flex-col">
                            <label className="text-[9px] font-bold text-indigo-700 uppercase tracking-wide">
                              Write Review Comments / Reason:
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Signature missing. Please re-upload verified copy."
                              value={customDenialReason}
                              onChange={(e) => setCustomDenialReason(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-gray-800"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => {
                                setAdmissionDocs(prev => prev.map(d => {
                                  if (d.id === selectedDocForViewer.id) {
                                    return {
                                      ...d,
                                      status: 'Approved',
                                      notes: customDenialReason.trim() || 'Official document received, inspected and approved by Registrar admissions desk.'
                                    };
                                  }
                                  return d;
                                }));
                                setSelectedDocForViewer(null);
                              }}
                              className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check size={12} />
                              <span>Accept</span>
                            </button>

                            <button
                              onClick={() => {
                                setAdmissionDocs(prev => prev.map(d => {
                                  if (d.id === selectedDocForViewer.id) {
                                    return {
                                      ...d,
                                      status: 'Action Required',
                                      notes: customDenialReason.trim() || 'Document copy illegible or incomplete. Please upload again.'
                                    };
                                  }
                                  return d;
                                }));
                                setSelectedDocForViewer(null);
                              }}
                              className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Ban size={12} />
                              <span>Deny</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 text-[11px] space-y-1">
                          <p className="font-bold text-slate-700">Student Access Mode</p>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            To simulate administrative Review actions, click on <strong><span className="text-indigo-600">Admin Mode</span></strong> at the top right of the page (in the Resources section) to authorize Accept/Deny decisions.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Admissions Payment Details Panel (Sorted Descending) */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in duration-500 delay-100 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <CreditCard className="text-indigo-600" size={20} />
                  <span>Admissions Payments & Fees</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Historical registry of all admissions-related deposits and payments, sorted in descending order of date.
                </p>
              </div>
              {/* COMMENTED OUT: Submit Fee Payment Option Trigger Button
              <button 
                onClick={() => setIsPaymentFormOpen(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-xs rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-center transition-all"
              >
                <Plus size={14} />
                <span>Submit Fee Payment</span>
              </button>
              */}
            </div>

            {/* Payment List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-2">Payment Description</th>
                    <th className="py-3 px-2">Academic Term</th>
                    <th className="py-3 px-2">Method Type</th>
                    <th className="py-3 px-2">Date Paid</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedPayments.map((p) => (
                    <tr key={p.id} className="text-xs hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-gray-800">{p.itemName}</div>
                        <div className="text-[10px] font-mono text-gray-400 font-semibold mt-0.5">{p.transactionId}</div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 font-bold rounded-md text-[10px] uppercase">
                          {p.termName}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-gray-600 font-medium">
                        {p.paymentType}
                      </td>
                      <td className="py-3.5 px-2 text-gray-600 font-mono">
                        {new Date(p.date + 'T12:00:00').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-gray-900">
                        ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-2 text-center">
                        <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sortedPayments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 font-medium text-xs">
                        No admissions fee payment records located.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs mt-2 text-slate-600">
              <span className="font-bold">Total Admissions Fees Settled:</span>
              <span className="font-black text-indigo-700 text-sm">
                ${sortedPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Resources & Document Center Panel */}
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-indigo-950 text-sm flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" />
                <span>Resources Directory</span>
              </h3>
              
              {/* Easy Admin Mode Toggle Switch */}
              <button 
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isAdminMode 
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
                title="Toggle Administrative upload capabilities"
              >
                {isAdminMode ? (
                  <>
                    <Unlock size={11} />
                    <span>Admin Mode</span>
                  </>
                ) : (
                  <>
                    <Lock size={11} />
                    <span>Student View</span>
                  </>
                )}
              </button>
            </div>

            {/* Admin Upload Area (Visible only in Administrative Mode) */}
            {isAdminMode && (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-indigo-600 bg-indigo-100/50 scale-[0.98]' 
                    : 'border-indigo-200 bg-white hover:bg-indigo-100/20'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                
                {uploadProgress !== null ? (
                  <div className="space-y-2 animate-pulse">
                    <UploadCloud className="mx-auto text-indigo-600 animate-bounce" size={24} />
                    <p className="text-[10px] font-black text-gray-700 truncate max-w-full px-2" title={uploadingName}>
                      Uploading: {uploadingName}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[150px] mx-auto overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-100" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 font-bold">{uploadProgress}% Complete</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <UploadCloud className="mx-auto text-indigo-400" size={24} />
                    <p className="text-[11px] font-bold text-indigo-950">Drag & drop document here</p>
                    <p className="text-[9px] text-indigo-600/70 font-semibold uppercase tracking-wider">
                      or <span className="underline font-black text-indigo-700">browse file directory</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Rendered List of Resources */}
            <div className="space-y-2.5">
              {resources.map((doc) => {
                const IconComponent = doc.icon;
                return (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-indigo-100 transition-all group"
                  >
                    <a 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      className="flex items-center space-x-3 min-w-0 flex-1 pr-2 cursor-pointer"
                    >
                      <span className="p-2 bg-slate-50 text-indigo-500 rounded-lg shrink-0">
                        <IconComponent size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-800 truncate" title={doc.name}>{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono text-gray-400 font-bold">{doc.size}</span>
                          <span className="text-[9px] text-gray-300">•</span>
                          <span className="text-[9px] text-gray-400 font-medium">{doc.date}</span>
                        </div>
                      </div>
                    </a>

                    {/* Delete capability in admin mode, else standard checkCircle */}
                    {isAdminMode ? (
                      <button 
                        onClick={() => handleDeleteResource(doc.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete this dynamic document"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <CheckCircle2 size={15} className="text-gray-300 group-hover:text-indigo-400 transition-all shrink-0" />
                    )}
                  </div>
                );
              })}

              {resources.length === 0 && (
                <div className="text-center py-6 bg-white/40 border border-indigo-100/50 rounded-2xl p-4">
                  <p className="text-[11px] text-indigo-805/70 font-bold">No resources folder entries</p>
                  <p className="text-[9px] text-indigo-600/50 mt-0.5">Switch into admin mode to upload guidelines documents.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContactSection department="admissions" />

      {/* 
        COMMENTED OUT: Interactive Payment Submission Modal as requested
        
        {isPaymentFormOpen && (
          <div id="payment-modal" className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-200 animate-in zoom-in-95 duration-200 text-left space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="font-black text-gray-800 text-sm flex items-center gap-2">
                  <CreditCard className="text-indigo-600" size={18} />
                  <span>Submit Fee Payment</span>
                </h4>
                <button 
                  onClick={() => setIsPaymentFormOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fee Category / Description</label>
                  <select 
                    value={newPaymentItem}
                    onChange={(e) => {
                      setNewPaymentItem(e.target.value);
                      if (e.target.value === 'Seat Deposit & Acceptance Fee') setNewPaymentAmount('300');
                      else if (e.target.value === 'Housing Security Deposit') setNewPaymentAmount('250');
                      else if (e.target.value === 'Undergraduate Application Fee') setNewPaymentAmount('75');
                      else if (e.target.value === 'Fall 2024 Orientation Fee') setNewPaymentAmount('150');
                      else if (e.target.value === 'Graduate Admission Processing Fee') setNewPaymentAmount('100');
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="Seat Deposit & Acceptance Fee">Seat Deposit & Acceptance Fee ($300)</option>
                    <option value="Housing Security Deposit">Housing Security Deposit ($250)</option>
                    <option value="Undergraduate Application Fee">Undergraduate Application Fee ($75)</option>
                    <option value="Fall 2024 Orientation Fee">Fall 2024 Orientation Fee ($150)</option>
                    <option value="Graduate Admission Processing Fee">Graduate Admission Processing Fee ($100)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</label>
                    <select 
                      value={newPaymentType}
                      onChange={(e) => setNewPaymentType(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    >
                      <option value="Credit Card (Visa *4242)">Credit Card (Visa)</option>
                      <option value="Credit Card (Mastercard *9812)">Credit Card (Mastercard)</option>
                      <option value="Credit Card (Amex *1001)">Credit Card (Amex)</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Electronic Check (ACH)">Electronic Check (ACH)</option>
                      <option value="Apple Pay">Apple Pay</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fee Amount ($)</label>
                    <input 
                      type="number"
                      value={newPaymentAmount}
                      onChange={(e) => setNewPaymentAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Date</label>
                    <input 
                      type="date"
                      value={newPaymentDate}
                      onChange={(e) => setNewPaymentDate(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Academic Entry Term</label>
                    <select 
                      value={newPaymentTermId}
                      onChange={(e) => setNewPaymentTermId(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      required
                    >
                      {ADMISSION_HISTORY.map(t => (
                        <option key={t.id} value={t.id}>{t.termName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsPaymentFormOpen(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Submit Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      */}
    </div>
  );
};

export default Admissions;
