import Link from 'next/link';
import { Flame, Coins, Trophy, Clock, TrendingUp } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { levelProgress } from '@/lib/gamification';
import { getDueReviews } from '@/lib/srs';
import { getRecommendations } from '@/lib/recommendations';
import { XPBar } from '@/components/XPBar';
import { MasteryChart } from '@/components/MasteryChart';
import { timeAgo, cn, DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const [mastery, activity, dueReviews, recommendations, solvedCount, bossCount] = await Promise.all([
    prisma.userTopicMastery.findMany({ where: { userId: user!.id }, include: { topic: true } }),
    prisma.activityLog.findMany({ where: { userId: user!.id }, orderBy: { createdAt: 'desc' }, take: 8 }),
    getDueReviews(user!.id, 5),
    getRecommendations(user!.id, 3),
    prisma.submission.count({ where: { userId: user!.id, status: 'ACCEPTED' } }),
    prisma.submission.count({ where: { userId: user!.id, status: 'ACCEPTED', problem: { isBossBattle: true } } }),
  ]);

  const { level, progressPct } = levelProgress(user!.xp);
  const masteryData = mastery
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .map((m) => ({ topic: m.topic.title, mastery: m.masteryScore }));

  const stats = [
    { label: 'Level', value: level, icon: TrendingUp, color: 'text-arcane-400' },
    { label: 'Streak', value: `${user!.currentStreak}d`, icon: Flame, color: 'text-ember-400' },
    { label: 'Coins', value: user!.coins, icon: Coins, color: 'text-ember-400' },
    { label: 'Problems solved', value: solvedCount, icon: Trophy, color: 'text-verdant-400' },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment mb-1">
        Welcome back, {user!.username}
      </h1>
      <p className="text-mist mb-8">
        {user!.avatarClass} · Level {level} · {progressPct}% to next level
        {bossCount > 0 ? ` · ${bossCount} boss battle${bossCount > 1 ? 's' : ''} defeated` : ''}
      </p>

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-4">
            <s.icon size={18} className={s.color} />
            <p className="font-display text-xl text-parchment mt-2">{s.value}</p>
            <p className="text-xs text-mist">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5">
        <XPBar xp={user!.xp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5">
          <h2 className="font-display text-lg text-parchment mb-4">Topic mastery</h2>
          <MasteryChart data={masteryData} />
        </section>

        <section className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5">
          <h2 className="font-display text-lg text-parchment mb-4 flex items-center gap-2">
            <Clock size={18} className="text-arcane-400" /> Due for review
          </h2>
          {dueReviews.length === 0 ? (
            <p className="text-sm text-mist">Nothing due — solve a few problems to build your review queue.</p>
          ) : (
            <div className="space-y-2">
              {dueReviews.map((r) => (
                <Link
                  key={r.id}
                  href={`/problems/${r.problem.slug}`}
                  className="flex items-center justify-between rounded-lg border border-obsidian-700 hover:border-arcane-500/40 px-3 py-2 text-sm transition-colors"
                >
                  <span className="truncate">{r.problem.title}</span>
                  <span className={cn('text-xs font-mono px-2 py-0.5 rounded border shrink-0', DIFFICULTY_COLOR[r.problem.difficulty])}>
                    {DIFFICULTY_LABEL[r.problem.difficulty]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5">
          <h2 className="font-display text-lg text-parchment mb-4">Recommended next</h2>
          <div className="space-y-2">
            {recommendations.map((r) => (
              <Link
                key={r.problemId}
                href={`/problems/${r.slug}`}
                className="block rounded-lg border border-obsidian-700 hover:border-arcane-500/40 px-3 py-2 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-parchment truncate">{r.title}</span>
                  <span className={cn('text-xs font-mono px-2 py-0.5 rounded border shrink-0', DIFFICULTY_COLOR[r.difficulty])}>
                    {DIFFICULTY_LABEL[r.difficulty]}
                  </span>
                </div>
                <p className="text-xs text-mist">{r.reason}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5">
          <h2 className="font-display text-lg text-parchment mb-4">Recent activity</h2>
          <div className="space-y-3">
            {activity.length === 0 && <p className="text-sm text-mist">Nothing yet — go clear a lesson or a problem.</p>}
            {activity.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-parchment/90 truncate">{a.message}</span>
                <span className="text-xs text-mist shrink-0 ml-2">{timeAgo(a.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
