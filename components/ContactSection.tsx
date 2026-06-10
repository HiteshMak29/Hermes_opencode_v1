
import React from 'react';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import { CONTACTS_MOCK } from '../constants';

interface ContactSectionProps {
  department: keyof typeof CONTACTS_MOCK;
}

const ContactSection: React.FC<ContactSectionProps> = ({ department }) => {
  const contact = CONTACTS_MOCK[department];

  return (
    <div className="mt-12 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <ShieldCheck size={20} />
        </div>
        <h3 className="font-bold text-gray-800 uppercase text-xs tracking-widest">
          {contact.dept} Contact Information
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a 
          href={`mailto:${contact.email}`}
          className="group flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
        >
          <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Official Email</p>
            <p className="text-sm font-bold text-gray-800 break-all">{contact.email}</p>
          </div>
        </a>

        <a 
          href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
          className="group flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
        >
          <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
            <Phone size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Support Phone</p>
            <p className="text-sm font-bold text-gray-800">{contact.phone}</p>
          </div>
        </a>
      </div>
      
      <p className="mt-6 text-center text-xs text-gray-400 italic">
        Office Hours: Monday - Friday, 9:00 AM - 5:00 PM EST. Responses typically within 24 business hours.
      </p>
    </div>
  );
};

export default ContactSection;
