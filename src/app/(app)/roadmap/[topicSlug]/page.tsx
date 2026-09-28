import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, CheckCircle2, Circle, Swords } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cn, DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '@/lib/utils';

export default async function TopicPage({ params }: { params: { topicSlug: string } }) {
  const user = await getCurrentUser();
  const topic = await prisma.topic.findUnique({
    where: { slug: params.topicSlug },
    include: {
      lessons: { orderBy: { order: 'asc' } },
      problems: { orderBy: { order: 'asc' } },
    },
  });
  if (!topic) notFound();

  const [lessonProgress, submissions] = await Promise.all([
    prisma.userLessonProgress.findMany({ where: { userId: user!.id, lessonId: { in: topic.lessons.map((l) => l.id) } } }),
    prisma.submission.findMany({
      where: { userId: user!.id, status: 'ACCEPTED', problemId: { in: topic.problems.map((p) => p.id) } },
      select: { problemId: true },
    }),
  ]);
  const completedLessonIds = new Set(lessonProgress.filter((l) => l.completed).map((l) => l.lessonId));
  const solvedProblemIds = new Set(submissions.map((s) => s.problemId));

  return (
    <div className="max-w-3xl mx-auto">
      <p className="text-sm text-arcane-400 mb-1">Realm</p>
      <h1 className="font-display text-2xl text-parchment">{topic.title}</h1>
      <p className="text-mist mt-2">{topic.description}</p>

      <section className="mt-10">
        <h2 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-arcane-400" /> Lessons
        </h2>
        <div className="space-y-2">
          {topic.lessons.map((lesson) => {
            const done = completedLessonIds.has(lesson.id);
            return (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="flex items-center gap-3 rounded-lg border border-obsidian-700 bg-obsidian-900/60 px-4 py-3 hover:border-arcane-500/40 transition-colors"
              >
                {done ? (
                  <CheckCircle2 size={18} className="text-verdant-400 shrink-0" />
                ) : (
                  <Circle size={18} className="text-mist shrink-0" />
                )}
                <span className={cn('flex-1', done && 'text-mist')}>{lesson.title}</span>
                <span className="text-xs font-mono text-ember-400">+{lesson.xpReward} XP</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
          <Swords size={18} className="text-arcane-400" /> Problems
        </h2>
        <div className="space-y-2">
          {topic.problems.map((problem) => {
            const solved = solvedProblemIds.has(problem.id);
            return (
              <Link
                key={problem.id}
                href={`/problems/${problem.slug}`}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                  problem.isBossBattle
                    ? 'border-arcane-500/50 bg-arcane-500/10 hover:border-arcane-400'
                    : 'border-obsidian-700 bg-obsidian-900/60 hover:border-arcane-500/40'
                )}
              >
                {solved ? (
                  <CheckCircle2 size={18} className="text-verdant-400 shrink-0" />
                ) : problem.isBossBattle ? (
                  <Swords size={18} className="text-arcane-400 shrink-0" />
                ) : (
                  <Circle size={18} className="text-mist shrink-0" />
                )}
                <span className={cn('flex-1', solved && 'text-mist')}>
                  {problem.isBossBattle ? '👑 ' : ''}
                  {problem.title}
                </span>
                <span className={cn('text-xs font-mono px-2 py-0.5 rounded border', DIFFICULTY_COLOR[problem.difficulty])}>
                  {DIFFICULTY_LABEL[problem.difficulty]}
                </span>
                <span className="text-xs font-mono text-ember-400 w-16 text-right">+{problem.xpReward} XP</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
