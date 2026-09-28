'use client';

import { useState, useRef, useEffect } from 'react';
import { Lightbulb, MessageCircleQuestion, Bug, Gauge, Mic, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'HINT' | 'SOCRATIC' | 'DEBUG' | 'COMPLEXITY' | 'INTERVIEW';

const MODES: { key: Mode; label: string; icon: typeof Lightbulb; blurb: string }[] = [
  { key: 'HINT', label: 'Hint', icon: Lightbulb, blurb: 'One small nudge at a time' },
  { key: 'SOCRATIC', label: 'Socratic', icon: MessageCircleQuestion, blurb: 'Questions, not answers' },
  { key: 'DEBUG', label: 'Debug', icon: Bug, blurb: 'Find the bug together' },
  { key: 'COMPLEXITY', label: 'Complexity', icon: Gauge, blurb: 'Big-O breakdown' },
  { key: 'INTERVIEW', label: 'Interview', icon: Mic, blurb: 'Full mock interview' },
];

type Msg = { role: 'user' | 'assistant'; content: string };

export function AIMentorPanel({ problemSlug, getCode }: { problemSlug: string; getCode: () => string }) {
  const [mode, setMode] = useState<Mode>('HINT');
  const [messagesByMode, setMessagesByMode] = useState<Record<Mode, Msg[]>>({
    HINT: [],
    SOCRATIC: [],
    DEBUG: [],
    COMPLEXITY: [],
    INTERVIEW: [],
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = messagesByMode[mode];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    setMessagesByMode((m) => ({ ...m, [mode]: [...m[mode], { role: 'user', content: text }] }));
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, message: text, problemSlug, code: getCode() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'The AI mentor is unavailable.');
      setMessagesByMode((m) => ({ ...m, [mode]: [...m[mode], { role: 'assistant', content: data.reply }] }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const activeModeMeta = MODES.find((m) => m.key === mode)!;

  return (
    <div className="rounded-xl border border-obsidian-600 bg-obsidian-900/60 flex flex-col h-[32rem]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-obsidian-700">
        <Sparkles size={16} className="text-arcane-400" />
        <span className="font-display text-sm">Sage</span>
        <span className="text-xs text-mist">— {activeModeMeta.blurb}</span>
      </div>

      <div className="flex gap-1 px-3 py-2 border-b border-obsidian-700 overflow-x-auto">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors',
              mode === m.key ? 'bg-arcane-500/20 text-arcane-300 border border-arcane-500/40' : 'text-mist hover:text-parchment'
            )}
          >
            <m.icon size={13} /> {m.label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-mist italic">
            {mode === 'INTERVIEW'
              ? 'Say "start" and Sage will kick off a mock interview for this problem.'
              : 'Ask Sage anything about this problem — she can see your current code.'}
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'text-sm rounded-lg px-3 py-2 max-w-[90%] whitespace-pre-wrap',
              m.role === 'user' ? 'bg-arcane-500/15 ml-auto text-parchment' : 'bg-obsidian-800 text-parchment'
            )}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="text-xs text-mist italic">Sage is thinking…</div>}
        {error && <div className="text-xs text-ember_red-400">{error}</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 p-3 border-t border-obsidian-700"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Sage…"
          className="flex-1 bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-arcane-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-lg bg-arcane-500 hover:bg-arcane-400 disabled:opacity-40 text-obsidian-950"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
