import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Sparkles, Cpu, Send, Globe, RefreshCw, 
  AlertTriangle, Menu, X, ChevronDown, ChevronUp, 
  Volume2, VolumeX, Clock, Terminal, ShieldAlert,
  Mic, MicOff, Paperclip, Trash2, Eye, Play, Palette,
  Mail, Download, FileText, FileJson, Video, Reply, CornerDownRight, Quote, Smartphone,
  ShieldCheck, CreditCard, ArrowRightLeft, FileSignature, FileCheck, Lock, PhoneCall, Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ThinkingIndicator } from './components/ThinkingIndicator';
import { GroundingSources } from './components/GroundingSources';
import { FormattedText } from './components/FormattedText';
import { GmailSuite } from './components/GmailSuite';
import { VideoStudio } from './components/VideoStudio';
import { AppDownloadModal } from './components/AppDownloadModal';
import { KraEtimsSuite } from './components/KraEtimsSuite';
import { MpesaPaymentModal } from './components/MpesaPaymentModal';
import { DocumentConverterModal } from './components/DocumentConverterModal';
import { ProfessionalDocumentStudio } from './components/ProfessionalDocumentStudio';
import { IdPassportDocEditorModal } from './components/IdPassportDocEditorModal';
import { SecurityModal } from './components/SecurityModal';
import { ThemeColorPickerModal } from './components/ThemeColorPickerModal';
import { AiCallModal } from './components/AiCallModal';
import { Message, ChatSession, IntelligenceEngine, Attachment } from './types';
import { exportChatAsMarkdown, exportChatAsJson } from './lib/exportUtils';

// Web Audio API synthesizer for premium UI auditory feedback
const playSound = (type: 'send' | 'success' | 'click' | 'error', mute: boolean) => {
  if (mute) return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(698.46, now + 0.08); // F5
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.start(now);
      osc.stop(now + 0.02);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (err) {
    console.warn('AudioContext not initialized or blocked', err);
  }
};

const compressImageAndGetBase64 = (file: File): Promise<{ base64: string; preview: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      if (!file.type.startsWith('image/')) {
        const commaIndex = dataUrl.indexOf(',');
        const base64 = commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
        resolve({ base64, preview: dataUrl });
        return;
      }

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          const commaIndex = compressedDataUrl.indexOf(',');
          const base64 = commaIndex !== -1 ? compressedDataUrl.substring(commaIndex + 1) : compressedDataUrl;
          resolve({ base64, preview: compressedDataUrl });
        } else {
          const commaIndex = dataUrl.indexOf(',');
          const base64 = commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
          resolve({ base64, preview: dataUrl });
        }
      };
      img.onerror = () => {
        const commaIndex = dataUrl.indexOf(',');
        const base64 = commaIndex !== -1 ? dataUrl.substring(commaIndex + 1) : dataUrl;
        resolve({ base64, preview: dataUrl });
      };
    };
    reader.onerror = () => {
      resolve({ base64: '', preview: '' });
    };
  });
};

export default function App() {
  // Persistence Loading
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('ariella_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return localStorage.getItem('ariella_active_session_id');
  });

  // Theme state
  const [theme, setTheme] = useState<'midnight' | 'cyber'>(() => {
    const saved = localStorage.getItem('ariella_theme');
    return (saved === 'midnight' || saved === 'cyber') ? saved : 'midnight';
  });

  useEffect(() => {
    localStorage.setItem('ariella_theme', theme);
  }, [theme]);

  // Custom Background Color state
  const [customBgColor, setCustomBgColor] = useState<string>(() => {
    return localStorage.getItem('ariella_bg_color') || '#020617';
  });

  useEffect(() => {
    localStorage.setItem('ariella_bg_color', customBgColor);
  }, [customBgColor]);

  // 16:9 Full HD Aspect Ratio state
  const [is16x9FullHD, setIs16x9FullHD] = useState<boolean>(() => {
    const saved = localStorage.getItem('ariella_16x9_fhd');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('ariella_16x9_fhd', String(is16x9FullHD));
  }, [is16x9FullHD]);

  // UI state
  const [inputMessage, setInputMessage] = useState('');
  const [currentEngine, setCurrentEngine] = useState<IntelligenceEngine>('standard');
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [audioMuted, setAudioMuted] = useState(true); // Mute by default to respect user
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [expandedReasoningMap, setExpandedReasoningMap] = useState<Record<string, boolean>>({});
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  const [isKraEtimsOpen, setIsKraEtimsOpen] = useState(false);
  const [isMpesaOpen, setIsMpesaOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [isDocStudioOpen, setIsDocStudioOpen] = useState(false);
  const [isIdPassportOpen, setIsIdPassportOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isE2EEEnabled, setIsE2EEEnabled] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [mpesaPaymentConfig, setMpesaPaymentConfig] = useState<any>(null);

  const handleOpenMpesaWithDetails = (invoiceDetails: { title: string; amount: number; paybill: string; account: string }) => {
    setMpesaPaymentConfig(invoiceDetails);
    setIsMpesaOpen(true);
  };
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed standalone app
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsStandalone(true);
      setDeferredPrompt(null);
    }
  };

  const handleInsertVideoToChat = (videoUrl: string, prompt: string) => {
    if (!activeSession) return;
    playSound('success', audioMuted);

    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      role: 'assistant',
      content: `🎬 **AI Video Render Completed!**\n\n**Prompt:** *"${prompt}"*\n\nHere is your generated video rendered with Veo 3.1:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      videoUrl
    };

    setSessions(prev => prev.map(s => s.id === activeSession.id ? {
      ...s,
      messages: [...s.messages, newMessage]
    } : s));
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // File Upload States
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    playSound('click', audioMuted);
    setIsProcessingFile(true);

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 20 * 1024 * 1024) {
        alert(`File ${file.name} is too large (max 20MB)`);
        continue;
      }

      try {
        const { base64, preview } = await compressImageAndGetBase64(file);
        newAttachments.push({
          id: Math.random().toString(36).substring(2, 15),
          name: file.name,
          mimeType: file.type,
          base64,
          previewUrl: preview
        });
      } catch (err) {
        console.error("Error processing file:", err);
      }
    }

    setPendingAttachments(prev => [...prev, ...newAttachments]);
    setIsProcessingFile(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePendingAttachment = (id: string) => {
    playSound('click', audioMuted);
    setPendingAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    playSound('click', audioMuted);
    
    if (!speechSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        const initialText = inputMessage.trim();

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let accumulatedSpeech = '';
          for (let i = 0; i < event.results.length; i++) {
            accumulatedSpeech += event.results[i][0].transcript;
          }
          setInputMessage(initialText ? `${initialText} ${accumulatedSpeech.trim()}` : accumulatedSpeech.trim());
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Speech recognition initiation failed:", err);
        setIsListening(false);
      }
    }
  };

  // Active Session Finder
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // Persist sessions with quota safety checks
  useEffect(() => {
    try {
      localStorage.setItem('ariella_sessions', JSON.stringify(sessions));
    } catch (err) {
      console.warn("localStorage quota exceeded, saving sessions with stripped heavy base64 strings", err);
      try {
        // Create copies with stripped raw base64 of attachments to save space
        const strippedSessions = sessions.map(s => ({
          ...s,
          messages: s.messages.map(m => {
            if (!m.attachments) return m;
            return {
              ...m,
              attachments: m.attachments.map(att => ({
                ...att,
                base64: "" // remove payload but keep previewUrl, name, mimeType
              }))
            };
          })
        }));
        localStorage.setItem('ariella_sessions', JSON.stringify(strippedSessions));
      } catch (innerErr) {
        console.error("Critical: Failed to save sessions even with stripped attachments", innerErr);
      }
    }
  }, [sessions]);

  // Persist active session ID
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem('ariella_active_session_id', activeSessionId);
    } else {
      localStorage.removeItem('ariella_active_session_id');
    }
  }, [activeSessionId]);

  // Server health check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setServerOnline(true);
        setAiEnabled(data.aiEnabled);
      } catch (err) {
        console.error("Health check failed:", err);
        setServerOnline(false);
        setAiEnabled(false);
      }
    };
    checkHealth();
  }, []);

  // Scroll to bottom on load/new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  // Initial session setup if activeSessionId is null but sessions exist
  useEffect(() => {
    if (!activeSessionId && sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // Actions
  const handleNewSession = (engine: IntelligenceEngine = 'standard') => {
    playSound('click', audioMuted);
    const newSession: ChatSession = {
      id: Math.random().toString(36).substring(2, 15),
      title: `Cognitive Core ${sessions.length + 1}`,
      engine,
      searchEnabled: false,
      messages: [],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    playSound('click', audioMuted);
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleClearAll = () => {
    playSound('error', audioMuted);
    if (confirm("Are you sure you want to clear all Ariella intelligence session records? This cannot be undone.")) {
      setSessions([]);
      setActiveSessionId(null);
    }
  };

  const handleSelectPrompt = (promptText: string) => {
    setInputMessage(promptText);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hasAttachments = pendingAttachments.length > 0;
    if ((!inputMessage.trim() && !hasAttachments) || isLoading) return;

    // Stop listening if active on message send
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    let targetSession = activeSession;
    const cleanInput = inputMessage.trim();
    const messageTitle = cleanInput || (hasAttachments ? `Sent ${pendingAttachments[0].name}` : 'New session');
    
    // Create new session if none exists
    if (!targetSession) {
      const newId = Math.random().toString(36).substring(2, 15);
      const newSess: ChatSession = {
        id: newId,
        title: messageTitle.substring(0, 30) + (messageTitle.length > 30 ? '...' : ''),
        engine: currentEngine,
        searchEnabled: searchEnabled,
        messages: [],
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSessions(prev => [newSess, ...prev]);
      setActiveSessionId(newSess.id);
      targetSession = newSess;
    }

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      role: 'user',
      content: cleanInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: pendingAttachments,
      replyTo: replyingToMessage ? {
        messageId: replyingToMessage.id,
        role: replyingToMessage.role,
        snippet: replyingToMessage.content.slice(0, 160)
      } : undefined
    };

    // Append user message
    const updatedMessages = [...targetSession.messages, userMessage];
    setSessions(prev => prev.map(s => s.id === targetSession!.id ? { 
      ...s, 
      messages: updatedMessages,
      // Auto rename if it was the first message
      title: s.messages.length === 0 ? messageTitle.substring(0, 26) + (messageTitle.length > 26 ? '...' : '') : s.title
    } : s));

    setInputMessage('');
    setPendingAttachments([]);
    setReplyingToMessage(null);
    setIsLoading(true);
    setInferenceTime(null);
    playSound('send', audioMuted);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          engine: targetSession.engine,
          searchEnabled: targetSession.searchEnabled
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      setInferenceTime(Math.round(endTime - startTime));

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(2, 15),
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinkingSteps: data.thinkingSteps || [],
        sources: data.sources || [],
        searchQueries: data.searchQueries || []
      };

      setSessions(prev => prev.map(s => s.id === targetSession!.id ? {
        ...s,
        messages: [...updatedMessages, assistantMessage]
      } : s));

      playSound('success', audioMuted);

    } catch (error: any) {
      console.error("Chat error:", error);
      playSound('error', audioMuted);
      
      const errorMessage: Message = {
        id: Math.random().toString(36).substring(2, 15),
        role: 'assistant',
        content: `⚠️ **Cognitive Core Error:** Unable to map intelligence vector. \n\nDetails: ${error.message || 'The server rejected or failed the request.'}\n\nPlease verify that your server is running and a valid API key is set in Settings > Secrets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => prev.map(s => s.id === targetSession!.id ? {
        ...s,
        messages: [...updatedMessages, errorMessage]
      } : s));

    } finally {
      setIsLoading(false);
    }
  };

  const toggleReasoningDetails = (messageId: string) => {
    playSound('click', audioMuted);
    setExpandedReasoningMap(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  return (
    <div 
      className={`w-screen h-screen flex items-center justify-center overflow-hidden relative transition-all duration-300 ${theme === 'cyber' ? 'theme-cyber' : 'theme-midnight'} bg-slate-950 font-sans text-slate-100`}
      style={{ backgroundColor: customBgColor }}
    >
      {/* 16:9 Full HD Aspect Ratio Application Stage */}
      <div 
        className={`relative w-full h-full flex flex-row overflow-hidden transition-all duration-300 ${
          is16x9FullHD 
            ? 'max-w-[1920px] max-h-[1080px] xl:aspect-[16/9] xl:rounded-2xl xl:border xl:border-slate-800/80 xl:shadow-2xl xl:shadow-violet-950/50 my-auto mx-auto' 
            : ''
        }`}
      >
      {/* Absolute Header with Core Status indicators */}
      <div className="absolute top-0 right-0 left-0 h-16 bg-slate-950/40 backdrop-blur-xl border-b border-slate-900/60 flex items-center justify-between px-6 z-30 select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1.5 text-xs text-violet-300 bg-violet-950/40 px-3 py-1.5 rounded-lg border border-violet-500/20 shadow-glow-sm font-medium">
            <span>✨ Created by <strong className="text-violet-200">Ariella Agnes</strong> 🎨</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {inferenceTime && (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono bg-violet-950/40 border border-violet-800/20 text-violet-400 px-2.5 py-1 rounded">
              Latency: {inferenceTime}ms
            </span>
          )}

          {/* Direct Download App Button */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsAppDownloadOpen(true);
            }}
            className="group p-2.5 rounded-lg border border-violet-500/40 bg-gradient-to-r from-violet-950/60 to-fuchsia-950/60 text-violet-200 hover:text-white hover:border-violet-400 hover:shadow-glow-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Download as App (Zero Installation Needed)"
          >
            <Smartphone className="h-4 w-4 text-violet-400 animate-bounce" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">GET APP 📲</span>
          </button>

          {/* KRA & eTIMS Trigger */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsKraEtimsOpen(true);
            }}
            className="group p-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-500/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="KRA & eTIMS Tax Studio"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold hidden lg:inline">KRA & eTIMS 🇰🇪</span>
          </button>

          {/* M-Pesa Trigger */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsMpesaOpen(true);
            }}
            className="group p-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-500/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="M-Pesa Express Payment Gateway"
          >
            <CreditCard className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold hidden lg:inline">M-PESA 💚</span>
          </button>

          {/* Doc Converter Trigger */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsConverterOpen(true);
            }}
            className="group p-2 rounded-lg border border-blue-500/30 bg-blue-950/20 text-blue-300 hover:bg-blue-950/40 hover:border-blue-500/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="PDF, Word & Image Converter"
          >
            <ArrowRightLeft className="h-4 w-4 text-blue-400" />
            <span className="text-[10px] font-mono font-bold hidden lg:inline">CONVERTER 🔄</span>
          </button>

          {/* Official Document Studio Trigger */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsDocStudioOpen(true);
            }}
            className="group p-2 rounded-lg border border-violet-500/30 bg-violet-950/20 text-violet-300 hover:bg-violet-950/40 hover:border-violet-500/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Professional Letter & Contract Studio"
          >
            <FileSignature className="h-4 w-4 text-violet-400" />
            <span className="text-[10px] font-mono font-bold hidden lg:inline">DOC STUDIO 📄</span>
          </button>

          {/* ID & Passport Editor Trigger */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsIdPassportOpen(true);
            }}
            className="group p-2 rounded-lg border border-teal-500/30 bg-teal-950/20 text-teal-300 hover:bg-teal-950/40 hover:border-teal-500/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Passport, ID & Scanned Document Editor"
          >
            <FileCheck className="h-4 w-4 text-teal-400" />
            <span className="text-[10px] font-mono font-bold hidden lg:inline">PASSPORT & ID 🛂</span>
          </button>

          {/* Security E2EE & 2FA Trigger */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsSecurityOpen(true);
            }}
            className="group p-2 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-950/40 hover:border-emerald-500/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="End-to-End Encryption & Two-Factor Authentication"
          >
            <Lock className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold hidden lg:inline">E2EE & 2FA 🔒</span>
          </button>

          {/* Video Studio trigger */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsVideoStudioOpen(true);
            }}
            className="group p-2.5 rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/20 text-fuchsia-300 hover:bg-fuchsia-950/40 hover:border-fuchsia-500/60 shadow-glow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            title="Open AI Video Studio"
          >
            <Video className="h-4 w-4 text-fuchsia-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">VIDEO STUDIO 🎬</span>
          </button>

          {/* Gmail trigger */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsGmailOpen(true);
            }}
            className={`group p-2.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              theme === 'cyber'
                ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/30'
            }`}
            title="Open Gmail Workspace"
          >
            <Mail className="h-4 w-4" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">GMAIL</span>
          </button>

          {/* Download Chat Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                playSound('click', audioMuted);
                setIsDownloadMenuOpen(!isDownloadMenuOpen);
              }}
              disabled={!activeSession || !activeSession.messages || activeSession.messages.length === 0}
              className={`group p-2.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                !activeSession || !activeSession.messages || activeSession.messages.length === 0
                  ? 'border-slate-800/40 bg-slate-950/40 text-slate-600 cursor-not-allowed opacity-50'
                  : theme === 'cyber'
                    ? 'border-fuchsia-500/30 bg-fuchsia-950/20 text-fuchsia-400 hover:bg-fuchsia-950/40 hover:border-fuchsia-500/50 hover:shadow-[0_0_10px_rgba(217,70,239,0.25)]'
                    : 'border-slate-800 bg-slate-950 text-slate-300 hover:text-slate-100 hover:border-violet-500/40 hover:bg-violet-950/20 shadow-glow-sm'
              }`}
              title={
                !activeSession || !activeSession.messages || activeSession.messages.length === 0
                  ? "No chat messages to export"
                  : "Download / Export Conversation History"
              }
            >
              <Download className="h-4 w-4" />
              <span className="text-[10px] font-mono font-bold hidden sm:inline">EXPORT</span>
              <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDownloadMenuOpen && activeSession && activeSession.messages && activeSession.messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 w-64 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 space-y-1 backdrop-blur-2xl"
                >
                  <div className="px-3 py-2 border-b border-slate-800/80">
                    <p className="text-[11px] font-semibold text-slate-200 truncate">
                      Export "{activeSession.title || 'Current Chat'}"
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {activeSession.messages.length} messages in buffer
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      exportChatAsMarkdown(activeSession);
                      playSound('success', audioMuted);
                      setIsDownloadMenuOpen(false);
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-violet-600/15 text-left group transition-colors cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 group-hover:scale-105 transition-transform">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-100 group-hover:text-violet-300">
                        Markdown (.md)
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Formatted document with headers, reasoning steps & sources
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportChatAsJson(activeSession);
                      playSound('success', audioMuted);
                      setIsDownloadMenuOpen(false);
                    }}
                    className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-cyan-600/15 text-left group transition-colors cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                      <FileJson className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-100 group-hover:text-cyan-300">
                        JSON (.json)
                      </p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Raw structured data payload with complete metadata
                      </p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme & Custom BG Color Switcher */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsThemePickerOpen(true);
            }}
            className={`group p-2.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              theme === 'cyber'
                ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:text-slate-100 hover:border-violet-500/40'
            }`}
            title="Custom Background Color & Theme Studio"
          >
            <Palette className="h-4 w-4 text-fuchsia-400 transition-transform duration-500 group-hover:rotate-180" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">
              BG COLOR 🎨
            </span>
          </button>

          {/* 16:9 Full HD Mode Toggle */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIs16x9FullHD(!is16x9FullHD);
            }}
            className={`group p-2.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              is16x9FullHD
                ? 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300 hover:border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
            title={is16x9FullHD ? "16:9 Full HD Mode Active (1920x1080 Aspect Ratio)" : "Enable 16:9 Full HD Aspect Mode"}
          >
            <Tv className="h-4 w-4 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">
              16:9 FHD {is16x9FullHD ? '📺' : '🖥️'}
            </span>
          </button>

          {/* AI Voice Call Trigger */}
          <button
            onClick={() => {
              playSound('click', audioMuted);
              setIsCallOpen(true);
            }}
            className="group p-2.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 text-cyan-200 hover:text-white hover:border-cyan-400 hover:shadow-glow-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Make a Voice Call with Ariella AI"
          >
            <PhoneCall className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">CALL 📞</span>
          </button>

          {/* Sound configuration */}
          <button
            onClick={() => setAudioMuted(!audioMuted)}
            className={`p-2 rounded-lg border transition-all ${
              audioMuted 
                ? 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300' 
                : 'border-violet-500/20 bg-violet-950/10 text-violet-400 shadow-glow-sm'
            }`}
            title={audioMuted ? "Unmute Sounds" : "Mute Sounds"}
          >
            {audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* API Secret status checker */}
          {aiEnabled === false && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-950/10 text-rose-400 text-xs font-mono">
              <ShieldAlert className="h-4 w-4 animate-bounce" />
              <span className="hidden lg:inline">KEY MISSING</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-900">
            <div className={`w-2 h-2 rounded-full ${serverOnline ? 'bg-emerald-400 shadow-glow-emerald animate-pulse' : 'bg-rose-500 shadow-glow-rose'}`} />
            <span className="hidden sm:inline">{serverOnline ? 'ARI-CORE ONLINE' : 'DISCONNECTED'}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 h-full pt-16 overflow-hidden">
        {/* Sidebar Panel */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="h-full"
            >
              <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={setActiveSessionId}
                onNewSession={() => handleNewSession('standard')}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleRenameSession}
                onClearAll={handleClearAll}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat / Stage area */}
        <div className="flex-1 flex flex-col h-full bg-slate-950 relative">
          {/* Main stage viewport */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {!activeSession || activeSession.messages.length === 0 ? (
              <WelcomeScreen
                onSelectPrompt={handleSelectPrompt}
                selectedEngine={activeSession ? activeSession.engine : currentEngine}
                onOpenVideoStudio={() => {
                  playSound('click', audioMuted);
                  setIsVideoStudioOpen(true);
                }}
                onOpenAppDownload={() => {
                  playSound('click', audioMuted);
                  setIsAppDownloadOpen(true);
                }}
                onOpenKraEtims={() => {
                  playSound('click', audioMuted);
                  setIsKraEtimsOpen(true);
                }}
                onOpenMpesa={() => {
                  playSound('click', audioMuted);
                  setIsMpesaOpen(true);
                }}
                onOpenConverter={() => {
                  playSound('click', audioMuted);
                  setIsConverterOpen(true);
                }}
                onOpenDocStudio={() => {
                  playSound('click', audioMuted);
                  setIsDocStudioOpen(true);
                }}
                onOpenIdPassportEditor={() => {
                  playSound('click', audioMuted);
                  setIsIdPassportOpen(true);
                }}
                onOpenSecurity={() => {
                  playSound('click', audioMuted);
                  setIsSecurityOpen(true);
                }}
                onOpenThemePicker={() => {
                  playSound('click', audioMuted);
                  setIsThemePickerOpen(true);
                }}
                onOpenCall={() => {
                  playSound('click', audioMuted);
                  setIsCallOpen(true);
                }}
                onSelectEngine={(engine) => {
                  playSound('click', audioMuted);
                  if (activeSession) {
                    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, engine } : s));
                  } else {
                    setCurrentEngine(engine);
                  }
                }}
                searchEnabled={activeSession ? activeSession.searchEnabled : searchEnabled}
                onToggleSearch={() => {
                  playSound('click', audioMuted);
                  if (activeSession) {
                    setSessions(prev => prev.map(s => s.id === activeSession.id ? { ...s, searchEnabled: !s.searchEnabled } : s));
                  } else {
                    setSearchEnabled(!searchEnabled);
                  }
                }}
              />
            ) : (
              <div className="max-w-4xl mx-auto space-y-6 pb-24">
                {/* Missing API Key Header Prompt */}
                {aiEnabled === false && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 text-rose-300 text-sm flex items-start gap-3"
                  >
                    <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold">Gemini API Key Missing</p>
                      <p className="text-xs text-rose-400/80 leading-relaxed">
                        The application has started successfully, but no `GEMINI_API_KEY` was found in the environment. 
                        Please configure your key in the **Settings &gt; Secrets** panel in the Google AI Studio UI to enable intelligence endpoints.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Messages Loop */}
                {activeSession.messages.map((msg, msgIdx) => {
                  const isModel = msg.role === 'assistant' || msg.role === 'model';
                  const isLatestAssistantMessage = isModel && msgIdx === activeSession.messages.length - 1;
                  const hasReasoning = msg.thinkingSteps && msg.thinkingSteps.length > 0;
                  const isExpanded = expandedReasoningMap[msg.id] ?? true;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 ${isModel ? 'justify-start' : 'justify-end'}`}
                    >
                      {/* Avatar */}
                      {isModel && (
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 shadow-lg">
                          {activeSession.engine === 'reasoning' ? (
                            <Brain className="h-5 w-5 text-violet-400 animate-pulse" />
                          ) : activeSession.engine === 'creative' ? (
                            <Sparkles className="h-5 w-5 text-fuchsia-400" />
                          ) : (
                            <Cpu className="h-5 w-5 text-sky-400" />
                          )}
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-glow" />
                        </div>
                      )}

                      <div className={`flex flex-col gap-2 max-w-2xl ${!isModel ? 'items-end' : 'items-start'}`}>
                        {/* Bubble */}
                        <div className={`p-5 rounded-2xl border text-sm shadow-xl ${
                          isModel 
                            ? 'bg-slate-900/60 border-slate-800/80 text-slate-100 rounded-tl-sm' 
                            : 'bg-violet-950/20 border-violet-800/30 text-slate-100 rounded-tr-sm shadow-violet-500/5'
                        }`}>
                          
                          {/* Visual Thread Quote Indicator */}
                          {msg.replyTo && (
                            <div className="mb-3.5 p-3 rounded-xl border-l-2 border-violet-500 bg-slate-950/70 text-xs text-slate-300 flex items-start gap-2.5 shadow-inner">
                              <CornerDownRight className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-violet-300 font-bold uppercase tracking-wider mb-1">
                                  <Quote className="h-3 w-3 text-fuchsia-400" />
                                  <span>Replying to {msg.replyTo.role === 'assistant' || msg.replyTo.role === 'model' ? 'Ariella 🤖' : 'User 👤'}</span>
                                </div>
                                <p className="text-slate-400 text-xs italic line-clamp-2 leading-relaxed">
                                  "{msg.replyTo.snippet}"
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Inner Model Reasoning Block */}
                          {hasReasoning && (
                            <div className="mb-4 overflow-hidden rounded-xl border border-violet-500/10 bg-violet-950/5">
                              <button
                                onClick={() => toggleReasoningDetails(msg.id)}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-violet-950/15 text-violet-300 hover:bg-violet-950/25 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Brain className="h-4 w-4 text-violet-400" />
                                  <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                                    Cognitive Reasoning Chain
                                  </span>
                                </div>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </button>

                              {isExpanded && (
                                <div className="p-3.5 space-y-2 border-t border-violet-500/10 bg-slate-950/40">
                                  {msg.thinkingSteps?.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 text-xs font-mono text-slate-400 leading-relaxed">
                                      <span className="text-violet-500/60 font-semibold mt-0.5">{idx + 1}.</span>
                                      <span>{step}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Message attachments rendering */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2.5 mb-3">
                              {msg.attachments.map((att) => {
                                const isImage = att.mimeType.startsWith('image/');
                                const isVideo = att.mimeType.startsWith('video/');
                                const src = att.previewUrl || `data:${att.mimeType};base64,${att.base64}`;
                                
                                return (
                                  <div 
                                    key={att.id} 
                                    className="relative rounded-xl overflow-hidden border border-slate-800/80 max-w-[280px] bg-slate-950/80 shadow-md group"
                                  >
                                    {isImage ? (
                                      <a href={src} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden cursor-zoom-in">
                                        <img 
                                          src={src} 
                                          alt={att.name} 
                                          className="max-h-[180px] w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                                          referrerPolicy="no-referrer"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                          <Eye className="h-5 w-5 text-slate-100" />
                                        </div>
                                      </a>
                                    ) : isVideo ? (
                                      <video 
                                        src={src} 
                                        controls 
                                        className="max-h-[180px] w-full rounded-xl"
                                        preload="metadata"
                                      />
                                    ) : (
                                      <div className="p-3 flex items-center gap-2">
                                        <Play className="h-4 w-4 text-violet-400" />
                                        <span className="text-xs text-slate-300 truncate">{att.name}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <FormattedText text={msg.content} animateTyping={isLatestAssistantMessage} />

                          {/* Generated AI Video Inline Player */}
                          {msg.videoUrl && (
                            <div className="mt-3 rounded-2xl overflow-hidden border border-violet-500/30 bg-black max-w-lg shadow-xl">
                              <video
                                src={msg.videoUrl}
                                controls
                                autoPlay
                                loop
                                className="w-full max-h-[360px] object-contain rounded-2xl"
                              />
                              <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-violet-300 font-bold flex items-center gap-1">
                                  <Video className="h-3.5 w-3.5 text-fuchsia-400" /> Veo 3.1 AI Video 🎥
                                </span>
                                <a
                                  href={msg.videoUrl}
                                  download={`ariella_ai_video_${msg.id}.mp4`}
                                  className="text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors"
                                >
                                  <Download className="h-3 w-3" /> Save MP4 ⬇️
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Citations/Grounding Sources list if present */}
                        {isModel && (msg.sources || msg.searchQueries) && (
                          <GroundingSources
                            queries={msg.searchQueries}
                            sources={msg.sources}
                          />
                        )}

                        <div className="flex items-center justify-between w-full px-1 pt-0.5">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {isModel ? 'Ariella' : 'You'} • {msg.timestamp}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              playSound('click', audioMuted);
                              setReplyingToMessage(msg);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 hover:bg-violet-950/30 text-slate-400 hover:text-violet-300 text-[10px] font-mono transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                            title="Reply to this message 💬"
                          >
                            <Reply className="h-3 w-3 text-violet-400" />
                            <span>Reply 💬</span>
                          </button>
                        </div>
                      </div>

                      {/* User Avatar */}
                      {!isModel && (
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-violet-950/10 border border-violet-800/30 flex-shrink-0 shadow-lg shadow-violet-500/5">
                          <Terminal className="h-5 w-5 text-violet-400" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Animated thinking stage loading loader */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start gap-4"
                  >
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 shadow-lg">
                      <Brain className="h-5 w-5 text-violet-400 animate-spin" />
                    </div>
                    <ThinkingIndicator engine={activeSession.engine} />
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Interactive footer panel input */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent border-t border-transparent z-20">
            <form
              onSubmit={handleSendMessage}
              className="max-w-4xl mx-auto rounded-2xl border border-slate-800/90 bg-slate-950/90 shadow-2xl shadow-black/80 p-2 space-y-2 focus-within:border-violet-500/40 focus-within:shadow-violet-500/5 transition-all duration-300"
            >
              {/* Active Replying To Thread Banner */}
              <AnimatePresence>
                {replyingToMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-violet-950/25 border-b border-violet-500/30 rounded-t-xl"
                  >
                    <div className="flex items-center gap-2.5 text-xs text-slate-200 min-w-0">
                      <Reply className="h-4 w-4 text-violet-400 flex-shrink-0 animate-bounce" />
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="font-bold text-violet-300 font-mono text-xs flex items-center gap-1">
                          Replying to {replyingToMessage.role === 'assistant' || replyingToMessage.role === 'model' ? 'Ariella 🤖' : 'User 👤'}:
                        </span>
                        <span className="text-slate-400 text-xs italic truncate">
                          "{replyingToMessage.content.substring(0, 90)}{replyingToMessage.content.length > 90 ? '...' : ''}"
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playSound('click', audioMuted);
                        setReplyingToMessage(null);
                      }}
                      className="p-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-500 hover:text-rose-400 text-slate-400 transition-colors flex-shrink-0 cursor-pointer"
                      title="Cancel reply"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Pending Attachments Previews */}
              {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-slate-900/60 bg-slate-950/30 rounded-t-xl max-h-[160px] overflow-y-auto">
                  {pendingAttachments.map((att) => (
                    <div 
                      key={att.id} 
                      className="relative group flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 rounded-xl p-1.5 pr-2.5 max-w-[200px]"
                    >
                      {att.mimeType.startsWith('image/') ? (
                        <img 
                          src={att.previewUrl || `data:${att.mimeType};base64,${att.base64}`} 
                          alt={att.name} 
                          className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-violet-950/40 border border-violet-800/30 flex items-center justify-center flex-shrink-0">
                          <Play className="h-4 w-4 text-violet-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-medium text-slate-300 truncate">{att.name}</p>
                        <p className="text-[8px] text-slate-500 font-mono uppercase">
                          {att.mimeType.split('/')[1] || 'media'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePendingAttachment(att.id)}
                        className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-rose-500 hover:text-rose-400 text-slate-400 transition-all absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 shadow-md"
                        title="Remove attachment"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Compression / Processing indicator */}
              {isProcessingFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-violet-400 font-mono animate-pulse bg-slate-950/30 rounded-t-xl">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Processing high-fidelity media...</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* File Attachment Input (hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                />

                {/* Upload Trigger Button */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click', audioMuted);
                    fileInputRef.current?.click();
                  }}
                  disabled={isLoading || isProcessingFile}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all duration-300 flex items-center justify-center flex-shrink-0"
                  title="Attach pictures or videos"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                {/* Input block */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isLoading 
                      ? "Cognitive streams resolving..." 
                      : (activeSession?.engine === 'reasoning' ? "Formulate a complex reasoning query..." : "Ask Ariella anything...")
                  }
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-0 outline-none px-3 py-2 text-sm text-slate-100 placeholder-slate-500 font-medium"
                />

                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center ${
                    !speechSupported
                      ? 'border-slate-900/50 bg-slate-950/50 text-slate-600 cursor-not-allowed'
                      : isListening
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  title={
                    !speechSupported
                      ? "Speech recognition not supported in this browser"
                      : isListening
                        ? "Stop listening"
                        : "Voice transcription (Web Speech)"
                  }
                >
                  {!speechSupported ? (
                    <MicOff className="h-4 w-4" />
                  ) : isListening ? (
                    <div className="relative">
                      <Mic className="h-4 w-4 text-rose-400" />
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    </div>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isLoading || (!inputMessage.trim() && pendingAttachments.length === 0)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold flex items-center justify-center shadow-lg hover:shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-violet-600 disabled:hover:to-fuchsia-600 transition-all flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {/* Status footer with selectors in input container */}
              <div className="flex flex-wrap items-center justify-between border-t border-slate-900/80 pt-2 px-1 text-xs text-slate-400 gap-2 select-none">
                <div className="flex items-center gap-3">
                  {/* Quick Engine badge */}
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Active Matrix:
                  </span>
                  
                  {activeSession ? (
                    <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[10px] border uppercase tracking-wider ${
                      activeSession.engine === 'reasoning' 
                        ? 'bg-violet-950/30 border-violet-800/20 text-violet-300' 
                        : activeSession.engine === 'creative' 
                          ? 'bg-fuchsia-950/30 border-fuchsia-800/20 text-fuchsia-300' 
                          : 'bg-sky-950/30 border-sky-800/20 text-sky-300'
                    }`}>
                      {activeSession.engine === 'reasoning' ? <Brain className="h-2.5 w-2.5" /> : activeSession.engine === 'creative' ? <Sparkles className="h-2.5 w-2.5" /> : <Cpu className="h-2.5 w-2.5" />}
                      {activeSession.engine}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No session active</span>
                  )}

                  {/* Web Grounding details badge */}
                  {activeSession && (
                    <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[10px] border uppercase tracking-wider ${
                      activeSession.searchEnabled 
                        ? 'bg-emerald-950/30 border-emerald-800/20 text-emerald-300' 
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}>
                      <Globe className="h-2.5 w-2.5" />
                      Grounding: {activeSession.searchEnabled ? 'On' : 'Off'}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-slate-600">
                  Secure HTTPS Gateway • Port 3000
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isGmailOpen && (
          <GmailSuite
            theme={theme}
            audioMuted={audioMuted}
            playSound={playSound}
            onClose={() => {
              playSound('click', audioMuted);
              setIsGmailOpen(false);
            }}
          />
        )}

        {isVideoStudioOpen && (
          <VideoStudio
            isOpen={isVideoStudioOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsVideoStudioOpen(false);
            }}
            onInsertVideoToChat={handleInsertVideoToChat}
            audioMuted={audioMuted}
          />
        )}

        {isAppDownloadOpen && (
          <AppDownloadModal
            isOpen={isAppDownloadOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsAppDownloadOpen(false);
            }}
            deferredPrompt={deferredPrompt}
            onInstallPWA={handleInstallPWA}
            isStandalone={isStandalone}
          />
        )}

        {isKraEtimsOpen && (
          <KraEtimsSuite
            isOpen={isKraEtimsOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsKraEtimsOpen(false);
            }}
            onOpenMpesaPayment={(details) => handleOpenMpesaWithDetails(details)}
          />
        )}

        {isMpesaOpen && (
          <MpesaPaymentModal
            isOpen={isMpesaOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsMpesaOpen(false);
            }}
            defaultTitle={mpesaPaymentConfig?.title || 'Ariella AI Premium Subscription / Invoice Payment'}
            defaultAmount={mpesaPaymentConfig?.amount || 1500}
            defaultPaybill={mpesaPaymentConfig?.paybill || '247247'}
            defaultAccount={mpesaPaymentConfig?.account || 'ARIELLA-9021'}
          />
        )}

        {isConverterOpen && (
          <DocumentConverterModal
            isOpen={isConverterOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsConverterOpen(false);
            }}
            audioMuted={audioMuted}
          />
        )}

        {isDocStudioOpen && (
          <ProfessionalDocumentStudio
            isOpen={isDocStudioOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsDocStudioOpen(false);
            }}
            onOpenMpesaPayment={(details) => handleOpenMpesaWithDetails(details)}
          />
        )}

        {isIdPassportOpen && (
          <IdPassportDocEditorModal
            isOpen={isIdPassportOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsIdPassportOpen(false);
            }}
            audioMuted={audioMuted}
          />
        )}

        {isSecurityOpen && (
          <SecurityModal
            isOpen={isSecurityOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsSecurityOpen(false);
            }}
            isE2EEEnabled={isE2EEEnabled}
            onToggleE2EE={(val) => setIsE2EEEnabled(val)}
            is2FAEnabled={is2FAEnabled}
            onToggle2FA={(val) => setIs2FAEnabled(val)}
            audioMuted={audioMuted}
          />
        )}

        {isThemePickerOpen && (
          <ThemeColorPickerModal
            isOpen={isThemePickerOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsThemePickerOpen(false);
            }}
            customBgColor={customBgColor}
            onChangeBgColor={(color) => setCustomBgColor(color)}
            theme={theme}
            onToggleTheme={(newTheme) => setTheme(newTheme)}
          />
        )}

        {isCallOpen && (
          <AiCallModal
            isOpen={isCallOpen}
            onClose={() => {
              playSound('click', audioMuted);
              setIsCallOpen(false);
            }}
            audioMuted={audioMuted}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
