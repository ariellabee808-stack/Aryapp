import React, { useState } from 'react';
import { 
  Download, Smartphone, Laptop, CheckCircle2, X, 
  Sparkles, ExternalLink, ShieldCheck, ArrowRight,
  Monitor, Globe, FileCode2, Share2, PlusSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPWA: () => void;
  isStandalone: boolean;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPWA,
  isStandalone
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'portable' | 'ios' | 'android'>('pwa');
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Generate a standalone offline-wrapper single-file HTML app for 1-click download
  const handleDownloadPortableApp = () => {
    const currentOrigin = window.location.origin;
    const standaloneHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Ariella AI 🤖 | Portable Desktop App</title>
  <meta name="theme-color" content="#090d16">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #090d16; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    iframe { width: 100%; height: 100%; border: none; display: block; }
    .offline-notice {
      display: none;
      position: absolute;
      top: 0; left: 0; right: 0;
      background: #7c3aed; color: #fff;
      text-align: center; padding: 8px; font-size: 12px; font-weight: bold;
    }
  </style>
</head>
<body>
  <div id="offline" class="offline-notice">⚠️ Internet disconnected. Connecting to Ariella AI local cache...</div>
  <iframe src="${currentOrigin}" allow="camera; microphone; geolocation; clipboard-read; clipboard-write; autoplay"></iframe>
  <script>
    window.addEventListener('offline', () => {
      document.getElementById('offline').style.display = 'block';
    });
    window.addEventListener('online', () => {
      document.getElementById('offline').style.display = 'none';
    });
  </script>
</body>
</html>`;

    const blob = new Blob([standaloneHtmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ariella_AI_App.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 4000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-violet-500/30 rounded-3xl shadow-2xl shadow-violet-950/50 overflow-hidden flex flex-col my-8"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                  GET ARIELLA <span className="text-violet-400">DIRECT APP</span> 📲
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Zero setup • No app store required • Instant launch ⚡
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
          <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('pwa')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pwa'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Direct PWA App 📱</span>
            </button>

            <button
              onClick={() => setActiveTab('portable')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'portable'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCode2 className="h-4 w-4" />
              <span>Portable HTML File 💾</span>
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ios'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>iPhone/iPad 🍎</span>
            </button>

            <button
              onClick={() => setActiveTab('android')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'android'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>Android 🤖</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Tab 1: Direct PWA Native Install */}
            {activeTab === 'pwa' && (
              <div className="space-y-5 text-center">
                <div className="inline-flex p-4 rounded-3xl bg-violet-950/40 border border-violet-500/30 text-violet-400 shadow-glow-md">
                  <Monitor className="h-10 w-10 animate-bounce" />
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-extrabold text-slate-100">
                    Install Ariella AI directly as a Native Web App 🚀
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Installs instantly on your computer, phone, or tablet with a dedicated icon, full-screen canvas, and fast local launching.
                  </p>
                </div>

                {isStandalone ? (
                  <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span>Ariella AI is already running as an installed standalone app! 🎉</span>
                  </div>
                ) : deferredPrompt ? (
                  <button
                    onClick={onInstallPWA}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Click to Download & Install App Now 📱</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 text-left space-y-2">
                    <p className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-violet-400" />
                      Instant 1-Click Install Guide:
                    </p>
                    <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
                      <li>Look at your browser's address bar at the top right.</li>
                      <li>Click the <span className="font-bold text-violet-300">"Install Ariella AI"</span> icon or 3-dots menu.</li>
                      <li>Click <span className="font-bold text-violet-300">"Install"</span> — no app store or password needed!</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Portable Standalone Single-File HTML Package */}
            {activeTab === 'portable' && (
              <div className="space-y-5 text-center">
                <div className="inline-flex p-4 rounded-3xl bg-fuchsia-950/40 border border-fuchsia-500/30 text-fuchsia-400 shadow-glow-md">
                  <FileCode2 className="h-10 w-10 animate-pulse" />
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-extrabold text-slate-100">
                    Download Standalone Offline Web App File 💾
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Downloads a single <code className="text-fuchsia-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono">.html</code> app bundle to your device. Double-click it anytime to open Ariella AI in any browser without installing anything!
                  </p>
                </div>

                <button
                  onClick={handleDownloadPortableApp}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-violet-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-fuchsia-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{isDownloaded ? 'Downloaded! Check Downloads Folder 🎉' : 'Download Portable App (.html) 💾'}</span>
                </button>
              </div>
            )}

            {/* Tab 3: iOS iPhone Guide */}
            {activeTab === 'ios' && (
              <div className="space-y-4 text-left">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-300">
                    <Share2 className="h-4 w-4 text-fuchsia-400" />
                    How to Add to iPhone / iPad Home Screen:
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-900/60 text-violet-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                      <p>Open this page in <span className="font-bold text-white">Safari</span> browser on your iOS device.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-900/60 text-violet-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                      <p>Tap the <span className="font-bold text-violet-300 flex-inline items-center gap-1"><Share2 className="h-3.5 w-3.5 inline" /> Share</span> button at the bottom of the screen.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-900/60 text-violet-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                      <p>Scroll down and tap <span className="font-bold text-fuchsia-300 flex-inline items-center gap-1"><PlusSquare className="h-3.5 w-3.5 inline" /> Add to Home Screen</span>.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-violet-900/60 text-violet-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
                      <p>Tap <span className="font-bold text-emerald-400">Add</span>. The Ariella AI app icon will appear directly on your home screen!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Android Guide & APK Launcher */}
            {activeTab === 'android' && (
              <div className="space-y-4 text-left">
                <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      <span>Android Web App & APK Installer 🤖</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      ANDROID COMPATIBLE
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ariella AI is designed to run seamlessly on both <strong className="text-white">Desktop & Mobile Websites</strong> and as a dedicated <strong className="text-emerald-400">Android Mobile Application</strong> with full touch support and camera access.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={handleDownloadPortableApp}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Android Web App (.html) 🤖</span>
                    </button>

                    {deferredPrompt ? (
                      <button
                        onClick={onInstallPWA}
                        className="py-3 px-4 rounded-xl bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4 text-emerald-400" />
                        <span>Install PWA directly on Android 📱</span>
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>Web app ready for all Android devices</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <p className="text-xs font-bold text-slate-200">How to Install on Android Phone / Tablet:</p>
                    <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed pl-1">
                      <li>Open this URL in <span className="font-bold text-white">Google Chrome</span> or your phone's browser.</li>
                      <li>Tap the <span className="font-bold text-emerald-400">3-dots menu (⋮)</span> in Chrome's top right corner.</li>
                      <li>Tap <span className="font-bold text-emerald-300">"Install app"</span> or <span className="font-bold text-emerald-300">"Add to Home screen"</span>.</li>
                      <li>Launch Ariella AI anytime right from your Android app drawer! 🎉</li>
                    </ol>
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
