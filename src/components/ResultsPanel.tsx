'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type CaseResult = {
  passed: boolean;
  input?: unknown;
  expected?: unknown;
  output?: unknown;
  error?: string;
  isSample?: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  RUNTIME_ERROR: 'Runtime Error',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  COMPILE_ERROR: 'Compile Error',
};

const STATUS_COLOR: Record<string, string> = {
  ACCEPTED: 'text-verdant-400',
  WRONG_ANSWER: 'text-ember_red-400',
  RUNTIME_ERROR: 'text-ember_red-400',
  TIME_LIMIT_EXCEEDED: 'text-ember-400',
  COMPILE_ERROR: 'text-ember_red-400',
};

export function ResultsPanel({
  status,
  passedCount,
  totalCount,
  errorOutput,
  cases,
}: {
  status: string;
  passedCount: number;
  totalCount: number;
  errorOutput?: string | null;
  cases: CaseResult[];
}) {
  const visibleCases = cases.filter((c) => c.isSample !== false);

  return (
    <div className="rounded-lg border border-obsidian-600 bg-obsidian-900/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={cn('font-display', STATUS_COLOR[status] ?? 'text-parchment')}>
          {STATUS_LABEL[status] ?? status}
        </span>
        <span className="text-xs font-mono text-mist">
          {passedCount}/{totalCount} passed
        </span>
      </div>
      {errorOutput && (
        <pre className="text-xs font-mono text-ember_red-400 whitespace-pre-wrap mb-3 bg-obsidian-950 rounded p-2 border border-obsidian-700">
          {errorOutput}
        </pre>
      )}
      <div className="space-y-2">
        {visibleCases.map((c, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-xs font-mono rounded border border-obsidian-700 bg-obsidian-950 p-2"
          >
            {c.passed ? (
              <CheckCircle2 size={14} className="text-verdant-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={14} className="text-ember_red-400 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <div className="text-mist">input: {JSON.stringify(c.input)}</div>
              <div className="text-mist">expected: {JSON.stringify(c.expected)}</div>
              <div className={c.passed ? 'text-verdant-400' : 'text-ember_red-400'}>
                {c.error ? `error: ${c.error}` : `got: ${JSON.stringify(c.output)}`}
              </div>
            </div>
          </div>
        ))}
        {cases.length > visibleCases.length && (
          <p className="text-xs text-mist italic">
            + {cases.length - visibleCases.length} hidden test case(s) also graded.
          </p>
        )}
      </div>
    </div>
  );
}
