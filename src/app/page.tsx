import Link from 'next/link';
import { Sparkles, Swords, Brain, Map, Trophy, Flame } from 'lucide-react';

const PATH_TOPICS = ['Arrays', 'Two Pointers', 'Linked Lists', 'Stacks', 'Trees', 'DP', 'Boss'];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-arcane-400" size={22} />
          <span className="font-display font-semibold text-lg">DSA Quest</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-mist hover:text-parchment transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-arcane-500 hover:bg-arcane-400 text-obsidian-950 font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Start your quest
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center">
        <p className="inline-flex items-center gap-2 text-sm text-arcane-400 bg-arcane-500/10 border border-arcane-500/30 rounded-full px-3 py-1 mb-6">
          <Swords size={14} /> An RPG for your algorithms brain
        </p>
        <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-tight text-parchment">
          Turn data structures and algorithms into a game you actually want to play
        </h1>
        <p className="mt-6 text-lg text-mist max-w-2xl mx-auto">
          Walk a roadmap of topics, fight your way through coding challenges and boss battles, and
          get unstuck with Sage — an AI mentor that teaches instead of just answering.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-arcane-500 hover:bg-arcane-400 text-obsidian-950 font-medium px-6 py-3 rounded-lg transition-colors shadow-glow"
          >
            Create free account
          </Link>
          <Link
            href="/login"
            className="border border-obsidian-600 hover:border-obsidian-500 px-6 py-3 rounded-lg transition-colors"
          >
            I already have one
          </Link>
        </div>

        <div className="mt-20 flex items-center justify-center">
          <div className="flex items-center gap-1 flex-wrap justify-center">
            {PATH_TOPICS.map((t, i) => (
              <div key={t} className="flex items-center">
                <div
                  className={
                    'flex items-center justify-center rounded-full border text-xs font-mono px-4 py-2 ' +
                    (t === 'Boss'
                      ? 'border-arcane-400 bg-arcane-500/20 text-arcane-300'
                      : 'border-obsidian-600 bg-obsidian-800 text-mist')
                  }
                >
                  {t}
                </div>
                {i < PATH_TOPICS.length - 1 && (
                  <div className="w-6 sm:w-10 h-px bg-obsidian-600 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-28 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Map,
            title: 'A roadmap, not a dump of problems',
            body: 'Topics unlock in order, each with a short lesson, a quiz, and problems that build on what you just learned.',
          },
          {
            icon: Brain,
            title: 'Sage, your AI mentor',
            body: 'Ask for a hint, a Socratic nudge, a debug pass, a complexity breakdown, or a full mock interview.',
          },
          {
            icon: Trophy,
            title: 'XP, coins, quests, achievements',
            body: 'Every lesson and problem earns real progress. Daily and weekly quests keep momentum going.',
          },
          {
            icon: Flame,
            title: 'Streaks and spaced repetition',
            body: 'DSA Quest resurfaces problems right before you forget them, and tracks your mastery per topic.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-obsidian-700 bg-obsidian-900/60 p-5 hover:border-arcane-500/40 transition-colors"
          >
            <f.icon className="text-arcane-400 mb-3" size={22} />
            <h3 className="font-display text-parchment mb-1.5">{f.title}</h3>
            <p className="text-sm text-mist leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
