import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';
import { awardRewards } from '@/lib/gamification';
import { progressQuests } from '@/lib/quests';
import { checkAndUnlockAchievements } from '@/lib/achievements';

const schema = z.object({ quizScore: z.number().min(0).max(100).optional() });

export async function POST(req: NextRequest, { params }: { params: { lessonId: string } }) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({ where: { id: params.lessonId } });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

  const existing = await prisma.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
  });

  await prisma.userLessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    update: { completed: true, quizScore: parsed.data.quizScore, completedAt: new Date() },
    create: {
      userId,
      lessonId: lesson.id,
      completed: true,
      quizScore: parsed.data.quizScore,
      completedAt: new Date(),
    },
  });

  // Only award XP the first time a lesson is completed.
  let leveledUp = false;
  if (!existing?.completed) {
    const result = await awardRewards(userId, {
      xp: lesson.xpReward,
      coins: Math.round(lesson.xpReward / 4),
      type: 'LESSON_COMPLETED',
      message: `Completed lesson: ${lesson.title}`,
    });
    leveledUp = result.leveledUp;
    await progressQuests(userId, 'COMPLETE_LESSON', 1);
  }

  const newAchievements = await checkAndUnlockAchievements(userId);

  return NextResponse.json({ leveledUp, newAchievements });
}
