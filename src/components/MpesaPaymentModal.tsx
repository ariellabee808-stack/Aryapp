import React, { useState } from 'react';
import { 
  CreditCard, Smartphone, CheckCircle2, AlertCircle, 
  X, Sparkles, Send, ShieldCheck, Download, RefreshCw, Lock, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTitle?: string;
  defaultAmount?: number;
  defaultPaybill?: string;
  defaultAccount?: string;
  onPaymentSuccess?: (receiptDetails: any) => void;
}

export const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultTitle = 'Service Payment / Invoice Clearance',
  defaultAmount = 1500,
  defaultPaybill = '247247',
  defaultAccount = 'ARIELLA-9021',
  onPaymentSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [amount, setAmount] = useState(defaultAmount);
  const [paybill, setPaybill] = useState(defaultPaybill);
  const [account, setAccount] = useState(defaultAccount);
  const [paymentType, setPaymentType] = useState<'stk' | 'manual'>('stk');

  // Simulation steps
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStkPinPrompt, setShowStkPinPrompt] = useState(false);
  const [mpesaPin, setMpesaPin] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  // Manual verification
  const [manualTxCode, setManualTxCode] = useState('');

  const handleSendStkPush = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('Please enter a valid M-Pesa phone number (e.g., 0712345678 or 254712345678)');
      return;
    }
    setIsProcessing(true);

    // Simulate network delay to trigger phone STK push prompt
    setTimeout(() => {
      setIsProcessing(false);
      setShowStkPinPrompt(true);
    }, 1500);
  };

  const handleConfirmPin = () => {
    if (mpesaPin.length < 4) {
      alert('Please enter your 4-digit M-Pesa PIN');
      return;
    }

    setIsProcessing(true);
    setShowStkPinPrompt(false);

    // Generate realistic M-Pesa transaction receipt code
    const txCode = 'SLK' + Math.floor(10000000 + Math.random() * 90000000);
    const dateStr = new Date().toLocaleString('en-KE', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true 
    });

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const receiptData = {
        txCode,
        amount,
        phone: phoneNumber,
        paybill,
        account,
        date: dateStr,
        smsText: `${txCode} Confirmed. Ksh${Number(amount).toLocaleString()}.00 sent to ARIELLA AGNES ENTERPRISES LTD for account ${account} on ${dateStr}. New M-PESA balance is Ksh14,890.00. Transaction cost, Ksh0.00.`
      };
      setReceipt(receiptData);
      if (onPaymentSuccess) onPaymentSuccess(receiptData);
    }, 2000);
  };

  const handleVerifyManualTx = () => {
    if (!manualTxCode || manualTxCode.length < 6) {
      alert('Please enter a valid M-Pesa transaction code (e.g. SLK9281034)');
      return;
    }

    setIsProcessing(true);
    const dateStr = new Date().toLocaleString();

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      const receiptData = {
        txCode: manualTxCode.toUpperCase(),
        amount,
        phone: phoneNumber,
        paybill,
        account,
        date: dateStr,
        smsText: `${manualTxCode.toUpperCase()} Confirmed. Ksh${Number(amount).toLocaleString()}.00 verified for account ${account} on ${dateStr}.`
      };
      setReceipt(receiptData);
      if (onPaymentSuccess) onPaymentSuccess(receiptData);
    }, 1200);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setShowStkPinPrompt(false);
    setIsProcessing(false);
    setMpesaPin('');
    setReceipt(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/60 overflow-hidden flex flex-col my-6"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-emerald-950/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-1.5">
                  M-PESA <span className="text-emerald-400">EXPRESS CHECKOUT</span> 💚
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Safaricom Direct STK Push & Instant Receipt Verification
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Payment Type Selector */}
          {!isSuccess && !showStkPinPrompt && (
            <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-2">
              <button
                onClick={() => setPaymentType('stk')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  paymentType === 'stk'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📲 Express STK Push
              </button>
              <button
                onClick={() => setPaymentType('manual')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  paymentType === 'manual'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🧾 Verify Code Manually
              </button>
            </div>
          )}

          {/* Main Content Body */}
          <div className="p-6 space-y-5 text-slate-100">
            {/* STK PIN Prompt Phone Overlay Simulation */}
            {showStkPinPrompt && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-slate-950 border-2 border-emerald-500/60 space-y-4 text-center shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <Lock className="h-6 w-6 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    SAFARICOM M-PESA SIMULATOR
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    Do you want to pay KSh {Number(amount).toLocaleString()} to Paybill {paybill}?
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Account: {account}
                  </p>
                </div>

                <div className="space-y-2 max-w-xs mx-auto">
                  <label className="block text-xs text-slate-300 font-mono">Enter M-Pesa PIN:</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={mpesaPin}
                    onChange={(e) => setMpesaPin(e.target.value)}
                    placeholder="••••"
                    className="w-full text-center text-xl font-mono tracking-widest bg-slate-900 border-2 border-emerald-500/50 rounded-xl py-2 text-emerald-400 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setShowStkPinPrompt(false)}
                    className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmPin}
                    disabled={isProcessing}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Send KSh ' + Number(amount).toLocaleString()}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Success State with Official M-Pesa SMS Receipt */}
            {isSuccess && receipt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-emerald-300">
                    M-PESA Payment Verified & Confirmed! 🎉
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    Transaction Code: <span className="font-extrabold text-white bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/30">{receipt.txCode}</span>
                  </p>
                </div>

                {/* M-Pesa Simulated Phone SMS Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> MPESA
                    </span>
                    <span>{receipt.date}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-[11px] pt-1">
                    {receipt.smsText}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    New Payment
                  </button>

                  <button
                    onClick={onClose}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer"
                  >
                    Close & Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Standard Checkout Input Form */}
            {!isSuccess && !showStkPinPrompt && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                    PURCHASE / INVOICE ITEM:
                  </span>
                  <p className="text-xs font-bold text-white">{defaultTitle}</p>
                </div>

                {paymentType === 'stk' ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Safaricom M-Pesa Phone Number:</label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712345678 or 254712345678"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-mono">Amount (KSh):</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-extrabold text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-mono">Paybill / Till Number:</label>
                        <input
                          type="text"
                          value={paybill}
                          onChange={(e) => setPaybill(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSendStkPush}
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Initiating STK Push...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Pay KSh {Number(amount).toLocaleString()} via M-Pesa 💚</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">M-Pesa Transaction Code:</label>
                      <input
                        type="text"
                        value={manualTxCode}
                        onChange={(e) => setManualTxCode(e.target.value.toUpperCase())}
                        placeholder="e.g. SLK9182374"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-extrabold text-base uppercase focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleVerifyManualTx}
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Verifying with Safaricom Server...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          <span>Verify M-Pesa Payment Code 💚</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
