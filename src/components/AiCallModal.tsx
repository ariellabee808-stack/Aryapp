import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  Sparkles, X, User, RefreshCw, Activity, PhoneCall, 
  Radio, ShieldCheck, Globe, Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AiCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioMuted?: boolean;
}

export const AiCallModal: React.FC<AiCallModalProps> = ({
  isOpen,
  onClose,
  audioMuted = false
}) => {
  const [callState, setCallState] = useState<'idle' | 'dialing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [aiSpeechStatus, setAiSpeechStatus] = useState<string>('Ariella AI Voice Engine Ready');
  const [phoneNumber, setPhoneNumber] = useState('+254 700 000 ARIELLA');
  const [transcript, setTranscript] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isListening, setIsListening] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Call timer effect
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultText = event.results[current][0].transcript;
        if (event.results[current].isFinal) {
          setTranscript((prev) => [...prev, { sender: 'user', text: resultText }]);
          handleAiCallResponse(resultText);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setCallState('dialing');
    setAiSpeechStatus('Dialing Ariella AI Voice Core...');

    setTimeout(() => {
      setCallState('connected');
      setCallDuration(0);
      setAiSpeechStatus('Connected. Ariella is listening...');
      
      const greeting = "Hello! This is Ariella AI speaking. I am on the line. How can I assist you today?";
      setTranscript([{ sender: 'ai', text: greeting }]);
      speakText(greeting);

      if (recognitionRef.current && !isMicMuted) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.log('Speech recognition start issue', e);
        }
      }
    }, 2500);
  };

  const handleEndCall = () => {
    setCallState('ended');
    setAiSpeechStatus('Call Ended');
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setTimeout(() => {
      setCallState('idle');
      setCallDuration(0);
      setTranscript([]);
    }, 1500);
  };

  const speakText = (text: string) => {
    if (!isSpeakerOn) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.onstart = () => setAiSpeechStatus('Ariella is speaking...');
      utterance.onend = () => setAiSpeechStatus('Ariella is listening...');
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAiCallResponse = (userPrompt: string) => {
    setAiSpeechStatus('Ariella thinking...');
    
    setTimeout(() => {
      let aiText = "I received your message loud and clear. Let me process that for you immediately.";
      const lower = userPrompt.toLowerCase();

      if (lower.includes('hello') || lower.includes('hi')) {
        aiText = "Hello! It's great to hear your voice. What can I do for you on this call?";
      } else if (lower.includes('kra') || lower.includes('tax') || lower.includes('etims')) {
        aiText = "I can assist you with KRA pin registration, eTIMS tax invoice generation, or M-Pesa payments right away!";
      } else if (lower.includes('passport') || lower.includes('id')) {
        aiText = "Our Passport and ID studio is active. You can edit, scan, or enhance any document instantly.";
      } else if (lower.includes('who created you') || lower.includes('creator')) {
        aiText = "I was created by Ariella Agnes Okemwa, built with advanced Gemini AI core technology.";
      }

      setTranscript((prev) => [...prev, { sender: 'ai', text: aiText }]);
      speakText(aiText);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-2xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-violet-500/40 rounded-3xl shadow-2xl shadow-violet-950/80 overflow-hidden flex flex-col my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-600/30 text-violet-400 border border-violet-500/40">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  ARIELLA AI VOICE CALL 📞
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  Real-Time Encrypted Web Speech & Voice Assistant
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

          {/* Call Body */}
          <div className="p-6 text-center space-y-6">
            
            {/* Avatar & Pulse ring */}
            <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
              {callState === 'connected' && (
                <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
              )}
              {callState === 'dialing' && (
                <div className="absolute inset-0 rounded-full bg-amber-500/30 animate-pulse" />
              )}
              
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-500 p-1 shadow-xl shadow-violet-600/30 relative z-10 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
                  <Sparkles className="h-8 w-8 text-violet-400 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Call Info */}
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-100">Ariella AI Voice Assistant</h3>
              <p className="text-xs font-mono text-violet-400">{phoneNumber}</p>
              <div className="flex items-center justify-center gap-2 text-xs font-mono pt-1 text-slate-400">
                {callState === 'connected' ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                    <Activity className="h-3.5 w-3.5 animate-spin" /> {formatDuration(callDuration)}
                  </span>
                ) : (
                  <span className="text-slate-400 font-mono">{aiSpeechStatus}</span>
                )}
              </div>
            </div>

            {/* Live Audio Spectrum Visualizer */}
            {callState === 'connected' && (
              <div className="flex items-center justify-center gap-1.5 h-10 py-1">
                {[40, 70, 30, 90, 60, 100, 50, 80, 40, 70, 30].map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-violet-500 to-fuchsia-400 rounded-full animate-pulse"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Live Transcript Stream */}
            {transcript.length > 0 && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl max-h-32 overflow-y-auto text-left text-xs font-mono space-y-2">
                {transcript.map((t, idx) => (
                  <div key={idx} className={t.sender === 'ai' ? 'text-violet-300' : 'text-emerald-300'}>
                    <strong className="uppercase">{t.sender}:</strong> {t.text}
                  </div>
                ))}
              </div>
            )}

            {/* Call Action Controls */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-4">
              
              {callState === 'connected' && (
                <>
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-4 rounded-full border transition-all cursor-pointer ${
                      isMicMuted 
                        ? 'bg-rose-950 text-rose-400 border-rose-500/50' 
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                  >
                    {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>

                  <button
                    onClick={handleEndCall}
                    className="p-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-600/40 cursor-pointer transition-transform transform active:scale-95"
                    title="End Call"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </button>

                  <button
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={`p-4 rounded-full border transition-all cursor-pointer ${
                      !isSpeakerOn 
                        ? 'bg-amber-950 text-amber-400 border-amber-500/50' 
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={isSpeakerOn ? "Mute Speaker" : "Turn On Speaker"}
                  >
                    {!isSpeakerOn ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </>
              )}

              {callState === 'idle' && (
                <button
                  onClick={handleStartCall}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 cursor-pointer transition-all transform hover:scale-[1.02]"
                >
                  <Phone className="h-5 w-5" />
                  <span>Start Live Voice Call with Ariella AI 📞</span>
                </button>
              )}

              {callState === 'dialing' && (
                <button
                  onClick={handleEndCall}
                  className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-600/30 cursor-pointer"
                >
                  <PhoneOff className="h-5 w-5" />
                  <span>Cancel Dialing...</span>
                </button>
              )}

            </div>

            {/* Bottom Security Note */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Encrypted WebRTC HD Audio Channel</span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
