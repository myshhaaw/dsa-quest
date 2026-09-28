import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { cn, DIFFICULTY_COLOR, DIFFICULTY_LABEL } from '@/lib/utils';
import { ProblemWorkspace } from '@/components/ProblemWorkspace';

export default async function ProblemPage({ params }: { params: { slug: string } }) {
  const problem = await prisma.problem.findUnique({
    where: { slug: params.slug },
    include: { topic: true },
  });
  if (!problem) notFound();

  return (
    <div>
      <Link
        href={`/roadmap/${problem.topic.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-parchment mb-6"
      >
        <ArrowLeft size={14} /> Back to {problem.topic.title}
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-display text-2xl text-parchment">
          {problem.isBossBattle ? '👑 ' : ''}
          {problem.title}
        </h1>
        <span className={cn('text-xs font-mono px-2 py-0.5 rounded border', DIFFICULTY_COLOR[problem.difficulty])}>
          {DIFFICULTY_LABEL[problem.difficulty]}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-6">
        {problem.tags.map((t) => (
          <span key={t} className="text-xs text-mist bg-obsidian-800 border border-obsidian-700 rounded-full px-2 py-0.5">
            {t}
          </span>
        ))}
      </div>

      {problem.whyThisProblem && (
        <div className="mb-6 flex gap-2 rounded-lg border border-arcane-500/30 bg-arcane-500/5 px-4 py-3 text-sm text-parchment/90">
          <Sparkles size={16} className="text-arcane-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-arcane-400 font-medium">Why this problem? </span>
            {problem.whyThisProblem}
          </div>
        </div>
      )}

      <div className="prose-quest mb-8">
        <ReactMarkdown>{problem.description}</ReactMarkdown>
      </div>

      <ProblemWorkspace slug={problem.slug} starterCode={problem.starterCode as Record<string, string>} />
    </div>
  );
}
