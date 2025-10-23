"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuizResults {
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  answers: {
    questionId: number;
    selectedAnswer: number | null;
    textAnswer?: Record<string, string>;
    correctAnswer: number | Record<string, string>;
    isCorrect: boolean;
  }[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResults | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("quizResults");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      router.push("/");
    }
  }, [router]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const score = Math.round(
    (results.correctAnswers / results.totalQuestions) * 100
  );
  const passed = score >= 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Results Card */}
        <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {results.quizTitle}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">시험 결과</p>
          </div>

          {/* Score Display */}
          <div className="text-center mb-6 sm:mb-8">
            <div
              className={`inline-block rounded-full p-6 sm:p-8 mb-3 sm:mb-4 ${
                passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <div
                className={`text-4xl sm:text-5xl md:text-6xl font-bold ${
                  passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {score}점
              </div>
            </div>
            <div className="text-lg sm:text-xl text-gray-700 mb-2">
              {results.correctAnswers} / {results.totalQuestions} 문제 정답
            </div>
            <div
              className={`inline-block px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold text-sm sm:text-base ${
                passed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {passed ? "합격" : "불합격"}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {results.totalQuestions}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">총 문제</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {results.correctAnswers}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">정답</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {results.totalQuestions - results.correctAnswers}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">오답</div>
            </div>
          </div>

          {/* Answer Details */}
          <div className="border-t pt-4 sm:pt-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
              문제별 결과
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {results.answers.map((answer) => {
                const isShortAnswer = typeof answer.correctAnswer === "object";

                return (
                  <div
                    key={answer.questionId}
                    className={`p-3 sm:p-4 rounded-lg ${
                      answer.isCorrect
                        ? "bg-green-50 border-2 border-green-200"
                        : "bg-red-50 border-2 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                            answer.isCorrect
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {answer.questionId}
                        </div>
                        <div className="font-medium text-gray-800 text-sm sm:text-base">
                          문제 {answer.questionId}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {answer.isCorrect ? (
                          <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 sm:w-6 sm:h-6 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {isShortAnswer ? (
                      <div className="ml-11 sm:ml-13 space-y-1">
                        {Object.keys(
                          answer.correctAnswer as Record<string, string>
                        ).map((key) => {
                          const userAnswer = answer.textAnswer?.[key] || "";
                          const correctAnswerValue = (
                            answer.correctAnswer as Record<string, string>
                          )[key];
                          const isKeyCorrect =
                            userAnswer.replace(/\s+/g, "").toLowerCase() ===
                            correctAnswerValue
                              .replace(/\s+/g, "")
                              .toLowerCase();

                          return (
                            <div
                              key={key}
                              className="text-xs sm:text-sm text-gray-600"
                            >
                              <span className="font-semibold">{key}.</span>{" "}
                              <span
                                className={
                                  isKeyCorrect
                                    ? "text-green-700"
                                    : "text-red-700"
                                }
                              >
                                입력: {userAnswer || "(미입력)"}
                              </span>
                              {!isKeyCorrect && (
                                <>
                                  {" | "}
                                  <span className="text-gray-700">
                                    정답: {correctAnswerValue}
                                  </span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="ml-11 sm:ml-13 text-xs sm:text-sm text-gray-600">
                        {answer.selectedAnswer !== null
                          ? `선택: ${answer.selectedAnswer + 1}번`
                          : "미선택"}
                        {" | "}
                        정답: {(answer.correctAnswer as number) + 1}번
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg transition-all"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            홈으로
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem("quizResults");
              router.back();
            }}
            className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transition-all"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            다시 풀기
          </button>
        </div>

        {/* Motivational Message */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-2xl mx-auto">
            <p className="text-gray-700 text-sm sm:text-base md:text-lg">
              {passed
                ? "축하합니다! 시험에 합격하셨습니다. 계속해서 다른 시험도 도전해보세요!"
                : "아쉽게도 불합격입니다. 다시 한번 공부하고 도전해보세요!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
