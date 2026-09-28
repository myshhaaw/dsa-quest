import { prisma } from './prisma';
import { awardRewards, levelFromXp } from './gamification';

async function getStat(userId: string, criteriaType: string): Promise<number> {
  switch (criteriaType) {
    case 'TOTAL_SOLVES':
      return prisma.submission.count({ where: { userId, status: 'ACCEPTED' } });
    case 'STREAK_DAYS': {
      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      return user.longestStreak;
    }
    case 'BOSS_DEFEATED':
      return prisma.submission.count({
        where: { userId, status: 'ACCEPTED', problem: { isBossBattle: true } },
      });
    case 'TOPIC_MASTERED':
      return prisma.userTopicMastery.count({ where: { userId, masteryScore: { gte: 90 } } });
    case 'LEVEL_REACHED': {
      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      return levelFromXp(user.xp);
    }
    default:
      return 0;
  }
}

/** Checks every not-yet-unlocked achievement and unlocks any the learner now qualifies for. */
export async function checkAndUnlockAchievements(userId: string) {
  const [allAchievements, unlocked] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
  const newlyUnlocked: { title: string; icon: string }[] = [];

  const statCache = new Map<string, number>();

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;
    if (!statCache.has(achievement.criteriaType)) {
      statCache.set(achievement.criteriaType, await getStat(userId, achievement.criteriaType));
    }
    const stat = statCache.get(achievement.criteriaType)!;
    if (stat >= achievement.criteriaTarget) {
      await prisma.userAchievement.create({ data: { userId, achievementId: achievement.id } });
      if (achievement.xpReward || achievement.coinReward) {
        await awardRewards(userId, {
          xp: achievement.xpReward,
          coins: achievement.coinReward,
          type: 'ACHIEVEMENT_UNLOCKED',
          message: `Unlocked achievement: ${achievement.title}`,
        });
      }
      newlyUnlocked.push({ title: achievement.title, icon: achievement.icon });
    }
  }

  return newlyUnlocked;
}
