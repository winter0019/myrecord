
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
        // Increment the running total
        existing.totalContributed += c.amount;
        existing.lastContributionDate = c.date;
        existing.lastAmount = c.amount;
        // If an admin updates the "previousPayment" on a later record, 
        // in this simple model, we treat the FIRST record's previousPayment as the starting point.
        // However, to make it more flexible, we'll assume the total is: 
        // (Sum of all amounts) + (previousPayment of the absolute first record)
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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text"
            placeholder="Search name or File Number..."
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-500">
            Showing <span className="text-gray-900 font-bold">{members.length}</span> Staff Members
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Staff Member / File No</th>
                <th className="px-6 py-4">Total Balance</th>
                <th className="px-6 py-4">Last Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.fileNumber} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm leading-none">{member.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{member.fileNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm">₦{member.totalContributed.toLocaleString()}</span>
                      {member.openingBalance > 0 && (
                        <span className="text-[9px] text-gray-400">Inc. ₦{member.openingBalance.toLocaleString()} Opening</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-green-700">₦{member.lastAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">{member.lastContributionDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-lg uppercase">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => onQuickAdd({ name: member.name, fileNumber: member.fileNumber })}
                        className="bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-md shadow-green-100"
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
          {members.length === 0 && (
            <div className="p-16 text-center text-gray-400">
              <i className="fa-solid fa-users-slash text-5xl mb-4 block opacity-20"></i>
              <p className="text-lg font-medium">No staff found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberTable;
