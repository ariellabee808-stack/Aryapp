import React, { useState } from 'react';
import { 
  FileText, Download, Printer, Copy, Check, Sparkles, 
  Send, X, Building2, UserCheck, Briefcase, FileSignature, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfessionalDocumentStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMpesaPayment?: (invoiceDetails: { title: string; amount: number; paybill: string; account: string }) => void;
}

export const ProfessionalDocumentStudio: React.FC<ProfessionalDocumentStudioProps> = ({
  isOpen,
  onClose,
  onOpenMpesaPayment
}) => {
  const [docType, setDocType] = useState<'coverLetter' | 'businessLetter' | 'contract' | 'employment'>('coverLetter');
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [senderName, setSenderName] = useState('Ariella Agnes Okemwa');
  const [senderTitle, setSenderTitle] = useState('Senior AI Systems Engineer');
  const [recipientName, setRecipientName] = useState('Hiring Manager / Executive Committee');
  const [companyName, setCompanyName] = useState('Safaricom Innovation Hub');
  const [jobTitle, setJobTitle] = useState('Lead AI Solutions Architect');
  const [salutation, setSalutation] = useState('Dear Hiring Manager,');

  const [bodyText, setBodyText] = useState(
    'I am writing to express my enthusiastic interest in the Lead AI Solutions Architect position. With extensive experience in architecting scalable Gemini multi-agent workflows, full-stack React systems, and eTIMS tax compliance integrations, I have proven my capability to deliver cutting-edge software solutions.\n\nThroughout my career, I have consistently driven technical excellence by bridging complex backend engineering with elegant user-facing experiences. I look forward to contributing my expertise to your engineering teams.'
  );

  const handleAiPolish = () => {
    setBodyText(
      `Dear ${recipientName},\n\nI am writing to formally present my qualifications for the ${jobTitle} role at ${companyName}. As a technology specialist committed to technical mastery and operational efficiency, I specialize in full-stack architecture, Gemini AI integration, and eTIMS/KRA compliance frameworks.\n\nMy approach combines rigorous mathematical precision with user-centered interface design. I am confident that my skills in system integration and automated workflow design will immediately add strategic value to ${companyName}.\n\nThank you for your consideration. I look forward to scheduling a formal discussion at your earliest convenience.`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    const fullDocumentContent = `${senderName}\n${senderTitle}\n${new Date().toLocaleDateString()}\n\n${recipientName}\n${companyName}\n\n${salutation}\n\n${bodyText}\n\nSincerely,\n${senderName}`;
    const blob = new Blob([fullDocumentContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType}_${senderName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-950/50 overflow-hidden flex flex-col my-6 max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20">
                <FileSignature className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                  PROFESSIONAL <span className="text-violet-400">LETTER & DOCUMENT STUDIO</span> 📄
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Create Cover Letters, Official Contracts & Business Letters with AI Polish
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 overflow-x-auto">
            <button
              onClick={() => setDocType('coverLetter')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                docType === 'coverLetter'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Cover Letter 💼</span>
            </button>

            <button
              onClick={() => setDocType('businessLetter')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                docType === 'businessLetter'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Official Business Letter 🏢</span>
            </button>

            <button
              onClick={() => setDocType('contract')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                docType === 'contract'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSignature className="h-4 w-4" />
              <span>Service Contract / Agreement 📜</span>
            </button>

            <button
              onClick={() => setDocType('employment')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                docType === 'employment'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Employment Offer Letter 👔</span>
            </button>
          </div>

          {/* Main Workspace */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Controls */}
              <div className="lg:col-span-5 space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-violet-400 font-mono uppercase">Document Fields</h3>
                  <button
                    onClick={handleAiPolish}
                    className="text-[10px] text-fuchsia-400 hover:text-fuchsia-300 font-bold flex items-center gap-1 bg-fuchsia-950/40 px-2 py-1 rounded border border-fuchsia-500/30 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" /> Polish with AI ✨
                  </button>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Your Full Name:</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Your Professional Title:</label>
                  <input
                    type="text"
                    value={senderTitle}
                    onChange={(e) => setSenderTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Recipient & Company:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Recipient"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Document Content Body:</label>
                  <textarea
                    rows={8}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 leading-relaxed font-sans focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Printable Preview */}
              <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl p-8 shadow-2xl font-serif relative flex flex-col justify-between space-y-6 border border-slate-200">
                <div className="space-y-4">
                  {/* Sender Header */}
                  <div className="border-b-2 border-slate-900 pb-4">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{senderName}</h1>
                    <p className="text-xs font-sans text-slate-600">{senderTitle}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>

                  {/* Recipient Header */}
                  <div className="text-xs font-sans space-y-0.5 text-slate-800">
                    <p className="font-bold">{recipientName}</p>
                    <p className="text-slate-600">{companyName}</p>
                  </div>

                  {/* Subject Line */}
                  <div className="text-xs font-sans font-bold text-slate-900 uppercase tracking-wider border-l-4 border-violet-600 pl-3 py-1">
                    RE: APPLICATION / OFFICIAL DOCUMENT FOR {jobTitle.toUpperCase()}
                  </div>

                  {/* Main Letter Body */}
                  <div className="text-xs font-sans leading-relaxed text-slate-800 whitespace-pre-wrap space-y-3">
                    <p>{salutation}</p>
                    <p>{bodyText}</p>
                  </div>

                  {/* Sign-off */}
                  <div className="pt-6 font-sans text-xs space-y-8">
                    <p>Sincerely,</p>
                    <div>
                      <div className="font-serif italic text-base text-violet-900 border-b w-48 pb-1 border-slate-400">
                        {senderName}
                      </div>
                      <p className="font-bold text-slate-900 text-[11px] mt-1">{senderName}</p>
                      <p className="text-slate-500 text-[10px]">{senderTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Print & Export Actions */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Printer className="h-4 w-4" /> Print / Save PDF 📜
                  </button>

                  <button
                    onClick={handleDownloadWord}
                    className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-violet-600/30"
                  >
                    <Download className="h-4 w-4" /> Download Word (.doc) 📄
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
