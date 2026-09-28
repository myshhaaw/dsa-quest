'use client';

export function CodeEditor({
  value,
  onChange,
  language,
}: {
  value: string;
  onChange: (v: string) => void;
  language: 'javascript' | 'python';
}) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const indent = '  ';
      const next = value.slice(0, start) + indent + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + indent.length;
      });
    }
  }

  return (
    <div className="rounded-lg border border-obsidian-600 bg-obsidian-950 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-obsidian-700 bg-obsidian-900">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-ember_red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-ember-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-verdant-500/70" />
        </div>
        <span className="text-xs font-mono text-mist">
          {language === 'javascript' ? 'solution.js' : 'solution.py'}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="w-full h-80 resize-y bg-transparent p-4 font-mono text-sm text-parchment outline-none leading-relaxed"
      />
    </div>
  );
}
