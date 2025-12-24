
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberTable from './components/MemberTable';
import Assistant from './components/Assistant';
import UploadSection from './components/UploadSection';
import AddRecordModal from './components/AddRecordModal';
import ShareReceipt from './components/ShareReceipt';
import LoanManagement from './components/LoanManagement';
import { dbService } from './services/db';
import { Page, Contribution, Loan } from './types';

const ADMIN_PIN = "2025"; 

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('katsina_coop_auth') === 'true';
  });
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Contribution | undefined>(undefined);
  const [prefilledData, setPrefilledData] = useState<{ name: string; fileNo: string } | undefined>(undefined);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState<boolean>(() => {
    return localStorage.getItem('katsina_sidebar_minimized') === 'true';
  });
  
  const [ledgerSearchTerm, setLedgerSearchTerm] = useState('');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Initial Data Fetch from Cloud - Vital for multi-device support
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [cloudContributions, cloudLoans] = await Promise.all([
            dbService.getContributions(),
            dbService.getLoans()
          ]);
          setContributions(cloudContributions);
          setLoans(cloudLoans);
        } catch (error) {
          console.error("Cloud Connectivity Failure:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated]);

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
    if (window.confirm("End society session? All changes are saved to the cloud.")) {
      setIsAuthenticated(false);
      localStorage.removeItem('katsina_coop_auth');
      setPin('');
    }
  };

  const handleAddOrUpdateRecord = async (record: Contribution) => {
    setIsSyncing(true);
    try {
      if (editingRecord) {
        await dbService.updateContribution(record);
        setContributions(prev => prev.map(c => c.id === record.id ? record : c));
      } else {
        await dbService.addContribution(record);
        setContributions(prev => [record, ...prev]);
      }
    } catch (error) {
      alert("Cloud Sync Failed. Check internet connection.");
    } finally {
      setIsSyncing(false);
      setEditingRecord(undefined);
      setPrefilledData(undefined);
      setIsModalOpen(false);
    }
  };

  const handleAddLoan = async (loan: Loan) => {
    setIsSyncing(true);
    try {
      await dbService.addLoan(loan);
      setLoans(prev => [...prev, loan]);
    } catch (error) {
      alert("Failed to sync loan request.");
    } finally {
      setIsSyncing(false);
    }
  };

  const updateLoanStatus = async (id: string, status: Loan['status']) => {
    setIsSyncing(true);
    try {
      await dbService.updateLoanStatus(id, status);
      setLoans(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (error) {
      alert("Status update failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBatchAdd = async (newOnes: Contribution[]) => {
    setIsSyncing(true);
    try {
      // In production, a Firestore Batch Write would be preferred
      for (const item of newOnes) {
        await dbService.addContribution(item);
      }
      setContributions(prev => [...newOnes, ...prev]);
      setCurrentPage(Page.CONTRIBUTIONS);
    } catch (error) {
      alert("Partial batch import failure.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm("Permanently remove this entry from the society cloud?")) {
      setIsSyncing(true);
      try {
        await dbService.deleteContribution(id);
        setContributions(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        alert("Delete failed.");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const filteredLedger = useMemo(() => {
    const term = ledgerSearchTerm.toLowerCase();
    return contributions
      .filter(c => 
        c.memberName.toLowerCase().includes(term) || 
        c.fileNumber.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
      );
  }, [contributions, ledgerSearchTerm]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 relative z-10 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-6">
              <i className="fa-solid fa-building-columns text-white text-2xl"></i>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">NYSC Katsina Society</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Staff Records Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block text-center">Enter Private Admin PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="• • • •"
                className={`w-full text-center text-3xl md:text-4xl tracking-[0.5em] font-black py-4 bg-slate-50 border-2 rounded-2xl transition-all outline-none ${
                  pinError ? 'border-red-500 animate-shake' : 'border-slate-100 focus:border-emerald-500'
                }`}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300"
            >
              Access Cloud Database
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
              Forgot PIN? Contact the Society Secretary.
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Syncing Cloud Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        onLogout={handleLogout} 
        isMinimized={isSidebarMinimized}
        setIsMinimized={setIsSidebarMinimized}
      />
      
      <main className={`flex-1 transition-all duration-300 pb-24 md:pb-0 ${isSidebarMinimized ? 'md:ml-20' : 'md:ml-64'}`}>
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 flex items-center justify-between px-6 py-3.5">
          <div className="flex items-center space-x-4">
            <div className="md:hidden bg-emerald-600 p-1.5 rounded-lg">
               <i className="fa-solid fa-building-columns text-white text-xs"></i>
            </div>
            <h2 className="text-base font-black text-slate-900">
              {currentPage === Page.DASHBOARD ? 'Society Dashboard' : currentPage.replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {isSyncing ? (
              <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 animate-fadeIn">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Syncing...</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 text-slate-300 px-3 py-1.5">
                <i className="fa-solid fa-cloud-check text-[10px]"></i>
                <span className="text-[10px] font-black uppercase tracking-tighter">Cloud Connected</span>
              </div>
            )}
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white shadow-lg text-sm">
              KC
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {(() => {
            switch (currentPage) {
              case Page.DASHBOARD: return <Dashboard contributions={contributions} loans={loans} />;
              case Page.MEMBERS: return <MemberTable contributions={contributions} onQuickAdd={(m) => { setPrefilledData({ name: m.name, fileNo: m.fileNumber }); setIsModalOpen(true); }} />;
              case Page.CONTRIBUTIONS: return (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div>
                      <h1 className="text-xl md:text-2xl font-black text-slate-900">Cloud Society Ledger</h1>
                      <p className="text-slate-500 text-xs">Verified transactions for all NYSC staff members.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-1 md:flex-none">
                        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                        <input 
                          type="text"
                          placeholder="Search records..."
                          className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none w-full md:w-64 text-sm font-medium"
                          value={ledgerSearchTerm}
                          onChange={(e) => setLedgerSearchTerm(e.target.value)}
                        />
                      </div>
                      <button onClick={() => { setEditingRecord(undefined); setIsModalOpen(true); }} className="hidden md:flex bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl items-center space-x-2 active:scale-95">
                        <i className="fa-solid fa-plus"></i>
                        <span>New Entry</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Mobile Action: Batch Upload access */}
                  <div className="md:hidden grid grid-cols-2 gap-3 mb-2">
                    <button 
                      onClick={() => { setEditingRecord(undefined); setIsModalOpen(true); }}
                      className="bg-emerald-600 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex flex-col items-center justify-center space-y-2"
                    >
                      <i className="fa-solid fa-plus text-lg"></i>
                      <span>Add Single</span>
                    </button>
                    <button 
                      onClick={() => setCurrentPage(Page.BATCH_UPLOAD)}
                      className="bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex flex-col items-center justify-center space-y-2"
                    >
                      <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
                      <span>Batch Import</span>
                    </button>
                  </div>

                  <div className="md:hidden space-y-4">
                    {filteredLedger.map(c => (
                      <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-slate-400">{c.memberName.charAt(0)}</div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{c.memberName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{c.fileNumber}</p>
                            </div>
                          </div>
                          <p className="font-black text-emerald-600 text-sm">₦{c.amount.toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                          <span className="text-[10px] text-slate-400 font-bold">{c.date}</span>
                          <div className="flex items-center space-x-2">
                            <ShareReceipt transaction={c} allContributions={contributions} />
                            <button onClick={() => { setEditingRecord(c); setIsModalOpen(true); }} className="p-2 text-slate-400"><i className="fa-solid fa-pen-to-square"></i></button>
                            <button onClick={() => handleDeleteRecord(c.id)} className="p-2 text-slate-400"><i className="fa-solid fa-trash"></i></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold">
                        <tr><th className="px-8 py-4">Date</th><th className="px-8 py-4">Member</th><th className="px-8 py-4">File No</th><th className="px-8 py-4 text-right">Amount</th><th className="px-8 py-4 text-center">Actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredLedger.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50 group transition-colors">
                            <td className="px-8 py-5 text-slate-500 text-sm">{c.date}</td>
                            <td className="px-8 py-5 font-bold text-slate-900 text-sm">{c.memberName}</td>
                            <td className="px-8 py-5 text-slate-400 text-xs font-bold">{c.fileNumber}</td>
                            <td className="px-8 py-5 text-right font-black text-emerald-600 text-sm">₦{c.amount.toLocaleString()}</td>
                            <td className="px-8 py-5">
                              <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ShareReceipt transaction={c} allContributions={contributions} />
                                <button onClick={() => { setEditingRecord(c); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600"><i className="fa-solid fa-pen-to-square"></i></button>
                                <button onClick={() => handleDeleteRecord(c.id)} className="p-2 text-slate-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredLedger.length === 0 && (
                      <div className="p-20 text-center text-slate-400 italic">No records found matching your query.</div>
                    )}
                  </div>
                </div>
              );
              case Page.LOANS: return <LoanManagement loans={loans} contributions={contributions} onAddLoan={handleAddLoan} onUpdateLoanStatus={updateLoanStatus} />;
              case Page.BATCH_UPLOAD: return <UploadSection onAddContributions={handleBatchAdd} />;
              case Page.RECORD_ASSISTANT: return <Assistant contributions={contributions} />;
            }
          })()}
        </div>
      </main>

      <AddRecordModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setPrefilledData(undefined); setEditingRecord(undefined); }} 
        onSave={handleAddOrUpdateRecord}
        editingRecord={editingRecord}
        prefilledData={prefilledData}
      />
    </div>
  );
};

export default App;
