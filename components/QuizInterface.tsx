"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Quiz,
  UserAnswer,
  QuizSettings,
  Question,
  ShortAnswerQuestion,
  MultipleChoiceQuestion,
} from "@/types/quiz";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuizInterfaceProps {
  quiz: Quiz;
}

// Type guard functions
function isShortAnswerQuestion(
  question: Question
): question is ShortAnswerQuestion {
  return question.type === "short_answer";
}

function isMultipleChoiceQuestion(
  question: Question
): question is MultipleChoiceQuestion {
  return !question.type || question.type === "multiple_choice";
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function QuizInterface({ quiz }: QuizInterfaceProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  // Get settings from sessionStorage
  const filteredQuestions = useMemo(() => {
    if (typeof window === "undefined") return quiz.questions;

    const settingsStr = sessionStorage.getItem("quizSettings");
    if (!settingsStr) return quiz.questions;

    const settings: QuizSettings = JSON.parse(settingsStr);
    let questions = [...quiz.questions];

    // Filter by difficulty
    if (settings.difficulty) {
      questions = questions.filter((q) => q.difficulty === settings.difficulty);
    }

    // Shuffle questions if needed
    if (settings.shuffleQuestions) {
      questions = shuffleArray(questions);
    }

    // Limit question count
    if (settings.questionCount && settings.questionCount < questions.length) {
      if (settings.mode === "random") {
        questions = shuffleArray(questions).slice(0, settings.questionCount);
      } else {
        questions = questions.slice(0, settings.questionCount);
      }
    }

    return questions;
  }, [quiz.questions]);

  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(
    filteredQuestions.map((q) => ({
      questionId: q.id,
      selectedAnswer: null,
      textAnswer: isShortAnswerQuestion(q) ? {} : undefined,
    }))
  );

  // Shuffle options if needed (only for multiple choice questions)
  const [shuffledOptions, setShuffledOptions] = useState<{
    [key: number]: { options: string[]; mapping: number[] };
  }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const settingsStr = sessionStorage.getItem("quizSettings");
    if (!settingsStr) return;

    const settings: QuizSettings = JSON.parse(settingsStr);

    if (settings.shuffleOptions) {
      const newShuffledOptions: {
        [key: number]: { options: string[]; mapping: number[] };
      } = {};

      filteredQuestions.forEach((question) => {
        if (isMultipleChoiceQuestion(question)) {
          const indices = question.options.map((_, i) => i);
          const shuffledIndices = shuffleArray(indices);
          const shuffledOpts = shuffledIndices.map((i) => question.options[i]);

          newShuffledOptions[question.id] = {
            options: shuffledOpts,
            mapping: shuffledIndices,
          };
        }
      });

      setShuffledOptions(newShuffledOptions);
    }
  }, [filteredQuestions]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const currentAnswer = userAnswers.find(
    (a) => a.questionId === currentQuestion.id
  );

  // Get display options and correct answer mapping (for multiple choice only)
  const displayOptions = isMultipleChoiceQuestion(currentQuestion)
    ? shuffledOptions[currentQuestion.id]?.options || currentQuestion.options
    : [];
  const answerMapping = isMultipleChoiceQuestion(currentQuestion)
    ? shuffledOptions[currentQuestion.id]?.mapping ||
      currentQuestion.options.map((_, i) => i)
    : [];
  const mappedCorrectAnswer = isMultipleChoiceQuestion(currentQuestion)
    ? answerMapping.indexOf(currentQuestion.correctAnswer)
    : -1;

  const handleAnswerSelect = (optionIndex: number) => {
    setUserAnswers((prev) =>
      prev.map((a) =>
        a.questionId === currentQuestion.id
          ? { ...a, selectedAnswer: optionIndex }
          : a
      )
    );
    setShowExplanation(false);
  };

  const handleTextAnswerChange = (key: string, value: string) => {
    setUserAnswers((prev) =>
      prev.map((a) =>
        a.questionId === currentQuestion.id
          ? { ...a, textAnswer: { ...a.textAnswer, [key]: value } }
          : a
      )
    );
    setShowExplanation(false);
  };

  const handleSubmitAnswer = () => {
    if (isShortAnswerQuestion(currentQuestion)) {
      // Check if all text answers are provided
      const allAnswered = Object.keys(currentQuestion.correctAnswer).every(
        (key) => currentAnswer?.textAnswer?.[key]?.trim()
      );
      if (allAnswered) {
        setShowExplanation(true);
      }
    } else if (currentAnswer?.selectedAnswer !== null) {
      setShowExplanation(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowExplanation(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowExplanation(false);
    }
  };

  const handleCompleteQuiz = () => {
    const results = {
      quizTitle: quiz.examTitle,
      totalQuestions: filteredQuestions.length,
      correctAnswers: userAnswers.filter((answer) => {
        const question = filteredQuestions.find(
          (q) => q.id === answer.questionId
        );
        if (!question) return false;

        if (isShortAnswerQuestion(question)) {
          // Check if all text answers match (case-insensitive, all whitespace removed)
          return Object.keys(question.correctAnswer).every(
            (key) =>
              answer.textAnswer?.[key]?.replace(/\s+/g, "").toLowerCase() ===
              question.correctAnswer[key].replace(/\s+/g, "").toLowerCase()
          );
        } else {
          // Map back to original answer if options were shuffled
          let userOriginalAnswer = answer.selectedAnswer;
          if (userOriginalAnswer !== null && shuffledOptions[question.id]) {
            userOriginalAnswer =
              shuffledOptions[question.id].mapping[userOriginalAnswer];
          }
          return userOriginalAnswer === question.correctAnswer;
        }
      }).length,
      answers: userAnswers.map((answer) => {
        const question = filteredQuestions.find(
          (q) => q.id === answer.questionId
        );
        if (!question)
          return {
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            textAnswer: answer.textAnswer,
            correctAnswer: -1,
            isCorrect: false,
          };

        if (isShortAnswerQuestion(question)) {
          const isCorrect = Object.keys(question.correctAnswer).every(
            (key) =>
              answer.textAnswer?.[key]?.replace(/\s+/g, "").toLowerCase() ===
              question.correctAnswer[key].replace(/\s+/g, "").toLowerCase()
          );
          return {
            questionId: answer.questionId,
            selectedAnswer: null,
            textAnswer: answer.textAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
          };
        } else {
          let userOriginalAnswer = answer.selectedAnswer;
          if (userOriginalAnswer !== null && shuffledOptions[question.id]) {
            userOriginalAnswer =
              shuffledOptions[question.id].mapping[userOriginalAnswer];
          }

          return {
            questionId: answer.questionId,
            selectedAnswer: userOriginalAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: userOriginalAnswer === question.correctAnswer,
          };
        }
      }),
    };

    // Store results in sessionStorage
    sessionStorage.setItem("quizResults", JSON.stringify(results));
    router.push("/results");
  };

  const answeredCount = userAnswers.filter((a, index) => {
    const question = filteredQuestions[index];
    if (isShortAnswerQuestion(question)) {
      return Object.keys(question.correctAnswer).every((key) =>
        a.textAnswer?.[key]?.trim()
      );
    }
    return a.selectedAnswer !== null;
  }).length;

  const isAnswered = isShortAnswerQuestion(currentQuestion)
    ? Object.keys(currentQuestion.correctAnswer).every((key) =>
        currentAnswer?.textAnswer?.[key]?.trim()
      )
    : currentAnswer?.selectedAnswer !== null;

  // Check if answer is correct
  let isCorrect = false;
  if (currentAnswer) {
    if (isShortAnswerQuestion(currentQuestion)) {
      isCorrect = Object.keys(currentQuestion.correctAnswer).every(
        (key) =>
          currentAnswer.textAnswer?.[key]?.replace(/\s+/g, "").toLowerCase() ===
          currentQuestion.correctAnswer[key].replace(/\s+/g, "").toLowerCase()
      );
    } else if (
      isMultipleChoiceQuestion(currentQuestion) &&
      currentAnswer.selectedAnswer !== null
    ) {
      const userOriginalAnswer = shuffledOptions[currentQuestion.id]
        ? shuffledOptions[currentQuestion.id].mapping[
            currentAnswer.selectedAnswer
          ]
        : currentAnswer.selectedAnswer;
      isCorrect = userOriginalAnswer === currentQuestion.correctAnswer;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              목록으로
            </Link>
            <div className="text-xs sm:text-sm text-gray-500">
              {answeredCount} / {filteredQuestions.length} 문제 답변함
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            {quiz.examTitle}
          </h1>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          {/* Question Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="bg-indigo-600 text-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 font-semibold text-sm sm:text-base">
                문제 {currentQuestion.id}
              </span>
              <span className="bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
                난이도: {currentQuestion.difficulty}
              </span>
            </div>
            <div className="text-gray-500 text-xs sm:text-sm">
              {currentQuestionIndex + 1} / {filteredQuestions.length}
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-6 sm:mb-8">
            <p className="text-base sm:text-lg text-gray-800 whitespace-pre-line leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Multiple Choice Options */}
          {isMultipleChoiceQuestion(currentQuestion) && (
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {displayOptions.map((option, index) => {
                const isSelected = currentAnswer?.selectedAnswer === index;
                const isCorrectOption = index === mappedCorrectAnswer;
                const showCorrect = showExplanation && isCorrectOption;
                const showIncorrect =
                  showExplanation && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() =>
                      !showExplanation && handleAnswerSelect(index)
                    }
                    disabled={showExplanation}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${
                      showCorrect
                        ? "border-green-500 bg-green-50"
                        : showIncorrect
                        ? "border-red-500 bg-red-50"
                        : isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                    } ${
                      showExplanation ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span
                        className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                          showCorrect
                            ? "bg-green-500 text-white"
                            : showIncorrect
                            ? "bg-red-500 text-white"
                            : isSelected
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm sm:text-base text-gray-800 flex-1 break-words">
                        {option}
                      </span>
                      {showCorrect && (
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0"
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
                      )}
                      {showIncorrect && (
                        <svg
                          className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0"
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
                  </button>
                );
              })}
            </div>
          )}

          {/* Short Answer Input Fields */}
          {isShortAnswerQuestion(currentQuestion) && (
            <div className="space-y-4 mb-4 sm:mb-6">
              {Object.keys(currentQuestion.correctAnswer).map((key) => {
                const value = currentAnswer?.textAnswer?.[key] || "";
                const isCorrectAnswer =
                  showExplanation &&
                  value.replace(/\s+/g, "").toLowerCase() ===
                    currentQuestion.correctAnswer[key]
                      .replace(/\s+/g, "")
                      .toLowerCase();
                const isIncorrectAnswer = showExplanation && !isCorrectAnswer;

                return (
                  <div key={key} className="space-y-2">
                    <label
                      htmlFor={`answer-${key}`}
                      className="block text-sm sm:text-base font-semibold text-gray-700"
                    >
                      {key}.
                    </label>
                    <div className="relative">
                      <input
                        id={`answer-${key}`}
                        type="text"
                        value={value}
                        onChange={(e) =>
                          !showExplanation &&
                          handleTextAnswerChange(key, e.target.value)
                        }
                        disabled={showExplanation}
                        placeholder="답을 입력하세요"
                        className={`w-full p-3 sm:p-4 rounded-lg border-2 transition-all text-sm sm:text-base text-gray-900 ${
                          isCorrectAnswer
                            ? "border-green-500 bg-green-50"
                            : isIncorrectAnswer
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300 focus:border-indigo-500 focus:outline-none"
                        } ${
                          showExplanation ? "cursor-not-allowed" : "cursor-text"
                        }`}
                      />
                      {showExplanation && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {isCorrectAnswer ? (
                            <svg
                              className="w-5 h-5 sm:w-6 sm:h-6 text-green-500"
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
                              className="w-5 h-5 sm:w-6 sm:h-6 text-red-500"
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
                      )}
                    </div>
                    {showExplanation && isIncorrectAnswer && (
                      <p className="text-sm text-gray-600 mt-1">
                        정답: {currentQuestion.correctAnswer[key]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit Button */}
          {!showExplanation && (
            <button
              onClick={handleSubmitAnswer}
              disabled={!isAnswered}
              className={`w-full py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all ${
                isAnswered
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              정답 확인
            </button>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div
              className={`p-4 sm:p-6 rounded-lg ${
                isCorrect
                  ? "bg-green-50 border-2 border-green-200"
                  : "bg-red-50 border-2 border-red-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {isCorrect ? (
                  <>
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-green-800 font-semibold text-base sm:text-lg">
                      정답입니다!
                    </span>
                  </>
                ) : (
                  <>
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
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-red-800 font-semibold text-base sm:text-lg">
                      틀렸습니다
                    </span>
                  </>
                )}
              </div>
              <div className="mb-3 sm:mb-4">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                  해설:
                </h4>
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">참고:</span>{" "}
                {currentQuestion.reference}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all ${
              currentQuestionIndex === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-indigo-600 hover:bg-indigo-50 shadow"
            }`}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">이전 문제</span>
            <span className="sm:hidden">이전</span>
          </button>

          {currentQuestionIndex < filteredQuestions.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base bg-indigo-600 text-white hover:bg-indigo-700 shadow transition-all"
            >
              <span className="hidden sm:inline">다음 문제</span>
              <span className="sm:hidden">다음</span>
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleCompleteQuiz}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base bg-green-600 text-white hover:bg-green-700 shadow transition-all"
            >
              <span className="hidden sm:inline">시험 완료</span>
              <span className="sm:hidden">완료</span>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-4 sm:mt-6 bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            문제 바로가기
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {filteredQuestions.map((_, index) => {
              const answer = userAnswers[index];
              const isAnsweredQuestion = answer.selectedAnswer !== null;
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setShowExplanation(false);
                  }}
                  className={`aspect-square rounded-lg font-semibold text-sm sm:text-base transition-all ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2"
                      : isAnsweredQuestion
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
