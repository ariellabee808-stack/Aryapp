import React, { useState, useEffect } from 'react';
import { Check, Copy, Code } from 'lucide-react';

interface FormattedTextProps {
  text: string;
  animateTyping?: boolean;
  onTypingComplete?: () => void;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ 
  text, 
  animateTyping = false,
  onTypingComplete 
}) => {
  if (!text) return null;

  const [displayedLength, setDisplayedLength] = useState(() => {
    return animateTyping ? Math.min(10, text.length) : text.length;
  });
  const [isTyping, setIsTyping] = useState(animateTyping);

  useEffect(() => {
    if (!animateTyping) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      return;
    }

    if (displayedLength >= text.length) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);

    const interval = setInterval(() => {
      setDisplayedLength((prev) => {
        // Dynamic snappy typing speed
        const chunk = Math.max(3, Math.ceil((text.length - prev) / 30));
        const next = prev + chunk;
        if (next >= text.length) {
          clearInterval(interval);
          setIsTyping(false);
          if (onTypingComplete) onTypingComplete();
          return text.length;
        }
        return next;
      });
    }, 15);

    return () => clearInterval(interval);
  }, [text, animateTyping]);

  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      if (onTypingComplete) onTypingComplete();
    }
  };

  const currentText = isTyping ? text.slice(0, displayedLength) : text;

  // Split by code blocks
  const parts = currentText.split(/(```[\s\S]*?```)/g);

  return (
    <div 
      onClick={handleSkipTyping}
      className={`space-y-4 leading-relaxed text-slate-100 selection:bg-violet-500/30 selection:text-white ${
        isTyping ? 'cursor-pointer' : ''
      }`}
      title={isTyping ? "Click to reveal full response instantly" : undefined}
    >
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // It's a code block
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);
          return <CodeBlock key={index} language={lang} code={code.trim()} />;
        } else {
          // Standard text block
          return <TextBlock key={index} content={part} />;
        }
      })}

      {isTyping && (
        <span className="inline-flex items-center gap-1 text-violet-400 font-mono text-xs font-bold animate-pulse ml-1 align-middle bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-500/30">
          <span className="w-1.5 h-3.5 bg-violet-400 animate-ping inline-block rounded-xs" />
          <span className="text-[10px] text-violet-300">typing... (click to skip)</span>
        </span>
      )}
    </div>
  );
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-violet-400" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-sm leading-6 text-slate-200">
        <pre className="whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const TextBlock: React.FC<{ content: string }> = ({ content }) => {
  const paragraphs = content.split('\n\n');

  return (
    <>
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Check if it's a table
        if (trimmed.includes('|') && trimmed.split('\n').length > 1) {
          return <TableBlock key={pIdx} content={trimmed} />;
        }

        // Check if it's a list item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n');
          return (
            <ul key={pIdx} className="my-3 list-inside list-disc space-y-2 pl-2 text-slate-200">
              {items.map((item, iIdx) => {
                const cleaned = item.replace(/^[-*]\s*|^\d+\.\s*/, '');
                return (
                  <li key={iIdx} className="marker:text-violet-400">
                    <span className="pl-1">{renderInlineStyling(cleaned)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Check if it's a heading
        if (trimmed.startsWith('#')) {
          const hashCount = (trimmed.match(/^#+/) || [''])[0].length;
          const text = trimmed.replace(/^#+\s*/, '');
          const sizeClass = 
            hashCount === 1 ? 'text-2xl font-bold text-white mt-6 mb-3 border-b border-slate-800 pb-1.5' :
            hashCount === 2 ? 'text-xl font-bold text-white mt-5 mb-2.5' :
            'text-lg font-semibold text-slate-200 mt-4 mb-2';
          return (
            <h4 key={pIdx} className={`${sizeClass} tracking-tight`}>
              {renderInlineStyling(text)}
            </h4>
          );
        }

        // Standard paragraph
        return (
          <p key={pIdx} className="mb-3 text-slate-200 last:mb-0">
            {renderInlineStyling(trimmed)}
          </p>
        );
      })}
    </>
  );
};

const TableBlock: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.startsWith('|'));
  if (lines.length < 2) return <p className="text-slate-200">{content}</p>;

  // Parse headers
  const headers = lines[0]
    .split('|')
    .slice(1, -1)
    .map(cell => cell.trim());

  // Check if second line is separator
  const hasSeparator = lines[1].replace(/[\s|-|:]/g, '') === '';
  const dataLines = hasSeparator ? lines.slice(2) : lines.slice(1);

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-300 font-semibold">
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {dataLines.map((line, rowIdx) => {
              const cells = line
                .split('|')
                .slice(1, -1)
                .map(cell => cell.trim());
              return (
                <tr key={rowIdx} className="hover:bg-slate-900/10 transition-colors">
                  {cells.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2.5 text-slate-300">
                      {renderInlineStyling(cell)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Simple helper to parse bold, italic, and inline code
function renderInlineStyling(text: string): React.ReactNode[] {
  // Split by bold (**text**) or inline code (`code`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-pink-400 border border-slate-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
