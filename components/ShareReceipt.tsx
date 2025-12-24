
import React from 'react';
import { Contribution } from '../types';

interface ShareReceiptProps {
  transaction: Contribution;
  allContributions: Contribution[];
}

const ShareReceipt: React.FC<ShareReceiptProps> = ({ transaction, allContributions }) => {
  // Get all transactions for this member, sorted by date
  const memberHistory = allContributions
    .filter(c => c.fileNumber === transaction.fileNumber)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Determine the opening balance (from the very first record of this user)
  const openingBalance = memberHistory[0]?.previousPayment || 0;

  // Calculate the final balance
  const totalContributed = memberHistory.reduce((sum, c) => sum + c.amount, 0);
  const finalBalance = openingBalance + totalContributed;

  const shareViaWhatsApp = () => {
    const receiptContent = `
*NYSC KATSINA STATE STAFF MULTI-PURPOSE COOPERATIVE SOCIETY LIMITED*
*OFFICIAL CONTRIBUTION STATEMENT*
----------------------------
Name: ${transaction.memberName}
File No: ${transaction.fileNumber}
Opening Bal: ₦${openingBalance.toLocaleString()}
Recent Pmt: ₦${transaction.amount.toLocaleString()}
*Current Total: ₦${finalBalance.toLocaleString()}*
----------------------------
Generated on ${new Date().toLocaleDateString()}
    `.trim();
    const encodedText = encodeURIComponent(receiptContent);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const downloadStatement = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate table rows for history
    let runningBalance = openingBalance;
    const tableRows = memberHistory.map(c => {
      runningBalance += c.amount;
      return `
        <tr>
          <td>${c.date}</td>
          <td>${c.category}${c.notes ? ' - ' + c.notes : ''}</td>
          <td class="amount">₦${c.amount.toLocaleString()}</td>
          <td class="amount">₦${runningBalance.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Statement - ${transaction.fileNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .statement-container { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            .header { border-bottom: 2px solid #15803d; padding-bottom: 20px; margin-bottom: 30px; }
            .org-info h1 { color: #15803d; margin: 0; font-size: 18px; text-transform: uppercase; text-align: center; }
            .org-info p { margin: 5px 0 0; font-size: 11px; color: #64748b; text-align: center; font-weight: bold; }
            
            .statement-meta-header { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; }
            .statement-title h2 { margin: 0; color: #1e293b; font-size: 16px; text-transform: uppercase; }
            .statement-title p { margin: 2px 0 0; font-size: 10px; color: #64748b; }

            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-top: 30px; margin-bottom: 30px; }
            .meta-box h4 { margin: 0 0 8px; font-size: 9px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
            .meta-box p { margin: 0; font-size: 13px; font-weight: bold; }

            .summary-cards { display: grid; grid-template-cols: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; }
            .summary-card span { display: block; font-size: 9px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
            .summary-card strong { font-size: 14px; color: #0f172a; }
            .summary-card.highlight { background: #f0fdf4; border-color: #bbf7d0; }
            .summary-card.highlight strong { color: #15803d; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
            .amount { text-align: right; font-family: monospace; font-weight: bold; }
            
            .footer { margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end; }
            .stamp-box { width: 140px; height: 90px; border: 2px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 9px; text-align: center; }
            .signature-line { border-top: 1px solid #000; width: 180px; text-align: center; font-size: 11px; padding-top: 5px; }
            
            @media print {
              body { padding: 0; }
              .statement-container { border: none; box-shadow: none; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="statement-container">
            <div class="header">
              <div class="org-info">
                <h1>NYSC KATSINA STATE STAFF MULTI-PURPOSE COOPERATIVE SOCIETY LIMITED</h1>
                <p>NYSC Secretariat, Katsina State, Nigeria</p>
              </div>
              <div class="statement-meta-header">
                <div class="statement-title">
                  <h2>Official Contribution Statement</h2>
                  <p>System Generated Report</p>
                </div>
                <div class="statement-title" style="text-align: right;">
                  <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-box">
                <h4>Member Name</h4>
                <p>${transaction.memberName}</p>
              </div>
              <div class="meta-box">
                <h4>Staff File No.</h4>
                <p>${transaction.fileNumber}</p>
              </div>
            </div>

            <div class="summary-cards">
              <div class="summary-card">
                <span>Opening Balance</span>
                <strong>₦${openingBalance.toLocaleString()}</strong>
              </div>
              <div class="summary-card">
                <span>Period Contributions</span>
                <strong>₦${totalContributed.toLocaleString()}</strong>
              </div>
              <div class="summary-card highlight">
                <span>Net Total Equity</span>
                <strong>₦${finalBalance.toLocaleString()}</strong>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Transaction Date</th>
                  <th>Description / Category</th>
                  <th class="amount">Contribution (₦)</th>
                  <th class="amount">Running Balance (₦)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>-</td>
                  <td>Initial Opening Balance</td>
                  <td class="amount">₦${openingBalance.toLocaleString()}</td>
                  <td class="amount">₦${openingBalance.toLocaleString()}</td>
                </tr>
                ${tableRows}
              </tbody>
            </table>

            <div class="footer">
              <div class="stamp-box">
                OFFICIAL SOCIETY STAMP<br>HERE
              </div>
              <div>
                <div class="signature-line">Cooperative Secretary</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
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
        title="Share Quick Receipt"
      >
        <i className="fa-brands fa-whatsapp text-lg"></i>
      </button>
      <button 
        onClick={downloadStatement}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Print Official Society Statement"
      >
        <i className="fa-solid fa-file-invoice text-lg"></i>
      </button>
    </div>
  );
};

export default ShareReceipt;
