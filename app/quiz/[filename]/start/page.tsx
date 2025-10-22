import { getQuizByFilename } from "@/lib/quiz-loader";
import { notFound } from "next/navigation";
import QuizInterface from "@/components/QuizInterface";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ filename: string }>;
}) {
  const resolvedParams = await params;
  const filename = decodeURIComponent(resolvedParams.filename);
  const quiz = getQuizByFilename(filename);

  if (!quiz) {
    notFound();
  }

  return <QuizInterface quiz={quiz} />;
}
