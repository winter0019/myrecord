
import React, { useState } from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onLogout: () => void;
  isMinimized: boolean;
  setIsMinimized: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  setCurrentPage, 
  onLogout, 
  isMinimized, 
  setIsMinimized 
}) => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const menuItems = [
    { id: Page.DASHBOARD, icon: 'fa-chart-pie', label: 'Dashboard' },
    { id: Page.MEMBERS, icon: 'fa-users', label: 'Staff Directory' },
    { id: Page.CONTRIBUTIONS, icon: 'fa-receipt', label: 'Ledger' },
    { id: Page.LOANS, icon: 'fa-hand-holding-dollar', label: 'Loan Management' },
    { id: Page.BATCH_UPLOAD, icon: 'fa-cloud-arrow-up', label: 'Batch Upload' },
    { id: Page.RECORD_ASSISTANT, icon: 'fa-microphone-lines', label: 'Voice Assistant' },
  ];

  const handleMobileNav = (page: Page) => {
    setCurrentPage(page);
    setIsToolsOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`bg-slate-900 text-white h-screen fixed left-0 top-0 hidden md:flex flex-col shadow-2xl z-30 transition-all duration-300 ease-in-out ${
          isMinimized ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`p-6 border-b border-slate-800 flex items-center transition-all ${isMinimized ? 'justify-center' : 'space-x-3'}`}>
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-900/20 flex-shrink-0">
            <i className="fa-solid fa-building-columns text-white text-lg"></i>
          </div>
          {!isMinimized && (
            <div className="flex flex-col leading-tight animate-fadeIn">
              <span className="font-bold text-xs uppercase tracking-tighter text-emerald-400">NYSC Katsina</span>
              <span className="font-medium text-[10px] text-slate-400">Staff Coop Society</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end px-4 py-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-500 hover:text-white transition-colors p-2"
          >
            <i className={`fa-solid ${isMinimized ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
          </button>
        </div>

        <nav className="flex-1 mt-2 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              title={isMinimized ? item.label : ''}
              className={`w-full flex items-center rounded-xl transition-all duration-200 ${
                isMinimized ? 'justify-center py-4' : 'space-x-3 px-4 py-3'
              } ${
                currentPage === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-sm`}></i>
              {!isMinimized && <span className="text-sm font-semibold whitespace-nowrap animate-fadeIn">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-4 space-y-3 ${isMinimized ? 'flex flex-col items-center' : ''}`}>
          {!isMinimized && (
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 animate-fadeIn">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">System Status</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-slate-300">Auditor Online</span>
              </div>
            </div>
          )}

          <button 
            onClick={() => {
              if(window.confirm("Sign out of the administration panel?")) onLogout();
            }}
            title={isMinimized ? 'End Session' : ''}
            className={`w-full flex items-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 group ${
              isMinimized ? 'justify-center py-4' : 'space-x-3 px-4 py-3'
            }`}
          >
            <i className="fa-solid fa-right-from-bracket w-5 text-center group-hover:scale-110 transition-transform"></i>
            {!isMinimized && <span className="text-sm font-bold animate-fadeIn">End Session</span>}
          </button>
        </div>

        {!isMinimized && (
          <div className="p-6 bg-slate-950 text-[10px] text-slate-500 border-t border-slate-800 font-bold uppercase tracking-tight animate-fadeIn">
            Admin Console v2.5.0
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex items-center justify-around px-2 py-3 z-50 md:hidden pb-safe-area shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => handleMobileNav(Page.DASHBOARD)}
          className={`flex flex-col items-center space-y-1 w-16 ${currentPage === Page.DASHBOARD ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-chart-pie text-lg"></i>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        <button 
          onClick={() => handleMobileNav(Page.CONTRIBUTIONS)}
          className={`flex flex-col items-center space-y-1 w-16 ${currentPage === Page.CONTRIBUTIONS ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-receipt text-lg"></i>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Ledger</span>
        </button>
        
        {/* Assistant FAB */}
        <button 
          onClick={() => handleMobileNav(Page.RECORD_ASSISTANT)}
          className={`flex flex-col items-center justify-center -mt-8 w-14 h-14 rounded-2xl shadow-xl transition-all active:scale-90 ${currentPage === Page.RECORD_ASSISTANT ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}
        >
          <i className="fa-solid fa-microphone-lines text-xl"></i>
        </button>

        <button 
          onClick={() => handleMobileNav(Page.MEMBERS)}
          className={`flex flex-col items-center space-y-1 w-16 ${currentPage === Page.MEMBERS ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-users text-lg"></i>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Staff</span>
        </button>
        
        <button 
          onClick={() => setIsToolsOpen(!isToolsOpen)}
          className={`flex flex-col items-center space-y-1 w-16 ${isToolsOpen ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <i className={`fa-solid ${isToolsOpen ? 'fa-xmark' : 'fa-grid-2'} text-lg`}></i>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Tools</span>
        </button>
      </nav>

      {/* Mobile Tools Overlay */}
      {isToolsOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-fadeIn">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsToolsOpen(false)}></div>
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-[2rem] p-6 shadow-2xl animate-fadeIn space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Administrative Tools</p>
            
            <button 
              onClick={() => handleMobileNav(Page.LOANS)}
              className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${currentPage === Page.LOANS ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentPage === Page.LOANS ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400'}`}>
                <i className="fa-solid fa-hand-holding-dollar"></i>
              </div>
              <span className="font-bold text-sm">Loan Management</span>
            </button>

            <button 
              onClick={() => handleMobileNav(Page.BATCH_UPLOAD)}
              className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${currentPage === Page.BATCH_UPLOAD ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentPage === Page.BATCH_UPLOAD ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400'}`}>
                <i className="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <span className="font-bold text-sm">Batch Ledger Import</span>
            </button>

            <div className="h-px bg-slate-100 my-2"></div>

            <button 
              onClick={() => { setIsToolsOpen(false); onLogout(); }}
              className="w-full flex items-center space-x-4 p-4 rounded-2xl bg-red-50 text-red-600 active:bg-red-100"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white text-red-400">
                <i className="fa-solid fa-right-from-bracket"></i>
              </div>
              <span className="font-bold text-sm">Sign Out Session</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
