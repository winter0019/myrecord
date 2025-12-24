
import React, { useState, useMemo } from 'react';
import { Contribution, Member } from '../types';

interface MemberTableProps {
  contributions: Contribution[];
  onQuickAdd: (member: { name: string; fileNumber: string }) => void;
}

const MemberTable: React.FC<MemberTableProps> = ({ contributions, onQuickAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const members = useMemo(() => {
    const map = new Map<string, Member & { lastAmount: number; openingBalance: number }>();
    
    // Sort contributions by date (ascending) to find the opening balance first
    const sorted = [...contributions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach(c => {
      const existing = map.get(c.fileNumber);
      if (existing) {
        existing.totalContributed += c.amount;
        existing.lastContributionDate = c.date;
        existing.lastAmount = c.amount;
      } else {
        map.set(c.fileNumber, {
          fileNumber: c.fileNumber,
          name: c.memberName,
          openingBalance: c.previousPayment || 0,
          totalContributed: (c.previousPayment || 0) + c.amount,
          lastContributionDate: c.date,
          lastAmount: c.amount
        });
      }
    });

    return Array.from(map.values())
      .filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.fileNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.totalContributed - a.totalContributed);
  }, [contributions, searchTerm]);

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input 
            type="text"
            placeholder="Search staff name or File No..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-600 outline-none transition-all text-sm shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-sm font-medium text-slate-500">
            Total Staff: <span className="text-slate-900 font-bold">{members.length}</span>
          </span>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {members.map((member) => (
          <div key={member.fileNumber} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col space-y-4 active:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-sm">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">{member.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{member.fileNumber}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-md uppercase tracking-tighter">Active</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Balance</p>
                <p className="font-black text-slate-900 text-sm">₦{member.totalContributed.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Last Payment</p>
                <p className="font-bold text-emerald-600 text-sm">₦{member.lastAmount.toLocaleString()}</p>
                <p className="text-[8px] text-slate-300 font-bold">{member.lastContributionDate}</p>
              </div>
            </div>

            <button 
              onClick={() => onQuickAdd({ name: member.name, fileNumber: member.fileNumber })}
              className="w-full bg-emerald-600 py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center space-x-2 shadow-lg shadow-emerald-100"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
              <span>Add Quick Payment</span>
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Staff Member / File No</th>
                <th className="px-6 py-4">Total Balance</th>
                <th className="px-6 py-4">Last Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.fileNumber} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-none">{member.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{member.fileNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">₦{member.totalContributed.toLocaleString()}</span>
                      {member.openingBalance > 0 && (
                        <span className="text-[9px] text-slate-400">Inc. ₦{member.openingBalance.toLocaleString()} Opening</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">₦{member.lastAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">{member.lastContributionDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg uppercase">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => onQuickAdd({ name: member.name, fileNumber: member.fileNumber })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-md shadow-emerald-100 active:scale-95"
                      >
                        <i className="fa-solid fa-plus"></i>
                        <span>Add Payment</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {members.length === 0 && (
        <div className="p-16 text-center text-slate-400">
          <i className="fa-solid fa-users-slash text-5xl mb-4 block opacity-10"></i>
          <p className="text-lg font-black">No results found</p>
          <p className="text-xs font-bold uppercase tracking-widest mt-1">Refine your search parameters</p>
        </div>
      )}
    </div>
  );
};

export default MemberTable;
