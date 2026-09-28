import { ScrollText, Trophy, Lock } from 'lucide-react';
import * as Icons from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getActiveQuests } from '@/lib/quests';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';

export default async function QuestsPage() {
  const user = await getCurrentUser();
  const [quests, achievements, unlocked] = await Promise.all([
    getActiveQuests(user!.id),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId: user!.id } }),
  ]);
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  const daily = quests.filter((q) => q.quest.type === 'DAILY');
  const weekly = quests.filter((q) => q.quest.type === 'WEEKLY');

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl text-parchment mb-1 flex items-center gap-2">
        <ScrollText className="text-arcane-400" size={22} /> Quest board
      </h1>
      <p className="text-mist mb-8">Steady, small goals that keep your streak alive.</p>

      {[
        { title: 'Today', list: daily },
        { title: 'This week', list: weekly },
      ].map((section) => (
        <section key={section.title} className="mb-10">
          <h2 className="font-display text-sm uppercase tracking-wide text-arcane-400 mb-3">
            {section.title}
          </h2>
          <div className="space-y-2">
            {section.list.map((uq) => {
              const Icon = (Icons as any)[uq.quest.icon] ?? ScrollText;
              const pct = Math.min(100, Math.round((uq.progress / uq.quest.goalTarget) * 100));
              return (
                <div
                  key={uq.id}
                  className={cn(
                    'rounded-lg border px-4 py-3',
                    uq.isCompleted ? 'border-verdant-500/40 bg-verdant-500/5' : 'border-obsidian-700 bg-obsidian-900/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={uq.isCompleted ? 'text-verdant-400' : 'text-arcane-400'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-parchment text-sm">{uq.quest.title}</p>
                      <p className="text-xs text-mist">{uq.quest.description}</p>
                    </div>
                    <span className="text-xs font-mono text-ember-400 shrink-0">
                      +{uq.quest.xpReward} XP
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-obsidian-700 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', uq.isCompleted ? 'bg-verdant-500' : 'bg-arcane-500')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <section>
        <h2 className="font-display text-sm uppercase tracking-wide text-arcane-400 mb-3 flex items-center gap-2">
          <Trophy size={14} /> Achievements
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {achievements.map((a) => {
            const Icon = (Icons as any)[a.icon] ?? Trophy;
            const isUnlocked = unlockedIds.has(a.id);
            return (
              <div
                key={a.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-4 py-3',
                  isUnlocked ? 'border-ember-500/40 bg-ember-500/5' : 'border-obsidian-700 bg-obsidian-900/40 opacity-60'
                )}
              >
                {isUnlocked ? <Icon size={18} className="text-ember-400" /> : <Lock size={18} className="text-mist" />}
                <div className="min-w-0">
                  <p className="text-parchment text-sm">{a.title}</p>
                  <p className="text-xs text-mist">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
