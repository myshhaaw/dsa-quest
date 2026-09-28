import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';
import { getMentorReply, MentorMode } from '@/lib/ai';
import { progressQuests } from '@/lib/quests';

const schema = z.object({
  mode: z.enum(['HINT', 'SOCRATIC', 'DEBUG', 'COMPLEXITY', 'INTERVIEW']),
  message: z.string().min(1).max(4000),
  problemSlug: z.string().optional(),
  code: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const { mode, message, problemSlug, code } = parsed.data;

  let problem = null;
  if (problemSlug) {
    problem = await prisma.problem.findUnique({ where: { slug: problemSlug } });
  }

  const problemContext = problem
    ? `Title: ${problem.title}\nDifficulty: ${problem.difficulty}\nDescription:\n${problem.description}${
        code ? `\n\nLearner's current code:\n\`\`\`${code}\`\`\`` : ''
      }`
    : code
      ? `Learner's current code:\n\`\`\`${code}\`\`\``
      : undefined;

  const history = await prisma.aIMessage.findMany({
    where: { userId, problemId: problem?.id ?? null, mode },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  await prisma.aIMessage.create({
    data: { userId, problemId: problem?.id, mode, role: 'user', content: message },
  });

  let reply: string;
  try {
    reply = await getMentorReply(
      mode as MentorMode,
      problemContext,
      history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      message
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'The AI mentor is unavailable right now.' }, { status: 502 });
  }

  await prisma.aIMessage.create({
    data: { userId, problemId: problem?.id, mode, role: 'assistant', content: reply },
  });

  await progressQuests(userId, 'USE_AI_MENTOR', 1);

  return NextResponse.json({ reply });
}
