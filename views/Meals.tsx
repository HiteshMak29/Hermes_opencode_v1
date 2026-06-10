
import React, { useState, useRef, useEffect } from 'react';
import { 
  Coffee, 
  Wallet, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ArrowDownRight,
  ShieldCheck,
  Zap,
  ChevronDown,
  QrCode,
  X,
  ScanLine,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MEAL_PLAN_MOCK, SEMESTERS_MOCK } from '../constants';
import ContactSection from '../components/ContactSection';

const Meals: React.FC = () => {
  const [selectedTermId, setSelectedTermId] = useState<string>('f24');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanner = async () => {
    setScanError(null);
    setIsScanning(true);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setScanError("Your browser does not support camera access.");
      return;
    }

    try {
      let stream: MediaStream;
      try {
        // Try requesting back camera specifically for mobile/tablet
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
      } catch (innerErr) {
        // Fallback to any available video source (webcams, etc.)
        console.warn("Back camera failed, trying default video source", innerErr);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate a successful scan after 3 seconds for demo purposes
      setTimeout(() => {
        handleScanSuccess();
      }, 3000);
    } catch (err: any) {
      console.error("Camera access error:", err);
      let errorMessage = "Camera access denied or not available.";
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "Camera permission was denied. Please check your browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "No camera found on this device.";
      }
      
      setScanError(errorMessage);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setScanSuccess(false);
    setScanError(null);
  };

  const handleScanSuccess = () => {
    // Only proceed if still scanning and not already successful
    if (!streamRef.current) return;

    setScanSuccess(true);
    if (navigator.vibrate) navigator.vibrate(200);
    
    setTimeout(() => {
      stopScanner();
    }, 2000);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Meal Wallet</h1>
            <span className="flex items-center text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              <Clock size={10} className="mr-1" />
              Updated: Oct 22, 2024
            </span>
          </div>
          <p className="text-gray-500">Track your digital wallet, meal credits, and recent campus dining.</p>
        </div>

        {/* Term Filter */}
        <div className="relative inline-block text-left w-full md:w-64">
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Transaction History</label>
          <div className="relative group">
            <select 
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="appearance-none w-full bg-white border border-gray-200 rounded-2xl px-5 py-3 pr-10 font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="f24">Fall 2024 (Active)</option>
              {SEMESTERS_MOCK.map(sem => (
                <option key={sem.id} value={sem.id}>{sem.term} {sem.year}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Balance Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">Current Balance</p>
                <p className="text-5xl font-black">${MEAL_PLAN_MOCK.currentBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                <Wallet size={32} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">Opening Balance</p>
                <p className="text-xl font-bold">${MEAL_PLAN_MOCK.openingBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">Total Spent (Term)</p>
                <p className="text-xl font-bold">${(MEAL_PLAN_MOCK.openingBalance - MEAL_PLAN_MOCK.currentBalance).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Scan to Pay Button - Visible only on Mobile/Tablet (lg:hidden) */}
              <button 
                onClick={startScanner}
                className="lg:hidden flex-1 bg-white text-indigo-600 py-3.5 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center space-x-2"
              >
                <QrCode size={18} />
                <span>Scan to Pay</span>
              </button>
              
              <button className="flex-1 bg-white/10 text-white border border-white/20 py-3.5 rounded-2xl font-black hover:bg-white/20 transition-all flex items-center justify-center space-x-2">
                <Zap size={18} />
                <span>Quick Top-Up</span>
              </button>
              
              <button className="hidden sm:flex flex-1 bg-white/10 text-white border border-white/20 py-3.5 rounded-2xl font-black hover:bg-white/20 transition-all items-center justify-center space-x-2">
                <ShieldCheck size={18} />
                <span>Security</span>
              </button>
            </div>
          </div>
          
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Meal Plan Info */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 mb-6">
              <Coffee size={24} />
              <h3 className="font-black uppercase text-xs tracking-widest">Active Plan</h3>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">{MEAL_PLAN_MOCK.planName}</h2>
            <p className="text-gray-500 text-sm mb-6">{MEAL_PLAN_MOCK.planType}</p>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                 <span className="text-xs font-bold text-gray-400 uppercase">Wallet ID</span>
                 <span className="text-sm font-black text-gray-800 font-mono text-[10px]">{MEAL_PLAN_MOCK.walletId}</span>
               </div>
            </div>
          </div>
          <button className="mt-8 text-indigo-600 font-bold text-sm hover:underline">Change Plan</button>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center space-x-2">
            <TrendingUp size={18} className="text-indigo-600" />
            <h3 className="font-bold text-gray-800">Recent Transactions</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {MEAL_PLAN_MOCK.transactions.map((tx) => (
            <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{tx.location}</h4>
                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                    <span className="flex items-center"><Clock size={12} className="mr-1" /> {tx.time}</span>
                    <span>{tx.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end text-red-600 font-black">
                  <ArrowDownRight size={16} />
                  <span>-${tx.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ContactSection department="meals" />

      {/* QR Scanner Modal Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <QrCode size={24} />
              </div>
              <h3 className="font-bold text-lg">Canteen Checkout</h3>
            </div>
            <button 
              onClick={stopScanner}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Camera Viewport / Content */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
            {!scanError ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover opacity-80"
                />
                
                {/* Scan Reticle Area */}
                {!scanSuccess ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-64 h-64 border-2 border-white/30 rounded-3xl overflow-hidden shadow-[0_0_0_100vw_rgba(0,0,0,0.5)]">
                      {/* Glowing corners */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-xl"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-xl"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-xl"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-xl"></div>
                      
                      {/* Animated scanning line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-400/80 shadow-[0_0_15px_rgba(129,140,248,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-600/20 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center space-y-4 scale-110">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                        <CheckCircle2 size={48} />
                      </div>
                      <div className="text-center">
                        <h4 className="text-xl font-black text-gray-900">Payment Successful</h4>
                        <p className="text-sm text-gray-500">Transaction ID: TXN-552-JU</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center space-y-6 max-w-sm animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-red-100/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                  <AlertCircle size={40} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Scanner Unavailable</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{scanError}</p>
                </div>
                <button 
                  onClick={stopScanner}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold border border-white/10 transition-colors"
                >
                  Return to Wallet
                </button>
              </div>
            )}
          </div>

          {/* Footer Instructions */}
          {!scanSuccess && !scanError && (
            <div className="absolute bottom-12 left-0 right-0 px-8 text-center text-white/70 z-20">
              <p className="text-sm font-medium">Position the QR code inside the frame to pay</p>
              <div className="mt-4 flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                <ScanLine size={12} />
                <span>Auto-detecting...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keyframe for scanning line animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Meals;
