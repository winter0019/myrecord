
import React, { useMemo } from 'react';
import { Contribution } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

interface DashboardProps {
  contributions: Contribution[];
}

const Dashboard: React.FC<DashboardProps> = ({ contributions }) => {
  const stats = useMemo(() => {
    const memberBalances = new Map<string, number>();
    
    // Sort to ensure we handle opening balances from the first record
    const sorted = [...contributions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach(c => {
      if (memberBalances.has(c.fileNumber)) {
        memberBalances.set(c.fileNumber, (memberBalances.get(c.fileNumber) || 0) + c.amount);
      } else {
        memberBalances.set(c.fileNumber, (c.previousPayment || 0) + c.amount);
      }
    });

    const total = Array.from(memberBalances.values()).reduce((sum, val) => sum + val, 0);
    const members = memberBalances.size;
    const avg = contributions.length > 0 ? total / members : 0;
    
    return { total, members, avg };
  }, [contributions]);

  const chartData = useMemo(() => {
    const groups: Record<string, number> = {};
    contributions.forEach(c => {
      try {
        const date = new Date(c.date);
        const month = date.toLocaleString('default', { month: 'short' });
        if (month !== "Invalid Date") {
          groups[month] = (groups[month] || 0) + c.amount;
        }
      } catch(e) {
        console.warn("Skipping record with bad date format");
      }
    });
    return Object.keys(groups).map(month => ({ name: month, amount: groups[month] }));
  }, [contributions]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Staff Fund</p>
              <p className="text-2xl font-bold text-gray-900">₦{stats.total.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <i className="fa-solid fa-piggy-bank text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600">
            <i className="fa-solid fa-shield-check mr-1"></i>
            <span>Verified Savings (Incl. Opening Balances)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Enrolled Staff</p>
              <p className="text-2xl font-bold text-gray-900">{stats.members}</p>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <i className="fa-solid fa-user-tie text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600">
            <i className="fa-solid fa-plus mr-1"></i>
            <span>Active Contributors</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg Balance per Staff</p>
              <p className="text-2xl font-bold text-gray-900">₦{Math.round(stats.avg).toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <i className="fa-solid fa-chart-simple text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-600">
            <i className="fa-solid fa-calendar-check mr-1"></i>
            <span>Calculated from total equity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Staff Contribution Volume</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803d" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Amount']}
              />
              <Area type="monotone" dataKey="amount" stroke="#15803d" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Latest Staff Payments</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {contributions.slice(-10).reverse().map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-700 font-bold text-sm">
                    {c.memberName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{c.memberName}</p>
                    <p className="text-[11px] text-gray-400">{c.date} • {c.fileNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700 text-sm">₦{c.amount.toLocaleString()}</p>
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">{c.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
