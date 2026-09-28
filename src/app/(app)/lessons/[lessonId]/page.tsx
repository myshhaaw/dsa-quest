import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LessonQuiz } from '@/components/LessonQuiz';

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const user = await getCurrentUser();
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: { topic: true, quizQuestions: { orderBy: { order: 'asc' } } },
  });
  if (!lesson) notFound();

  const progress = await prisma.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId: user!.id, lessonId: lesson.id } },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/roadmap/${lesson.topic.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-parchment mb-6"
      >
        <ArrowLeft size={14} /> Back to {lesson.topic.title}
      </Link>
      <p className="text-sm text-arcane-400 mb-1">{lesson.topic.title}</p>
      <h1 className="font-display text-2xl text-parchment mb-6">{lesson.title}</h1>

      <div className="prose-quest">
        <ReactMarkdown>{lesson.content}</ReactMarkdown>
      </div>

      <LessonQuiz
        lessonId={lesson.id}
        questions={lesson.quizQuestions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          choices: q.choices as string[],
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }))}
        alreadyCompleted={Boolean(progress?.completed)}
        xpReward={lesson.xpReward}
      />
    </div>
  );
}
