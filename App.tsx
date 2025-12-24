
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MemberTable from './components/MemberTable';
import Assistant from './components/Assistant';
import UploadSection from './components/UploadSection';
import AddRecordModal from './components/AddRecordModal';
import ShareReceipt from './components/ShareReceipt';
import { Page, Contribution } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Contribution | undefined>(undefined);
  const [prefilledData, setPrefilledData] = useState<{ name: string; fileNo: string } | undefined>(undefined);
  
  const [contributions, setContributions] = useState<Contribution[]>(() => {
    const saved = localStorage.getItem('katsina_staff_coop_data');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('katsina_staff_coop_data', JSON.stringify(contributions));
  }, [contributions]);

  const handleAddOrUpdateRecord = (record: Contribution) => {
    if (editingRecord) {
      setContributions(prev => prev.map(c => c.id === record.id ? record : c));
    } else {
      setContributions(prev => [...prev, record]);
    }
    setEditingRecord(undefined);
    setPrefilledData(undefined);
    setIsModalOpen(false);
  };

  const handleBatchAdd = (newOnes: Contribution[]) => {
    setContributions(prev => [...prev, ...newOnes]);
    setCurrentPage(Page.CONTRIBUTIONS);
  };

  const handleEditClick = (record: Contribution) => {
    setEditingRecord(record);
    setPrefilledData(undefined);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
      setContributions(prev => prev.filter(c => c.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingRecord(undefined);
    setPrefilledData(undefined);
    setIsModalOpen(true);
  };

  const handleQuickAdd = (member: { name: string; fileNumber: string }) => {
    setEditingRecord(undefined);
    setPrefilledData({ name: member.name, fileNo: member.fileNumber });
    setIsModalOpen(true);
  };

  const exportToCSV = () => {
    if (contributions.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Date", "Staff Member", "File No", "Category", "Amount", "Notes"];
    const rows = contributions.map(c => [
      c.date,
      `"${c.memberName}"`,
      `"${c.fileNumber}"`,
      `"${c.category}"`,
      c.amount,
      `"${c.notes || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NYSC_Katsina_Coop_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Cooperative Dashboard</h1>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-tight">Katsina State Staff Multi-Purpose Society Ltd.</p>
              </div>
              <button 
                onClick={openAddModal}
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-100 flex items-center space-x-2 transition-all active:scale-95"
              >
                <i className="fa-solid fa-plus"></i>
                <span>Add Record</span>
              </button>
            </div>
            <Dashboard contributions={contributions} />
          </div>
        );
      case Page.MEMBERS:
        return <MemberTable contributions={contributions} onQuickAdd={handleQuickAdd} />;
      case Page.CONTRIBUTIONS:
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800">Official Society Ledger</h2>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={exportToCSV}
                  className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Export CSV</span>
                </button>
                <button 
                  onClick={openAddModal}
                  className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all"
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Manual Entry</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Staff Member</th>
                    <th className="px-6 py-4">File No</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contributions.slice().reverse().map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 text-sm group">
                      <td className="px-6 py-4 text-gray-500">{c.date}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{c.memberName}</td>
                      <td className="px-6 py-4 text-gray-500">{c.fileNumber}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-700">₦{c.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center space-x-2">
                          <ShareReceipt transaction={c} allContributions={contributions} />
                          <button 
                            onClick={() => handleEditClick(c)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Record"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteRecord(c.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {contributions.length === 0 && (
                <div className="p-10 text-center text-gray-400">No transactions recorded in the society ledger.</div>
              )}
            </div>
          </div>
        );
      case Page.BATCH_UPLOAD:
        return <UploadSection onAddContributions={handleBatchAdd} />;
      case Page.RECORD_ASSISTANT:
        return <Assistant contributions={contributions} />;
      default:
        return <Dashboard contributions={contributions} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <header className="md:hidden bg-green-800 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-building-columns"></i>
            <span className="font-bold text-xs">NYSC Katsina Coop Ltd.</span>
          </div>
          <div className="flex space-x-3">
             <button onClick={() => setCurrentPage(Page.CONTRIBUTIONS)} className="text-white">
               <i className="fa-solid fa-list text-lg"></i>
             </button>
             <button onClick={openAddModal}>
               <i className="fa-solid fa-plus text-xl"></i>
             </button>
          </div>
        </header>

        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 hidden md:flex items-center justify-between px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>NYSC Katsina Coop Ltd.</span>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
            <span className="text-gray-900 font-semibold">{currentPage.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={openAddModal}
              className="bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Quick Add</span>
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 leading-none">Coop Admin</p>
                <p className="text-[10px] text-green-600 mt-1 uppercase tracking-widest font-bold">Official Control</p>
              </div>
              <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                KC
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>

      <AddRecordModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setPrefilledData(undefined);
          setEditingRecord(undefined);
        }} 
        onSave={handleAddOrUpdateRecord}
        editingRecord={editingRecord}
        prefilledData={prefilledData}
      />
    </div>
  );
};

export default App;
