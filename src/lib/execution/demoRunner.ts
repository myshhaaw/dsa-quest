import vm from 'node:vm';
import { spawn } from 'node:child_process';
import type { SupportedLanguage } from './harness';

/**
 * ⚠️ DEMO / LOCAL-DEV EXECUTION ONLY.
 *
 * This runs submitted code in-process (JavaScript via Node's `vm` module) or
 * as a bare child process (Python), with no OS-level sandboxing, filesystem
 * isolation, or network egress control. It exists so the app works out of
 * the box with zero external services. It is NOT safe for untrusted,
 * multi-tenant, public production use.
 *
 * For production, set JUDGE0_API_URL (+ JUDGE0_API_KEY) in your environment
 * — see .env.example and README — and the app will automatically use the
 * properly sandboxed Judge0 backend (src/lib/execution/judge0.ts) instead.
 */

export type DemoRunResult = { stdout: string; stderr: string; timedOut: boolean };

export function runJavaScriptInVm(sourceCode: string, timeLimitMs: number): DemoRunResult {
  const logs: string[] = [];
  const errors: string[] = [];

  const sandbox: Record<string, unknown> = {
    Buffer,
    console: {
      log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
      error: (...args: unknown[]) => errors.push(args.map(String).join(' ')),
    },
  };
  const context = vm.createContext(sandbox);

  try {
    const script = new vm.Script(sourceCode, { filename: 'submission.js' });
    script.runInContext(context, { timeout: timeLimitMs });
    return { stdout: logs.join('\n'), stderr: errors.join('\n'), timedOut: false };
  } catch (err: any) {
    const timedOut = /Script execution timed out/i.test(String(err?.message));
    return {
      stdout: logs.join('\n'),
      stderr: String(err?.message ?? err),
      timedOut,
    };
  }
}

export function runPythonInSubprocess(
  sourceCode: string,
  timeLimitMs: number
): Promise<DemoRunResult> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    let child;
    try {
      child = spawn('python3', ['-c', sourceCode], { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (err: any) {
      resolve({ stdout: '', stderr: `python3 is not available in this environment: ${err.message}`, timedOut: false });
      return;
    }

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeLimitMs);

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', () => {
      clearTimeout(timer);
      resolve({ stdout, stderr, timedOut });
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout: '', stderr: String(err.message), timedOut: false });
    });
  });
}

export async function runDemo(
  language: SupportedLanguage,
  sourceCode: string,
  timeLimitMs: number
): Promise<DemoRunResult> {
  if (language === 'javascript') return runJavaScriptInVm(sourceCode, timeLimitMs);
  return runPythonInSubprocess(sourceCode, timeLimitMs);
}
