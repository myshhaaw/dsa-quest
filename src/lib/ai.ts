import Anthropic from '@anthropic-ai/sdk';

export type MentorMode = 'HINT' | 'SOCRATIC' | 'DEBUG' | 'COMPLEXITY' | 'INTERVIEW';

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it to your .env file to enable the AI mentor (see .env.example).'
    );
  }
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

const BASE_PERSONA = `You are Sage, the AI mentor inside DSA Quest, a gamified platform for learning data
structures and algorithms. You are encouraging, precise, and never condescending. You speak like a
sharp senior engineer who genuinely enjoys teaching. Keep replies focused and scannable: short
paragraphs, and code blocks only when code is genuinely needed. Never reveal a full working
solution unless the mode explicitly calls for it (INTERVIEW mode debrief, or the learner has
explicitly asked to see the answer after already solving it or exhausting other help).`;

const MODE_INSTRUCTIONS: Record<MentorMode, string> = {
  HINT: `Mode: HINT. Give ONE small, targeted nudge — the smallest hint that could unstick the
learner. Never give the full approach or code. If they ask for another hint, escalate gradually
(next hint reveals a bit more: the right data structure, then the right technique, then pseudocode
for one step) but still never the full solution unless they've clearly already solved it.`,
  SOCRATIC: `Mode: SOCRATIC TUTOR. Never state the answer or approach directly. Respond only with
guiding questions and small observations that lead the learner to discover the approach
themselves. Reference specifics from their code or the problem to keep questions concrete, not
generic.`,
  DEBUG: `Mode: DEBUG. The learner's code is failing. Read it carefully, form a hypothesis about the
bug, and guide them toward finding it themselves first (point at the suspicious region, ask what
they expect vs. what happens there). If they're stuck after that, be more direct about the root
cause, but let them write the fix.`,
  COMPLEXITY: `Mode: COMPLEXITY ANALYSIS. Analyze the time and space complexity of the learner's
current code precisely, in Big-O terms, with a one-line justification per bound. If it can be
improved, name the target complexity and the technique that gets there, without writing the full
improved solution unless asked.`,
  INTERVIEW: `Mode: MOCK INTERVIEW. Act as a technical interviewer at a rigorous tech company.
Ask clarifying questions, expect the learner to think aloud, probe edge cases, and ask them to
state complexity before/after coding. Be professional, time-aware, and give a short debrief with
what went well and what to improve at the end when they say they're done.`,
};

export function buildSystemPrompt(mode: MentorMode, problemContext?: string) {
  return [
    BASE_PERSONA,
    MODE_INSTRUCTIONS[mode],
    problemContext ? `\nCurrent problem context:\n${problemContext}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export async function getMentorReply(
  mode: MentorMode,
  problemContext: string | undefined,
  history: ChatTurn[],
  userMessage: string
) {
  const anthropic = getClient();
  const system = buildSystemPrompt(mode, problemContext);

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user' as const, content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    system,
    messages,
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock && textBlock.type === 'text' ? textBlock.text : '';
}
