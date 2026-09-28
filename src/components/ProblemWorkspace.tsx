'use client';

import { useState } from 'react';
import { Play, Send, Trophy } from 'lucide-react';
import { CodeEditor } from './CodeEditor';
import { ResultsPanel } from './ResultsPanel';
import { AIMentorPanel } from './AIMentorPanel';

type Language = 'javascript' | 'python';

export function ProblemWorkspace({
  slug,
  starterCode,
}: {
  slug: string;
  starterCode: Record<string, string>;
}) {
  const [language, setLanguage] = useState<Language>(
    (Object.keys(starterCode)[0] as Language) ?? 'javascript'
  );
  const [code, setCode] = useState(starterCode[language] ?? '');
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState<'run' | 'submit' | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);

  function switchLanguage(lang: Language) {
    setLanguage(lang);
    setCode(starterCode[lang] ?? '');
    setResult(null);
  }

  async function run() {
    setBusy('run');
    setResult(null);
    const res = await fetch(`/api/problems/${slug}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    setResult(await res.json());
    setBusy(null);
  }

  async function submit() {
    setBusy('submit');
    setResult(null);
    setCelebration(null);
    const res = await fetch(`/api/problems/${slug}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    const data = await res.json();
    setResult(data);
    setBusy(null);
    if (data.firstSolve) {
      setCelebration(
        `Solved! ${data.leveledUp ? 'Level up! ' : ''}${
          data.newAchievements?.length ? `Unlocked: ${data.newAchievements.map((a: any) => a.title).join(', ')}` : ''
        }`
      );
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            {Object.keys(starterCode).map((lang) => (
              <button
                key={lang}
                onClick={() => switchLanguage(lang as Language)}
                className={
                  'px-3 py-1.5 rounded-md text-xs font-mono transition-colors ' +
                  (lang === language
                    ? 'bg-arcane-500/20 text-arcane-300 border border-arcane-500/40'
                    : 'text-mist hover:text-parchment border border-transparent')
                }
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={run}
              disabled={busy !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-obsidian-600 hover:border-obsidian-500 text-sm disabled:opacity-50"
            >
              <Play size={14} /> {busy === 'run' ? 'Running…' : 'Run samples'}
            </button>
            <button
              onClick={submit}
              disabled={busy !== null}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-arcane-500 hover:bg-arcane-400 text-obsidian-950 font-medium text-sm disabled:opacity-50"
            >
              <Send size={14} /> {busy === 'submit' ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>

        <CodeEditor value={code} onChange={setCode} language={language} />

        {celebration && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-ember-500/50 bg-ember-500/10 px-4 py-3 text-sm text-ember-400 animate-popIn">
            <Trophy size={16} /> {celebration}
          </div>
        )}

        {result && (
          <div className="mt-4">
            <ResultsPanel
              status={result.status ?? 'ERROR'}
              passedCount={result.passedCount ?? 0}
              totalCount={result.totalCount ?? 0}
              errorOutput={result.errorOutput ?? result.error}
              cases={result.cases ?? []}
            />
          </div>
        )}
      </div>

      <AIMentorPanel problemSlug={slug} getCode={() => code} />
    </div>
  );
}
