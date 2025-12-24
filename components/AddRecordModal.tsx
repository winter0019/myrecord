
import React, { useState, useEffect } from 'react';
import { Contribution } from '../types';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Contribution) => void;
  editingRecord?: Contribution;
  prefilledData?: { name: string; fileNo: string };
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({ isOpen, onClose, onSave, editingRecord, prefilledData }) => {
  const [formData, setFormData] = useState({
    memberName: '',
    fileNumber: '',
    amount: '',
    previousPayment: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Monthly Contribution',
    notes: ''
  });

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        memberName: editingRecord.memberName,
        fileNumber: editingRecord.fileNumber,
        amount: editingRecord.amount.toString(),
        previousPayment: editingRecord.previousPayment?.toString() || '',
        date: editingRecord.date,
        category: editingRecord.category,
        notes: editingRecord.notes || ''
      });
    } else if (prefilledData) {
      setFormData({
        memberName: prefilledData.name,
        fileNumber: prefilledData.fileNo,
        amount: '',
        previousPayment: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Monthly Contribution',
        notes: ''
      });
    } else {
      setFormData({
        memberName: '',
        fileNumber: '',
        amount: '',
        previousPayment: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Monthly Contribution',
        notes: ''
      });
    }
  }, [editingRecord, prefilledData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberName || !formData.fileNumber || !formData.amount || !formData.date) {
      alert("Please fill in all required fields.");
      return;
    }

    const record: Contribution = {
      id: editingRecord ? editingRecord.id : Math.random().toString(36).substr(2, 9),
      memberName: formData.memberName,
      fileNumber: formData.fileNumber,
      amount: parseFloat(formData.amount),
      previousPayment: formData.previousPayment ? parseFloat(formData.previousPayment) : 0,
      date: formData.date,
      category: formData.category,
      notes: formData.notes
    };

    onSave(record);
    onClose();
  };

  const isLocked = !!prefilledData;

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all h-[92vh] md:h-auto overflow-y-auto">
        <div className="bg-emerald-800 p-6 text-white flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg md:text-xl font-black tracking-tight">
            {editingRecord ? 'Edit Entry' : prefilledData ? `Record: ${prefilledData.name.split(' ')[0]}` : 'New Ledger Entry'}
          </h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-emerald-700 rounded-full transition-colors active:scale-90">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 pb-12 md:pb-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Full Name *</label>
            <input
              type="text"
              required
              readOnly={isLocked}
              className={`w-full p-4 bg-slate-50 border-2 rounded-2xl focus:border-emerald-600 focus:bg-white outline-none transition-all font-bold ${isLocked ? 'text-slate-500 border-slate-100 cursor-not-allowed' : 'border-transparent'}`}
              placeholder="Full Name"
              value={formData.memberName}
              onChange={(e) => setFormData({...formData, memberName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Number *</label>
              <input
                type="text"
                required
                readOnly={isLocked}
                className={`w-full p-4 bg-slate-50 border-2 rounded-2xl focus:border-emerald-600 focus:bg-white outline-none transition-all font-bold ${isLocked ? 'text-slate-500 border-slate-100 cursor-not-allowed' : 'border-transparent'}`}
                placeholder="KT/STF/..."
                value={formData.fileNumber}
                onChange={(e) => setFormData({...formData, fileNumber: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₦) *</label>
              <input
                type="number"
                inputMode="decimal"
                required
                min="1"
                step="any"
                autoFocus={isLocked}
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-600 focus:bg-white outline-none font-bold transition-all shadow-inner"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opening Bal (₦)</label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                className="w-full p-4 bg-slate-100/50 border-2 border-transparent rounded-2xl focus:border-emerald-600 focus:bg-white outline-none font-bold transition-all"
                placeholder="0.00"
                value={formData.previousPayment}
                onChange={(e) => setFormData({...formData, previousPayment: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Date *</label>
              <input
                type="date"
                required
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-600 focus:bg-white outline-none font-bold transition-all shadow-inner"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Category</label>
            <div className="relative">
              <select
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-600 focus:bg-white outline-none font-bold appearance-none transition-all cursor-pointer shadow-inner"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Monthly Contribution">Monthly Contribution</option>
                <option value="Direct Credit">Direct Credit</option>
                <option value="Credited from Camp">Credited from Camp</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {formData.category === 'Credited from Camp' ? 'Camp Detail (Mandatory)' : 'Administrative Notes'}
            </label>
            <textarea
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-600 focus:bg-white outline-none transition-all h-24 resize-none font-medium text-sm shadow-inner"
              placeholder={formData.category === 'Credited from Camp' ? "e.g. Katsina 2024 Batch A" : "Optional details..."}
              required={formData.category === 'Credited from Camp'}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-6 flex flex-col-reverse md:flex-row space-y-3 space-y-reverse md:space-y-0 md:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-4 md:py-3 border-2 border-slate-100 rounded-2xl text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-colors active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full px-6 py-4 md:py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-100"
            >
              {editingRecord ? 'Update Entry' : 'Post to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;
