import React from 'react';
import { 
  Sparkles, Brain, Cpu, MessageSquare, ArrowRight, Compass, Video, Wand2, Smartphone,
  ShieldCheck, CreditCard, ArrowRightLeft, FileSignature, FileCheck, Lock, Palette, PhoneCall
} from 'lucide-react';
import { IntelligenceEngine } from '../types';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  selectedEngine: IntelligenceEngine;
  onSelectEngine: (engine: IntelligenceEngine) => void;
  searchEnabled: boolean;
  onToggleSearch: () => void;
  onOpenVideoStudio?: () => void;
  onOpenAppDownload?: () => void;
  onOpenKraEtims?: () => void;
  onOpenMpesa?: () => void;
  onOpenConverter?: () => void;
  onOpenDocStudio?: () => void;
  onOpenIdPassportEditor?: () => void;
  onOpenSecurity?: () => void;
  onOpenThemePicker?: () => void;
  onOpenCall?: () => void;
}

const samplePrompts = [
  {
    category: 'AI Video Generation',
    title: 'Generate Cyberpunk City Video 🎬',
    prompt: 'Can you generate a cinematic 4k video of a futuristic neon cyberpunk metropolis with flying vehicles and rain reflections?',
    icon: Video,
    color: 'text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-950/10'
  },
  {
    category: 'Quantum Computing',
    title: 'Explain Quantum Teleportation',
    prompt: 'Can you provide a deeply intuitive, technically rigorous explanation of Quantum Teleportation and state-transfer protocols, using clear analogies?',
    icon: Compass,
    color: 'text-violet-400 border-violet-500/20 bg-violet-950/10'
  },
  {
    category: 'Algorithm Refinement',
    title: 'Optimize Async Queue Process',
    prompt: 'Implement a highly robust, concurrent Task Queue in TypeScript that supports priority weighting, backoff retry limits, and active pool size throttling.',
    icon: Cpu,
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/10'
  },
  {
    category: 'Creative Synthesis',
    title: 'Write a Dystopian Cyber-Fable',
    prompt: 'Write an elegant, atmospheric short story about a sentient clockwork librarian tasked with archiving human memories in a post-biological digital void.',
    icon: Sparkles,
    color: 'text-sky-400 border-sky-500/20 bg-sky-950/10'
  }
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  selectedEngine,
  onSelectEngine,
  searchEnabled,
  onToggleSearch,
  onOpenVideoStudio,
  onOpenAppDownload,
  onOpenKraEtims,
  onOpenMpesa,
  onOpenConverter,
  onOpenDocStudio,
  onOpenIdPassportEditor,
  onOpenSecurity,
  onOpenThemePicker,
  onOpenCall
}) => {
  return (
    <div className="flex flex-col max-w-4xl mx-auto py-8 px-4 space-y-10">
      {/* Visual Identity Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center relative p-1 mb-2">
          {/* Animated pulsing gradient background rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-xl opacity-30 animate-pulse" />
          <div className="relative flex items-center justify-center bg-slate-950 border border-slate-800 rounded-full w-20 h-20 shadow-2xl">
            <Brain className="h-10 w-10 text-violet-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-200 via-slate-100 to-fuchsia-200">
            ARIELLA <span className="text-violet-400">AI</span>
          </h1>
          <p className="text-sm font-semibold tracking-wide text-violet-300 mt-1 flex items-center justify-center gap-1.5">
            ✨ Created by <span className="text-violet-400 font-bold">Ariella Agnes</span> 🎨
          </p>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            A high-fidelity cognitive companion engineered with multi-modal synthesis, AI video rendering, real-time web grounding, and an adaptive logic core designed to exceed standard conversational models.
          </p>
        </div>
      </div>

      {/* AI Video Studio Featured Hero Banner */}
      {onOpenVideoStudio && (
        <div className="relative rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-fuchsia-950/20 to-slate-900/60 p-6 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-fuchsia-600/20 transition-all duration-500 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold font-mono">
                <Video className="h-3.5 w-3.5 animate-pulse" /> NEW: VEO 3.1 AI VIDEO GENERATOR 🎬
              </div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">
                Create High-Definition AI Videos & Cinematic Animations 🎥
              </h2>
              <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                Transform prompts or starting image frames into 720p/1080p MP4 videos with custom aspect ratios, cinematic lighting, and fluid motion.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
              <button
                onClick={onOpenVideoStudio}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-violet-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wand2 className="h-4 w-4" />
                <span>Launch Video Studio 🎬</span>
              </button>

              {onOpenAppDownload && (
                <button
                  onClick={onOpenAppDownload}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-950 border border-violet-500/40 hover:border-violet-400 text-violet-200 hover:text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:bg-violet-950/40 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="h-4 w-4 text-violet-400 animate-bounce" />
                  <span>Get Direct App 📲</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Special Kenya & Business Document Tools Suite */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 font-mono">
          <ShieldCheck className="h-4 w-4" />
          KRA, eTIMS, M-Pesa & Professional Document Tools 🇰🇪
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {onOpenKraEtims && (
            <button
              onClick={onOpenKraEtims}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 text-left space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-100 group-hover:text-emerald-300">KRA & eTIMS 🧾</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">VAT Invoices & PINs</p>
              </div>
            </button>
          )}

          {onOpenMpesa && (
            <button
              onClick={onOpenMpesa}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 text-left space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-100 group-hover:text-emerald-300">M-Pesa Payments 💚</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">STK Push & Receipts</p>
              </div>
            </button>
          )}

          {onOpenConverter && (
            <button
              onClick={onOpenConverter}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-950/20 text-left space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-500/40 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-100 group-hover:text-blue-300">Doc Converter 🔄</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">PDF ↔ Word ↔ Image</p>
              </div>
            </button>
          )}

          {onOpenDocStudio && (
            <button
              onClick={onOpenDocStudio}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-violet-500/30 hover:border-violet-400 hover:bg-violet-950/20 text-left space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-950 border border-violet-500/40 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSignature className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-100 group-hover:text-violet-300">Official Letters 📄</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">Cover Letters & Contracts</p>
              </div>
            </button>
          )}

          {onOpenIdPassportEditor && (
            <button
              onClick={onOpenIdPassportEditor}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-teal-500/30 hover:border-teal-400 hover:bg-teal-950/20 text-left space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-500/40 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-100 group-hover:text-teal-300">Passport & ID 🛂</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">Passports, IDs & Scans</p>
              </div>
            </button>
          )}

          {onOpenSecurity && (
            <button
              onClick={onOpenSecurity}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-950/20 text-left space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-100 group-hover:text-emerald-300">E2EE & 2FA 🔒</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">Security & Encryption</p>
              </div>
            </button>
          )}

          {onOpenThemePicker && (
            <button
              onClick={onOpenThemePicker}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-fuchsia-500/30 hover:border-fuchsia-400 hover:bg-fuchsia-950/20 text-left space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-fuchsia-950 border border-fuchsia-500/40 text-fuchsia-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-100 group-hover:text-fuchsia-300">BG Color 🎨</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">Custom Background Choice</p>
              </div>
            </button>
          )}

          {onOpenCall && (
            <button
              onClick={onOpenCall}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/20 text-left space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PhoneCall className="h-4 w-4 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-100 group-hover:text-cyan-300">Voice Call 📞</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">Real-Time Speech Call</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Cognitive Engines / Config Matrix */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-violet-400" />
          Select Cognitive Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Standard Engine */}
          <button
            onClick={() => onSelectEngine('standard')}
            className={`flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
              selectedEngine === 'standard'
                ? 'border-sky-500/50 bg-sky-950/10 shadow-lg shadow-sky-500/5'
                : 'border-slate-800/80 bg-slate-900/20 hover:border-slate-700/60 hover:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Cpu className="h-5 w-5" />
              </div>
              {selectedEngine === 'standard' && (
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-100 group-hover:text-sky-300 transition-colors">Turbo Core</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Standard rapid-synthesis matrix optimized for real-time conversation and quick queries.
            </p>
          </button>

          {/* Reasoning Engine */}
          <button
            onClick={() => onSelectEngine('reasoning')}
            className={`flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
              selectedEngine === 'reasoning'
                ? 'border-violet-500/50 bg-violet-950/10 shadow-lg shadow-violet-500/5'
                : 'border-slate-800/80 bg-slate-900/20 hover:border-slate-700/60 hover:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Brain className="h-5 w-5 animate-pulse" />
              </div>
              {selectedEngine === 'reasoning' && (
                <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-100 group-hover:text-violet-300 transition-colors">Deep Reasoning</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Forces real-time step-by-step thinking, mathematical formulation, and systematic code planning.
            </p>
          </button>

          {/* Creative Core */}
          <button
            onClick={() => onSelectEngine('creative')}
            className={`flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
              selectedEngine === 'creative'
                ? 'border-fuchsia-500/50 bg-fuchsia-950/10 shadow-lg shadow-fuchsia-500/5'
                : 'border-slate-800/80 bg-slate-900/20 hover:border-slate-700/60 hover:bg-slate-900/40'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-3">
              <div className="p-2 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400">
                <Sparkles className="h-5 w-5" />
              </div>
              {selectedEngine === 'creative' && (
                <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-100 group-hover:text-fuchsia-300 transition-colors">Creative Spark</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Expands temperature threshold for original concepts, witty prose, and speculative architectures.
            </p>
          </button>
        </div>
      </div>

      {/* Google Search Grounding toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950/50 gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200">Real-Time Search Grounding</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
              Integrates the Google Search index to verify facts, fetch up-to-date documentation, and cite sources.
            </p>
          </div>
        </div>
        <button
          onClick={onToggleSearch}
          className={`px-4 py-2 rounded-xl border text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 flex-shrink-0 ${
            searchEnabled
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${searchEnabled ? 'bg-emerald-400 shadow-glow animate-pulse' : 'bg-slate-500'}`} />
          {searchEnabled ? 'Grounding Enabled' : 'Enable Grounding'}
        </button>
      </div>

      {/* High-Intellect Prompts Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-violet-400" />
          High-Intellect Prompt Vectors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {samplePrompts.map((prompt, idx) => {
            const Icon = prompt.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt(prompt.prompt)}
                className="flex flex-col text-left p-4 rounded-xl border border-slate-800/80 bg-slate-900/10 hover:border-violet-500/30 hover:bg-slate-900/30 transition-all group duration-300 relative overflow-hidden"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`p-1.5 rounded-lg border ${prompt.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {prompt.category}
                  </span>
                </div>
                <h3 className="font-bold text-slate-200 text-sm group-hover:text-violet-400 transition-colors">
                  {prompt.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {prompt.prompt}
                </p>
                <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400">
                  <ArrowRight className="h-4 w-4 transform translate-x-[-4px] group-hover:translate-x-0 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Developer Badge Footer */}
      <div className="text-center pt-8 border-t border-slate-900/60 text-[11px] font-mono text-slate-400">
        <span>✨ Created by Ariella Agnes • All cognitive pathways configured 🚀</span>
      </div>
    </div>
  );
};
