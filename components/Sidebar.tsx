
import React from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onLogout }) => {
  const menuItems = [
    { id: Page.DASHBOARD, icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: Page.MEMBERS, icon: 'fa-users', label: 'Staff Directory' },
    { id: Page.CONTRIBUTIONS, icon: 'fa-receipt', label: 'Ledger' },
    { id: Page.LOANS, icon: 'fa-hand-holding-dollar', label: 'Loan Management' },
    { id: Page.BATCH_UPLOAD, icon: 'fa-cloud-arrow-up', label: 'Batch Upload' },
    { id: Page.RECORD_ASSISTANT, icon: 'fa-microphone-lines', label: 'Voice Assistant' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 hidden md:flex flex-col shadow-2xl z-30">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-900/20">
          <i className="fa-solid fa-building-columns text-white text-lg"></i>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-xs uppercase tracking-tighter text-emerald-400">NYSC Katsina</span>
          <span className="font-medium text-[10px] text-slate-400">Staff Coop Society</span>
        </div>
      </div>
      
      <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentPage === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-3">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">System Status</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-slate-300">Auditor Online</span>
          </div>
        </div>

        <button 
          onClick={() => {
            if(window.confirm("Sign out of the administration panel?")) onLogout();
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 group"
        >
          <i className="fa-solid fa-right-from-bracket w-5 text-center group-hover:scale-110 transition-transform"></i>
          <span className="text-sm font-bold">End Session</span>
        </button>
      </div>

      <div className="p-6 bg-slate-950 text-[10px] text-slate-500 border-t border-slate-800 font-bold uppercase tracking-tight">
        Admin Console v2.5.0
      </div>
    </aside>
  );
};

export default Sidebar;
