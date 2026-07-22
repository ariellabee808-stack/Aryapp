import React, { useState } from 'react';
import { 
  MessageSquare, Plus, Trash2, Edit2, Check, X,
  Brain, Sparkles, Cpu, Settings, Globe, Download,
  FileText, FileJson
} from 'lucide-react';
import { ChatSession } from '../types';
import { exportChatAsMarkdown, exportChatAsJson } from '../lib/exportUtils';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAll: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onClearAll
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [exportMenuId, setExportMenuId] = useState<string | null>(null);

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div className="w-80 border-r border-slate-900 bg-slate-950 flex flex-col h-full flex-shrink-0 select-none">
      {/* Upper Logo / Brand header */}
      <div className="p-5 border-b border-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Brain className="h-5 w-5 animate-pulse" />
          </div>
          <span className="font-extrabold text-slate-100 tracking-wider text-sm flex items-center gap-1.5">
            ARIELLA <span className="text-[10px] bg-violet-500/20 border border-violet-500/30 text-violet-300 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest leading-none">CORE</span>
          </span>
        </div>
      </div>

      {/* New Session Button */}
      <div className="p-4">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-violet-500/30 bg-violet-950/15 hover:bg-violet-950/30 text-violet-300 font-bold text-sm tracking-wide transition-all shadow-lg shadow-violet-500/5 hover:border-violet-500/50"
        >
          <Plus className="h-4 w-4" />
          INITIATE COGNITION
        </button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <MessageSquare className="h-8 w-8 text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">No active matrix traces found.</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isEditing = session.id === editingId;

            // Get icon of active engine in the session
            const EngineIcon = 
              session.engine === 'reasoning' ? Brain : 
              session.engine === 'creative' ? Sparkles : 
              Cpu;

            return (
              <div
                key={session.id}
                onClick={() => !isEditing && onSelectSession(session.id)}
                className={`group flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 border-slate-800 shadow-md shadow-black/10'
                    : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <div className={`p-1.5 rounded-lg border flex-shrink-0 ${
                    isActive 
                      ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-500 group-hover:text-slate-400'
                  }`}>
                    <EngineIcon className="h-4 w-4" />
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-slate-950 border border-violet-500/40 text-slate-200 rounded px-2 py-1 text-xs font-mono outline-none w-full"
                      autoFocus
                    />
                  ) : (
                    <div className="flex flex-col overflow-hidden">
                      <span className={`text-xs font-semibold truncate ${isActive ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {session.title}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                        {session.messages.length} vectors
                        {session.searchEnabled && (
                          <span className="flex items-center gap-0.5 text-emerald-500 text-[9px] font-bold">
                            <Globe className="h-2 w-2" /> Grounded
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit / Delete actions */}
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => saveRename(session.id, e)}
                        className="p-1 rounded hover:bg-slate-800 text-emerald-400"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExportMenuId(exportMenuId === session.id ? null : session.id);
                          }}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Download / Export Chat"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>

                        {exportMenuId === session.id && (
                          <div 
                            className="absolute right-0 top-6 z-50 w-44 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-1.5 space-y-1 backdrop-blur-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                exportChatAsMarkdown(session);
                                setExportMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-200 hover:bg-violet-600/20 hover:text-violet-300 transition-colors text-left"
                            >
                              <FileText className="h-3.5 w-3.5 text-violet-400" />
                              <span>Markdown (.md)</span>
                            </button>
                            <button
                              onClick={() => {
                                exportChatAsJson(session);
                                setExportMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-200 hover:bg-cyan-600/20 hover:text-cyan-300 transition-colors text-left"
                            >
                              <FileJson className="h-3.5 w-3.5 text-cyan-400" />
                              <span>JSON (.json)</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => startRename(session, e)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Rename Chat"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="p-1 rounded hover:bg-slate-800/80 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Controls */}
      <div className="p-4 border-t border-slate-900/80 flex flex-col gap-3">
        {sessions.length > 0 && (
          <button
            onClick={onClearAll}
            className="w-full text-center py-2 px-3 rounded-lg border border-rose-500/20 bg-rose-950/5 hover:bg-rose-950/25 text-rose-400 font-semibold text-xs tracking-wide transition-all"
          >
            CLEAR ALL MATRIX DATA
          </button>
        )}
        <div className="flex flex-col gap-1.5 text-[10px] text-slate-500 font-mono">
          <div className="flex items-center justify-between">
            <span>Active Interface v3.5</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow animate-pulse" />
              Online
            </span>
          </div>
          <div className="text-center text-violet-300 border-t border-slate-900/40 pt-1.5 text-[9px] font-semibold tracking-wider">
            ✨ CREATED BY ARIELLA AGNES 🎨
          </div>
        </div>
      </div>
    </div>
  );
};
