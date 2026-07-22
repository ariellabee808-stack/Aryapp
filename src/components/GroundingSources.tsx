import React from 'react';
import { Search, Globe, ArrowUpRight } from 'lucide-react';
import { GroundingSource } from '../types';

interface GroundingSourcesProps {
  queries?: string[];
  sources?: GroundingSource[];
}

export const GroundingSources: React.FC<GroundingSourcesProps> = ({ queries = [], sources = [] }) => {
  if (queries.length === 0 && sources.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
      {/* Search queries heading */}
      {queries.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Search className="h-3.5 w-3.5 text-violet-400" />
          <span>Queried Google Search:</span>
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {queries.map((q, idx) => (
              <span
                key={idx}
                className="bg-violet-950/40 text-violet-300 border border-violet-800/30 px-2 py-0.5 rounded font-medium text-[11px]"
              >
                "{q}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sources list */}
      {sources.length > 0 && (
        <div className="flex flex-col gap-2 mt-1 border-t border-slate-800/50 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            <span>Search Sources:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {sources.map((source, idx) => (
              <a
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg border border-slate-800/60 bg-slate-950/40 hover:border-violet-500/30 hover:bg-violet-950/10 transition-all group"
              >
                <div className="flex flex-col overflow-hidden pr-2">
                  <span className="text-xs font-medium text-slate-200 truncate group-hover:text-violet-300">
                    {source.title}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate mt-0.5">
                    {source.uri}
                  </span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
