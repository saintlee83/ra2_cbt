"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import QuizInterface from "@/components/QuizInterface";
import { Quiz, Question } from "@/types/quiz";

export default function CombinedQuizPage() {
  const router = useRouter();
  const [combinedQuiz, setCombinedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCombinedQuiz = async () => {
      try {
        // Get selected files from sessionStorage
        const selectedFilesStr = sessionStorage.getItem("selectedQuizFiles");

        if (!selectedFilesStr) {
          router.push("/quiz/combined/setup");
          return;
        }

        const selectedFiles: string[] = JSON.parse(selectedFilesStr);

        if (selectedFiles.length === 0) {
          router.push("/quiz/combined/setup");
          return;
        }

        // Load all selected quiz files
        const quizPromises = selectedFiles.map((filename) =>
          fetch(`/quiz_sets/${filename}`).then((res) => res.json())
        );

        const quizzes = await Promise.all(quizPromises);

        // Combine all questions with unique IDs
        const allQuestions: Question[] = [];
        const titles: string[] = [];
        let questionIdCounter = 1;

        quizzes.forEach((quiz) => {
          // Reassign unique IDs to each question
          const questionsWithNewIds = quiz.questions.map((q) => ({
            ...q,
            id: questionIdCounter++,
          }));
          allQuestions.push(...questionsWithNewIds);
          titles.push(quiz.examTitle);
        });

        const combined: Quiz = {
          examTitle: `종합 시험 (${titles.join(", ")})`,
          questions: allQuestions,
        };

        setCombinedQuiz(combined);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load combined quiz:", error);
        alert("시험 로드에 실패했습니다. 다시 시도해주세요.");
        router.push("/quiz/combined/setup");
      }
    };

    loadCombinedQuiz();
  }, [router]);

  if (loading || !combinedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">시험을 준비하는 중...</p>
        </div>
      </div>
    );
  }

  return <QuizInterface quiz={combinedQuiz} />;
}
