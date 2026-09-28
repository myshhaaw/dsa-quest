'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Question = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export function LessonQuiz({
  lessonId,
  questions,
  alreadyCompleted,
  xpReward,
}: {
  lessonId: string;
  questions: Question[];
  alreadyCompleted: boolean;
  xpReward: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(alreadyCompleted);
  const [saving, setSaving] = useState(false);
  const [reward, setReward] = useState<{ leveledUp: boolean } | null>(null);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const score = questions.length
    ? Math.round(
        (questions.filter((q) => answers[q.id] === q.correctIndex).length / questions.length) * 100
      )
    : 100;

  async function complete() {
    setSaving(true);
    const res = await fetch(`/api/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizScore: score }),
    });
    const data = await res.json();
    setSaving(false);
    setSubmitted(true);
    setReward(data);
    router.refresh();
  }

  if (questions.length === 0) {
    return (
      <div className="mt-8">
        {!alreadyCompleted ? (
          <button
            onClick={complete}
            disabled={saving}
            className="bg-arcane-500 hover:bg-arcane-400 disabled:opacity-60 text-obsidian-950 font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : `Mark complete (+${xpReward} XP)`}
          </button>
        ) : (
          <p className="text-verdant-400 text-sm flex items-center gap-1.5">
            <CheckCircle2 size={16} /> Lesson completed
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5">
      <h3 className="font-display text-lg text-parchment mb-4">Check your understanding</h3>
      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id}>
            <p className="text-parchment mb-2">
              {qi + 1}. {q.prompt}
            </p>
            <div className="space-y-1.5">
              {q.choices.map((choice, ci) => {
                const selected = answers[q.id] === ci;
                const showCorrectness = submitted;
                const isCorrect = ci === q.correctIndex;
                return (
                  <button
                    key={ci}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: ci }))}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors flex items-center justify-between gap-2',
                      selected
                        ? 'border-arcane-400 bg-arcane-500/10'
                        : 'border-obsidian-600 hover:border-obsidian-500',
                      showCorrectness && isCorrect && 'border-verdant-500 bg-verdant-500/10',
                      showCorrectness && selected && !isCorrect && 'border-ember_red-500 bg-ember_red-500/10'
                    )}
                  >
                    <span>{choice}</span>
                    {showCorrectness && isCorrect && <CheckCircle2 size={16} className="text-verdant-400 shrink-0" />}
                    {showCorrectness && selected && !isCorrect && <XCircle size={16} className="text-ember_red-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {submitted && <p className="text-xs text-mist mt-2">{q.explanation}</p>}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={complete}
          disabled={!allAnswered || saving}
          className="mt-6 bg-arcane-500 hover:bg-arcane-400 disabled:opacity-40 text-obsidian-950 font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {saving ? 'Saving…' : 'Submit answers'}
        </button>
      ) : (
        <p className="mt-6 text-verdant-400 text-sm flex items-center gap-1.5">
          <CheckCircle2 size={16} /> Scored {score}% · lesson complete
          {reward?.leveledUp ? ' · Level up!' : ''}
        </p>
      )}
    </div>
  );
}
