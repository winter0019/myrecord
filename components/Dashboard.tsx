
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

  const monthlyChartData = useMemo(() => {
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
    // Order by month - assuming current year for simplicity in this specific display
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months
      .filter(m => groups[m] !== undefined)
      .map(month => ({ name: month, amount: groups[month] }));
  }, [contributions]);

  const yearlyStats = useMemo(() => {
    const groups: Record<string, number> = {};
    contributions.forEach(c => {
      try {
        const year = new Date(c.date).getFullYear().toString();
        if (year !== "NaN") {
          groups[year] = (groups[year] || 0) + c.amount;
        }
      } catch(e) { /* ignore */ }
    });
    
    const sortedYears = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    const maxAmount = Math.max(...Object.values(groups), 0);

    return sortedYears.map(year => ({
      year,
      amount: groups[year],
      percentage: maxAmount > 0 ? (groups[year] / maxAmount) * 100 : 0
    }));
  }, [contributions]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
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
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Contribution Volume</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyChartData}>
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Yearly Fund Summary</h3>
          <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            {yearlyStats.length > 0 ? (
              yearlyStats.map((item) => (
                <div key={item.year} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xl font-bold text-gray-900">{item.year}</span>
                      <span className="ml-2 text-xs text-gray-400 uppercase font-bold tracking-widest">Fiscal Year</span>
                    </div>
                    <span className="font-bold text-green-700">₦{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-700 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                <i className="fa-solid fa-calendar-minus text-4xl mb-2 opacity-20"></i>
                <p className="text-sm">No yearly records found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Latest Staff Payments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {contributions.slice(-12).reverse().map((c) => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-white hover:shadow-md rounded-xl transition-all border border-transparent hover:border-gray-100 group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm group-hover:bg-green-700 group-hover:text-white transition-colors">
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
          {contributions.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-400">
              No recent payment activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
