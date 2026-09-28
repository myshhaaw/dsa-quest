import type { SupportedLanguage } from './harness';

// Judge0 language IDs — confirmed against the public Judge0 CE instance's
// GET /languages list. If you self-host Judge0 or use a different provider,
// verify these against your instance's /languages endpoint and adjust.
const LANGUAGE_IDS: Record<SupportedLanguage, number> = {
  javascript: 93, // "JavaScript (Node.js 18.15.0)"
  python: 71, // "Python (3.8.1)"
};

export type Judge0Result = {
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  statusDescription: string;
  timeMs: number | null;
};

export function isJudge0Configured() {
  return Boolean(process.env.JUDGE0_API_URL);
}

/**
 * Submits source code to a Judge0 instance (self-hosted or RapidAPI) and
 * waits for the sandboxed result. Judge0 runs each submission in an
 * isolated, resource-limited container (via isolate/cgroups) — this is the
 * backend you should use in any real deployment.
 */
export async function runOnJudge0(
  language: SupportedLanguage,
  sourceCode: string,
  timeLimitMs: number
): Promise<Judge0Result> {
  const baseUrl = process.env.JUDGE0_API_URL;
  if (!baseUrl) throw new Error('JUDGE0_API_URL is not configured');

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // RapidAPI-hosted Judge0 needs these headers; self-hosted instances ignore them.
  if (process.env.JUDGE0_API_KEY) {
    headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
    headers['X-RapidAPI-Host'] =
      process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeLimitMs + 10_000);

  try {
    const res = await fetch(
      `${baseUrl}/submissions?base64_encoded=true&wait=true`,
      {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          language_id: LANGUAGE_IDS[language],
          source_code: Buffer.from(sourceCode, 'utf-8').toString('base64'),
          cpu_time_limit: Math.max(1, Math.ceil(timeLimitMs / 1000)),
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Judge0 request failed with status ${res.status}`);
    }

    const data = await res.json();
    const decode = (v: string | null) =>
      v ? Buffer.from(v, 'base64').toString('utf-8') : null;

    return {
      stdout: decode(data.stdout),
      stderr: decode(data.stderr),
      compileOutput: decode(data.compile_output),
      statusDescription: data.status?.description ?? 'Unknown',
      timeMs: data.time ? Math.round(parseFloat(data.time) * 1000) : null,
    };
  } finally {
    clearTimeout(timeout);
  }
}
