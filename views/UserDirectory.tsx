import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Database, 
  Settings, 
  Key, 
  ShieldCheck, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  UserPlus, 
  Trash2, 
  Search, 
  Filter, 
  Server, 
  UserPlus2, 
  Activity, 
  AlertTriangle, 
  Sparkles,
  Check
} from 'lucide-react';
import { useCollegeBranding } from '../brandingConfig';

// Define TS Interfaces for mock LDAP context
interface ADConfig {
  ldapUrl: string;
  domain: string;
  bindDn: string;
  bindPass: string;
  studentGroup: string;
  facultyGroup: string;
}

interface LinkedUser {
  id: string;
  name: string;
  email: string;
  type: 'Student' | 'Faculty/Employee' | 'Administrator';
  adGroup: string;
  adDn: string;
  departmentOrMajor: string;
  status: 'Synced' | 'Pending Sync' | 'Local Only';
  isPromotedAdmin: boolean;
  syncedAt: string;
  avatarSeed: string;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

// Initial Virtual LDAP Database for simulation
const INITIAL_LDAP_USERS = [
  { name: "Dr. Sarah Mitchell", email: "s.mitchell@jericho.edu", group: "CN=Faculty Staff,OU=Groups,DC=jericho,DC=edu", dn: "CN=Sarah Mitchell,OU=Faculty,DC=jericho,DC=edu", dept: "School of Engineering (Professor)" },
  { name: "Prof. Robert Vance", email: "r.vance@jericho.edu", group: "CN=Faculty Staff,OU=Groups,DC=jericho,DC=edu", dn: "CN=Robert Vance,OU=Faculty,DC=jericho,DC=edu", dept: "Department of Computer Science" },
  { name: "Dean Cynthia Taylor", email: "c.taylor@jericho.edu", group: "CN=Faculty Staff,OU=Groups,DC=jericho,DC=edu", dn: "CN=Cynthia Taylor,OU=Staff,DC=jericho,DC=edu", dept: "Office of Academic Registries" },
  { name: "Dr. Marcus Sterling", email: "m.sterling@jericho.edu", group: "CN=Faculty Staff,OU=Groups,DC=jericho,DC=edu", dn: "CN=Marcus Sterling,OU=Faculty,DC=jericho,DC=edu", dept: "Finance & Bursar Administration" },
  { name: "Alex Johnson", email: "a.johnson@jericho.edu", group: "CN=Students,OU=Groups,DC=jericho,DC=edu", dn: "CN=Alex Johnson,OU=Undergraduates,DC=jericho,DC=edu", dept: "Computer Science & Engineering" },
  { name: "Jordan Smith", email: "j.smith@jericho.edu", group: "CN=Students,OU=Groups,DC=jericho,DC=edu", dn: "CN=Jordan Smith,OU=Undergraduates,DC=jericho,DC=edu", dept: "Software Engineering" },
  { name: "Emily Watson", email: "e.watson@jericho.edu", group: "CN=Students,OU=Groups,DC=jericho,DC=edu", dn: "CN=Emily Watson,OU=Graduates,DC=jericho,DC=edu", dept: "Mathematics" },
];

const UserDirectory: React.FC = () => {
  const { activeCollege } = useCollegeBranding();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'directory' | 'config' | 'superadmin' | 'logs'>('directory');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Student' | 'Faculty' | 'Admin'>('All');

  // Configuration State loaded from localStorage or default
  const [config, setConfig] = useState<ADConfig>(() => {
    const saved = localStorage.getItem('ad_config');
    if (saved) return JSON.parse(saved);
    return {
      ldapUrl: `ldaps://ad.${activeCollege.domain}:636`,
      domain: activeCollege.domain,
      bindDn: `CN=AD_Portal_Sync,OU=ServiceAccounts,DC=${activeCollege.id.toLowerCase()},DC=edu`,
      bindPass: '•••••••••••••••••••••',
      studentGroup: `CN=Students,OU=Groups,DC=${activeCollege.id.toLowerCase()},DC=edu`,
      facultyGroup: `CN=Faculty Staff,OU=Groups,DC=${activeCollege.id.toLowerCase()},DC=edu`,
    };
  });

  // Dynamic Linked Users Array stored locally
  const [users, setUsers] = useState<LinkedUser[]>(() => {
    const savedUsers = localStorage.getItem('ad_users');
    if (savedUsers) return JSON.parse(savedUsers);

    // Default Seed Users (Mapped from initial LDAP data)
    return INITIAL_LDAP_USERS.map((user, idx) => ({
      id: `usr-00${idx + 1}`,
      name: user.name,
      email: user.email.replace('jericho.edu', activeCollege.domain),
      type: user.group.includes('Faculty') ? 'Faculty/Employee' : 'Student',
      adGroup: user.group.replace('jericho,DC=edu', `${activeCollege.id.toLowerCase()},DC=edu`),
      adDn: user.dn.replace('jericho,DC=edu', `${activeCollege.id.toLowerCase()},DC=edu`),
      departmentOrMajor: user.dept,
      status: 'Synced',
      isPromotedAdmin: idx === 0, // Sarah Mitchell is admin by default
      syncedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarSeed: user.name.split(' ')[0].toLowerCase()
    }));
  });

  // Dynamic LDAP Virtual Input for Simulator
  const [newLdapName, setNewLdapName] = useState('');
  const [newLdapEmail, setNewLdapEmail] = useState('');
  const [newLdapGroupType, setNewLdapGroupType] = useState<'Student' | 'Faculty'>('Student');
  const [newLdapDept, setNewLdapDept] = useState('');

  // Diagnostics Logs State mapping LDAP actions
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'LDAP Active Directory Security client initialized.' },
    { timestamp: new Date().toLocaleTimeString(), type: 'success', message: 'AD Connection schema verified cleanly against ' + activeCollege.domain },
    { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Secure channel bound with default group credentials.' }
  ]);

  // Connection testing feedback
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connResult, setConnResult] = useState<'success' | 'error' | null>(null);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<string>(() => {
    return new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  // Administrator promotion selectors
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [promotionSuccessMsg, setPromotionSuccessMsg] = useState('');

  // Persist config state
  useEffect(() => {
    localStorage.setItem('ad_config', JSON.stringify(config));
  }, [config]);

  // Persist Users state
  useEffect(() => {
    localStorage.setItem('ad_users', JSON.stringify(users));
  }, [users]);

  // Dynamically update the LDAP/AD hostname if active college changes
  useEffect(() => {
    const isDefaultConfig = config.domain === 'jericho.edu' || config.ldapUrl.includes('jericho.edu');
    if (isDefaultConfig) {
      setConfig({
        ldapUrl: `ldaps://ad.${activeCollege.domain}:636`,
        domain: activeCollege.domain,
        bindDn: `CN=AD_Portal_Sync,OU=ServiceAccounts,DC=${activeCollege.id.toLowerCase()},DC=edu`,
        bindPass: '•••••••••••••••••••••',
        studentGroup: `CN=Students,OU=Groups,DC=${activeCollege.id.toLowerCase()},DC=edu`,
        facultyGroup: `CN=Faculty Staff,OU=Groups,DC=${activeCollege.id.toLowerCase()},DC=edu`,
      });
    }
  }, [activeCollege]);

  // Append logs helper
  const addLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Test LDAP Connection Simulation
  const testConnection = () => {
    setIsTestingConn(true);
    setConnResult(null);
    addLog('info', `Initiating LDAP handshake with server at ${config.ldapUrl}...`);
    
    setTimeout(() => {
      // Basic format validation
      if (!config.ldapUrl.startsWith('ldap://') && !config.ldapUrl.startsWith('ldaps://')) {
        addLog('error', `Connection failed: Invalid server protocol prefix in URI matches.`);
        setConnResult('error');
        setIsTestingConn(false);
        return;
      }

      addLog('success', `TCP Connection bound to domain host Successfully.`);
      addLog('info', `Attempting Bind DN Authentication using: ${config.bindDn}`);
      
      setTimeout(() => {
        addLog('success', `Active Directory Client bound securely. Ready for directory tree query retrieval.`);
        setConnResult('success');
        setIsTestingConn(false);
      }, 800);
    }, 1200);
  };

  // Active Directory Synchronization Simulation
  const handleSyncAccount = () => {
    setIsSyncing(true);
    addLog('info', `Active Directory Synchronization triggered. Mapping structural groups...`);
    addLog('info', `Querying Group Memberships corresponding to groups: ${config.studentGroup} and ${config.facultyGroup}`);

    setTimeout(() => {
      // Find any 'Pending Sync' users and turn them into 'Synced'
      let countSynced = 0;
      setUsers(prev => prev.map(user => {
        if (user.status === 'Pending Sync') {
          countSynced++;
          return { ...user, status: 'Synced', syncedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        }
        return user;
      }));

      addLog('success', `AD synchronization completed successfully!`);
      if (countSynced > 0) {
        addLog('success', `Found & imported ${countSynced} new records according to Active Directory group mapping filters.`);
      } else {
        addLog('info', `No changes detected. Active local accounts match LDAP directory safely.`);
      }
      
      const timeStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncDate(timeStr);
      setIsSyncing(false);
    }, 1500);
  };

  // Add dummy user into virtual directory tree (pending synchronization)
  const addLdapDirectoryUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLdapName || !newLdapEmail || !newLdapDept) {
      alert("Please fill in all directories details.");
      return;
    }

    const matchedGroup = newLdapGroupType === 'Student' ? config.studentGroup : config.facultyGroup;
    const computedId = `usr-${Math.floor(100 + Math.random() * 900)}`;
    const freshUser: LinkedUser = {
      id: computedId,
      name: newLdapName,
      email: newLdapEmail,
      type: newLdapGroupType === 'Student' ? 'Student' : 'Faculty/Employee',
      adGroup: matchedGroup,
      adDn: `CN=${newLdapName.trim()},OU=${newLdapGroupType === 'Student' ? 'Undergrad' : 'Staff'},DC=${activeCollege.id.toLowerCase()},DC=edu`,
      departmentOrMajor: newLdapDept,
      status: 'Pending Sync',
      isPromotedAdmin: false,
      syncedAt: 'Never Synced',
      avatarSeed: newLdapName.split(' ')[0].toLowerCase()
    };

    setUsers(prev => [freshUser, ...prev]);
    addLog('warning', `Host database simulation: Created LDAP record "${newLdapName}" [Pending integration synchronizer]`);
    
    // Reset Form fields
    setNewLdapName('');
    setNewLdapEmail('');
    setNewLdapDept('');
  };

  // Delete User function
  const deleteUser = (id: string) => {
    const userToDel = users.find(u => u.id === id);
    if (!userToDel) return;
    if (confirm(`Are you sure you want to delete ${userToDel.name} from the local cached directory database?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      addLog('info', `Removed directory record caches: "${userToDel.name}"`);
    }
  };

  // Promote checked Faculty to Administrators
  const promoteMultipleAdmins = () => {
    if (selectedFacultyIds.length === 0) return;
    
    setUsers(prev => prev.map(user => {
      if (selectedFacultyIds.includes(user.id)) {
        return { ...user, isPromotedAdmin: true };
      }
      return user;
    }));

    const promotedNames = users
      .filter(u => selectedFacultyIds.includes(u.id))
      .map(u => u.name)
      .join(', ');

    addLog('success', `Super Admin promoted users successfully to system Administrators: ${promotedNames}`);
    setPromotionSuccessMsg(`Successfully promoted: ${promotedNames}!`);
    setSelectedFacultyIds([]);

    setTimeout(() => {
      setPromotionSuccessMsg('');
    }, 4500);
  };

  // Revoke Admin permissions
  const revokeAdmin = (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke Administrator roles from ${name}?`)) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isPromotedAdmin: false } : u));
      addLog('warning', `Admin status revoked from security cache: ${name}`);
    }
  };

  // Filter users list based on Search & Roles filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.departmentOrMajor.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (roleFilter === 'All') return matchesSearch;
    if (roleFilter === 'Student') return matchesSearch && user.type === 'Student';
    if (roleFilter === 'Faculty') return matchesSearch && user.type === 'Faculty/Employee';
    if (roleFilter === 'Admin') return matchesSearch && user.isPromotedAdmin;
    return matchesSearch;
  });

  // Retrieve unpromoted linked faculty list matches for promotional selection
  const unpromotedFaculty = users.filter(user => user.type === 'Faculty/Employee' && !user.isPromotedAdmin && user.status === 'Synced');
  const activeAdmins = users.filter(user => user.isPromotedAdmin);

  return (
    <div className="space-y-6">
      {/* Header with quick system status cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 ${activeCollege.colors.primaryBg} ${activeCollege.colors.primaryText} rounded-full`}>
            IAM Control Plane
          </span>
          <h2 className="text-2xl font-black text-gray-900 mt-2">Active Directory & Directory Integration</h2>
          <p className="text-gray-500 text-sm mt-1">
            Map students and faculty/staff using corporate LDAP server groups. Appoint Administrators, audit linked credentials, and test connectivity.
          </p>
        </div>

        {/* Sync Trigger button widget */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncAccount}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold bg-white text-gray-700 hover:bg-gray-55 hover:border-gray-300 transition-colors shadow-sm ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-gray-400' : 'text-gray-500'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Directory Now'}</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-150 transition-all"
          >
            <Terminal size={14} />
            <span>Audit Logs</span>
          </button>
        </div>
      </div>

      {/* Connection warning or info banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none rounded-full"></div>
        <div className="flex items-start md:items-center gap-3.5 z-10">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider">Security Hub Authority</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-[10px] text-green-400 font-bold uppercase">AD Agent Connected & Active</span>
            </div>
            <h4 className="text-sm font-black text-white mt-0.5">Super Admin Dashboard Privileges Allowed</h4>
            <p className="text-slate-400 text-xs mt-0.5 leading-snug">
              Running simulation with preconfigured superuser <strong className="text-white">root.admin@{activeCollege.domain}</strong>. Synced using bind agent credentials dynamically.
            </p>
          </div>
        </div>

        {/* Sync details stats */}
        <div className="flex gap-4 md:border-l md:border-slate-800 md:pl-6 shrink-0 z-10 text-left">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Cached Users</p>
            <p className="text-lg font-black text-white">{users.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Administrators</p>
            <p className="text-lg font-black text-amber-400">{activeAdmins.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last LDAP Sync</p>
            <p className="text-xs font-semibold text-slate-400 mt-1">{lastSyncDate.split(' ')[1] || '08:30 AM'}</p>
          </div>
        </div>
      </div>

      {/* Styled Tabs */}
      <div className="flex border-b border-gray-150 gap-2.5">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'directory' 
              ? `${activeCollege.colors.primaryText} border-slate-900 font-black` 
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
          }`}
        >
          <Users size={14} />
          <span>User Directory Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'config' 
              ? `${activeCollege.colors.primaryText} border-slate-900 font-black` 
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
          }`}
        >
          <Settings size={14} />
          <span>Active Directory Config</span>
        </button>

        <button
          onClick={() => setActiveTab('superadmin')}
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'superadmin' 
              ? `${activeCollege.colors.primaryText} border-slate-900 font-black` 
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Appoint Admins (SuperAdmin)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'logs' 
              ? `${activeCollege.colors.primaryText} border-slate-900 font-black` 
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
          }`}
        >
          <Terminal size={14} />
          <span>LDAP Sync Diagnostics</span>
        </button>
      </div>

      {/* Content Rendering based on Active Tab */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-150 shadow-sm text-left">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search name, email, department..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="text-gray-400" size={14} />
              <div className="flex bg-gray-100 p-0.5 rounded-xl gap-1 w-full sm:w-auto">
                {(['All', 'Student', 'Faculty', 'Admin'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                      roleFilter === role 
                        ? `${activeCollege.colors.sidebarBg} text-white shadow-xs` 
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Directory Listings Table */}
          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6">Direct Mapped User</th>
                    <th className="py-4 px-3">Role / Mapping Route</th>
                    <th className="py-4 px-3">Active Directory DN (Distinguished Name)</th>
                    <th className="py-4 px-3">Sync Status</th>
                    <th className="py-4 px-3">Last Sync Triggered</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-slate-800 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <Users size={32} className="mx-auto text-gray-300 mb-2.5" />
                        <p className="font-semibold text-xs">No users matched search parameters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Mapped Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://picsum.photos/seed/${user.avatarSeed}/100/100`} 
                              alt={user.name} 
                              className="w-10 h-10 rounded-full border-2 border-gray-100"
                            />
                            <div>
                              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                                {user.name}
                                {user.isPromotedAdmin && (
                                  <span className="text-[8px] tracking-widest uppercase font-extrabold px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded">
                                    Admin
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-gray-500">{user.email}</p>
                              <p className="text-[10px] font-medium text-gray-400 mt-0.5">{user.departmentOrMajor}</p>
                            </div>
                          </div>
                        </td>

                        {/* Mapped Role */}
                        <td className="py-4 px-3">
                          <div className="flex flex-col py-1">
                            <span className="font-bold text-gray-800">{user.type}</span>
                            <span className="text-[9px] text-gray-400 font-mono truncate max-w-[140px]" title={user.adGroup}>
                              {user.adGroup.split(',')[0]}
                            </span>
                          </div>
                        </td>

                        {/* Distinguished DN name */}
                        <td className="py-4 px-3">
                          <div className="max-w-[200px] truncate" title={user.adDn}>
                            <p className="text-[10px] font-mono text-gray-500">{user.adDn}</p>
                          </div>
                        </td>

                        {/* Sync state status */}
                        <td className="py-4 px-3">
                          {user.status === 'Synced' ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Synced
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Pending Sync
                            </span>
                          )}
                        </td>

                        {/* SyncedAt timestamp details */}
                        <td className="py-4 px-3">
                          <p className="text-gray-500 text-[10px] font-semibold">{user.syncedAt}</p>
                        </td>

                        {/* Inline Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {user.isPromotedAdmin && (
                              <button
                                onClick={() => revokeAdmin(user.id, user.name)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Revoke Admin Access"
                              >
                                <XCircle size={15} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Cache Local Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          {/* Left Column Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Database className={activeCollege.colors.primaryText} size={20} />
                <h3 className="font-extrabold text-gray-900">LDAP / AD Connection Settings</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-gray-500">Active Directory server URL</label>
                  <input
                    type="text"
                    value={config.ldapUrl}
                    onChange={e => setConfig({ ...config, ldapUrl: e.target.value })}
                    placeholder="ldaps://ad.campus.edu:636"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <p className="text-[9px] text-gray-400">Secure LDAP over TLS port matches defaults (636).</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-gray-500">Corporate Domain Scope</label>
                  <input
                    type="text"
                    value={config.domain}
                    onChange={e => setConfig({ ...config, domain: e.target.value })}
                    placeholder="campus.edu"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <p className="text-[9px] text-gray-400">DNS Domain resolving queries.</p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-extrabold uppercase text-gray-500">Bind Distinguished Name (DN)</label>
                  <input
                    type="text"
                    value={config.bindDn}
                    onChange={e => setConfig({ ...config, bindDn: e.target.value })}
                    placeholder="CN=AD_Portal_Sync,OU=ServiceAccounts,DC=jericho,DC=edu"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <p className="text-[9px] text-gray-400">Domain controller credentials query executor.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-gray-500">Bind Service Password</label>
                  <input
                    type="password"
                    value={config.bindPass}
                    onChange={e => setConfig({ ...config, bindPass: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Settings className={activeCollege.colors.primaryText} size={20} />
                <h3 className="font-extrabold text-gray-900">Active Directory Group mapping mappings</h3>
              </div>
              <p className="text-xs text-gray-500">
                Users existing inside target LDAP Distinguished Groups will automatically be provisioned and sync roles.
              </p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold uppercase text-gray-500">Students Group DN</label>
                    <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Maps to "Student" Role</span>
                  </div>
                  <input
                    type="text"
                    value={config.studentGroup}
                    onChange={e => setConfig({ ...config, studentGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <p className="text-[9px] text-gray-400">LDAP search target query. Recommended filters: (objectClass=user)</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold uppercase text-gray-500">Faculty & Staff Group DN</label>
                    <span className="text-[9px] font-black uppercase text-green-700 bg-green-50 px-2 py-0.5 rounded">Maps to "Faculty" Role</span>
                  </div>
                  <input
                    type="text"
                    value={config.facultyGroup}
                    onChange={e => setConfig({ ...config, facultyGroup: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <p className="text-[9px] text-gray-400">Distinguished group paths for instructors and employees.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Simulator Actions & Connection Verification) */}
          <div className="space-y-6">
            {/* Run verification testing */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm text-left">
              <h3 className="font-extrabold text-gray-900 flex items-center gap-1.5 mb-2">
                <Server size={18} className="text-gray-400" />
                <span>Test Config Integration</span>
              </h3>
              <p className="text-gray-500 text-xs mb-4">
                Validate active domain handshake to ensure AD credentials execute correctly.
              </p>

              <button
                onClick={testConnection}
                disabled={isTestingConn}
                className={`w-full py-2.5 rounded-xl uppercase text-[10px] tracking-wider font-extrabold flex items-center justify-center gap-2 transition-all ${
                  isTestingConn 
                    ? 'bg-gray-100 text-gray-400' 
                    : `${activeCollege.colors.primaryButtonBg} text-white`
                }`}
              >
                {isTestingConn ? (
                  <>
                    <RefreshCw className="animate-spin text-gray-400" size={14} />
                    <span>Querying Handshake...</span>
                  </>
                ) : (
                  <span>Test Connection Now</span>
                )}
              </button>

              {/* Status report bubble */}
              {connResult === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-150 rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
                  <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="text-xs font-bold text-green-900 leading-tight">Handshake Integrity Valid</h5>
                    <p className="text-[10px] text-green-700 leading-normal mt-0.5">
                      Successfully queried Bind DN. 2 linked structural target groups found containing records.
                    </p>
                  </div>
                </div>
              )}

              {connResult === 'error' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-150 rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
                  <XCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h5 className="text-xs font-bold text-red-900 leading-tight">Connection Timed Out</h5>
                    <p className="text-[10px] text-red-700 leading-normal mt-0.5">
                      Server host failed handshake verification queries. Ensure DNS host parses port outputs cleanly.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Active Directory Server Tree manager */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
              <span className="text-[8px] font-black uppercase tracking-widest bg-gray-100 border text-gray-500 px-2.5 py-0.5 rounded-full">
                LDAP Directory Tree Simulator
              </span>
              <h3 className="font-extrabold text-gray-900 flex items-center gap-1.5 mt-2 mb-1.5">
                <UserPlus size={18} className="text-gray-400" />
                <span>Add Record to AD Server</span>
              </h3>
              <p className="text-gray-500 text-xs mb-4">
                Mock adding a student or faculty account directly to the Active Directory domain tree, then hitting "Sync Directory Now" to watch it automatically populate using group permissions!
              </p>

              <form onSubmit={addLdapDirectoryUser} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-gray-500">Record CN Name</label>
                  <input
                    type="text"
                    required
                    value={newLdapName}
                    onChange={e => setNewLdapName(e.target.value)}
                    placeholder="e.g., Dean Harrison"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-gray-500">Mail / Principal Email</label>
                  <input
                    type="email"
                    required
                    value={newLdapEmail}
                    onChange={e => setNewLdapEmail(e.target.value)}
                    placeholder="e.g., d.harrison@campus.edu"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-gray-500">Department / Academic Major</label>
                  <input
                    type="text"
                    required
                    value={newLdapDept}
                    onChange={e => setNewLdapDept(e.target.value)}
                    placeholder="e.g., Department of Physics"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-gray-500">Security Group Destination Mapping</label>
                  <select
                    value={newLdapGroupType}
                    onChange={e => setNewLdapGroupType(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="Student">Student Group Mapping (CN=Students)</option>
                    <option value="Faculty">Faculty Group Mapping (CN=Faculty Staff)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Create Virtual LDAP Entry
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'superadmin' && (
        <div className="space-y-6 text-left">
          {/* Top layout instructions */}
          <div className="bg-amber-50 border border-amber-150 p-5 rounded-2xl flex flex-col md:flex-row items-start gap-4">
            <div className="p-3 bg-amber-500/10 border border-primaryBorder text-amber-600 rounded-xl shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">Administrative Provisioning Authority</span>
              <h3 className="font-extrabold text-gray-900 text-base mt-0.5">Appoint Portal Administrators</h3>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                As the Master Super Administrator (<strong className="text-gray-800">root.admin@{activeCollege.domain}</strong>), you are authorized to elevate synced Active Directory Faculty & Employee accounts to <strong>Administrators</strong>. 
                Below, inspect the active, verified roster of Faculty members. Select <strong>one or multiple</strong> candidates concurrently and click "Promote Selected Candidates" to grant system admin privileges.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Box: Active Faculty/Employees promote selector list */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100">
                <div>
                  <h4 className="font-black text-gray-800 text-sm">Roster of LDAP-Bound Staff</h4>
                  <p className="text-gray-500 text-[11px]">Synced Faculty & Employee users who can be elevated to portal Admins.</p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-gray-100 text-gray-600 rounded">
                  {unpromotedFaculty.length} Candidates Available
                </span>
              </div>

              {unpromotedFaculty.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <UserPlus2 className="mx-auto text-gray-200 mb-2" size={32} />
                  <p className="text-xs font-semibold">No unpromoted directory staff available.</p>
                  <p className="text-[10px] text-gray-400 mt-1">Try synchronizing new staff members in the Config menu or AD tree.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {unpromotedFaculty.map((staff) => {
                    const isChecked = selectedFacultyIds.includes(staff.id);
                    return (
                      <div 
                        key={staff.id} 
                        onClick={() => {
                          if (isChecked) {
                            setSelectedFacultyIds(prev => prev.filter(id => id !== staff.id));
                          } else {
                            setSelectedFacultyIds(prev => [...prev, staff.id]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          isChecked 
                            ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950' 
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Checked Checkbox selection */}
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isChecked && <Check size={10} strokeWidth={4} />}
                          </div>

                          <img 
                            src={`https://picsum.photos/seed/${staff.avatarSeed}/100/100`} 
                            alt={staff.name} 
                            className="w-10 h-10 rounded-full border border-gray-150"
                          />
                          <div>
                            <p className="font-bold text-xs text-gray-900">{staff.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono select-all truncate max-w-[170px]" title={staff.adDn}>
                              {staff.email}
                            </p>
                            <p className="text-[9px] text-indigo-600 font-bold tracking-tight mt-0.5">
                              {staff.departmentOrMajor}
                            </p>
                          </div>
                        </div>

                        {/* Visual indicator details */}
                        <div className="text-right">
                          <span className="text-[9px] font-mono text-gray-400 block">LDAP Linked Verified</span>
                          <span className="text-[9.5px] font-black uppercase text-gray-600 bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                            Faculty
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Promo validation notifications */}
              {promotionSuccessMsg && (
                <div className="p-3 bg-teal-50 border border-teal-150 text-teal-800 rounded-xl text-xs font-bold animate-in zoom-in-95 duration-200">
                  {promotionSuccessMsg}
                </div>
              )}

              {/* Action Promo button */}
              <button
                disabled={selectedFacultyIds.length === 0}
                onClick={promoteMultipleAdmins}
                className={`w-full py-3 rounded-xl uppercase text-xs font-black tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                  selectedFacultyIds.length === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : `${activeCollege.colors.primaryButtonBg} text-white shadow-md hover:scale-[1.01]`
                }`}
              >
                <Sparkles size={14} className={selectedFacultyIds.length > 0 ? "animate-pulse" : ""} />
                <span>Promote Selected Candidates ({selectedFacultyIds.length})</span>
              </button>
            </div>

            {/* Right Box: Live Administrators List */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
              <div className="border-b pb-3 border-gray-100">
                <h4 className="font-gray-900 font-black text-sm">Active Administrator Accounts</h4>
                <p className="text-gray-500 text-[11px]">Audit and review existing accounts with structural administrative level permissions.</p>
              </div>

              {/* Static Super Admin root profile */}
              <div className="p-3.5 bg-slate-950 border border-slate-900 text-white rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow">
                    ROOT
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                      <span>SuperAdmin Root</span>
                      <span className="text-[8px] tracking-wider uppercase font-black px-1.5 bg-amber-500 text-slate-950 rounded">
                        Permanent
                      </span>
                    </h5>
                    <p className="text-[10px] text-slate-300 font-mono">root.admin@{activeCollege.domain}</p>
                    <p className="text-[9px] text-amber-400 font-medium">Bypasses external LDAP verification</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Administartors */}
              <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                {activeAdmins.map((admin) => (
                  <div key={admin.id} className="p-3 rounded-xl border border-gray-100 flex items-center justify-between text-left">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={`https://picsum.photos/seed/${admin.avatarSeed}/100/100`} 
                        alt={admin.name} 
                        className="w-8 h-8 rounded-full border border-gray-100 shrink-0"
                      />
                      <div>
                        <h6 className="font-bold text-xs text-gray-900">{admin.name}</h6>
                        <p className="text-[9.5px] text-gray-500 truncate max-w-[140px] font-mono">{admin.email}</p>
                        <p className="text-[9px] text-indigo-600 font-bold uppercase mt-0.5">{admin.departmentOrMajor.split('(')[0]}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => revokeAdmin(admin.id, admin.name)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 shrink-0"
                      title="Revoke Admin Access"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4 text-left">
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3.5">
              <div className="flex items-center gap-2 text-white">
                <Terminal className="text-amber-400 animate-pulse" size={20} />
                <h4 className="font-black text-sm tracking-tight font-mono">LDAP Authentication, Bind & Sync Diagnostics Console</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setLogs([]);
                    addLog('info', 'Console logs cleared safely.');
                  }}
                  className="px-3 py-1 font-mono text-[9px] font-black uppercase text-slate-400 hover:text-white border border-slate-800 rounded hover:bg-slate-900 transition-colors"
                >
                  Clear Console
                </button>
              </div>
            </div>

            <div className="font-mono text-xs text-slate-300 space-y-2 max-h-[380px] overflow-y-auto sleek-scrollbar pr-1">
              {logs.length === 0 ? (
                <p className="text-slate-500 italic py-6 text-center">Shell console empty. Initializing diagnostic loops...</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 leading-relaxed text-sm py-0.5">
                    <span className="text-slate-500 text-[11px] shrink-0 font-bold select-none">[{log.timestamp}]</span>
                    {log.type === 'success' && (
                      <span className="text-green-400 text-[11px] font-bold shrink-0 uppercase tracking-wider bg-green-500/10 px-1.5 rounded">[OK]</span>
                    )}
                    {log.type === 'error' && (
                      <span className="text-red-400 text-[11px] font-bold shrink-0 uppercase tracking-wider bg-red-500/10 px-1.5 rounded">[ERR]</span>
                    )}
                    {log.type === 'warning' && (
                      <span className="text-amber-400 text-[11px] font-bold shrink-0 uppercase tracking-wider bg-amber-500/10 px-1.5 rounded">[WARN]</span>
                    )}
                    {log.type === 'info' && (
                      <span className="text-indigo-400 text-[11px] font-bold shrink-0 uppercase tracking-wider bg-indigo-500/10 px-1.5 rounded">[INFO]</span>
                    )}
                    <span className="text-slate-200 text-xs font-medium font-sans select-text">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDirectory;
