
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberTable from './components/MemberTable';
import Assistant from './components/Assistant';
import UploadSection from './components/UploadSection';
import AddRecordModal from './components/AddRecordModal';
import ShareReceipt from './components/ShareReceipt';
import LoanManagement from './components/LoanManagement';
import { Page, Contribution, Loan } from './types';

const ADMIN_PIN = "2025"; 

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('katsina_coop_auth') === 'true';
  });
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Contribution | undefined>(undefined);
  const [prefilledData, setPrefilledData] = useState<{ name: string; fileNo: string } | undefined>(undefined);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(() => {
    return localStorage.getItem('katsina_sidebar_minimized') === 'true';
  });
  
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState('');

  const [contributions, setContributions] = useState<Contribution[]>(() => {
    const saved = localStorage.getItem('katsina_staff_coop_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('katsina_staff_coop_loans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('katsina_staff_coop_data', JSON.stringify(contributions));
  }, [contributions]);

  useEffect(() => {
    localStorage.setItem('katsina_staff_coop_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('katsina_sidebar_minimized', String(isSidebarMinimized));
  }, [isSidebarMinimized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem('katsina_coop_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 500);
      setPin('');
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to end the session?")) {
      setIsAuthenticated(false);
      localStorage.removeItem('katsina_coop_auth');
      setPin('');
    }
  };

  const handleAddOrUpdateRecord = (record: Contribution) => {
    if (editingRecord) {
      setContributions(prev => prev.map(c => c.id === record.id ? record : c));
    } else {
      setContributions(prev => [...prev, record]);
    }
    setEditingRecord(undefined);
    setPrefilledData(undefined);
    setIsModalOpen(false);
  };

  const handleAddLoan = (loan: Loan) => {
    setLoans(prev => [...prev, loan]);
  };

  const updateLoanStatus = (id: string, status: Loan['status']) => {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const handleBatchAdd = (newOnes: Contribution[]) => {
    setContributions(prev => [...prev, ...newOnes]);
    setCurrentPage(Page.CONTRIBUTIONS);
  };

  const handleEditClick = (record: Contribution) => {
    setEditingRecord(record);
    setPrefilledData(undefined);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm("Delete this ledger entry?")) {
      setContributions(prev => prev.filter(c => c.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingRecord(undefined);
    setPrefilledData(undefined);
    setIsModalOpen(true);
  };

  const handleQuickAdd = (member: { name: string; fileNumber: string }) => {
    setEditingRecord(undefined);
    setPrefilledData({ name: member.name, fileNo: member.fileNumber });
    setIsModalOpen(true);
  };

  const filteredLedger = useMemo(() => {
    const term = ledgerSearchTerm.toLowerCase();
    return contributions
      .filter(c => 
        c.memberName.toLowerCase().includes(term) || 
        c.fileNumber.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
      )
      .slice()
      .reverse();
  }, [contributions, ledgerSearchTerm]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 animate-fadeIn border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-900/20 transform -rotate-6 transition-transform hover:rotate-0 duration-500">
              <i className="fa-solid fa-building-columns text-white text-3xl"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">NYSC Katsina State Staff</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Cooperative Society Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block text-center">Administrator Access Key</label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="• • • •"
                  className={`w-full text-center text-4xl tracking-[0.5em] font-black py-5 bg-slate-50 border-2 rounded-2xl transition-all outline-none focus:bg-white ${
                    pinError ? 'border-red-500 text-red-600 animate-shake' : 'border-slate-100 focus:border-emerald-500 text-slate-900 shadow-inner'
                  }`}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPin(val);
                  }}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pin.length < 4}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                pin.length === 4 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30' 
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
            >
              Sign In to Ledger
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-50 pt-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
              Restricted Area<br/>
              Authorized Cooperative Personnel Only
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard contributions={contributions} loans={loans} />;
      case Page.MEMBERS:
        return <MemberTable contributions={contributions} onQuickAdd={handleQuickAdd} />;
      case Page.CONTRIBUTIONS:
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Official Society Ledger</h1>
                <p className="text-slate-500 text-sm">Full transaction history for staff members.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                  <input 
                    type="text"
                    placeholder="Search records..."
                    className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-600 outline-none transition-all text-sm w-full md:w-64 lg:w-80 shadow-sm"
                    value={ledgerSearchTerm}
                    onChange={(e) => setLedgerSearchTerm(e.target.value)}
                  />
                  {ledgerSearchTerm && (
                    <button 
                      onClick={() => setLedgerSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                  )}
                </div>
                <button 
                  onClick={openAddModal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 flex items-center space-x-2 transition-all active:scale-95"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Manual Entry</span>
                </button>
              </div>
            </div>

            {ledgerSearchTerm && (
              <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 animate-fadeIn w-fit">
                <i className="fa-solid fa-filter"></i>
                <span>Showing {filteredLedger.length} results for "{ledgerSearchTerm}"</span>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Date</th>
                      <th className="px-8 py-4">Staff Member</th>
                      <th className="px-8 py-4">File No</th>
                      <th className="px-8 py-4 text-right">Amount</th>
                      <th className="px-8 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLedger.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 group transition-colors">
                        <td className="px-8 py-5 text-slate-500 text-sm font-medium">{c.date}</td>
                        <td className="px-8 py-5 font-bold text-slate-900 text-sm">{c.memberName}</td>
                        <td className="px-8 py-5 text-slate-400 text-xs font-bold tracking-wider">{c.fileNumber}</td>
                        <td className="px-8 py-5 text-right font-black text-emerald-600 text-sm">₦{c.amount.toLocaleString()}</td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ShareReceipt transaction={c} allContributions={contributions} />
                            <button 
                              onClick={() => handleEditClick(c)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Edit"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button 
                              onClick={() => handleDeleteRecord(c.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLedger.length === 0 && (
                  <div className="p-20 text-center text-slate-300 italic flex flex-col items-center">
                    <i className="fa-solid fa-magnifying-glass text-5xl mb-4 opacity-10"></i>
                    {ledgerSearchTerm ? `No entries match "${ledgerSearchTerm}"` : "No ledger entries found."}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case Page.LOANS:
        return <LoanManagement loans={loans} contributions={contributions} onAddLoan={handleAddLoan} onUpdateLoanStatus={updateLoanStatus} />;
      case Page.BATCH_UPLOAD:
        return <UploadSection onAddContributions={handleBatchAdd} />;
      case Page.RECORD_ASSISTANT:
        return <Assistant contributions={contributions} />;
      default:
        return <Dashboard contributions={contributions} loans={loans} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout} 
        isMinimized={isSidebarMinimized}
        setIsMinimized={setIsSidebarMinimized}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarMinimized ? 'md:ml-20' : 'md:ml-64'}`}>
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 flex items-center justify-between px-8 py-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {currentPage === Page.DASHBOARD ? 'Executive Dashboard' : currentPage.replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</span>
              <span className="text-xs font-black text-emerald-600">Cooperative Secretary</span>
            </div>
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shadow-emerald-200">
              KC
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>

      <AddRecordModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setPrefilledData(undefined);
          setEditingRecord(undefined);
        }} 
        onSave={handleAddOrUpdateRecord}
        editingRecord={editingRecord}
        prefilledData={prefilledData}
      />
    </div>
  );
};

export default App;
