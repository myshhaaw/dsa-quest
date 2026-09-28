import { prisma } from './prisma';

/**
 * Simplified SM-2 spaced-repetition algorithm.
 * quality: 0-5 self-reported/derived recall quality.
 *   Here we derive it automatically from solve outcome + attempt count:
 *   - solved on first try            -> 5
 *   - solved after retries           -> 3
 *   - not solved / gave up           -> 1
 */
export function deriveQuality(solved: boolean, attemptsThisSession: number): number {
  if (!solved) return 1;
  return attemptsThisSession <= 1 ? 5 : 3;
}

export async function scheduleReview(userId: string, problemId: string, quality: number) {
  const existing = await prisma.reviewSchedule.findUnique({
    where: { userId_problemId: { userId, problemId } },
  });

  let easeFactor = existing?.easeFactor ?? 2.5;
  let repetitions = existing?.repetitions ?? 0;
  let intervalDays = existing?.intervalDays ?? 1;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + intervalDays);

  return prisma.reviewSchedule.upsert({
    where: { userId_problemId: { userId, problemId } },
    update: { easeFactor, repetitions, intervalDays, dueAt, lastReviewedAt: new Date() },
    create: {
      userId,
      problemId,
      easeFactor,
      repetitions,
      intervalDays,
      dueAt,
      lastReviewedAt: new Date(),
    },
  });
}

/** Problems due for review today or earlier, soonest first. */
export async function getDueReviews(userId: string, limit = 10) {
  return prisma.reviewSchedule.findMany({
    where: { userId, dueAt: { lte: new Date() } },
    orderBy: { dueAt: 'asc' },
    take: limit,
    include: { problem: { include: { topic: true } } },
  });
}
