import { prisma } from './prisma';

export type RoadmapTopic = Awaited<ReturnType<typeof getRoadmapForUser>>[number];

export async function getRoadmapForUser(userId: string) {
  const topics = await prisma.topic.findMany({
    orderBy: { order: 'asc' },
    include: {
      lessons: { orderBy: { order: 'asc' } },
      problems: { orderBy: { order: 'asc' } },
    },
  });

  const [lessonProgress, solvedProblemIds, mastery] = await Promise.all([
    prisma.userLessonProgress.findMany({ where: { userId, completed: true } }),
    prisma.submission
      .findMany({ where: { userId, status: 'ACCEPTED' }, select: { problemId: true } })
      .then((rows) => new Set(rows.map((r) => r.problemId))),
    prisma.userTopicMastery.findMany({ where: { userId } }),
  ]);
  const completedLessonIds = new Set(lessonProgress.map((l) => l.lessonId));
  const masteryByTopic = new Map(mastery.map((m) => [m.topicId, m.masteryScore]));

  const completedTopicSlugs = new Set<string>();

  // First pass: figure out which topics are fully completed (all lessons done).
  for (const topic of topics) {
    const allLessonsDone =
      topic.lessons.length > 0 && topic.lessons.every((l) => completedLessonIds.has(l.id));
    if (allLessonsDone) completedTopicSlugs.add(topic.slug);
  }

  return topics.map((topic) => {
    const lessonsCompleted = topic.lessons.filter((l) => completedLessonIds.has(l.id)).length;
    const problemsSolved = topic.problems.filter((p) => solvedProblemIds.has(p.id)).length;
    const isCompleted = completedTopicSlugs.has(topic.slug);
    const unlocked =
      topic.prerequisiteSlugs.length === 0 ||
      topic.prerequisiteSlugs.every((s) => completedTopicSlugs.has(s));

    const status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' = isCompleted
      ? 'COMPLETED'
      : !unlocked
        ? 'LOCKED'
        : lessonsCompleted > 0 || problemsSolved > 0
          ? 'IN_PROGRESS'
          : 'AVAILABLE';

    return {
      ...topic,
      lessonsCompleted,
      totalLessons: topic.lessons.length,
      problemsSolved,
      totalProblems: topic.problems.length,
      masteryScore: masteryByTopic.get(topic.id) ?? 0,
      status,
    };
  });
}
