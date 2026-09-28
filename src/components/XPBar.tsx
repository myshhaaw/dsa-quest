import { levelProgress } from '@/lib/gamification';

export function XPBar({ xp, compact = false }: { xp: number; compact?: boolean }) {
  const { level, xpIntoLevel, xpForNextLevel, progressPct } = levelProgress(xp);

  return (
    <div className={compact ? 'w-32' : 'w-full'}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-mist">Lv.{level}</span>
        {!compact && (
          <span className="text-xs font-mono text-mist">
            {xpIntoLevel} / {xpForNextLevel} XP
          </span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-obsidian-700 overflow-hidden border border-obsidian-600">
        <div
          className="h-full rounded-full bg-gradient-to-r from-arcane-600 to-arcane-400 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
