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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="bg-green-800 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {editingRecord ? 'Edit Record' : prefilledData ? `Payment for ${prefilledData.name}` : 'New Record'}
          </h2>
          <button onClick={onClose} className="hover:bg-green-700 p-2 rounded-full transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Full Name *</label>
            <input
              type="text"
              required
              readOnly={isLocked}
              className={`w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all ${isLocked ? 'bg-gray-50 text-gray-500 font-semibold cursor-not-allowed' : ''}`}
              placeholder="e.g. John Doe"
              value={formData.memberName}
              onChange={(e) => setFormData({...formData, memberName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">File Number *</label>
              <input
                type="text"
                required
                readOnly={isLocked}
                className={`w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all ${isLocked ? 'bg-gray-50 text-gray-500 font-semibold cursor-not-allowed' : ''}`}
                placeholder="Staff ID / File #"
                value={formData.fileNumber}
                onChange={(e) => setFormData({...formData, fileNumber: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (₦) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                autoFocus={isLocked}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Previous Payment/Balance (₦)</label>
              <input
                type="number"
                step="any"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all bg-gray-50"
                placeholder="0.00"
                value={formData.previousPayment}
                onChange={(e) => setFormData({...formData, previousPayment: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date *</label>
              <input
                type="date"
                required
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
            <select
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none bg-white transition-all"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="Monthly Contribution">Monthly Contribution</option>
              <option value="Direct Credit">Direct Credit</option>
              <option value="Credited from Camp">Credited from Camp</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {formData.category === 'Credited from Camp' 
                ? 'Camp Details (State, Year, Batch) *' 
                : 'Notes (Optional)'}
            </label>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none transition-all h-20 resize-none"
              placeholder={formData.category === 'Credited from Camp' 
                ? "e.g. Katsina, 2024, Batch A" 
                : "Add any extra details..."}
              required={formData.category === 'Credited from Camp'}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-all active:scale-95 shadow-lg shadow-green-200"
            >
              {editingRecord ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;