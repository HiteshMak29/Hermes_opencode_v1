
import React, { useState } from 'react';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  User, 
  Send,
  MoreVertical,
  ChevronRight,
  UserPlus,
  Tag,
  AlertCircle
} from 'lucide-react';
import { TICKETS_MOCK, DEPARTMENTS, TICKET_STATUSES, CURRENT_USER_ROLE, STUDENT_MOCK } from '../constants';

const SupportTicketing: React.FC = () => {
  const [tickets, setTickets] = useState(TICKETS_MOCK);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // New Ticket Form State
  const [newTicket, setNewTicket] = useState({
    subject: '',
    department: DEPARTMENTS[0],
    priority: 'Medium',
    message: ''
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const isAdminOrFaculty = CURRENT_USER_ROLE === 'Admin' || CURRENT_USER_ROLE === 'Faculty';

  const handleCreateTicket = () => {
    const ticket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newTicket.subject,
      department: newTicket.department,
      status: 'Open',
      priority: newTicket.priority,
      studentId: STUDENT_MOCK.studentId,
      studentName: STUDENT_MOCK.name,
      createdAt: new Date().toISOString(),
      assignedTo: 'Unassigned',
      messages: [
        { sender: STUDENT_MOCK.name, text: newTicket.message, timestamp: new Date().toISOString() }
      ]
    };
    setTickets([ticket, ...tickets]);
    setIsCreating(false);
    setNewTicket({ subject: '', department: DEPARTMENTS[0], priority: 'Medium', message: '' });
  };

  const handleSendMessage = () => {
    if (!replyText.trim() || !selectedTicketId) return;
    
    setTickets(prev => prev.map(t => {
      if (t.id === selectedTicketId) {
        return {
          ...t,
          messages: [...t.messages, { 
            sender: isAdminOrFaculty ? 'Staff' : STUDENT_MOCK.name, 
            text: replyText, 
            timestamp: new Date().toISOString() 
          }]
        };
      }
      return t;
    }));
    setReplyText('');
  };

  const handleUpdateStatus = (id: string, status: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleReassign = (id: string, assignedTo: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, assignedTo } : t));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-6">
      {/* Sidebar: Ticket List */}
      <div className="w-1/3 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <LifeBuoy className="text-indigo-600" size={24} />
              Support Center
            </h1>
            <button 
              onClick={() => setIsCreating(true)}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => { setSelectedTicketId(ticket.id); setIsCreating(false); }}
              className={`w-full p-6 text-left hover:bg-gray-50 transition-colors ${selectedTicketId === ticket.id ? 'bg-indigo-50/50 border-r-4 border-indigo-600' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ticket.id}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{ticket.subject}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">{ticket.department}</span>
                <span className="text-[10px] text-gray-400 font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Ticket Detail or Create Form */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {isCreating ? (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Raise a New Ticket</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subject</label>
                <input 
                  type="text" 
                  value={newTicket.subject}
                  onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Briefly describe the issue"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Department</label>
                  <select 
                    value={newTicket.department}
                    onChange={e => setNewTicket({...newTicket, department: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                  <select 
                    value={newTicket.priority}
                    onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  rows={6}
                  value={newTicket.message}
                  onChange={e => setNewTicket({...newTicket, message: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Provide more details about your concern..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleCreateTicket}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                  Submit Ticket
                </button>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : selectedTicket ? (
          <>
            {/* Ticket Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedTicket.id}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${getStatusColor(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {isAdminOrFaculty && (
                    <>
                      <select 
                        onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                        className="text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedTicket.status}
                      >
                        {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                        <UserPlus size={18} />
                      </button>
                    </>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600">{selectedTicket.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600">{selectedTicket.studentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600">Assigned: {selectedTicket.assignedTo}</span>
                </div>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/20">
              {selectedTicket.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === (isAdminOrFaculty ? 'Staff' : STUDENT_MOCK.name) ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                    msg.sender === (isAdminOrFaculty ? 'Staff' : STUDENT_MOCK.name)
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${
                      msg.sender === (isAdminOrFaculty ? 'Staff' : STUDENT_MOCK.name) ? 'text-indigo-200' : 'text-gray-400'
                    }`}>
                      {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Area */}
            <div className="p-6 border-t border-gray-50 bg-white">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <textarea 
                    rows={1}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm resize-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!replyText.trim()}
                    className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
              <LifeBuoy size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Select a ticket to view details</h2>
            <p className="text-gray-500 max-w-xs">Choose a ticket from the list or create a new one to get support from our departments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketing;
