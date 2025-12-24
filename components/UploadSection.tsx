
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    
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
    reader.onerror = () => {
      setErrorMessage("System error: Could not read the selected file.");
    };
    reader.readAsDataURL(file);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileData(null);
    setTextInput('');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processBatch = async () => {
    if (!textInput && !fileData) {
      setErrorMessage("Please select a file or paste text data first.");
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      const results = await parseContributionList(
        textInput, 
        fileData ? { data: fileData.data, mimeType: fileData.type } : undefined
      );
      
      if (!results || results.length === 0) {
        setErrorMessage("The system processed the data but found no valid member records. Please check the document format.");
      } else {
        onAddContributions(results);
        setFileData(null);
        setTextInput('');
        alert(`Success! Audited and imported ${results.length} contribution records.`);
      }
    } catch (error: any) {
      console.error("Batch Processing Failed:", error);
      setErrorMessage(error.message || "An unexpected error occurred during processing. Please ensure the file contains valid ledger data.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = () => {
    if (!fileData) return null;
    if (fileData.type.includes('image')) return null;
    if (fileData.type.includes('pdf')) return <i className="fa-solid fa-file-pdf text-5xl text-red-500"></i>;
    if (fileData.type.includes('csv')) return <i className="fa-solid fa-file-csv text-5xl text-emerald-600"></i>;
    return <i className="fa-solid fa-file-lines text-5xl text-slate-400"></i>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-20">
      <header className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Intelligent Ledger Processing</h1>
        <p className="text-slate-500 text-sm mt-1">Upload PDF reports, bank statements, or CSV exports for automated member auditing.</p>
      </header>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start space-x-3 text-red-700 animate-fadeIn">
          <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
          <div className="flex-1">
            <p className="font-bold text-sm">Processing Failure</p>
            <p className="text-xs opacity-90 mt-1">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600 transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold mb-2">
            <i className="fa-solid fa-keyboard text-emerald-600"></i>
            <label className="text-xs uppercase tracking-widest text-slate-400">Manual Text Input</label>
          </div>
          <textarea
            className="w-full h-64 p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-600 outline-none resize-none text-xs font-mono"
            placeholder="Paste text records from emails, Excel, or WhatsApp groups..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold mb-2">
            <i className="fa-solid fa-file-arrow-up text-emerald-600"></i>
            <label className="text-xs uppercase tracking-widest text-slate-400">Digital Document</label>
          </div>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-64 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center hover:bg-slate-50 cursor-pointer transition-all overflow-hidden group relative"
          >
            {fileData ? (
              <div className="flex flex-col items-center p-4 w-full h-full justify-center bg-slate-50">
                {fileData.type.includes('image') ? (
                  <img src={fileData.data} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <div className="text-center">
                    {getFileIcon()}
                    <p className="mt-4 font-black text-slate-800 text-sm truncate max-w-[200px]">{fileData.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{(fileData.type || 'Document').split('/')[1]}</p>
                  </div>
                )}
                
                <button 
                  onClick={clearSelection}
                  className="absolute top-6 right-6 bg-red-500 text-white w-10 h-10 rounded-full shadow-xl flex items-center justify-center hover:bg-red-600 transition-all active:scale-90"
                >
                  <i className="fa-solid fa-trash-can text-sm"></i>
                </button>
              </div>
            ) : (
              <div className="text-center p-8 group-hover:scale-105 transition-transform">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl"></i>
                </div>
                <p className="text-slate-900 font-black text-sm">Select Document</p>
                <p className="text-slate-400 text-[11px] mt-2">PDF, Images, or CSV Exports</p>
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

      <div className="flex justify-center pt-6">
        <button
          onClick={processBatch}
          disabled={isProcessing || (!textInput && !fileData)}
          className={`group px-20 py-5 rounded-[2.5rem] font-black text-white shadow-2xl transition-all flex items-center space-x-4 ${
            isProcessing 
            ? 'bg-slate-400 cursor-not-allowed scale-95 opacity-80' 
            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200/50 active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing Documents...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
              <span>Initiate Batch Import</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-start space-x-5 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-inner">
            <i className="fa-solid fa-magnifying-glass-chart"></i>
          </div>
          <div>
            <h4 className="text-slate-900 font-black text-xs mb-1 uppercase tracking-widest">Visual Recognition</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
              System scans images and PDFs to detect table headers and member names even if handwriting is present.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-start space-x-5 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-inner">
            <i className="fa-solid fa-shield-check"></i>
          </div>
          <div>
            <h4 className="text-slate-900 font-black text-xs mb-1 uppercase tracking-widest">Audit Validation</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
              Every row is validated against the society's financial rules to ensure amounts and dates are logically consistent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
