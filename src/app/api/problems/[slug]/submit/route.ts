import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';
import { gradeSubmission } from '@/lib/execution';
import { awardRewards, updateTopicMastery } from '@/lib/gamification';
import { deriveQuality, scheduleReview } from '@/lib/srs';
import { progressQuests } from '@/lib/quests';
import { checkAndUnlockAchievements } from '@/lib/achievements';

const schema = z.object({
  code: z.string().min(1),
  language: z.enum(['javascript', 'python']),
});

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const problem = await prisma.problem.findUnique({
    where: { slug: params.slug },
    include: { testCases: { orderBy: { order: 'asc' } } },
  });
  if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });

  const wasAlreadySolved = await prisma.submission.findFirst({
    where: { userId, problemId: problem.id, status: 'ACCEPTED' },
  });

  const result = await gradeSubmission({
    language: parsed.data.language,
    code: parsed.data.code,
    functionName: problem.functionName,
    testCases: problem.testCases.map((tc) => ({ input: tc.input as unknown[], expected: tc.expected })),
    timeLimitMs: problem.timeLimitMs,
  });

  const submission = await prisma.submission.create({
    data: {
      userId,
      problemId: problem.id,
      code: parsed.data.code,
      language: parsed.data.language,
      status: result.status,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      runtimeMs: result.runtimeMs ?? undefined,
      errorOutput: result.errorOutput ?? undefined,
    },
  });

  const solvedNow = result.status === 'ACCEPTED';
  await updateTopicMastery(userId, problem.topicId, solvedNow);

  const attemptsSoFar = await prisma.submission.count({ where: { userId, problemId: problem.id } });
  const quality = deriveQuality(solvedNow, attemptsSoFar);
  await scheduleReview(userId, problem.id, quality);

  let leveledUp = false;
  let firstSolve = false;
  if (solvedNow && !wasAlreadySolved) {
    firstSolve = true;
    const reward = await awardRewards(userId, {
      xp: problem.xpReward,
      coins: problem.coinReward,
      type: 'PROBLEM_SOLVED',
      message: `Solved ${problem.isBossBattle ? 'boss battle' : 'problem'}: ${problem.title}`,
    });
    leveledUp = reward.leveledUp;
    await progressQuests(userId, 'SOLVE_PROBLEMS', 1);
    await progressQuests(userId, 'SOLVE_DIFFICULTY', 1, problem.difficulty);
  }

  const newAchievements = firstSolve ? await checkAndUnlockAchievements(userId) : [];

  return NextResponse.json({
    submissionId: submission.id,
    status: result.status,
    passedCount: result.passedCount,
    totalCount: result.totalCount,
    errorOutput: result.errorOutput,
    backend: result.backend,
    firstSolve,
    leveledUp,
    newAchievements,
    cases: result.perCase.map((c, i) => ({
      input: problem.testCases[i]?.input,
      expected: problem.testCases[i]?.expected,
      isSample: problem.testCases[i]?.isSample,
      ...c,
    })),
  });
}
