import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';
import { gradeSubmission } from '@/lib/execution';

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
    include: { testCases: { where: { isSample: true }, orderBy: { order: 'asc' } } },
  });
  if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });

  const result = await gradeSubmission({
    language: parsed.data.language,
    code: parsed.data.code,
    functionName: problem.functionName,
    testCases: problem.testCases.map((tc) => ({
      input: tc.input as unknown[],
      expected: tc.expected,
    })),
    timeLimitMs: problem.timeLimitMs,
  });

  return NextResponse.json({
    status: result.status,
    passedCount: result.passedCount,
    totalCount: result.totalCount,
    errorOutput: result.errorOutput,
    backend: result.backend,
    cases: result.perCase.map((c, i) => ({
      input: problem.testCases[i]?.input,
      expected: problem.testCases[i]?.expected,
      ...c,
    })),
  });
}
