
import React from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const menuItems = [
    { id: Page.DASHBOARD, icon: 'fa-chart-line', label: 'Dashboard' },
    { id: Page.MEMBERS, icon: 'fa-users', label: 'Staff Directory' },
    { id: Page.CONTRIBUTIONS, icon: 'fa-hand-holding-dollar', label: 'Contributions' },
    { id: Page.BATCH_UPLOAD, icon: 'fa-file-import', label: 'Batch Upload' },
    { id: Page.RECORD_ASSISTANT, icon: 'fa-robot', label: 'Record Assistant' },
  ];

  return (
    <aside className="w-64 bg-green-800 text-white h-screen fixed left-0 top-0 hidden md:flex flex-col shadow-xl">
      <div className="p-6 border-b border-green-700 flex items-center space-x-3">
        <div className="bg-white p-2 rounded-lg">
          <i className="fa-solid fa-building-columns text-green-800 text-xl"></i>
        </div>
        <span className="font-bold text-sm leading-tight">NYSC Katsina State Staff Coop Ltd.</span>
      </div>
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center space-x-3 px-6 py-4 transition-colors ${
              currentPage === item.id 
                ? 'bg-green-900 border-r-4 border-yellow-400 text-yellow-400' 
                : 'hover:bg-green-700 text-green-100'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-6 bg-green-900 mt-auto text-[10px] text-green-300">
        &copy; 2024 NYSC Katsina State Staff Multi-Purpose Cooperative Society Limited.
      </div>
    </aside>
  );
};

export default Sidebar;
