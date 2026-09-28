import { prisma } from './prisma';
import { getDueReviews } from './srs';

/**
 * Recommends the next problem(s) for a learner:
 *  1. Anything due for spaced-repetition review, first.
 *  2. Otherwise, an unsolved problem from the topic with the lowest mastery
 *     score (defaulting to the first roadmap topic if the learner has no
 *     mastery data yet), preferring the easiest unsolved difficulty first.
 */
export async function getRecommendations(userId: string, limit = 3) {
  const due = await getDueReviews(userId, limit);
  const recommendations: {
    problemId: string;
    slug: string;
    title: string;
    difficulty: string;
    topicTitle: string;
    reason: string;
  }[] = due.map((r) => ({
    problemId: r.problem.id,
    slug: r.problem.slug,
    title: r.problem.title,
    difficulty: r.problem.difficulty,
    topicTitle: r.problem.topic.title,
    reason: 'Due for spaced-repetition review',
  }));

  if (recommendations.length >= limit) return recommendations.slice(0, limit);

  const mastery = await prisma.userTopicMastery.findMany({
    where: { userId },
    orderBy: { masteryScore: 'asc' },
  });

  const solvedProblemIds = new Set(
    (
      await prisma.submission.findMany({
        where: { userId, status: 'ACCEPTED' },
        select: { problemId: true },
      })
    ).map((s) => s.problemId)
  );

  const difficultyOrder = ['EASY', 'MEDIUM', 'HARD', 'BOSS'];
  const topicIdsToTry =
    mastery.length > 0
      ? mastery.map((m) => m.topicId)
      : (await prisma.topic.findMany({ orderBy: { order: 'asc' }, take: 3 })).map((t) => t.id);

  for (const topicId of topicIdsToTry) {
    if (recommendations.length >= limit) break;
    const problems = await prisma.problem.findMany({
      where: { topicId, id: { notIn: Array.from(solvedProblemIds) } },
      include: { topic: true },
    });
    problems.sort(
      (a, b) => difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty)
    );
    const pick = problems[0];
    if (pick) {
      recommendations.push({
        problemId: pick.id,
        slug: pick.slug,
        title: pick.title,
        difficulty: pick.difficulty,
        topicTitle: pick.topic.title,
        reason:
          mastery.length > 0
            ? `Strengthens ${pick.topic.title}, your weakest tracked topic`
            : `Next up on your roadmap`,
      });
    }
  }

  return recommendations.slice(0, limit);
}
