import React, { useState, useMemo } from 'react';
import { Loan, Contribution } from '../types';

interface LoanManagementProps {
  loans: Loan[];
  contributions: Contribution[];
  onAddLoan: (loan: Loan) => void;
  onUpdateLoanStatus: (id: string, status: Loan['status']) => void;
}

const LoanManagement: React.FC<LoanManagementProps> = ({ loans, contributions, onAddLoan, onUpdateLoanStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fileNumber: '',
    principal: '',
    interestRate: '5',
    duration: '6'
  });

  const memberMap = useMemo(() => {
    const map = new Map<string, string>();
    contributions.forEach(c => map.set(c.fileNumber, c.memberName));
    return map;
  }, [contributions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memberName = memberMap.get(formData.fileNumber);
    if (!memberName) {
      alert("Error: Staff File Number not found in society directory. Please verify the ID.");
      return;
    }

    const newLoan: Loan = {
      id: Math.random().toString(36).substr(2, 9),
      memberName,
      fileNumber: formData.fileNumber,
      principal: parseFloat(formData.principal),
      interestRate: parseFloat(formData.interestRate),
      durationMonths: parseInt(formData.duration),
      startDate: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      repaidAmount: 0
    };

    onAddLoan(newLoan);
    setIsModalOpen(false);
    setFormData({ fileNumber: '', principal: '', interestRate: '5', duration: '6' });
  };

  const totalDisbursed = loans.filter(l => l.status === 'APPROVED').reduce((s, l) => s + l.principal, 0);
  const pendingCount = loans.filter(l => l.status === 'PENDING').length;
  const projectedInterest = loans.reduce((s, l) => s + (l.principal * (l.interestRate / 100)), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Loan Portfolio</h1>
          <p className="text-slate-500 text-sm">Managing staff credit and society investment yields.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 flex items-center space-x-2 transition-all active:scale-95"
        >
          <i className="fa-solid fa-plus"></i>
          <span>Create Loan Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-200/50">
          <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">Total Capital Outlay</p>
          <h3 className="text-3xl font-black">₦{totalDisbursed.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Pending Review</p>
          <h3 className="text-3xl font-black text-slate-900">{pendingCount} <span className="text-xs font-bold text-slate-300 ml-1 uppercase">Requests</span></h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Est. Return on Credit</p>
          <h3 className="text-3xl font-black text-emerald-600">₦{projectedInterest.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-8 py-5">Staff Member</th>
                <th className="px-8 py-5">Loan Terms</th>
                <th className="px-8 py-5">Recovery Progress</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-center">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loans.map(loan => {
                const totalDue = loan.principal * (1 + loan.interestRate / 100);
                const progress = totalDue > 0 ? (loan.repaidAmount / totalDue) * 100 : 0;
                return (
                  <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900 text-sm">{loan.memberName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{loan.fileNumber}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 text-sm">₦{loan.principal.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{loan.interestRate}% Interest • {loan.durationMonths} Months</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-48">
                        <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-tighter">
                          <span className="text-emerald-600">₦{loan.repaidAmount.toLocaleString()} recovered</span>
                          <span className="text-slate-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        loan.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                        loan.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                        loan.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center space-x-2">
                        {loan.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => onUpdateLoanStatus(loan.id, 'APPROVED')}
                              className="w-9 h-9 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              title="Approve Loan"
                            >
                              <i className="fa-solid fa-check text-xs"></i>
                            </button>
                            <button 
                              onClick={() => onUpdateLoanStatus(loan.id, 'REJECTED')}
                              className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="Reject Loan"
                            >
                              <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {loans.length === 0 && (
            <div className="p-24 text-center text-slate-300 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <i className="fa-solid fa-folder-open text-3xl opacity-20"></i>
              </div>
              <p className="text-lg font-black text-slate-400">No Loan Records</p>
              <p className="text-xs font-bold text-slate-300 uppercase mt-1 tracking-widest">Active staff credit will appear here</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/20">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">New Loan Application</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Staff File Number</label>
                <input 
                  type="text" required 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-bold transition-all shadow-inner"
                  placeholder="KT/STF/..."
                  value={formData.fileNumber}
                  onChange={e => setFormData({...formData, fileNumber: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Principal Amount (₦)</label>
                  <input 
                    type="number" required 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none font-bold shadow-inner"
                    placeholder="0.00"
                    value={formData.principal}
                    onChange={e => setFormData({...formData, principal: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Interest (%)</label>
                  <input 
                    type="number" required 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none font-bold shadow-inner"
                    value={formData.interestRate}
                    onChange={e => setFormData({...formData, interestRate: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Repayment Tenure</label>
                <select 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none font-bold appearance-none cursor-pointer shadow-inner"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                >
                  <option value="3">3 Months (Short Term)</option>
                  <option value="6">6 Months (Standard)</option>
                  <option value="12">12 Months (Mid Term)</option>
                  <option value="24">24 Months (Long Term)</option>
                </select>
              </div>
              <div className="pt-6 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 p-4 bg-emerald-600 rounded-2xl font-bold text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95">Register Loan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanManagement;