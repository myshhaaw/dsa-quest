import { prisma } from './prisma';

/** Total cumulative XP required to reach a given level (quadratic curve). */
export function totalXpToReachLevel(level: number): number {
  return 50 * Math.pow(Math.max(level - 1, 0), 2);
}

export function levelFromXp(xp: number): number {
  return 1 + Math.floor(Math.sqrt(Math.max(xp, 0) / 50));
}

/** Returns { level, xpIntoLevel, xpForNextLevel, progressPct } for dashboard/XP bar UI. */
export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const floor = totalXpToReachLevel(level);
  const ceil = totalXpToReachLevel(level + 1);
  const xpIntoLevel = xp - floor;
  const xpForNextLevel = ceil - floor;
  const progressPct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));
  return { level, xpIntoLevel, xpForNextLevel, progressPct };
}

function isSameCalendarDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function daysBetween(a: Date, b: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const utcA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const utcB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((utcB - utcA) / msPerDay);
}

/**
 * Applies a streak update for "today's" activity. Call once per qualifying
 * action; safe to call multiple times a day (no double counting).
 */
export function computeStreakUpdate(lastActiveAt: Date | null, currentStreak: number, longestStreak: number) {
  const now = new Date();
  if (!lastActiveAt) {
    return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1), lastActiveAt: now };
  }
  if (isSameCalendarDay(lastActiveAt, now)) {
    return { currentStreak, longestStreak, lastActiveAt: now };
  }
  const gap = daysBetween(lastActiveAt, now);
  const nextStreak = gap === 1 ? currentStreak + 1 : 1;
  return {
    currentStreak: nextStreak,
    longestStreak: Math.max(longestStreak, nextStreak),
    lastActiveAt: now,
  };
}

export type ActivityType =
  | 'LESSON_COMPLETED'
  | 'PROBLEM_SOLVED'
  | 'QUEST_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'LEVEL_UP';

/**
 * Central reward function: awards XP + coins, updates the streak, persists
 * the new totals, logs an activity entry, and reports whether a level-up
 * occurred (so the UI can show a celebratory toast).
 */
export async function awardRewards(
  userId: string,
  opts: { xp: number; coins: number; type: ActivityType; message: string }
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const streak = computeStreakUpdate(user.lastActiveAt, user.currentStreak, user.longestStreak);
  const newXp = user.xp + opts.xp;
  const newCoins = user.coins + opts.coins;
  const oldLevel = levelFromXp(user.xp);
  const newLevel = levelFromXp(newXp);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      coins: newCoins,
      level: newLevel,
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveAt: streak.lastActiveAt,
    },
  });

  await prisma.activityLog.create({
    data: { userId, type: opts.type, message: opts.message, xpDelta: opts.xp, coinDelta: opts.coins },
  });

  const leveledUp = newLevel > oldLevel;
  if (leveledUp) {
    await prisma.activityLog.create({
      data: {
        userId,
        type: 'LEVEL_UP',
        message: `Reached level ${newLevel}!`,
        xpDelta: 0,
        coinDelta: 0,
      },
    });
  }

  return { user: updated, leveledUp, newLevel, streakExtended: streak.currentStreak > user.currentStreak };
}

/** Updates a user's mastery score for a topic after an attempt. */
export async function updateTopicMastery(userId: string, topicId: string, solved: boolean) {
  const existing = await prisma.userTopicMastery.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });
  const attempts = (existing?.attempts ?? 0) + 1;
  const solvedCount = (existing?.solved ?? 0) + (solved ? 1 : 0);
  // Mastery blends accuracy with a volume bonus, capped at 100.
  const accuracy = solvedCount / attempts;
  const volumeBonus = Math.min(solvedCount * 4, 40);
  const masteryScore = Math.min(100, Math.round(accuracy * 60 + volumeBonus));

  return prisma.userTopicMastery.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { attempts, solved: solvedCount, masteryScore },
    create: { userId, topicId, attempts, solved: solvedCount, masteryScore },
  });
}
