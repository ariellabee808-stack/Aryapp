import React, { useEffect, useState } from 'react';
import { Sparkles, Brain, Cpu, Orbit } from 'lucide-react';
import { motion } from 'motion/react';

interface ThinkingIndicatorProps {
  engine: 'standard' | 'reasoning' | 'creative';
  steps?: string[];
}

const statusPhrases = {
  standard: [
    "Formulating response...",
    "Retrieving conceptual blocks...",
    "Refining structural delivery...",
    "Polishing response style..."
  ],
  creative: [
    "Igniting imaginative synthesizers...",
    "Parsing emotional and stylistic markers...",
    "Drafting rich expressive models...",
    "Injecting wit and vivid prose..."
  ],
  reasoning: [
    "Deconstructing problem constraints...",
    "Drafting semantic logical pathways...",
    "Querying deep relation tensors...",
    "Running multi-variate validations...",
    "Assembling unified proof structures..."
  ]
};

// Engine specific custom styling attributes
const engineThemes = {
  standard: {
    title: 'Cognitive Link',
    colorClass: 'text-sky-400',
    ringColor: 'bg-sky-500',
    glowColor: 'shadow-sky-500/50',
    borderColor: 'border-sky-500/30',
    solidColor: 'bg-sky-400',
    iconColor: 'text-sky-200'
  },
  creative: {
    title: 'Creative Core',
    colorClass: 'text-fuchsia-400',
    ringColor: 'bg-fuchsia-500',
    glowColor: 'shadow-fuchsia-500/50',
    borderColor: 'border-fuchsia-500/30',
    solidColor: 'bg-fuchsia-400',
    iconColor: 'text-fuchsia-200'
  },
  reasoning: {
    title: 'Reasoning Engine',
    colorClass: 'text-violet-400',
    ringColor: 'bg-violet-500',
    glowColor: 'shadow-violet-500/50',
    borderColor: 'border-violet-500/30',
    solidColor: 'bg-violet-400',
    iconColor: 'text-violet-200'
  }
};

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ engine, steps = [] }) => {
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const phrases = statusPhrases[engine];
  const theme = engineThemes[engine];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [phrases]);

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-violet-500/10 bg-violet-950/5/30 backdrop-blur-md max-w-2xl relative overflow-hidden">
      {/* Background ambient pulse glow */}
      <motion.div 
        className={`absolute -left-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none ${theme.ringColor}`}
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.3, 0.15]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Neural Core representation */}
      <div className="flex items-center gap-5 relative z-10">
        <div className="relative flex items-center justify-center w-14 h-14">
          
          {/* Wave ripple 1 */}
          <motion.div
            className={`absolute inset-0 rounded-full opacity-60 border ${theme.borderColor}`}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />

          {/* Wave ripple 2 (Staggered) */}
          <motion.div
            className={`absolute inset-0 rounded-full opacity-60 border ${theme.borderColor}`}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 2.4, delay: 0.8, repeat: Infinity, ease: "easeOut" }}
          />

          {/* Wave ripple 3 (Staggered further) */}
          <motion.div
            className={`absolute inset-0 rounded-full opacity-60 border ${theme.borderColor}`}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 2.4, delay: 1.6, repeat: Infinity, ease: "easeOut" }}
          />

          {/* Orbital Path & Particle */}
          <motion.div
            className={`absolute w-10 h-10 rounded-full border border-dashed border-slate-700/40`}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <span className={`absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${theme.ringColor} shadow-[0_0_8px_rgba(139,92,246,0.8)]`} />
          </motion.div>

          {/* Interactive Core breathing base */}
          <motion.div
            className={`absolute w-8 h-8 rounded-full bg-slate-950/90 border border-slate-800 flex items-center justify-center shadow-lg`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {engine === 'reasoning' ? (
              <Brain className={`h-4.5 w-4.5 ${theme.iconColor}`} />
            ) : engine === 'creative' ? (
              <Sparkles className={`h-4.5 w-4.5 ${theme.iconColor}`} />
            ) : (
              <Cpu className={`h-4.5 w-4.5 ${theme.iconColor}`} />
            )}
          </motion.div>

          {/* Central tiny high-intensity nucleus */}
          <motion.div
            className={`absolute w-2.5 h-2.5 rounded-full ${theme.solidColor} shadow-md ${theme.glowColor}`}
            animate={{ scale: [0.7, 1.4, 0.7] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="flex flex-col">
          <span className={`text-xs font-semibold uppercase tracking-widest ${theme.colorClass}`}>
            {theme.title} Active
          </span>
          <motion.span
            key={currentPhraseIdx}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="text-sm font-medium text-slate-300"
          >
            {phrases[currentPhraseIdx]}
          </motion.span>
        </div>
      </div>

      {/* Structured steps rendering */}
      {steps.length > 0 && (
        <div className="mt-2 pl-4 border-l-2 border-violet-500/20 space-y-2 relative z-10">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex items-center gap-2 text-xs font-mono text-slate-400"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-glow animate-pulse" />
              <span>{step}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
