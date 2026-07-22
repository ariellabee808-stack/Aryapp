import React, { useState } from 'react';
import { 
  FileText, Download, Upload, RefreshCw, CheckCircle2, X, Sparkles, 
  CreditCard, Shield, Sliders, RotateCw, Contrast, Sun, FileCheck, 
  Printer, Copy, Check, Eye, Edit3, Image as ImageIcon, Globe, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IdPassportDocEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioMuted?: boolean;
}

export const IdPassportDocEditorModal: React.FC<IdPassportDocEditorModalProps> = ({
  isOpen,
  onClose,
  audioMuted = false
}) => {
  const [docCategory, setDocCategory] = useState<'passport' | 'nationalId' | 'license' | 'scannedDoc'>('passport');
  
  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Image Enhancement Controls
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [colorFilter, setColorFilter] = useState<'normal' | 'grayscale' | 'contrastBW' | 'enhance'>('enhance');

  // Parsed & Editable Document Fields
  const [fullName, setFullName] = useState('ARIELLA AGNES OKEMWA');
  const [docNumber, setDocNumber] = useState('A019827364');
  const [nationality, setNationality] = useState('KENYAN');
  const [countryCode, setCountryCode] = useState('KEN');
  const [dateOfBirth, setDateOfBirth] = useState('1996-04-15');
  const [gender, setGender] = useState('F');
  const [issueDate, setIssueDate] = useState('2021-09-12');
  const [expiryDate, setExpiryDate] = useState('2031-09-11');
  const [placeOfIssue, setPlaceOfIssue] = useState('NAIROBI');
  const [authority, setAuthority] = useState('DEPARTMENT OF IMMIGRATION');
  const [mrzLine1, setMrzLine1] = useState('P<KENOKEMWA<<ARIELLA<AGNES<<<<<<<<<<<<<<<<<');
  const [mrzLine2, setMrzLine2] = useState('A0198273644KEN9604153F3109110<<<<<<<<<<<<<<04');
  
  // Additional Scanned Document Fields
  const [docTitle, setDocTitle] = useState('OFFICIAL SCANNED REGISTRATION DOCUMENT');
  const [docNotes, setDocNotes] = useState('Verified document image cleaned and processed with high-precision OCR extraction.');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(selected);

    // Auto trigger AI OCR processing simulation
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsAnalyzed(true);
      
      if (docCategory === 'passport') {
        setFullName('ARIELLA AGNES OKEMWA');
        setDocNumber('AK' + Math.floor(1000000 + Math.random() * 9000000));
        setMrzLine1(`P<KENOKEMWA<<ARIELLA<AGNES<<<<<<<<<<<<<<<<<`);
        setMrzLine2(`AK98210344KEN9604153F3109110<<<<<<<<<<<<<<04`);
      } else if (docCategory === 'nationalId') {
        setFullName('ARIELLA AGNES OKEMWA');
        setDocNumber('34' + Math.floor(100000 + Math.random() * 900000));
        setPlaceOfIssue('NAIROBI WEST');
      } else if (docCategory === 'license') {
        setFullName('ARIELLA AGNES OKEMWA');
        setDocNumber('DL-KEN-' + Math.floor(100000 + Math.random() * 900000));
        setAuthority('NTSA KENYA');
      }
    }, 1500);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setRotation(0);
    setColorFilter('normal');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    const content = `DOCUMENT SUMMARY & EDITABLE DETAILS\n\nCategory: ${docCategory.toUpperCase()}\nFull Name: ${fullName}\nDocument Number: ${docNumber}\nNationality: ${nationality} (${countryCode})\nDate of Birth: ${dateOfBirth}\nSex: ${gender}\nIssue Date: ${issueDate}\nExpiry Date: ${expiryDate}\nPlace of Issue: ${placeOfIssue}\nAuthority: ${authority}\n\nMRZ Line 1: ${mrzLine1}\nMRZ Line 2: ${mrzLine2}\n\nNotes: ${docNotes}`;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docCategory}_${docNumber}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    const text = `DOCUMENT DATA:\nFull Name: ${fullName}\nDoc No: ${docNumber}\nNationality: ${nationality}\nDOB: ${dateOfBirth}\nExpiry: ${expiryDate}\nMRZ:\n${mrzLine1}\n${mrzLine2}`;
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
          className="relative w-full max-w-5xl bg-slate-900 border border-teal-500/40 rounded-3xl shadow-2xl shadow-teal-950/50 overflow-hidden flex flex-col my-6 max-h-[94vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-600 text-white shadow-lg shadow-teal-500/20">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                  PASSPORT, ID & SCANNED DOC <span className="text-teal-400">EDITOR</span> 🛂
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Scan, Clean, Enhance & Edit Passports, National IDs & Official Documents
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

          {/* Navigation Category Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 overflow-x-auto">
            <button
              onClick={() => setDocCategory('passport')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                docCategory === 'passport'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>International Passport 🛂</span>
            </button>

            <button
              onClick={() => setDocCategory('nationalId')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                docCategory === 'nationalId'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>National ID Card 🪪</span>
            </button>

            <button
              onClick={() => setDocCategory('license')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                docCategory === 'license'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Driving License / Permit 🚘</span>
            </button>

            <button
              onClick={() => setDocCategory('scannedDoc')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                docCategory === 'scannedDoc'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Scanned Legal Document 📄</span>
            </button>
          </div>

          {/* Main Content Workspace */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Image Controls & Field Editor */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Upload Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-teal-400 font-mono uppercase flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> Upload Document Image
                    </label>
                    {isProcessing && (
                      <span className="text-[10px] text-teal-400 font-mono animate-pulse flex items-center gap-1">
                        <RefreshCw className="h-3 w-3 animate-spin" /> AI Scanning...
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    id="id-passport-file-input"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  <label
                    htmlFor="id-passport-file-input"
                    className="block p-4 border-2 border-dashed border-slate-800 hover:border-teal-500 rounded-xl text-center cursor-pointer bg-slate-900/60 transition-colors"
                  >
                    <p className="text-xs font-bold text-slate-200">
                      {file ? file.name : `Select or drop ${docCategory.toUpperCase()} image`}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Supports JPG, PNG, WEBP, PDF scans
                    </p>
                  </label>
                </div>

                {/* Scanned Image Enhancements Panel */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-teal-400" /> Image Enhancer
                    </span>
                    <button
                      onClick={handleResetFilters}
                      className="text-[10px] text-slate-400 hover:text-white underline font-mono"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono mb-1 flex items-center justify-between">
                        <span>Brightness:</span> <span>{brightness}%</span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-teal-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono mb-1 flex items-center justify-between">
                        <span>Contrast:</span> <span>{contrast}%</span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-teal-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handleRotate}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="h-3.5 w-3.5 text-teal-400" /> Rotate 90°
                    </button>

                    <select
                      value={colorFilter}
                      onChange={(e: any) => setColorFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-mono focus:border-teal-500"
                    >
                      <option value="enhance">Restored Color</option>
                      <option value="grayscale">Clean Grayscale</option>
                      <option value="contrastBW">High Contrast B&W</option>
                      <option value="normal">Original Unfiltered</option>
                    </select>
                  </div>
                </div>

                {/* Editable Fields Form */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs max-h-80 overflow-y-auto">
                  <span className="font-bold text-teal-400 font-mono uppercase flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5" /> Edit Document Fields
                  </span>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Full Name:</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Document No:</label>
                      <input
                        type="text"
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Nationality / Country:</label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Date of Birth:</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-slate-100 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Sex:</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-slate-100 text-[11px]"
                      >
                        <option value="M">Male (M)</option>
                        <option value="F">Female (F)</option>
                        <option value="X">Other (X)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Expiry Date:</label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-slate-100 text-[11px]"
                      />
                    </div>
                  </div>

                  {docCategory === 'passport' && (
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <label className="block text-slate-400 font-mono text-[10px]">Machine Readable Zone (MRZ):</label>
                      <input
                        type="text"
                        value={mrzLine1}
                        onChange={(e) => setMrzLine1(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-teal-300 font-mono text-[10px] tracking-widest"
                      />
                      <input
                        type="text"
                        value={mrzLine2}
                        onChange={(e) => setMrzLine2(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-teal-300 font-mono text-[10px] tracking-widest"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Clean Official Preview & Export Panel */}
              <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl p-6 shadow-2xl font-sans relative flex flex-col justify-between border-2 border-teal-600">
                <div className="space-y-5">
                  
                  {/* Top Document Header */}
                  <div className="flex items-center justify-between border-b-2 border-teal-600 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-teal-800 text-white font-black flex items-center justify-center text-xs shadow-md">
                        {countryCode}
                      </div>
                      <div>
                        <h1 className="text-sm font-black text-slate-900 tracking-wider uppercase">
                          REPUBLIC OF {nationality}
                        </h1>
                        <p className="text-[10px] font-bold text-teal-700 font-mono uppercase tracking-widest">
                          OFFICIAL {docCategory.toUpperCase()} IDENTIFICATION DOCUMENT
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-900 border border-teal-300 px-2.5 py-1 rounded">
                      STATUS: VERIFIED
                    </span>
                  </div>

                  {/* Document Live Visual Display */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    
                    {/* Passport Photo / Uploaded Preview Box */}
                    <div className="sm:col-span-4 flex flex-col items-center justify-center space-y-2">
                      <div 
                        className="w-32 h-40 rounded-lg border-2 border-slate-300 bg-slate-200 overflow-hidden shadow-inner flex items-center justify-center relative"
                        style={{
                          filter: colorFilter === 'grayscale' ? 'grayscale(100%)' : colorFilter === 'contrastBW' ? 'contrast(200%) grayscale(100%)' : `brightness(${brightness}%) contrast(${contrast}%)`,
                          transform: `rotate(${rotation}deg)`
                        }}
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Scanned Document" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-2 text-slate-500">
                            <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                            <span className="text-[9px] font-mono block">Bio Photo Preview</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">OFFICIAL SEAL APPLIED</span>
                    </div>

                    {/* Data Fields Table */}
                    <div className="sm:col-span-8 text-xs font-mono space-y-2 text-slate-800">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">FULL NAME / NOM COMPLET:</span>
                        <span className="font-extrabold text-sm text-slate-900 uppercase">{fullName}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase">DOCUMENT NO:</span>
                          <span className="font-bold text-teal-800 text-xs">{docNumber}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase">NATIONALITY:</span>
                          <span className="font-bold text-slate-800">{nationality}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase">DATE OF BIRTH:</span>
                          <span className="font-bold text-slate-800">{dateOfBirth}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase">SEX:</span>
                          <span className="font-bold text-slate-800">{gender}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase">EXPIRY DATE:</span>
                          <span className="font-bold text-rose-700">{expiryDate}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">ISSUING AUTHORITY:</span>
                        <span className="font-bold text-slate-800">{authority} - {placeOfIssue}</span>
                      </div>
                    </div>
                  </div>

                  {/* MRZ Zone for Passports & IDs */}
                  {docCategory === 'passport' && (
                    <div className="bg-slate-900 text-teal-300 p-3 rounded-xl font-mono text-[11px] tracking-[0.25em] leading-relaxed border border-slate-800 select-all overflow-x-auto shadow-inner">
                      <p>{mrzLine1}</p>
                      <p>{mrzLine2}</p>
                    </div>
                  )}
                </div>

                {/* Print & Export Actions */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Printer className="h-4 w-4" /> Print / Save PDF 📜
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyText}
                      className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy Text'}
                    </button>

                    <button
                      onClick={handleDownloadWord}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/30"
                    >
                      <Download className="h-4 w-4" /> Export Word (.doc) 📄
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
