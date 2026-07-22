import React, { useState, useEffect } from 'react';
import { 
  Mail, Inbox, Send, Trash2, FileText, RefreshCw, 
  Search, Sparkles, Reply, ArrowLeft, Eye, LogOut, 
  X, Check, AlertTriangle, ChevronRight, PenSquare,
  Volume2, VolumeX, Loader2, Brain, Sparkle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  googleSignIn, logout, fetchEmailsList, markAsRead, 
  trashEmail, sendGmailEmail, createGmailDraft, 
  GmailEmail, initAuth 
} from '../lib/gmailService';

interface GmailSuiteProps {
  theme: 'midnight' | 'cyber';
  audioMuted: boolean;
  playSound: (type: 'send' | 'success' | 'click' | 'error', muted: boolean) => void;
  onClose: () => void;
}

type MailFolder = 'INBOX' | 'SENT' | 'DRAFT' | 'TRASH';

export const GmailSuite: React.FC<GmailSuiteProps> = ({
  theme,
  audioMuted,
  playSound,
  onClose
}) => {
  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Email states
  const [folder, setFolder] = useState<MailFolder>('INBOX');
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<GmailEmail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Compose / Reply states
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // AI Smart Tool states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAiText, setIsGeneratingAiText] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiReplyDraft, setAiReplyDraft] = useState<string | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [showAiWriter, setShowAiWriter] = useState(false);

  // Initialize Auth on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setIsAuthenticated(true);
      },
      () => {
        setIsAuthenticated(false);
        setAccessToken(null);
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch emails when folder or applied search changes
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadEmails(true);
    }
  }, [folder, appliedSearch, isAuthenticated, accessToken]);

  const loadEmails = async (reset = true) => {
    if (!accessToken) return;
    setIsLoadingEmails(true);
    try {
      // Build search query with folder filters
      let q = appliedSearch;
      if (folder === 'INBOX') {
        q = `${q} label:INBOX -label:TRASH`.trim();
      } else if (folder === 'SENT') {
        q = `${q} label:SENT -label:TRASH`.trim();
      } else if (folder === 'DRAFT') {
        q = `${q} label:DRAFT -label:TRASH`.trim();
      } else if (folder === 'TRASH') {
        q = `${q} label:TRASH`.trim();
      }

      const res = await fetchEmailsList(accessToken, q, 15, reset ? undefined : nextPageToken);
      if (reset) {
        setEmails(res.emails);
      } else {
        setEmails(prev => [...prev, ...res.emails]);
      }
      setNextPageToken(res.nextPageToken);
    } catch (err) {
      console.error("Failed to fetch emails:", err);
      playSound('error', audioMuted);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleSignIn = async () => {
    playSound('click', audioMuted);
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
        setIsAuthenticated(true);
        playSound('success', audioMuted);
      }
    } catch (err) {
      console.error("Sign-in failed:", err);
      playSound('error', audioMuted);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    playSound('click', audioMuted);
    if (window.confirm("Are you sure you want to sign out from Gmail?")) {
      await logout();
      setIsAuthenticated(false);
      setAccessToken(null);
      setGoogleUser(null);
      setSelectedEmail(null);
      setEmails([]);
      playSound('success', audioMuted);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound('click', audioMuted);
    setAppliedSearch(searchQuery);
  };

  const handleSelectEmail = async (email: GmailEmail) => {
    playSound('click', audioMuted);
    setSelectedEmail(email);
    setAiSummary(null);
    setAiReplyDraft(null);

    // If unread, mark as read
    if (email.isUnread && accessToken) {
      try {
        await markAsRead(accessToken, email.id);
        // Update local state
        setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isUnread: false } : e));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  const handleTrashEmail = async (emailId: string) => {
    if (!accessToken) return;
    playSound('click', audioMuted);
    
    const confirmed = window.confirm("Move this message to Trash?");
    if (!confirmed) return;

    try {
      await trashEmail(accessToken, emailId);
      setEmails(prev => prev.filter(e => e.id !== emailId));
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null);
      }
      playSound('success', audioMuted);
    } catch (err) {
      console.error("Trash failed:", err);
      playSound('error', audioMuted);
      alert("Failed to trash the email.");
    }
  };

  // AI Summarize handler
  const handleAiSummarize = async () => {
    if (!selectedEmail) return;
    playSound('click', audioMuted);
    setIsGeneratingSummary(true);
    setAiSummary(null);

    try {
      const emailContent = `From: ${selectedEmail.from}\nSubject: ${selectedEmail.subject}\nSnippet: ${selectedEmail.snippet}\n\nBody:\n${selectedEmail.body}`;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: 'standard',
          searchEnabled: false,
          messages: [
            {
              role: 'user',
              content: `Summarize this email comprehensively in 3 highly scannable, elegant bullet points with key highlights. Provide a brief recommendation if action is required. Always present with polished style. Here is the email:\n\n${emailContent}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      setAiSummary(data.text);
      playSound('success', audioMuted);
    } catch (err) {
      console.error("AI summary error:", err);
      playSound('error', audioMuted);
      setAiSummary("An error occurred while generating summary. Please try again.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // AI Smart Reply handler
  const handleAiGenerateReply = async () => {
    if (!selectedEmail) return;
    playSound('click', audioMuted);
    setIsGeneratingReply(true);
    setAiReplyDraft(null);

    try {
      const emailContent = `From: ${selectedEmail.from}\nSubject: ${selectedEmail.subject}\nBody:\n${selectedEmail.body}`;
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: 'standard',
          searchEnabled: false,
          messages: [
            {
              role: 'user',
              content: `Write a brilliant, articulate, polite, and contextual response draft to this email as if you are my elite executive AI assistant. Ensure it aligns nicely, handles any implicit requests, and sounds friendly but highly professional. Only output the reply body text itself, do not include subjects, "Dear [Name]", placeholders, or greetings unless required. Here is the email to reply to:\n\n${emailContent}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      setAiReplyDraft(data.text);
      playSound('success', audioMuted);
    } catch (err) {
      console.error("AI reply generator error:", err);
      playSound('error', audioMuted);
      setAiReplyDraft("Failed to generate AI reply.");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // AI Compose Assistant
  const handleAiWriteEmail = async () => {
    if (!aiPrompt.trim()) return;
    playSound('click', audioMuted);
    setIsGeneratingAiText(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine: 'standard',
          searchEnabled: false,
          messages: [
            {
              role: 'user',
              content: `Write a professional email body based on this objective: "${aiPrompt}". Do not include the Subject or To lines, only output the formatted HTML/rich email body. Make it premium and ready to send.`
            }
          ]
        })
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      setComposeBody(data.text);
      setShowAiWriter(false);
      playSound('success', audioMuted);
    } catch (err) {
      console.error("AI compose error:", err);
      playSound('error', audioMuted);
    } finally {
      setIsGeneratingAiText(false);
    }
  };

  // Send email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!composeTo.trim()) {
      alert("Please specify a recipient.");
      return;
    }

    playSound('click', audioMuted);
    const confirmed = window.confirm(`Send this email to ${composeTo}?`);
    if (!confirmed) return;

    setIsSending(true);
    try {
      await sendGmailEmail(accessToken, composeTo, composeSubject || '(No Subject)', composeBody);
      playSound('send', audioMuted);
      setIsComposing(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      loadEmails(true);
    } catch (err) {
      console.error("Send failed:", err);
      playSound('error', audioMuted);
      alert("Failed to send email.");
    } finally {
      setIsSending(false);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!accessToken) return;
    if (!composeTo.trim() && !composeSubject.trim()) {
      alert("Enter a recipient or subject to save draft.");
      return;
    }

    playSound('click', audioMuted);
    try {
      await createGmailDraft(accessToken, composeTo, composeSubject || '(No Subject)', composeBody);
      playSound('success', audioMuted);
      alert("Draft saved successfully.");
      setIsComposing(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      loadEmails(true);
    } catch (err) {
      console.error("Draft failed:", err);
      playSound('error', audioMuted);
    }
  };

  const initReplyForm = (email: GmailEmail) => {
    playSound('click', audioMuted);
    // Find reply email address
    let replyTo = email.from;
    const match = email.from.match(/<(.+?)>/);
    if (match) replyTo = match[1];

    setComposeTo(replyTo);
    setComposeSubject(email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`);
    setComposeBody(`\n\nOn ${email.date}, ${email.from} wrote:\n> ${email.body.substring(0, 300).replace(/\n/g, '\n> ')}`);
    setIsComposing(true);
  };

  // --- RENDERING PARSER ---

  const isThemeCyber = theme === 'cyber';

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isThemeCyber ? 'theme-cyber' : 'theme-midnight'} bg-slate-950 text-slate-100 overflow-hidden`}>
      {/* Top Bar Navigation */}
      <div className="h-16 border-b border-slate-900 bg-slate-950/90 backdrop-blur-xl px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            title="Return to Intelligence Center"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5 select-none">
            <div className={`p-1.5 rounded-lg border flex-shrink-0 ${isThemeCyber ? 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20 shadow-[0_0_10px_rgba(6,182,212,0.25)]' : 'border-violet-500/20 text-violet-400 bg-violet-950/15'}`}>
              <Mail className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-sm tracking-wider flex items-center gap-2">
              ARIELLA <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest ${isThemeCyber ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300' : 'bg-violet-500/20 border border-violet-500/30 text-violet-300'}`}>GMAIL SUITE</span>
            </span>
          </div>
        </div>

        {isAuthenticated && googleUser && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-slate-200">{googleUser.displayName}</span>
              <span className="text-[10px] text-slate-500 font-mono">{googleUser.email}</span>
            </div>
            <img 
              src={googleUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${googleUser.uid}`} 
              alt={googleUser.displayName || 'Google user'} 
              className="w-8 h-8 rounded-full border border-slate-800"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl border border-slate-800 hover:border-rose-500 bg-slate-950 hover:bg-rose-950/10 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
              title="Disconnect Google Account"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {!isAuthenticated ? (
        // Gateway Landing Page / Authenticator
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
          {/* Subtle tech background shapes */}
          <div className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none -top-20 -left-20 ${isThemeCyber ? 'bg-cyan-500' : 'bg-violet-500'}`} />
          <div className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none -bottom-20 -right-20 ${isThemeCyber ? 'bg-fuchsia-500' : 'bg-fuchsia-500'}`} />

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-slate-950/80 border border-slate-800/90 rounded-2xl p-8 shadow-2xl text-center space-y-6 relative z-10"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight font-display">Secure Workspace Connection</h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Authorize Ariella to connect directly to your Gmail account. This enables seamless reading, smart email summaries, and fast AI-composed response drafts.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-950/5 text-[11px] text-amber-400/90 leading-relaxed flex gap-2.5 items-start text-left font-mono">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>We value your confidentiality. Your access token is handled entirely in memory and never stored on any persistent disk or server database.</span>
            </div>

            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isAuthenticating ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
              ) : (
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              )}
              <span>Connect Google Account</span>
            </button>
          </motion.div>
        </div>
      ) : (
        // Gmail Workspace View
        <div className="flex-1 flex overflow-hidden">
          {/* Email Sidebar */}
          <div className="w-64 border-r border-slate-900 bg-slate-950 flex flex-col h-full flex-shrink-0 select-none">
            <div className="p-4">
              <button
                onClick={() => {
                  playSound('click', audioMuted);
                  setIsComposing(true);
                  setComposeTo('');
                  setComposeSubject('');
                  setComposeBody('');
                }}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-xs tracking-wider transition-all shadow-lg cursor-pointer ${isThemeCyber ? 'border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/45 text-cyan-400 hover:border-cyan-500/50' : 'border-violet-500/30 bg-violet-950/15 hover:bg-violet-950/30 text-violet-300 hover:border-violet-500/50'}`}
              >
                <PenSquare className="h-4 w-4" />
                COMPOSE DISPATCH
              </button>
            </div>

            <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {[
                { id: 'INBOX', label: 'Inbox', icon: Inbox },
                { id: 'SENT', label: 'Sent Mail', icon: Send },
                { id: 'DRAFT', label: 'Drafts', icon: FileText },
                { id: 'TRASH', label: 'Trash Bin', icon: Trash2 }
              ].map(item => {
                const FolderIcon = item.icon;
                const isFolderActive = folder === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playSound('click', audioMuted);
                      setFolder(item.id as MailFolder);
                      setSelectedEmail(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                      isFolderActive
                        ? isThemeCyber 
                          ? 'bg-slate-900 border-cyan-500/30 text-cyan-400' 
                          : 'bg-slate-900 border-violet-500/25 text-violet-400'
                        : 'bg-transparent border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FolderIcon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>SECURITY: MEMORY</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Center Pane: Email list */}
          <div className="flex-1 flex flex-col border-r border-slate-900 bg-slate-950/40">
            {/* Search and refresh row */}
            <div className="p-4 border-b border-slate-900 flex items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 focus-within:border-slate-800">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search email threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-200 outline-none w-full"
                />
              </form>
              <button
                onClick={() => {
                  playSound('click', audioMuted);
                  loadEmails(true);
                }}
                disabled={isLoadingEmails}
                className="p-2.5 rounded-xl border border-slate-900 bg-slate-950 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                title="Refresh mailbox list"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingEmails ? 'animate-spin text-violet-400' : ''}`} />
              </button>
            </div>

            {/* Email list or loading */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-900/50 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {isLoadingEmails && emails.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                  <span className="text-xs font-mono">Decoding secure matrix data...</span>
                </div>
              ) : emails.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 text-center p-6 text-slate-600">
                  <Mail className="h-8 w-8 text-slate-800" />
                  <span className="text-xs font-semibold font-display">Inbox Empty</span>
                  <span className="text-[10px] text-slate-600 max-w-[200px]">No emails found matching search parameters.</span>
                </div>
              ) : (
                emails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <div
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`p-4 transition-all duration-200 cursor-pointer flex items-start gap-3 border-l-2 ${
                        isSelected
                          ? isThemeCyber
                            ? 'bg-slate-900 border-cyan-500'
                            : 'bg-slate-900 border-violet-500'
                          : email.isUnread
                            ? isThemeCyber
                              ? 'bg-cyan-950/5 border-cyan-500/40 hover:bg-slate-900/20'
                              : 'bg-violet-950/5 border-violet-500/20 hover:bg-slate-900/20'
                            : 'border-transparent hover:bg-slate-900/20'
                      }`}
                    >
                      {/* Unread circle badge */}
                      <div className="mt-1.5 flex-shrink-0">
                        {email.isUnread ? (
                          <div className={`w-2.5 h-2.5 rounded-full ${isThemeCyber ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]'}`} />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold truncate ${email.isUnread ? 'text-slate-100' : 'text-slate-300'}`}>
                            {email.from.split(' <')[0]}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">
                            {new Date(email.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <h4 className={`text-xs truncate ${email.isUnread ? 'text-slate-200 font-bold' : 'text-slate-400'}`}>
                          {email.subject}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate max-w-sm">
                          {email.snippet}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              {nextPageToken && !isLoadingEmails && (
                <div className="p-3 text-center">
                  <button
                    onClick={() => {
                      playSound('click', audioMuted);
                      loadEmails(false);
                    }}
                    className="px-4 py-1.5 rounded-lg border border-slate-900 bg-slate-950 text-[10px] text-slate-400 hover:text-slate-200 transition-all cursor-pointer font-mono"
                  >
                    LOAD ADDITIONAL DISPATCHES
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane: Full email details & AI smart features */}
          <div className="w-1/2 flex flex-col bg-slate-950 overflow-hidden">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col h-full">
                {/* Email details card */}
                <div className="p-5 border-b border-slate-900 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-sm font-bold font-display text-slate-100 leading-snug">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => initReplyForm(selectedEmail)}
                        className={`p-2 rounded-xl border border-slate-900 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-800 transition-all cursor-pointer`}
                        title="Formulate Response"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleTrashEmail(selectedEmail.id)}
                        className="p-2 rounded-xl border border-slate-900 bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-950/30 transition-all cursor-pointer"
                        title="Move to Trash Bin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500 font-mono mr-1">FROM:</span>
                      <span className="text-slate-300 font-medium">{selectedEmail.from}</span>
                    </div>
                    {selectedEmail.to && (
                      <div>
                        <span className="text-slate-500 font-mono mr-1">TO:</span>
                        <span className="text-slate-300">{selectedEmail.to}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500 font-mono mr-1">DATE:</span>
                      <span className="text-slate-300">{selectedEmail.date}</span>
                    </div>
                  </div>
                </div>

                {/* Email body render & AI Tools */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                  {/* AI Smart Tools Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleAiSummarize}
                      disabled={isGeneratingSummary}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border bg-slate-950/80 text-[11px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${isThemeCyber ? 'border-cyan-500/20 text-cyan-400 hover:border-cyan-500/40 shadow-glow-sm' : 'border-violet-500/10 text-violet-400 hover:border-violet-500/30 shadow-glow-sm'}`}
                    >
                      {isGeneratingSummary ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                      ) : (
                        <Brain className="h-3.5 w-3.5" />
                      )}
                      ARIELLA AI COGNITIVE SUMMARY
                    </button>

                    <button
                      onClick={handleAiGenerateReply}
                      disabled={isGeneratingReply}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border bg-slate-950/80 text-[11px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${isThemeCyber ? 'border-cyan-500/20 text-cyan-400 hover:border-cyan-500/40' : 'border-violet-500/10 text-violet-400 hover:border-violet-500/30'}`}
                    >
                      {isGeneratingReply ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      ARIELLA SMART RESPONSE DRAFT
                    </button>
                  </div>

                  {/* AI Results */}
                  <AnimatePresence>
                    {aiSummary && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 relative overflow-hidden ${isThemeCyber ? 'border-cyan-500/20 bg-cyan-950/10' : 'border-violet-500/10 bg-violet-950/5'}`}
                      >
                        <div className="flex items-center gap-2 mb-1.5 font-bold tracking-wider text-[10px] uppercase">
                          <Brain className={`h-3.5 w-3.5 ${isThemeCyber ? 'text-cyan-400' : 'text-violet-400'}`} />
                          <span className={isThemeCyber ? 'text-cyan-400' : 'text-violet-400'}>Cognitive Highlights</span>
                        </div>
                        <div className="text-slate-300 whitespace-pre-line pl-1.5 border-l border-slate-800">
                          {aiSummary}
                        </div>
                        <button 
                          onClick={() => setAiSummary(null)}
                          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    )}

                    {aiReplyDraft && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-4 rounded-xl border text-xs leading-relaxed space-y-3 relative overflow-hidden ${isThemeCyber ? 'border-cyan-500/20 bg-cyan-950/10' : 'border-violet-500/10 bg-violet-950/5'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 font-bold tracking-wider text-[10px] uppercase">
                          <Sparkles className={`h-3.5 w-3.5 ${isThemeCyber ? 'text-cyan-400' : 'text-violet-400'}`} />
                          <span className={isThemeCyber ? 'text-cyan-400' : 'text-violet-400'}>Contextual Reply Formulation</span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap font-sans leading-relaxed pl-1.5 border-l border-slate-800">
                          {aiReplyDraft}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              playSound('click', audioMuted);
                              // Strip greetings if matching signature or similar, then use as body
                              setComposeTo(selectedEmail.from.match(/<(.+?)>/)?.[1] || selectedEmail.from);
                              setComposeSubject(selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`);
                              setComposeBody(aiReplyDraft);
                              setIsComposing(true);
                              setAiReplyDraft(null);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wide transition-all cursor-pointer ${isThemeCyber ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-950/40' : 'border-violet-500/20 bg-violet-950/10 text-violet-300 hover:bg-violet-950/20'}`}
                          >
                            <FileText className="h-3 w-3" />
                            TRANSFER TO COMPOSER
                          </button>
                        </div>
                        <button 
                          onClick={() => setAiReplyDraft(null)}
                          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message body content */}
                  <div className="border border-slate-900 bg-slate-950/50 rounded-2xl p-5 relative">
                    <span className="absolute top-3 right-3 text-[9px] font-mono text-slate-600 tracking-wider">MESS_BODY</span>
                    {selectedEmail.htmlBody ? (
                      <iframe
                        srcDoc={`
                          <html>
                            <head>
                              <style>
                                body {
                                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                                  font-size: 13px;
                                  line-height: 1.6;
                                  color: #e2e8f0;
                                  background-color: transparent;
                                  margin: 0;
                                  padding: 0;
                                  word-break: break-word;
                                }
                                a { color: #8b5cf6; text-decoration: none; }
                                a:hover { text-decoration: underline; }
                              </style>
                            </head>
                            <body>
                              ${selectedEmail.htmlBody}
                            </body>
                          </html>
                        `}
                        className="w-full h-[380px] bg-transparent border-0"
                        title="email-body-iframe"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                        {selectedEmail.body}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-600 gap-3">
                <Mail className="h-10 w-10 text-slate-800" />
                <div>
                  <h3 className="text-xs font-semibold font-display text-slate-500">No Email Selected</h3>
                  <p className="text-[10px] text-slate-600 max-w-xs mt-1">Select any email transmission on the left to display its full decodable contents and core metadata.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dispatch Composer Slide-over Modal */}
      <AnimatePresence>
        {isComposing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800/90 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenSquare className="h-4.5 w-4.5 text-violet-400" />
                  <span className="text-xs font-bold tracking-wider font-mono">FORMULATE OUTGOING DISPATCH</span>
                </div>
                <button
                  onClick={() => setIsComposing(false)}
                  className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Compose fields */}
              <form onSubmit={handleSendEmail} className="p-5 flex-1 overflow-y-auto space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center border-b border-slate-900/80 py-1">
                    <span className="text-[10px] font-mono text-slate-500 mr-3 w-10">TO:</span>
                    <input
                      type="email"
                      required
                      placeholder="recipient@domain.com"
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      className="bg-transparent border-0 text-xs text-slate-200 outline-none w-full"
                    />
                  </div>

                  <div className="flex items-center border-b border-slate-900/80 py-1">
                    <span className="text-[10px] font-mono text-slate-500 mr-3 w-10">SUBJECT:</span>
                    <input
                      type="text"
                      placeholder="Dispatch Subject"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      className="bg-transparent border-0 text-xs text-slate-200 outline-none w-full"
                    />
                  </div>
                </div>

                {/* AI Writer Section */}
                <div className="border border-slate-900/80 rounded-xl bg-slate-950/50 p-3.5 space-y-2">
                  <div 
                    onClick={() => {
                      playSound('click', audioMuted);
                      setShowAiWriter(!showAiWriter);
                    }}
                    className="flex items-center justify-between cursor-pointer text-[10px] font-bold text-violet-400 uppercase tracking-wide select-none hover:text-violet-300 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkle className="h-3.5 w-3.5 animate-pulse" />
                      <span>Compose with Ariella AI Writer</span>
                    </div>
                    <span className="text-[8px] border border-violet-800/20 bg-violet-950/20 px-1.5 py-0.5 rounded">
                      {showAiWriter ? 'HIDE PANEL' : 'OPEN PANEL'}
                    </span>
                  </div>

                  <AnimatePresence>
                    {showAiWriter && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2.5 overflow-hidden pt-1.5"
                      >
                        <p className="text-[9px] text-slate-500">Provide instructions (e.g. "Draft an email requesting a client meeting update") and let Ariella craft the copy:</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ariella AI writing objective..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAiWriteEmail}
                            disabled={isGeneratingAiText || !aiPrompt.trim()}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 cursor-pointer ${isThemeCyber ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400' : 'border-violet-500/30 bg-violet-950/15 text-violet-300'}`}
                          >
                            {isGeneratingAiText ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Sparkles className="h-3 w-3" />
                            )}
                            WRITE
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Body textarea */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 block">BODY TRANSLATION:</span>
                  <textarea
                    rows={10}
                    placeholder="Type dispatch content here..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl p-4 text-xs text-slate-300 outline-none focus:border-slate-800 transition-all font-sans leading-relaxed"
                  />
                </div>

                {/* Footer Controls */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="px-4 py-2 rounded-xl border border-slate-900 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-slate-800 text-xs font-semibold transition-all cursor-pointer"
                  >
                    SAVE OUTGOING DRAFT
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsComposing(false)}
                      className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      ABORT
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>TRANSMITTING...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>SEND DISPATCH</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
