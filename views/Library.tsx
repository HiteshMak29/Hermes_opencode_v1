
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Library as LibraryIcon, 
  Book, 
  History, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  ChevronRight,
  Search,
  BookOpen,
  X,
  Maximize2,
  ExternalLink,
  TableOfContents,
  Sparkles
} from 'lucide-react';
import { LIBRARY_MOCK, LIBRARY_PENALTIES, EBOOKS_MOCK, SEMESTERS_MOCK } from '../constants';
import { EBook } from '../types';
import ContactSection from '../components/ContactSection';

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'physical' | 'digital'>('physical');
  const [selectedTermId, setSelectedTermId] = useState<string>('all');
  const [expandedTerm, setExpandedTerm] = useState<string | null>('f24');
  const [readingBook, setReadingBook] = useState<EBook | null>(null);
  
  // Digital Library Specific State
  const [digitalTermId, setDigitalTermId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const totalLibraryPenalties = LIBRARY_PENALTIES.reduce((acc, curr) => acc + curr.amount, 0);

  const filteredHistory = selectedTermId === 'all' 
    ? LIBRARY_MOCK 
    : LIBRARY_MOCK.filter(term => term.id === selectedTermId);

  // Digital Library Logic
  const filteredEBooks = useMemo(() => {
    return EBOOKS_MOCK.filter(ebook => {
      const matchesTerm = digitalTermId === 'all' || ebook.termId === digitalTermId;
      const matchesSearch = ebook.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ebook.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ebook.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTerm && matchesSearch;
    });
  }, [digitalTermId, searchQuery]);

  const searchRecommendations = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return EBOOKS_MOCK.filter(ebook => 
      ebook.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ebook.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery]);

  // Click outside search listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowRecommendations(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Library Services</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Updated: Oct 21, 2024
            </span>
          </div>
          <p className="text-gray-500">Manage your issued books, renewals, and browse our extensive digital academic collection.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm self-start">
          <button 
            onClick={() => setActiveTab('physical')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'physical' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            Physical Records
          </button>
          <button 
            onClick={() => setActiveTab('digital')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'digital' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            Digital Library
          </button>
        </div>
      </header>

      {activeTab === 'physical' ? (
        <>
          {/* Library Stats / Penalty Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Book size={32} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Books Currently Issued</p>
                <p className="text-3xl font-black text-gray-900">
                  {LIBRARY_MOCK[0].books.filter(b => b.status === 'Issued').length}
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-3xl shadow-sm border flex items-center justify-between ${totalLibraryPenalties > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              <div className="flex items-center space-x-4 text-left">
                <div className={`p-3 rounded-xl ${totalLibraryPenalties > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Library Penalties</p>
                  <p className={`text-3xl font-black ${totalLibraryPenalties > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${totalLibraryPenalties.toFixed(2)}
                  </p>
                </div>
              </div>
              {totalLibraryPenalties > 0 && (
                <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 transition-colors shadow-md shadow-red-100">
                  Pay Fines
                </button>
              )}
            </div>
          </div>

          {/* Term-wise History */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center space-x-2">
                <History size={18} className="text-indigo-600" />
                <h3 className="font-bold text-gray-800">Borrowing Records</h3>
              </div>
              <select 
                value={selectedTermId}
                onChange={(e) => {
                  setSelectedTermId(e.target.value);
                  setExpandedTerm(e.target.value !== 'all' ? e.target.value : null);
                }}
                className="bg-transparent text-sm font-bold text-indigo-600 outline-none cursor-pointer"
              >
                <option value="all">All Terms History</option>
                {LIBRARY_MOCK.map(term => (
                  <option key={term.id} value={term.id}>{term.term} {term.year}</option>
                ))}
              </select>
            </div>
            
            {filteredHistory.map((term) => (
              <div key={term.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <button 
                  onClick={() => setExpandedTerm(expandedTerm === term.id ? null : term.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <LibraryIcon size={20} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900">{term.term} {term.year}</h4>
                      <p className="text-xs text-gray-500">{term.books.length} Books Recorded</p>
                    </div>
                  </div>
                  {expandedTerm === term.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                {expandedTerm === term.id && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {term.books.map((book) => (
                        <div key={book.id} className="p-5 border border-gray-100 rounded-2xl hover:border-indigo-100 transition-colors bg-gray-50/30">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h5 className="font-bold text-gray-900 leading-tight mb-1">{book.title}</h5>
                              <p className="text-xs text-gray-500">by {book.author}</p>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
                              book.status === 'Returned' ? 'bg-green-100 text-green-700' :
                              book.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {book.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100/50">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Issued</p>
                              <p className="text-xs font-bold text-gray-700">{book.issueDate}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">
                                {book.returnDate ? 'Returned' : 'Due Date'}
                              </p>
                              <p className={`text-xs font-bold ${book.status === 'Overdue' ? 'text-red-600' : 'text-gray-700'}`}>
                                {book.returnDate || book.dueDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" />
              <span>Digital Academic Library</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Term Filter for Digital Library */}
              <div className="relative w-full sm:w-48">
                <select 
                  value={digitalTermId}
                  onChange={(e) => setDigitalTermId(e.target.value)}
                  className="appearance-none w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">All Course Terms</option>
                  <option value="f24">Fall 2024</option>
                  <option value="s24">Spring 2024</option>
                  {SEMESTERS_MOCK.map(sem => (
                    <option key={sem.id} value={sem.id}>{sem.term} {sem.year}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Search with Recommendations */}
              <div className="relative w-full sm:w-64" ref={searchRef}>
                <div className="flex items-center bg-white border border-gray-100 rounded-xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
                  <Search size={16} className="text-gray-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search titles, authors..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowRecommendations(true);
                    }}
                    onFocus={() => setShowRecommendations(true)}
                    className="bg-transparent border-none outline-none text-xs w-full font-medium"
                  />
                </div>
                
                {/* Recommendation Dropdown */}
                {showRecommendations && searchRecommendations.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 bg-indigo-50/50 flex items-center gap-2 border-b border-gray-50">
                      <Sparkles size={12} className="text-indigo-600" />
                      <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Recommended for You</span>
                    </div>
                    {searchRecommendations.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => {
                          setReadingBook(book);
                          setShowRecommendations(false);
                          setSearchQuery(book.title);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <img src={book.coverUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="text-xs font-bold text-gray-900 truncate">{book.title}</p>
                          <p className="text-[10px] text-gray-500 truncate">{book.author} • {book.category}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEBooks.length > 0 ? (
              filteredEBooks.map((ebook) => (
                <div key={ebook.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                    <img 
                      src={ebook.coverUrl} 
                      alt={ebook.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    
                    {/* Read Action Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
                      <button 
                        onClick={() => setReadingBook(ebook)}
                        className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-black text-sm shadow-2xl flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                      >
                        <BookOpen size={16} />
                        Read Now
                      </button>
                    </div>

                    {/* Repositioned Category Badge - Top Right */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        {ebook.category}
                      </div>
                    </div>
                    
                    {/* Repositioned Term Badge - Bottom Left (Prevents overlap with top-left alt text/crowding) */}
                    {ebook.termId && (
                      <div className="absolute bottom-4 left-4 z-10">
                        <div className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-gray-100">
                          {ebook.termId === 'f24' ? 'Fall 2024' : 'Spring 2024'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="font-black text-gray-900 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors min-h-[3rem] line-clamp-2">
                      {ebook.title}
                    </h4>
                    <p className="text-xs font-bold text-gray-500 mb-3">by {ebook.author}</p>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-6 flex-1 italic">"{ebook.description}"</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                        <TableOfContents size={12} />
                        Academic Full Text
                      </span>
                      <button 
                        onClick={() => setReadingBook(ebook)}
                        className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1"
                      >
                        Details <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-gray-300" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">No eBooks found</h4>
                <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setDigitalTermId('all');}}
                  className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* eBook Reader Overlay */}
      {readingBook && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
          <header className="bg-white p-4 md:px-8 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setReadingBook(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={24} />
              </button>
              <div>
                <h3 className="font-black text-gray-900 text-sm md:text-base leading-none mb-1">{readingBook.title}</h3>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{readingBook.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={readingBook.readerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-indigo-50 rounded-xl transition-colors text-gray-400 hover:text-indigo-600"
                title="Open in new window"
              >
                <ExternalLink size={20} />
              </a>
              <button className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100">
                <Maximize2 size={16} />
                <span>Focus Mode</span>
              </button>
            </div>
          </header>
          
          <div className="flex-1 bg-white mx-auto w-full max-w-5xl shadow-2xl relative overflow-hidden">
             <iframe 
                src={readingBook.readerUrl} 
                className="w-full h-full border-none"
                title={`Reading ${readingBook.title}`}
             />
             
             {/* Simple loading state/overlay if iframe takes time */}
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <div className="bg-black/10 backdrop-blur-sm p-4 rounded-full">
                 <Clock className="text-white animate-spin" />
               </div>
             </div>
          </div>
        </div>
      )}

      <ContactSection department="library" />
    </div>
  );
};

export default Library;
