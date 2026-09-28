import Link from 'next/link';
import { CheckCircle2, Circle, Swords } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cn, DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '@/lib/utils';
import { getRecommendations } from '@/lib/recommendations';

export default async function ProblemsPage() {
  const user = await getCurrentUser();
  const [problems, solved, recommendations] = await Promise.all([
    prisma.problem.findMany({ include: { topic: true }, orderBy: [{ topic: { order: 'asc' } }, { order: 'asc' }] }),
    prisma.submission
      .findMany({ where: { userId: user!.id, status: 'ACCEPTED' }, select: { problemId: true } })
      .then((rows) => new Set(rows.map((r) => r.problemId))),
    getRecommendations(user!.id, 3),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment mb-1">Problem vault</h1>
      <p className="text-mist mb-8">Every challenge across every realm, in one place.</p>

      {recommendations.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-sm uppercase tracking-wide text-arcane-400 mb-3">
            Recommended for you
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {recommendations.map((r) => (
              <Link
                key={r.problemId}
                href={`/problems/${r.slug}`}
                className="rounded-lg border border-arcane-500/40 bg-arcane-500/5 hover:border-arcane-400 transition-colors p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('text-xs font-mono px-2 py-0.5 rounded border', DIFFICULTY_COLOR[r.difficulty])}>
                    {DIFFICULTY_LABEL[r.difficulty]}
                  </span>
                  <span className="text-xs text-mist">{r.topicTitle}</span>
                </div>
                <p className="text-parchment font-medium mb-1">{r.title}</p>
                <p className="text-xs text-mist">{r.reason}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-1.5">
        {problems.map((problem) => {
          const isSolved = solved.has(problem.id);
          return (
            <Link
              key={problem.id}
              href={`/problems/${problem.slug}`}
              className={cn(
                'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                problem.isBossBattle
                  ? 'border-arcane-500/40 bg-arcane-500/5 hover:border-arcane-400'
                  : 'border-obsidian-700 bg-obsidian-900/60 hover:border-arcane-500/40'
              )}
            >
              {isSolved ? (
                <CheckCircle2 size={18} className="text-verdant-400 shrink-0" />
              ) : problem.isBossBattle ? (
                <Swords size={18} className="text-arcane-400 shrink-0" />
              ) : (
                <Circle size={18} className="text-mist shrink-0" />
              )}
              <span className={cn('flex-1 truncate', isSolved && 'text-mist')}>
                {problem.isBossBattle ? '👑 ' : ''}
                {problem.title}
              </span>
              <span className="hidden sm:inline text-xs text-mist w-32 truncate">{problem.topic.title}</span>
              <span className={cn('text-xs font-mono px-2 py-0.5 rounded border', DIFFICULTY_COLOR[problem.difficulty])}>
                {DIFFICULTY_LABEL[problem.difficulty]}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
