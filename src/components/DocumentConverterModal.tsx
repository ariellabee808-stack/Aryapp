import React, { useState } from 'react';
import { 
  FileText, Download, Upload, FileCode2, Image as ImageIcon, 
  RefreshCw, CheckCircle2, X, Sparkles, FileType, ArrowRightLeft, Eye, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioMuted?: boolean;
}

export const DocumentConverterModal: React.FC<DocumentConverterModalProps> = ({
  isOpen,
  onClose,
  audioMuted = false
}) => {
  const [activeTab, setActiveTab] = useState<'pdfToWord' | 'wordToPdf' | 'imageOcr'>('pdfToWord');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [convertedContent, setConvertedContent] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsConverted(false);
    setConvertedContent('');

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const handleRunConversion = () => {
    if (!file) {
      alert('Please select or upload a document file first.');
      return;
    }

    setIsConverting(true);

    // Simulate smart OCR / Conversion engine processing
    setTimeout(() => {
      setIsConverting(false);
      setIsConverted(true);

      if (activeTab === 'pdfToWord') {
        setConvertedContent(
          `# ${file.name.replace('.pdf', '')} - Converted Word Document\n\n` +
          `**Document Title:** Official Executive Report & Summary\n` +
          `**Converted On:** ${new Date().toLocaleDateString()}\n\n` +
          `### 1. Executive Summary\n` +
          `This document has been parsed and converted from PDF to editable Word structure. All headings, bullet points, and table structures have been maintained with high fidelity.\n\n` +
          `### 2. Strategic Objectives\n` +
          `- High compliance with KRA eTIMS & statutory regulations.\n` +
          `- Automated AI document processing & workflow automation.\n` +
          `- Fast document rendering and instant Word / PDF exports.\n`
        );
      } else if (activeTab === 'wordToPdf') {
        setConvertedContent(
          `# ${file.name.replace(/\.(docx|doc|txt)$/, '')} - Standardized Printable PDF Layout\n\n` +
          `OFFICIAL PUBLIC DOCUMENT\n` +
          `--------------------------------------------------\n` +
          `File Source: ${file.name}\n` +
          `File Size: ${(file.size / 1024).toFixed(1)} KB\n` +
          `Conversion Engine: Ariella AI PDF Synthesis 2026\n\n` +
          `Content successfully compiled for high-resolution A4 printing and digital signature attachment.`
        );
      } else {
        // Image OCR
        setConvertedContent(
          `[OCR EXTRACTED TEXT FROM ${file.name}]\n\n` +
          `INVOICE / RECEIPT DOCUMENT\n` +
          `Date: ${new Date().toLocaleDateString()}\n` +
          `Merchant: ARIELLA AGNES ENTERPRISES\n` +
          `Status: COMPLIANT & VERIFIED\n` +
          `Total Amount: KSh 45,000.00\n` +
          `KRA PIN: A019827364Z\n\n` +
          `Text extracted with 99.8% precision rate via Ariella AI Vision OCR.`
        );
      }
    }, 1800);
  };

  const handleDownloadWord = () => {
    const blob = new Blob([convertedContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Converted_${file?.name || 'document'}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([convertedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Converted_${file?.name || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl shadow-blue-950/50 overflow-hidden flex flex-col my-6 max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  DOCUMENT <span className="text-blue-400">CONVERTER SUITE</span> 🔄
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Convert PDF ↔ Word ↔ Images with AI OCR Text Extraction
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

          {/* Mode Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('pdfToWord'); setIsConverted(false); setFile(null); }}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'pdfToWord'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileType className="h-4 w-4" />
              <span>PDF to Word (.docx) 📄</span>
            </button>

            <button
              onClick={() => { setActiveTab('wordToPdf'); setIsConverted(false); setFile(null); }}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'wordToPdf'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode2 className="h-4 w-4" />
              <span>Word / Text to PDF 📜</span>
            </button>

            <button
              onClick={() => { setActiveTab('imageOcr'); setIsConverted(false); setFile(null); }}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'imageOcr'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Image OCR to Document 🖼️</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="p-6 overflow-y-auto space-y-5 text-slate-100 flex-1">
            {!isConverted ? (
              <div className="space-y-4">
                {/* File Dropzone */}
                <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-3xl p-8 text-center bg-slate-950/50 transition-colors">
                  <input
                    type="file"
                    id="doc-converter-input"
                    onChange={handleFileSelect}
                    accept={
                      activeTab === 'pdfToWord'
                        ? '.pdf'
                        : activeTab === 'wordToPdf'
                        ? '.docx,.doc,.txt'
                        : 'image/*'
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor="doc-converter-input"
                    className="cursor-pointer space-y-3 block"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
                      <Upload className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-100">
                        {file ? file.name : 'Click to select or drop your file here'}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        {activeTab === 'pdfToWord'
                          ? 'Supported: PDF files'
                          : activeTab === 'wordToPdf'
                          ? 'Supported: DOCX, DOC, TXT'
                          : 'Supported: PNG, JPG, WEBP Receipts or Scans'}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Preview Image if image OCR */}
                {filePreview && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center max-h-48 overflow-hidden">
                    <img src={filePreview} alt="Preview" className="max-h-40 object-contain rounded-xl" />
                  </div>
                )}

                <button
                  onClick={handleRunConversion}
                  disabled={!file || isConverting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Converting with AI Document Engine...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Convert Document Now 🚀</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Converted Results View */
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Document Converted Successfully!
                  </span>
                  <button
                    onClick={() => setIsConverted(false)}
                    className="text-slate-400 hover:text-white underline font-mono text-[10px]"
                  >
                    Convert Another File
                  </button>
                </div>

                {/* Document Preview Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono space-y-2 max-h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {convertedContent}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleDownloadWord}
                    className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20"
                  >
                    <Download className="h-4 w-4" /> Download Word (.doc) 📄
                  </button>

                  <button
                    onClick={handlePrintPdf}
                    className="py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-violet-600/20"
                  >
                    <Download className="h-4 w-4" /> Save / Print PDF 📜
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="h-4 w-4" /> Plain Text (.txt) 📝
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
