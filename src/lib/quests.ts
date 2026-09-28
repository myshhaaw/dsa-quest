import { prisma } from './prisma';
import { awardRewards } from './gamification';

function startOfDayUTC(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function startOfWeekUTC(d = new Date()) {
  const day = startOfDayUTC(d);
  const dow = day.getUTCDay(); // 0 = Sunday
  day.setUTCDate(day.getUTCDate() - dow);
  return day;
}

/** Ensures the learner has an active UserQuest row for every DAILY/WEEKLY quest definition. */
export async function ensureAssignedQuests(userId: string) {
  const quests = await prisma.quest.findMany();
  const today = startOfDayUTC();
  const week = startOfWeekUTC();

  for (const quest of quests) {
    const assignedFor = quest.type === 'WEEKLY' ? week : today;
    await prisma.userQuest.upsert({
      where: { userId_questId_assignedFor: { userId, questId: quest.id, assignedFor } },
      update: {},
      create: { userId, questId: quest.id, assignedFor },
    });
  }
}

export async function getActiveQuests(userId: string) {
  await ensureAssignedQuests(userId);
  const today = startOfDayUTC();
  const week = startOfWeekUTC();
  return prisma.userQuest.findMany({
    where: {
      userId,
      OR: [{ assignedFor: today }, { assignedFor: week }],
    },
    include: { quest: true },
    orderBy: { quest: { type: 'asc' } },
  });
}

/**
 * Call after a qualifying learner action (problem solved, lesson completed,
 * AI mentor used, etc.) to progress any matching active quests.
 */
export async function progressQuests(
  userId: string,
  goalType: string,
  amount = 1,
  filterValue?: string
) {
  const active = await getActiveQuests(userId);
  const completedNow: { title: string; xpReward: number; coinReward: number }[] = [];

  for (const uq of active) {
    if (uq.isCompleted) continue;
    if (uq.quest.goalType !== goalType) continue;
    if (uq.quest.goalFilter && uq.quest.goalFilter !== filterValue) continue;

    const newProgress = uq.progress + amount;
    const isCompleted = newProgress >= uq.quest.goalTarget;

    await prisma.userQuest.update({
      where: { id: uq.id },
      data: {
        progress: Math.min(newProgress, uq.quest.goalTarget),
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    if (isCompleted) {
      await awardRewards(userId, {
        xp: uq.quest.xpReward,
        coins: uq.quest.coinReward,
        type: 'QUEST_COMPLETED',
        message: `Completed quest: ${uq.quest.title}`,
      });
      completedNow.push({
        title: uq.quest.title,
        xpReward: uq.quest.xpReward,
        coinReward: uq.quest.coinReward,
      });
    }
  }

  return completedNow;
}
