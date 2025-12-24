
import React, { useState, useRef } from 'react';
import { parseContributionList } from '../services/geminiService';
import { Contribution } from '../types';

interface UploadSectionProps {
  onAddContributions: (newOnes: Contribution[]) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onAddContributions }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [fileData, setFileData] = useState<{ name: string; type: string; data: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      // For CSV and plain text, we also want the raw text content
      if (file.type === 'text/csv' || file.name.endsWith('.csv') || file.type === 'text/plain') {
        const textReader = new FileReader();
        textReader.onload = () => {
          setTextInput(textReader.result as string);
        };
        textReader.readAsText(file);
      }

      reader.onloadend = () => {
        setFileData({
          name: file.name,
          type: file.type || 'application/octet-stream',
          data: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileData(null);
    setTextInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processBatch = async () => {
    if (!textInput && !fileData) return;
    
    setIsProcessing(true);
    try {
      const results = await parseContributionList(
        textInput, 
        fileData ? { data: fileData.data, mimeType: fileData.type } : undefined
      );
      
      onAddContributions(results);
      setFileData(null);
      setTextInput('');
      alert(`Successfully processed ${results.length} records! Your ledger has been updated.`);
    } catch (error) {
      console.error(error);
      alert("AI was unable to read this specific file format. Please try a clearer image, PDF, or CSV export.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = () => {
    if (!fileData) return null;
    if (fileData.type.includes('image')) return null;
    if (fileData.type.includes('pdf')) return <i className="fa-solid fa-file-pdf text-5xl text-red-500"></i>;
    if (fileData.type.includes('csv')) return <i className="fa-solid fa-file-csv text-5xl text-green-600"></i>;
    if (fileData.name.endsWith('.docx')) return <i className="fa-solid fa-file-word text-5xl text-blue-600"></i>;
    return <i className="fa-solid fa-file-lines text-5xl text-gray-400"></i>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-20">
      <header className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Batch Record Processing</h1>
        <p className="text-gray-500 text-sm mt-1">Upload PDF ledgers, CSV exports, or photos of contribution lists.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-green-700 font-bold mb-2">
            <i className="fa-solid fa-keyboard"></i>
            <label className="text-sm">Quick Paste Ledger Content</label>
          </div>
          <textarea
            className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-600 outline-none resize-none text-xs font-mono"
            placeholder="Paste text directly from Excel, PDF, or WhatsApp..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-green-700 font-bold mb-2">
            <i className="fa-solid fa-file-arrow-up"></i>
            <label className="text-sm">Upload File (PDF, CSV, PNG, DOCX)</label>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer transition-all overflow-hidden group relative"
          >
            {fileData ? (
              <div className="flex flex-col items-center p-4 w-full h-full justify-center bg-gray-50">
                {fileData.type.includes('image') ? (
                  <img src={fileData.data} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center">
                    {getFileIcon()}
                    <p className="mt-3 font-bold text-gray-700 text-sm truncate max-w-[200px]">{fileData.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{(fileData.type || 'Document').split('/')[1]}</p>
                  </div>
                )}
                
                <button 
                  onClick={clearSelection}
                  className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <i className="fa-solid fa-trash-can text-sm"></i>
                </button>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-green-50 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                </div>
                <p className="text-gray-900 font-bold text-sm">Select Document or Image</p>
                <p className="text-gray-400 text-xs mt-1">Accepts PDF, CSV, DOCX, and common Image formats</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.csv,.png,.jpg,.jpeg,.docx,text/plain" 
              onChange={handleFileUpload} 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={processBatch}
          disabled={isProcessing || (!textInput && !fileData)}
          className={`group px-12 py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center space-x-3 ${
            isProcessing 
            ? 'bg-gray-400 cursor-not-allowed scale-95' 
            : 'bg-green-700 hover:bg-green-800 hover:-translate-y-1 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin text-xl"></i>
              <span>AI Analyzing Document...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-wand-sparkles text-xl group-hover:rotate-12 transition-transform"></i>
              <span>Scan & Digitize Batch</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex items-start space-x-4">
          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-file-pdf"></i>
          </div>
          <div>
            <h4 className="text-blue-900 font-bold text-xs mb-1 uppercase tracking-wider">PDF Handling</h4>
            <p className="text-blue-700 text-[11px] leading-relaxed">
              Upload multi-page PDF reports. Our AI reads through tables to extract names, balances, and dates automatically.
            </p>
          </div>
        </div>

        <div className="bg-green-50/50 p-5 rounded-xl border border-green-100 flex items-start space-x-4">
          <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-file-csv"></i>
          </div>
          <div>
            <h4 className="text-green-900 font-bold text-xs mb-1 uppercase tracking-wider">CSV/Excel Export</h4>
            <p className="text-green-700 text-[11px] leading-relaxed">
              Drop raw CSV exports from bank apps or other systems. The AI intelligently maps messy columns to our ledger format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
