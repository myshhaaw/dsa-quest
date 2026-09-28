export type HarnessTestCase = { input: unknown[]; expected: unknown };

export type SupportedLanguage = 'javascript' | 'python';

function toBase64(text: string) {
  return Buffer.from(text, 'utf-8').toString('base64');
}

/**
 * Problems store one canonical camelCase `functionName` (e.g. "twoSum").
 * JavaScript starter/solution code uses it as-is; Python starter/solution
 * code follows Python convention and defines the snake_case equivalent
 * (e.g. "two_sum"). This converts the canonical name for a given language
 * so the harness calls the name that's actually defined in the learner's
 * code.
 */
export function functionNameForLanguage(functionName: string, language: SupportedLanguage): string {
  if (language === 'javascript') return functionName;
  return functionName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

/**
 * Wraps the learner's function submission with a small runner that invokes
 * it against every test case and prints a single JSON array of results to
 * stdout. This lets one sandboxed execution grade an entire problem instead
 * of spinning up one execution per test case.
 */
export function buildHarness(
  language: SupportedLanguage,
  userCode: string,
  functionName: string,
  testCases: HarnessTestCase[]
): string {
  const casesB64 = toBase64(JSON.stringify(testCases));
  const fnName = functionNameForLanguage(functionName, language);

  if (language === 'javascript') {
    return `'use strict';
${userCode}

(function runHarness() {
  const __cases = JSON.parse(Buffer.from("${casesB64}", "base64").toString("utf-8"));
  const __results = [];
  for (const tc of __cases) {
    const __start = Date.now();
    try {
      const __output = ${fnName}(...tc.input);
      const __passed = JSON.stringify(__output) === JSON.stringify(tc.expected);
      __results.push({ passed: __passed, output: __output, runtimeMs: Date.now() - __start });
    } catch (err) {
      __results.push({
        passed: false,
        error: (err && err.message) ? String(err.message) : String(err),
        runtimeMs: Date.now() - __start,
      });
    }
  }
  console.log(JSON.stringify(__results));
})();
`;
  }

  // python
  return `import json, base64, time, sys

${userCode}

def __run_harness():
    __cases = json.loads(base64.b64decode("${casesB64}").decode("utf-8"))
    __results = []
    for tc in __cases:
        __start = time.time()
        try:
            __output = ${fnName}(*tc["input"])
            __passed = __output == tc["expected"]
            __results.append({"passed": __passed, "output": __output, "runtimeMs": int((time.time() - __start) * 1000)})
        except Exception as e:
            __results.append({"passed": False, "error": str(e), "runtimeMs": int((time.time() - __start) * 1000)})
    print(json.dumps(__results))

__run_harness()
`;
}

export type HarnessResult = { passed: boolean; output?: unknown; error?: string; runtimeMs: number };
