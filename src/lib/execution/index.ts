import { buildHarness, HarnessResult, HarnessTestCase, SupportedLanguage } from './harness';
import { isJudge0Configured, runOnJudge0 } from './judge0';
import { runDemo } from './demoRunner';

export type GradeVerdict =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'COMPILE_ERROR';

export type GradeResult = {
  status: GradeVerdict;
  passedCount: number;
  totalCount: number;
  runtimeMs: number | null;
  errorOutput: string | null;
  perCase: HarnessResult[];
  backend: 'judge0' | 'demo';
};

export async function gradeSubmission(opts: {
  language: SupportedLanguage;
  code: string;
  functionName: string;
  testCases: HarnessTestCase[];
  timeLimitMs: number;
}): Promise<GradeResult> {
  const { language, code, functionName, testCases, timeLimitMs } = opts;
  const harness = buildHarness(language, code, functionName, testCases);

  let stdout = '';
  let stderr = '';
  let timedOut = false;
  let backend: 'judge0' | 'demo' = 'demo';

  if (isJudge0Configured()) {
    backend = 'judge0';
    const result = await runOnJudge0(language, harness, timeLimitMs);
    stdout = result.stdout ?? '';
    stderr = result.compileOutput || result.stderr || '';
    timedOut = /time limit/i.test(result.statusDescription);
    if (/compilation error/i.test(result.statusDescription)) {
      return {
        status: 'COMPILE_ERROR',
        passedCount: 0,
        totalCount: testCases.length,
        runtimeMs: result.timeMs,
        errorOutput: stderr || result.statusDescription,
        perCase: [],
        backend,
      };
    }
  } else {
    const result = await runDemo(language, harness, timeLimitMs);
    stdout = result.stdout;
    stderr = result.stderr;
    timedOut = result.timedOut;
  }

  if (timedOut) {
    return {
      status: 'TIME_LIMIT_EXCEEDED',
      passedCount: 0,
      totalCount: testCases.length,
      runtimeMs: timeLimitMs,
      errorOutput: 'Your solution took too long to run.',
      perCase: [],
      backend,
    };
  }

  let perCase: HarnessResult[] = [];
  try {
    const lastLine = stdout.trim().split('\n').filter(Boolean).pop() ?? '[]';
    perCase = JSON.parse(lastLine);
    if (!Array.isArray(perCase)) throw new Error('Harness did not return an array');
  } catch {
    return {
      status: 'RUNTIME_ERROR',
      passedCount: 0,
      totalCount: testCases.length,
      runtimeMs: null,
      errorOutput: stderr || 'Your code did not run successfully. Check for syntax errors.',
      perCase: [],
      backend,
    };
  }

  const passedCount = perCase.filter((c) => c.passed).length;
  const totalRuntime = perCase.reduce((sum, c) => sum + (c.runtimeMs ?? 0), 0);
  const firstError = perCase.find((c) => c.error)?.error ?? null;

  let status: GradeVerdict = 'ACCEPTED';
  if (passedCount < testCases.length) {
    status = firstError ? 'RUNTIME_ERROR' : 'WRONG_ANSWER';
  }

  return {
    status,
    passedCount,
    totalCount: testCases.length,
    runtimeMs: totalRuntime,
    errorOutput: firstError,
    perCase,
    backend,
  };
}

export type { SupportedLanguage, HarnessTestCase };
