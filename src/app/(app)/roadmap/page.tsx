import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Lock, Check, Swords } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getRoadmapForUser } from '@/lib/roadmap';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<string, string> = {
  LOCKED: 'border-obsidian-700 bg-obsidian-900 text-mist/50 cursor-not-allowed',
  AVAILABLE: 'border-arcane-500/50 bg-obsidian-800 text-parchment shadow-node hover:border-arcane-400',
  IN_PROGRESS: 'border-ember-500/60 bg-obsidian-800 text-parchment shadow-node hover:border-ember-400',
  COMPLETED: 'border-verdant-500/60 bg-verdant-500/10 text-parchment hover:border-verdant-400',
};

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  const topics = await getRoadmapForUser(user!.id);

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-2xl text-parchment">Your quest path</h1>
        <p className="text-mist mt-1">
          Clear each realm's lessons and problems to unlock the next. Boss battles wait at the end
          of the harder realms.
        </p>
      </div>

      <ol className="relative max-w-2xl mx-auto space-y-6">
        <div className="absolute left-6 top-6 bottom-6 w-px bg-obsidian-700" aria-hidden />
        {topics.map((topic, idx) => {
          const Icon = (Icons as any)[topic.icon] ?? Icons.Sparkles;
          const locked = topic.status === 'LOCKED';
          const content = (
            <div
              className={cn(
                'relative flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors',
                STATUS_STYLE[topic.status]
              )}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-obsidian-900 border border-obsidian-600 shrink-0">
                {locked ? <Lock size={18} /> : topic.status === 'COMPLETED' ? <Check size={18} className="text-verdant-400" /> : <Icon size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base truncate">
                    Realm {idx + 1}: {topic.title}
                  </h2>
                </div>
                <p className="text-sm text-mist truncate">{topic.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs font-mono text-mist">
                  <span>{topic.lessonsCompleted}/{topic.totalLessons} lessons</span>
                  <span>{topic.problemsSolved}/{topic.totalProblems} problems</span>
                  {topic.masteryScore > 0 && <span>{topic.masteryScore}% mastery</span>}
                </div>
              </div>
              {topic.problems.some((p) => p.isBossBattle) && (
                <Swords size={18} className="text-arcane-400 shrink-0" title="Boss battle inside" />
              )}
            </div>
          );

          return (
            <li key={topic.id} className="relative pl-0">
              {locked ? (
                <div>{content}</div>
              ) : (
                <Link href={`/roadmap/${topic.slug}`}>{content}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
