
import React, { useState, useEffect } from 'react';
import { Mail, Phone, ShieldCheck, Pencil, Check, X } from 'lucide-react';
import { CONTACTS_MOCK } from '../constants';

interface ContactSectionProps {
  department: keyof typeof CONTACTS_MOCK;
}

const STORAGE_KEY = 'juc_contacts';

interface ContactInfo {
  email: string;
  phone: string;
  dept: string;
}

const ContactSection: React.FC<ContactSectionProps> = ({ department }) => {
  const defaultContact = CONTACTS_MOCK[department];
  const [editing, setEditing] = useState(false);
  const [contact, setContact] = useState<ContactInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        if (all[department]) return all[department];
      }
    } catch {}
    return { email: defaultContact.email, phone: defaultContact.phone, dept: defaultContact.dept };
  });
  const [draft, setDraft] = useState<ContactInfo>({ ...contact });

  useEffect(() => {
    if (!editing) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const all = stored ? JSON.parse(stored) : {};
        all[department] = contact;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      } catch {}
    }
  }, [contact, editing, department]);

  const startEdit = () => {
    setDraft({ ...contact });
    setEditing(true);
  };

  const saveEdit = () => {
    setContact({ ...draft });
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  return (
    <div className="mt-12 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 relative group">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <ShieldCheck size={20} />
        </div>
        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">
          {editing ? (
            <input
              type="text"
              value={draft.dept}
              onChange={(e) => setDraft({ ...draft, dept: e.target.value })}
              className="border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Department Name"
            />
          ) : (
            contact.dept
          )} Contact Information
        </h3>
        {!editing && (
          <button
            onClick={startEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 rounded-lg cursor-pointer"
            title="Edit contact info"
          >
            <Pencil size={14} />
          </button>
        )}
        {editing && (
          <div className="flex gap-1">
            <button onClick={saveEdit} className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg cursor-pointer" title="Save">
              <Check size={14} />
            </button>
            <button onClick={cancelEdit} className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg cursor-pointer" title="Cancel">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-transparent ${editing ? 'border-indigo-200 bg-indigo-50/30' : ''}`}>
          <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600">
            <Mail size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Official Email</p>
            {editing ? (
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="email@example.com"
              />
            ) : (
              <a href={`mailto:${contact.email}`} className="text-sm font-bold text-gray-800 break-all hover:text-indigo-600">{contact.email}</a>
            )}
          </div>
        </div>

        <div className={`flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-transparent ${editing ? 'border-indigo-200 bg-indigo-50/30' : ''}`}>
          <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600">
            <Phone size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Support Phone</p>
            {editing ? (
              <input
                type="tel"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+1 (555) 000-0000"
              />
            ) : (
              <a href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} className="text-sm font-bold text-gray-800 hover:text-indigo-600">{contact.phone}</a>
            )}
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-center text-xs text-gray-400 italic">
        Office Hours: Monday - Friday, 9:00 AM - 5:00 PM EST. Responses typically within 24 business hours.
      </p>
    </div>
  );
};

export default ContactSection;
