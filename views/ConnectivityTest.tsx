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

export interface RDBMSConnection {
  id: string;
  name: string;
  dbType: string; // 'postgresql' | 'mysql' | 'oracle' | 'sqlserver' | 'sqlite'
  dbHost: string;
  dbPort: string;
  dbName: string;
  dbUser: string;
  dbPass: string;
  dbSslMode: string;
  status: 'online' | 'offline' | 'untested' | 'testing';
  latency?: number;
  lastTested?: string;
  errorMessage?: string;
}

export interface CardQueryBinding {
  cardId: string; // 'gpa' | 'credits' | 'program' | 'terms'
  cardName: string;
  section: string;
  connectionId: string; // e.g., 'sis-production'
  sqlQuery: string;
}

const DEFAULT_SQL_BINDINGS: CardQueryBinding[] = [
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
  }
];

const ConnectivityTest: React.FC = () => {
  const { activeCollege } = useCollegeBranding();

  // Load or Initialize Connections Spec
  const [connections, setConnections] = useState<RDBMSConnection[]>(() => {
    const cached = localStorage.getItem('juc_rdbms_connections');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((c: any) => 
            c.id !== 'sis-production' && 
            c.id !== 'admissions-replica' && 
            c.id !== 'canvas-migration'
          );
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

  // Whenever bindings change, persist to local storage
  useEffect(() => {
    localStorage.setItem('juc_card_sql_queries', JSON.stringify(bindings));
  }, [bindings]);

  // Selected Card for the interactive Mapper UI
  const [selectedCardId, setSelectedCardId] = useState<string>('gpa');
  const [mapperConnectionId, setMapperConnectionId] = useState<string>('sis-production');
  const [mapperSqlQuery, setMapperSqlQuery] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

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
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (conn: RDBMSConnection) => {
    setFormMode('edit');
    setEditingId(conn.id);
    setConnName(conn.name);
    setDbType(conn.dbType);
    setDbHost(conn.dbHost);
    setDbPort(conn.dbPort);
    setDbName(conn.dbName);
    setDbUser(conn.dbUser);
    setDbPass(conn.dbPass);
    setDbSslMode(conn.dbSslMode);
    setIsFormOpen(true);
  };

  const handleDbTypeChange = (type: string) => {
    setDbType(type);
    if (type === 'mysql') setDbPort('3306');
    else if (type === 'oracle') setDbPort('1521');
    else if (type === 'sqlserver') setDbPort('1433');
    else if (type === 'sqlite') setDbPort('N/A');
    else setDbPort('5432');
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = connName.trim() || `${dbType.toUpperCase()} Gateway`;

    if (formMode === 'edit' && editingId) {
      setConnections(prev => prev.map(c => c.id === editingId ? {
        ...c,
        name: finalName,
        dbType,
        dbHost,
        dbPort,
        dbName,
        dbUser,
        dbPass,
        dbSslMode,
        ...(c.dbHost !== dbHost || c.dbPort !== dbPort ? { status: 'untested', latency: undefined, errorMessage: undefined } : {})
      } : c));
    } else {
      const newConn: RDBMSConnection = {
        id: 'conn-' + Date.now(),
        name: finalName,
        dbType,
        dbHost,
        dbPort,
        dbName,
        dbUser,
        dbPass,
        dbSslMode,
        status: 'untested'
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
    setDbTestFeedback(`Initializing physical wire connection to ${conn.name}...`);

    setConnections(prev => prev.map(c => c.id === connId ? { ...c, status: 'testing' } : c));

    setDbTestSteps([
      { label: `DNS Lookup & network route verification to ${conn.dbHost}`, status: 'running' },
      { label: `TCP port handshaking on port ${conn.dbPort}`, status: 'idle' },
      { label: `SSL/TLS tunnel protocol validation (${conn.dbSslMode})`, status: 'idle' },
      { label: `Database user authentication handshake`, status: 'idle' },
      { label: `Metadata retrieval validation on schema "${conn.dbName}"`, status: 'idle' }
    ]);

    // Step 1 Finish
    setTimeout(() => {
      setDbTestSteps(prev => [
        { ...prev[0], status: 'success' },
        { ...prev[1], status: 'running' },
        ...prev.slice(2)
      ]);
      setDbTestFeedback(`Route verified. Server is reachable. Establishing socket connection...`);
    }, 900);

    // Step 2 Finish
    setTimeout(() => {
      setDbTestSteps(prev => [
        prev[0],
        { ...prev[1], status: 'success' },
        { ...prev[2], status: 'running' },
        ...prev.slice(3)
      ]);
      setDbTestFeedback(`TCP sockets bound. Testing secure cryptographic session wrappers...`);
    }, 1800);

    // Step 3 Finish
    setTimeout(() => {
      setDbTestSteps(prev => [
        prev[0],
        prev[1],
        { ...prev[2], status: 'success' },
        { ...prev[3], status: 'running' },
        ...prev.slice(4)
      ]);
      setDbTestFeedback(`SSL Session authenticated. Sending credentials for role "${conn.dbUser || 'default'}"...`);
    }, 2700);

    // Step 4 Finish
    setTimeout(() => {
      const isFailed = conn.dbHost.includes('192.168.4.22') || conn.dbHost.toLowerCase().includes('fail');
      if (isFailed) {
        setDbTestSteps(prev => [
          prev[0],
          prev[1],
          prev[2],
          { ...prev[3], status: 'failed' },
          { ...prev[4], status: 'idle' }
        ]);
        setDbTestFeedback('Connection Failed. Remote credentials challenge rejected or remote peer refused handshake connection.');
        setDbTestActive(false);

        setConnections(prev => prev.map(c => c.id === connId ? {
          ...c,
          status: 'offline',
          errorMessage: 'Access denied: bad password or host timeout',
          lastTested: new Date().toLocaleTimeString()
        } : c));
      } else {
        setDbTestSteps(prev => [
          prev[0],
          prev[1],
          prev[2],
          { ...prev[3], status: 'success' },
          { ...prev[4], status: 'running' }
        ]);
        setDbTestFeedback('Access authorized. Reading metadata, indexes and active schema tables...');
      }
    }, 3600);

    // Step 5 Finish
    setTimeout(() => {
      const isFailed = conn.dbHost.includes('192.168.4.22') || conn.dbHost.toLowerCase().includes('fail');
      if (isFailed) return;

      setDbTestSteps(prev => [
        prev[0],
        prev[1],
        prev[2],
        prev[3],
        { ...prev[4], status: 'success' }
      ]);
      setDbTestFeedback('Handshake fully verified. Bridge telemetry stream is active and operational.');
      setDbTestActive(false);

      const generatedLatency = Math.floor(Math.random() * 35) + 12; // 12-47ms
      setConnections(prev => prev.map(c => c.id === connId ? {
        ...c,
        status: 'online',
        latency: generatedLatency,
        errorMessage: undefined,
        lastTested: new Date().toLocaleTimeString()
      } : c));
    }, 4500);
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
                        conn.dbType === 'postgresql' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                        conn.dbType === 'mysql' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        conn.dbType === 'sqlite' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                        'bg-purple-50 border-purple-100 text-purple-700'
                      }`}>
                        {conn.dbType}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-gray-600">
                      {conn.dbType === 'sqlite' ? 'local_drive_ref' : `${conn.dbHost}:${conn.dbPort}`}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-gray-700">
                      {conn.dbName}
                    </td>

                    <td className="py-4 px-4 font-mono text-gray-500">
                      {conn.dbUser || 'N/A'}
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
                  disabled
                  value="Academics"
                  className="w-full text-xs font-bold bg-white border border-gray-150 rounded-xl px-3 py-2.5 text-gray-800 focus:outline-none cursor-not-allowed"
                >
                  <option value="Academics">Academics Section</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Target UI Card Component</label>
                <div className="space-y-1.5">
                  {bindings.map(b => (
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
                      {c.name} ({c.dbType.toUpperCase()} on {c.dbHost})
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
                  setBindings(prev => prev.map(b => b.cardId === selectedCardId ? {
                    ...b,
                    connectionId: mapperConnectionId,
                    sqlQuery: mapperSqlQuery
                  } : b));
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
                  {formMode === 'edit' ? 'Edit Connection Endpoint Spec' : 'Configure New Relational Endpoint'}
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
                  placeholder="e.g. Jericho Registrar Replica or Admissions Backup Feed"
                  className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 border-gray-150 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-750 block">Database Server Dialect</label>
                  <select
                    value={dbType}
                    onChange={(e) => handleDbTypeChange(e.target.value)}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-600 border-gray-150 transition-colors"
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL Server</option>
                    <option value="sqlite">SQLite (Embedded)</option>
                    <option value="oracle">Oracle Database</option>
                    <option value="sqlserver">Microsoft SQL Server</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-750 block">SSL Enforce Protocol</label>
                  <select
                    value={dbSslMode}
                    onChange={(e) => setDbSslMode(e.target.value)}
                    disabled={dbType === 'sqlite'}
                    className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 text-slate-800 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-600 border-gray-150 transition-colors disabled:opacity-40"
                  >
                    <option value="require">Require SSL (Encrypted)</option>
                    <option value="prefer">Prefer SSL (Opportunistic)</option>
                    <option value="disable">Disable SSL (Cleartext Insecure)</option>
                  </select>
                </div>
              </div>

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

              {/* Informative advice message */}
              <div className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex items-start gap-2.5 text-[11px] text-indigo-950 mt-1.5">
                <Info size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Note: Testing connections with IP address ending with <strong>192.168.4.22</strong> or strings containing "fail" will simulate logical TCP timeouts and auth refusal errors for platform error simulation.
                </p>
              </div>

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
                  RDBMS Telemetry Handshake verifier
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
