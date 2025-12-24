import React from 'react';
import { Contribution } from '../types';

interface ShareReceiptProps {
  transaction: Contribution;
  allContributions: Contribution[];
}

const ShareReceipt: React.FC<ShareReceiptProps> = ({ transaction, allContributions }) => {
  // Calculate historical data for this specific member up to this transaction's date
  const memberHistory = allContributions
    .filter(c => c.fileNumber === transaction.fileNumber)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentIdx = memberHistory.findIndex(c => c.id === transaction.id);
  
  // If we have a manual previous payment recorded, use it, otherwise calculate from history
  const previousTotal = transaction.previousPayment !== undefined && transaction.previousPayment !== 0
    ? transaction.previousPayment 
    : memberHistory
        .slice(0, currentIdx)
        .reduce((sum, c) => sum + c.amount, 0);
  
  const totalAfter = previousTotal + transaction.amount;

  const receiptContent = `
*NYSC KATSINA STAFF COOP*
----------------------------
*RECEIPT OF CONTRIBUTION*
Name: ${transaction.memberName}
File No: ${transaction.fileNumber}
Date: ${transaction.date}
Category: ${transaction.category}

Prev. Balance: ₦${previousTotal.toLocaleString()}
*Current Pmt: ₦${transaction.amount.toLocaleString()}*
*Total Balance: ₦${totalAfter.toLocaleString()}*
----------------------------
Thank you for your contribution.
  `.trim();

  const shareViaWhatsApp = () => {
    const encodedText = encodeURIComponent(receiptContent);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const downloadReceipt = () => {
    // Basic browser print approach
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.fileNumber}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
            .receipt { border: 2px solid #15803d; padding: 20px; max-width: 400px; margin: auto; }
            .header { text-align: center; color: #15803d; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; }
            .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; color: #15803d; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h3>NYSC KATSINA STAFF COOP</h3>
              <p>Official Payment Receipt</p>
            </div>
            <div class="row"><span>Date:</span> <span>${transaction.date}</span></div>
            <div class="row"><span>Name:</span> <span>${transaction.memberName}</span></div>
            <div class="row"><span>File No:</span> <span>${transaction.fileNumber}</span></div>
            <div class="row"><span>Category:</span> <span>${transaction.category}</span></div>
            <div class="row"><span>Prev. Balance:</span> <span>₦${previousTotal.toLocaleString()}</span></div>
            <div class="row"><span>Current Payment:</span> <span>₦${transaction.amount.toLocaleString()}</span></div>
            <div class="total row"><span>New Total:</span> <span>₦${totalAfter.toLocaleString()}</span></div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex space-x-2">
      <button 
        onClick={shareViaWhatsApp}
        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        title="Share via WhatsApp"
      >
        <i className="fa-brands fa-whatsapp text-lg"></i>
      </button>
      <button 
        onClick={downloadReceipt}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Download / Print PDF"
      >
        <i className="fa-solid fa-file-pdf text-lg"></i>
      </button>
    </div>
  );
};

export default ShareReceipt;