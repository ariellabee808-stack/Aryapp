import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Key, Smartphone, QrCode, CheckCircle2, 
  X, RefreshCw, Copy, Check, Eye, EyeOff, ShieldAlert, 
  Terminal, Cpu, Sparkles, Fingerprint, Shield, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isE2EEEnabled: boolean;
  onToggleE2EE: (enabled: boolean) => void;
  is2FAEnabled: boolean;
  onToggle2FA: (enabled: boolean) => void;
  audioMuted?: boolean;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  isE2EEEnabled,
  onToggleE2EE,
  is2FAEnabled,
  onToggle2FA,
  audioMuted = false
}) => {
  const [activeTab, setActiveTab] = useState<'e2ee' | '2fa' | 'audit'>('e2ee');
  
  // 2FA Setup State
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [is2faVerifying, setIs2faVerifying] = useState(false);
  const [is2faVerifiedSuccess, setIs2faVerifiedSuccess] = useState(is2FAEnabled);
  const [phoneNumber, setPhoneNumber] = useState('+254 712 345 678');
  const [smsSent, setSmsSent] = useState(false);
  const [smsCodeInput, setSmsCodeInput] = useState('');
  
  // E2EE Key Pair State
  const [keyFingerprint, setKeyFingerprint] = useState('8F92-E3C1-4B90-9021-A71D-33C4');
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Backup codes
  const [backupCodes] = useState([
    '8901-2345-6789',
    '1234-5678-9012',
    '3456-7890-1234',
    '5678-9012-3456',
    '7890-1234-5678'
  ]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  const handleTotpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newArr = [...totpCode];
    newArr[index] = val;
    setTotpCode(newArr);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`totp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify2FA = () => {
    setIs2faVerifying(true);
    setTimeout(() => {
      setIs2faVerifying(false);
      setIs2faVerifiedSuccess(true);
      onToggle2FA(true);
    }, 1200);
  };

  const handleRegenerateKeys = () => {
    setIsGeneratingKeys(true);
    setTimeout(() => {
      const hex = () => Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
      setKeyFingerprint(`${hex()}-${hex()}-${hex()}-${hex()}-${hex()}-${hex()}`);
      setIsGeneratingKeys(false);
    }, 1000);
  };

  const handleCopyFingerprint = () => {
    navigator.clipboard.writeText(keyFingerprint);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/60 overflow-hidden flex flex-col my-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                  SECURITY & PRIVACY HUB <span className="text-emerald-400">E2EE + 2FA</span> 🛡️
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Zero-Knowledge End-to-End Encryption & Two-Factor Verification
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
          <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
            <button
              onClick={() => setActiveTab('e2ee')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'e2ee'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>End-to-End Encryption (E2EE) 🔐</span>
            </button>

            <button
              onClick={() => setActiveTab('2fa')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === '2fa'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Two-Factor Auth (2FA) 📲</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fingerprint className="h-4 w-4" />
              <span>Security Logs 📜</span>
            </button>
          </div>

          {/* Workspace Body */}
          <div className="p-6 space-y-6 text-slate-100 max-h-[75vh] overflow-y-auto">
            
            {/* TAB 1: E2EE */}
            {activeTab === 'e2ee' && (
              <div className="space-y-6">
                
                {/* E2EE Toggle Banner */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                        AES-256-GCM Zero-Knowledge Encryption
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Messages, KRA receipts, Passports, and M-Pesa transactions are encrypted client-side.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleE2EE(!isE2EEEnabled)}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
                      isE2EEEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isE2EEEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Encryption Key & Fingerprint Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1.5">
                      <Key className="h-4 w-4" /> Client RSA-4096 / ECC Security Key Pair
                    </span>
                    <button
                      onClick={handleRegenerateKeys}
                      disabled={isGeneratingKeys}
                      className="text-xs text-slate-400 hover:text-emerald-300 font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingKeys ? 'animate-spin text-emerald-400' : ''}`} />
                      Regenerate Key
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-mono mb-1">
                      Session Safety Fingerprint Hash:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-900 border border-slate-800 text-emerald-300 font-mono text-xs px-3 py-2 rounded-xl tracking-wider select-all">
                        {keyFingerprint}
                      </div>
                      <button
                        onClick={handleCopyFingerprint}
                        className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedKey ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">ALGORITHM:</span>
                        <span className="font-bold text-slate-200">AES-256-GCM + RSA-4096</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-emerald-400" />
                      <div>
                        <span className="text-slate-400 block text-[10px]">HANDSHAKE:</span>
                        <span className="font-bold text-slate-200">Elliptic-Curve Diffie-Hellman</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* E2EE Protections List */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Chat Vault
                    </p>
                    <p className="text-slate-400 text-[11px]">All prompt sessions are stored encrypted in memory.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Document Studio
                    </p>
                    <p className="text-slate-400 text-[11px]">Passports, KRA Tax invoices & PDFs stay local.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <p className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> M-Pesa Pin Safe
                    </p>
                    <p className="text-slate-400 text-[11px]">STK Push request payloads are signed cryptographically.</p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: TWO-FACTOR AUTHENTICATION (2FA) */}
            {activeTab === '2fa' && (
              <div className="space-y-6">
                
                {/* 2FA Status Header */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                        Two-Factor Authenticator (2FA) Status
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Require TOTP security codes before printing IDs or carrying out financial transactions.
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold font-mono border ${
                    is2FAEnabled 
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50' 
                      : 'bg-amber-950 text-amber-400 border-amber-500/50'
                  }`}>
                    {is2FAEnabled ? '2FA ACTIVE 🔒' : '2FA DISABLED ⚠️'}
                  </span>
                </div>

                {/* Authenticator Setup Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 p-5 rounded-2xl bg-slate-950 border border-slate-800">
                  
                  {/* Left QR Code Box */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-900 rounded-xl border border-slate-800 text-center space-y-3">
                    <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-lg flex items-center justify-center">
                      <QrCode className="w-full h-full text-slate-950" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Scan with Authenticator</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Google / Microsoft Authenticator</p>
                      <p className="text-[10px] text-emerald-400 font-mono mt-1 select-all font-bold">Secret: ARIELLA-SEC-9021</p>
                    </div>
                  </div>

                  {/* Right 6-Digit TOTP Verifier Form */}
                  <div className="sm:col-span-7 space-y-4 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 font-mono mb-2">
                        Enter 6-Digit Authenticator Code:
                      </label>
                      <div className="flex gap-2 justify-between">
                        {totpCode.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`totp-input-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleTotpChange(idx, e.target.value)}
                            className="w-10 h-12 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-center text-lg font-bold text-emerald-400 font-mono transition-colors"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleVerify2FA}
                      disabled={is2faVerifying}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      {is2faVerifying ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" /> Verifying Code...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Enable Two-Factor Auth 🔐
                        </>
                      )}
                    </button>

                    {/* SMS Backup Simulation */}
                    <div className="pt-3 border-t border-slate-800/80 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>SMS Verification (+254 Kenya):</span>
                        <button
                          onClick={() => setSmsSent(true)}
                          className="text-emerald-400 font-mono hover:underline"
                        >
                          {smsSent ? 'Resend SMS OTP' : 'Send SMS OTP'}
                        </button>
                      </div>
                      {smsSent && (
                        <p className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 p-2 rounded border border-emerald-500/30">
                          📲 SMS OTP Sent to {phoneNumber}: <strong className="text-white">902154</strong>
                        </p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Emergency Backup Security Keys */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
                      <Key className="h-4 w-4 text-amber-400" /> Emergency Recovery Backup Codes
                    </span>
                    <button
                      onClick={handleCopyBackupCodes}
                      className="text-xs text-slate-400 hover:text-white font-mono flex items-center gap-1"
                    >
                      {copiedCodes ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedCodes ? 'Copied' : 'Copy Codes'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                    {backupCodes.map((code, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: AUDIT LOG */}
            {activeTab === 'audit' && (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                    <Terminal className="h-4 w-4" /> Live Cryptographic Audit Stream
                  </span>

                  <div className="space-y-2 text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-between">
                      <span className="text-emerald-400">[2026-07-22 12:20:01]</span>
                      <span>AES-256 Key Exchange Initialized</span>
                      <span className="text-slate-500">ECDH OK</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-between">
                      <span className="text-emerald-400">[2026-07-22 12:20:45]</span>
                      <span>Passport Document Scanner OCR Signed</span>
                      <span className="text-slate-500">SHA-256 OK</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-between">
                      <span className="text-emerald-400">[2026-07-22 12:21:12]</span>
                      <span>M-Pesa Express API Handshake Encrypted</span>
                      <span className="text-slate-500">200 SUCCESS</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-between">
                      <span className="text-emerald-400">[2026-07-22 12:22:05]</span>
                      <span>2FA TOTP Verification Handshake</span>
                      <span className="text-emerald-400 font-bold">VERIFIED</span>
                    </div>
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
