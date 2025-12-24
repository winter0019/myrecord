
import React, { useMemo } from 'react';
import { Contribution, Loan } from '../types';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface DashboardProps {
  contributions: Contribution[];
  loans: Loan[];
}

const Dashboard: React.FC<DashboardProps> = ({ contributions = [], loans = [] }) => {
  const stats = useMemo(() => {
    const memberBalances = new Map<string, number>();
    
    contributions.forEach(c => {
      const current = memberBalances.get(c.fileNumber) || (c.previousPayment || 0);
      memberBalances.set(c.fileNumber, current + c.amount);
    });

    const totalEquity = Array.from(memberBalances.values()).reduce((sum, val) => sum + val, 0);
    const activeLoans = loans.filter(l => l.status === 'APPROVED');
    const totalLoansOutstanding = activeLoans.reduce((sum, l) => sum + (l.principal * (1 + l.interestRate / 100) - l.repaidAmount), 0);
    const members = memberBalances.size;
    
    return { 
      totalEquity, 
      members, 
      totalLoansOutstanding,
      avgBalance: members > 0 ? totalEquity / members : 0,
      projectedDividends: totalEquity * 0.05 // 5% projected ROI
    };
  }, [contributions, loans]);

  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ name: m, amount: 0 }));
    
    contributions.forEach(c => {
      const d = new Date(c.date);
      if (isNaN(d.getTime())) return;
      data[d.getMonth()].amount += c.amount;
    });
    
    return data;
  }, [contributions]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn pb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all border-l-4 border-l-emerald-500">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Society Equity</p>
          <p className="text-xl md:text-2xl font-black text-slate-900">₦{stats.totalEquity.toLocaleString()}</p>
          <div className="mt-3 md:mt-4 flex items-center text-[9px] md:text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-full">
            <i className="fa-solid fa-arrow-up mr-1"></i> Growth
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all border-l-4 border-l-orange-500">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Loan Exposure</p>
          <p className="text-xl md:text-2xl font-black text-slate-900">₦{stats.totalLoansOutstanding.toLocaleString()}</p>
          <div className="mt-3 md:mt-4 flex items-center text-[9px] md:text-[10px] font-bold text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-full">
            <i className="fa-solid fa-clock mr-1"></i> {loans.filter(l => l.status === 'PENDING').length} Pending
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 group hover:shadow-lg transition-all border-l-4 border-l-blue-500">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Members</p>
          <p className="text-xl md:text-2xl font-black text-slate-900">{stats.members}</p>
          <div className="mt-3 md:mt-4 flex items-center text-[9px] md:text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-full">
             Verified Staff
          </div>
        </div>

        <div className="bg-slate-900 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl group hover:shadow-2xl transition-all border-l-4 border-l-yellow-400 text-white">
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Yearly Dividend</p>
          <p className="text-xl md:text-2xl font-black text-yellow-400">₦{stats.projectedDividends.toLocaleString()}</p>
          <div className="mt-3 md:mt-4 text-[9px] text-slate-400 font-medium italic">
            At 5% surplus
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3">
            <h3 className="font-black text-slate-900 tracking-tight text-sm md:text-base">Financial Inflow Trend</h3>
            <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl">
              <button className="px-3 py-1 bg-white shadow-sm rounded-lg text-[10px] font-bold text-slate-900">Monthly</button>
              <button className="px-3 py-1 text-[10px] font-bold text-slate-400">Yearly</button>
            </div>
          </div>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Contributions']}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-emerald-700 p-6 md:p-8 rounded-2xl md:rounded-[2rem] text-white shadow-xl relative overflow-hidden group flex flex-col justify-between min-h-[180px]">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          <div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 text-lg md:text-xl">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className="text-lg md:text-xl font-black mb-1 md:mb-2">Member Security</h3>
            <p className="text-emerald-100 text-xs leading-relaxed opacity-80">
              Redundant storage for society records.
            </p>
          </div>
          <button className="mt-6 w-full bg-white text-emerald-700 py-3 rounded-xl md:rounded-2xl font-black text-xs md:text-sm hover:bg-emerald-50 transition-colors shadow-lg active:scale-95">
            Audit Ledger
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-black text-slate-900 tracking-tight text-sm md:text-lg">Recent Ledger Entries</h3>
          <button className="text-[10px] font-black text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all">View All</button>
        </div>
        <div className="divide-y divide-slate-50">
          {contributions.slice(-5).reverse().map((c) => (
            <div key={c.id} className="px-5 md:px-8 py-4 md:py-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group active:bg-slate-50">
              <div className="flex items-center space-x-3 md:space-x-5">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors text-xs md:text-base">
                  {c.memberName.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-900 text-xs md:text-sm leading-none mb-1">{c.memberName}</p>
                  <p className="text-[9px] md:text-[11px] text-slate-400 font-bold uppercase tracking-wider">{c.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-600 text-sm md:text-base">₦{c.amount.toLocaleString()}</p>
                <span className="text-[8px] md:text-[10px] text-slate-400 uppercase font-black tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded-md">ID: {c.fileNumber.split('/').pop()}</span>
              </div>
            </div>
          ))}
          {contributions.length === 0 && (
            <div className="p-12 text-center text-slate-300 italic flex flex-col items-center">
              <i className="fa-solid fa-receipt text-4xl mb-3 opacity-10"></i>
              No recent records.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
