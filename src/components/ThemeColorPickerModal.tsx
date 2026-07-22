import React, { useState } from 'react';
import { 
  Palette, Check, X, RefreshCw, Sparkles, 
  Sun, Moon, Shield, Sliders, Contrast
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customBgColor: string;
  onChangeBgColor: (color: string) => void;
  theme: 'midnight' | 'cyber';
  onToggleTheme: (theme: 'midnight' | 'cyber') => void;
}

export const PRESET_BG_COLORS = [
  { name: 'Midnight Dark (Default)', hex: '#020617', desc: 'Classic deep slate' },
  { name: 'Cyber Blue Neon', hex: '#080d1a', desc: 'Electric high-tech navy' },
  { name: 'Deep Emerald Green', hex: '#021811', desc: 'Kenyan forest & eTIMS green' },
  { name: 'Royal Purple', hex: '#0f0728', desc: 'Vibrant Ariella signature theme' },
  { name: 'Crimson Dusk', hex: '#1a050b', desc: 'Warm ruby atmosphere' },
  { name: 'Ocean Abyssal', hex: '#031124', desc: 'Soothing oceanic sapphire' },
  { name: 'Warm Mocha Coffee', hex: '#180e0a', desc: 'Eye-safe warm mocha' },
  { name: 'OLED Pure Black', hex: '#000000', desc: 'Maximum contrast battery saver' },
  { name: 'Titanium Graphite', hex: '#111827', desc: 'Sleek industrial slate' },
];

export const ThemeColorPickerModal: React.FC<ThemeColorPickerModalProps> = ({
  isOpen,
  onClose,
  customBgColor,
  onChangeBgColor,
  theme,
  onToggleTheme
}) => {
  const [selectedHex, setSelectedHex] = useState(customBgColor || '#020617');

  const handleSelectColor = (hex: string) => {
    setSelectedHex(hex);
    onChangeBgColor(hex);
  };

  const handleResetToDefault = () => {
    const defaultColor = '#020617';
    setSelectedHex(defaultColor);
    onChangeBgColor(defaultColor);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-slate-900 border border-violet-500/40 rounded-3xl shadow-2xl shadow-violet-950/70 overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  CUSTOM BACKGROUND COLOR & THEME 🎨
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Personalize App Background Color & Visual Ambiance
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

          {/* Modal Body */}
          <div className="p-6 space-y-6 text-slate-100">
            
            {/* Custom Color Input Picker */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-400 font-mono uppercase flex items-center gap-1.5">
                  <Sliders className="h-4 w-4" /> Custom Color Picker
                </span>
                <button
                  onClick={handleResetToDefault}
                  className="text-xs text-slate-400 hover:text-white underline font-mono cursor-pointer"
                >
                  Reset Default
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <input
                    type="color"
                    value={selectedHex}
                    onChange={(e) => handleSelectColor(e.target.value)}
                    className="w-14 h-14 rounded-2xl border-2 border-violet-500/50 cursor-pointer bg-transparent p-0 overflow-hidden shadow-inner"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <label className="block text-[11px] text-slate-400 font-mono">Hex Color Code:</label>
                  <input
                    type="text"
                    value={selectedHex}
                    onChange={(e) => handleSelectColor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-violet-300 font-bold uppercase focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5 uppercase">
                <Sparkles className="h-4 w-4 text-cyan-400" /> Choose Preset Palette
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_BG_COLORS.map((preset) => {
                  const isSelected = selectedHex.toLowerCase() === preset.hex.toLowerCase();
                  return (
                    <button
                      key={preset.hex}
                      onClick={() => handleSelectColor(preset.hex)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-violet-400 bg-violet-950/40 ring-2 ring-violet-500/50 shadow-lg'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="w-6 h-6 rounded-full border border-white/20 shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{preset.hex}</span>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-100 truncate">{preset.name}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{preset.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cyber / Slate Theme Mode Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200">UI Accent Theme Mode</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Toggle between Cyber Neon glow or Slate Minimalist</p>
              </div>

              <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                <button
                  onClick={() => onToggleTheme('midnight')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    theme === 'midnight'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SLATE
                </button>

                <button
                  onClick={() => onToggleTheme('cyber')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    theme === 'cyber'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  CYBER NEON
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
