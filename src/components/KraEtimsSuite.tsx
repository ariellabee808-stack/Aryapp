import React, { useState } from 'react';
import { 
  FileText, ShieldCheck, Download, Printer, Copy, Check, 
  Building2, Receipt, ArrowRight, QrCode, Calculator, 
  X, Sparkles, CreditCard, Send, Lock, DollarSign, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KraEtimsSuiteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMpesaPayment?: (invoiceDetails: { title: string; amount: number; paybill: string; account: string }) => void;
}

export const KraEtimsSuite: React.FC<KraEtimsSuiteProps> = ({
  isOpen,
  onClose,
  onOpenMpesaPayment
}) => {
  const [activeTab, setActiveTab] = useState<'etims' | 'pin' | 'returns'>('etims');
  const [copied, setCopied] = useState(false);

  // eTIMS Invoice State
  const [invoiceNumber, setInvoiceNumber] = useState('ETIMS-' + Math.floor(100000 + Math.random() * 900000));
  const [sellerName, setSellerName] = useState('ARIELLA AGNES ENTERPRISES LTD');
  const [sellerPin, setSellerPin] = useState('A019827364Z');
  const [buyerName, setBuyerName] = useState('SAFARICOM PLC');
  const [buyerPin, setBuyerPin] = useState('P051123456K');
  const [cuSerialNumber, setCuSerialNumber] = useState('KRA-CU-0982348123');
  const [cuControlCode, setCuControlCode] = useState('4A9F-9102-88B1-72C0');
  
  // Line items for eTIMS Invoice
  const [items, setItems] = useState([
    { description: 'AI Software Consulting Services', qty: 1, unitPrice: 25000 },
    { description: 'eTIMS System Integration & Support', qty: 1, unitPrice: 15000 }
  ]);

  // KRA PIN Certificate State
  const [pinName, setPinName] = useState('ARIELLA AGNES OKEMWA');
  const [pinNumber, setPinNumber] = useState('A019827364Z');
  const [pinType, setPinType] = useState('Individual');
  const [taxObligations, setTaxObligations] = useState('Income Tax - Resident, VAT, PAYE');
  const [iTaxStatus, setITaxStatus] = useState('Active & Compliant');

  // KRA Return Summary State
  const [returnPeriod, setReturnPeriod] = useState('Jan 2026 - Dec 2026');
  const [taxObligationReturn, setTaxObligationReturn] = useState('Income Tax Resident Individual');
  const [receiptNo, setReceiptNo] = useState('KRA' + Math.floor(1000000000 + Math.random() * 900000000));

  // Item management
  const addItem = () => {
    setItems([...items, { description: 'New Service / Product Item', qty: 1, unitPrice: 5000 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  // Tax calculations (VAT 16% in Kenya)
  const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unitPrice)), 0);
  const vatAmount = subtotal * 0.16;
  const grandTotal = subtotal + vatAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl shadow-emerald-950/50 overflow-hidden flex flex-col my-6 max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-600 text-white shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                  KRA & eTIMS <span className="text-emerald-400">DOCUMENT STUDIO</span> 🇰🇪
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Official Kenya Revenue Authority Compliant eTIMS Invoices, PINs & Returns
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('etims')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'etims'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span>eTIMS Tax Invoice 🧾</span>
            </button>

            <button
              onClick={() => setActiveTab('pin')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'pin'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>KRA PIN Certificate 🪪</span>
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'returns'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>KRA Return Summary 📄</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-100">
            {/* TAB 1: eTIMS VAT Tax Invoice */}
            {activeTab === 'etims' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Controls / Form Panel */}
                <div className="lg:col-span-5 space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5" /> eTIMS Invoice Details
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Invoice Number:</label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Seller Name & PIN:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={sellerName}
                          onChange={(e) => setSellerName(e.target.value)}
                          placeholder="Seller Name"
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 text-xs"
                        />
                        <input
                          type="text"
                          value={sellerPin}
                          onChange={(e) => setSellerPin(e.target.value)}
                          placeholder="KRA PIN (e.g. A019283...)"
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 font-mono uppercase text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Buyer Name & PIN:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          placeholder="Buyer Name"
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 text-xs"
                        />
                        <input
                          type="text"
                          value={buyerPin}
                          onChange={(e) => setBuyerPin(e.target.value)}
                          placeholder="Buyer KRA PIN"
                          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500 font-mono uppercase text-xs"
                        />
                      </div>
                    </div>

                    {/* Items Section */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-slate-400 font-mono">Itemized Products/Services:</label>
                        <button
                          onClick={addItem}
                          className="text-[10px] text-emerald-400 hover:underline font-mono"
                        >
                          + Add Item
                        </button>
                      </div>

                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {items.map((item, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateItem(idx, 'description', e.target.value)}
                              className="flex-1 bg-transparent text-xs text-slate-100 focus:outline-none"
                              placeholder="Description"
                            />
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                              className="w-12 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs text-center font-mono"
                              placeholder="Qty"
                            />
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                              className="w-20 bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-xs text-right font-mono"
                              placeholder="Price"
                            />
                            {items.length > 1 && (
                              <button
                                onClick={() => removeItem(idx)}
                                className="text-slate-500 hover:text-rose-400 p-1 text-xs"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {onOpenMpesaPayment && (
                    <button
                      onClick={() => onOpenMpesaPayment({
                        title: `KRA eTIMS Tax Invoice #${invoiceNumber}`,
                        amount: grandTotal,
                        paybill: '247247',
                        account: invoiceNumber
                      })}
                      className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Pay KSh {grandTotal.toLocaleString()} via M-Pesa 💚</span>
                    </button>
                  )}
                </div>

                {/* Right Print Preview Document Panel */}
                <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl p-6 shadow-2xl font-sans relative flex flex-col justify-between print:m-0 print:p-0">
                  <div className="space-y-4">
                    {/* Header Banner */}
                    <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                            KRA
                          </div>
                          <div>
                            <h1 className="text-base font-black tracking-tight text-emerald-950 uppercase">
                              KENYA REVENUE AUTHORITY
                            </h1>
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                              eTIMS TAX INVOICE (VAT REGISTERED)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded text-[10px] font-mono font-bold">
                          ORIGINAL INVOICE
                        </span>
                        <p className="text-xs font-mono font-bold text-slate-800 mt-1">#{invoiceNumber}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Supplier and Customer Details */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">SUPPLIER / ISSUER:</p>
                        <p className="font-extrabold text-slate-900">{sellerName}</p>
                        <p className="font-mono text-slate-700">KRA PIN: <span className="font-bold">{sellerPin}</span></p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">BUYER / CUSTOMER:</p>
                        <p className="font-extrabold text-slate-900">{buyerName}</p>
                        <p className="font-mono text-slate-700">KRA PIN: <span className="font-bold">{buyerPin}</span></p>
                      </div>
                    </div>

                    {/* Table of Items */}
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-200 bg-slate-100 text-slate-700 font-mono text-[10px] uppercase">
                          <th className="py-2 px-2">Item Description</th>
                          <th className="py-2 px-2 text-center">Qty</th>
                          <th className="py-2 px-2 text-right">Unit Price (KSh)</th>
                          <th className="py-2 px-2 text-right">Total (KSh)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {items.map((item, idx) => (
                          <tr key={idx} className="text-slate-800">
                            <td className="py-2 px-2 font-medium">{item.description}</td>
                            <td className="py-2 px-2 text-center font-mono">{item.qty}</td>
                            <td className="py-2 px-2 text-right font-mono">{Number(item.unitPrice).toLocaleString()}</td>
                            <td className="py-2 px-2 text-right font-mono font-bold">{(item.qty * item.unitPrice).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="flex justify-end pt-2 border-t border-slate-200">
                      <div className="w-1/2 space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-slate-600">
                          <span>Taxable Amount (A):</span>
                          <span>KSh {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>VAT (16% Rate):</span>
                          <span>KSh {vatAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t-2 border-slate-900 pt-1">
                          <span>GRAND TOTAL:</span>
                          <span>KSh {grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* KRA eTIMS Verification Footer */}
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-xl flex items-center justify-between text-[10px] font-mono border border-slate-800">
                      <div className="space-y-1">
                        <p className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> eTIMS CONTROL ACKNOWLEDGEMENT
                        </p>
                        <p className="text-slate-300">CU Serial: <span className="font-bold text-white">{cuSerialNumber}</span></p>
                        <p className="text-slate-300">Control Code: <span className="font-bold text-white">{cuControlCode}</span></p>
                      </div>

                      <div className="bg-white p-1 rounded shadow flex items-center justify-center">
                        <QrCode className="h-10 w-10 text-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="h-4 w-4" /> Print / Save as PDF
                    </button>

                    <button
                      onClick={() => handleCopyText(`eTIMS Invoice #${invoiceNumber}\nSupplier: ${sellerName} (PIN: ${sellerPin})\nBuyer: ${buyerName}\nTotal: KSh ${grandTotal.toLocaleString()}\nCU Serial: ${cuSerialNumber}`)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy Summary'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: KRA PIN Certificate */}
            {activeTab === 'pin' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Taxpayer Full Name:</label>
                    <input
                      type="text"
                      value={pinName}
                      onChange={(e) => setPinName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">KRA PIN Number:</label>
                    <input
                      type="text"
                      value={pinNumber}
                      onChange={(e) => setPinNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                {/* PIN Certificate View */}
                <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-2xl space-y-6 font-sans relative border-4 border-emerald-600">
                  <div className="text-center space-y-1 border-b-2 border-emerald-600 pb-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center mx-auto text-lg shadow-md">
                      KRA
                    </div>
                    <h1 className="text-lg font-black tracking-wider text-emerald-950 uppercase">
                      KENYA REVENUE AUTHORITY
                    </h1>
                    <p className="text-xs font-bold text-emerald-800 tracking-widest uppercase">
                      ISO 9001:2015 CERTIFIED CERTIFICATE OF REGISTRATION (PIN)
                    </p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-500 font-mono">THIS IS TO CERTIFY THAT:</p>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{pinName}</h2>
                    <p className="text-xs text-slate-600 font-mono">
                      HAS BEEN REGISTERED WITH THE KENYA REVENUE AUTHORITY UNDER PIN:
                    </p>
                    <p className="text-2xl font-mono font-black text-emerald-700 tracking-widest bg-emerald-50 py-2 border border-emerald-200 rounded-xl max-w-xs mx-auto">
                      {pinNumber}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-b border-slate-200 py-4 font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">TAXPAYER CATEGORY:</span>
                      <span className="font-bold text-slate-800">{pinType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">iTAX STATUS:</span>
                      <span className="font-bold text-emerald-700">{iTaxStatus}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">REGISTERED TAX OBLIGATIONS:</span>
                      <span className="font-bold text-slate-800">{taxObligations}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <p>Generated via Ariella AI eTax Engine • Valid for iTax System Verification</p>
                    <p>Issue Date: {new Date().toLocaleDateString()}</p>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handlePrint}
                      className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Printer className="h-4 w-4" /> Download / Print KRA PIN Certificate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: KRA Return Summary */}
            {activeTab === 'returns' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Return Period:</label>
                      <input
                        type="text"
                        value={returnPeriod}
                        onChange={(e) => setReturnPeriod(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Receipt Acknowledgement No:</label>
                      <input
                        type="text"
                        value={receiptNo}
                        onChange={(e) => setReceiptNo(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Return Certificate View */}
                <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl space-y-4 font-sans border-t-8 border-emerald-600">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                        KRA
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-emerald-950 uppercase">iTAX RETURN RECEIPT</h3>
                        <p className="text-[10px] text-slate-500 font-mono">OFFICIAL KENYA REVENUE AUTHORITY ACKNOWLEDGEMENT</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      SUCCESSFULLY FILED
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p><span className="text-slate-500">Taxpayer Name:</span> <strong className="text-slate-900">{pinName}</strong></p>
                    <p><span className="text-slate-500">KRA PIN:</span> <strong className="text-slate-900">{pinNumber}</strong></p>
                    <p><span className="text-slate-500">Tax Obligation:</span> <strong className="text-slate-900">{taxObligationReturn}</strong></p>
                    <p><span className="text-slate-500">Return Period:</span> <strong className="text-slate-900">{returnPeriod}</strong></p>
                    <p><span className="text-slate-500">Acknowledgement No:</span> <strong className="text-emerald-700 font-bold">{receiptNo}</strong></p>
                  </div>

                  <div className="text-[10px] text-slate-500 italic text-center">
                    This document serves as proof of electronic submission to the Kenya Revenue Authority iTax platform.
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handlePrint}
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Printer className="h-4 w-4" /> Print Return Receipt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
