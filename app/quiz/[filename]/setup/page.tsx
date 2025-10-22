"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QuizSettings } from "@/types/quiz";

export default function QuizSetupPage() {
  const params = useParams();
  const router = useRouter();
  const filename = decodeURIComponent(params.filename as string);
  const [quizTitle, setQuizTitle] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [difficulties, setDifficulties] = useState<string[]>([]);

  const [settings, setSettings] = useState<QuizSettings>({
    mode: "all",
    questionCount: undefined,
    difficulty: undefined,
    shuffleQuestions: false,
    shuffleOptions: false,
  });

  useEffect(() => {
    // Load quiz metadata
    fetch(`/quiz_sets/${filename}`)
      .then((res) => res.json())
      .then((data) => {
        setQuizTitle(data.examTitle);
        setTotalQuestions(data.questions.length);

        // Extract unique difficulties
        const uniqueDifficulties = Array.from(
          new Set(data.questions.map((q: any) => q.difficulty))
        ) as string[];
        setDifficulties(uniqueDifficulties);
      });
  }, [filename]);

  const handleStartQuiz = () => {
    // Store settings in sessionStorage
    sessionStorage.setItem("quizSettings", JSON.stringify(settings));
    router.push(`/quiz/${encodeURIComponent(filename)}/start`);
  };

  const maxQuestions =
    settings.mode === "random"
      ? totalQuestions
      : settings.mode === "difficulty" && settings.difficulty
      ? totalQuestions // Will be calculated on the quiz page
      : totalQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 mb-4"
          >
            <svg
              className="w-5 h-5"
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {quizTitle}
          </h1>
          <p className="text-gray-600 mt-2">시험 설정을 선택하세요</p>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-8">
          {/* Mode Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              출제 방식
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    mode: "all",
                    questionCount: undefined,
                    difficulty: undefined,
                  })
                }
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  settings.mode === "all"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">
                  전체 문제
                </div>
                <div className="text-sm text-gray-600">
                  모든 문제 풀기 ({totalQuestions}문제)
                </div>
              </button>

              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    mode: "random",
                    difficulty: undefined,
                  })
                }
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  settings.mode === "random"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">
                  랜덤 출제
                </div>
                <div className="text-sm text-gray-600">
                  원하는 개수만큼 랜덤 출제
                </div>
              </button>

              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    mode: "difficulty",
                    questionCount: undefined,
                  })
                }
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  settings.mode === "difficulty"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">난이도별</div>
                <div className="text-sm text-gray-600">특정 난이도만 선택</div>
              </button>

              <button
                onClick={() => setSettings({ ...settings, mode: "custom" })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  settings.mode === "custom"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">커스텀</div>
                <div className="text-sm text-gray-600">세부 설정 조합</div>
              </button>
            </div>
          </div>

          {/* Question Count for Random Mode */}
          {settings.mode === "random" && (
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                문제 개수
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="5"
                  max={totalQuestions}
                  step="1"
                  value={settings.questionCount || 10}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      questionCount: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">5문제</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {settings.questionCount || 10}문제
                  </span>
                  <span className="text-gray-600">{totalQuestions}문제</span>
                </div>
              </div>
            </div>
          )}

          {/* Difficulty Selection */}
          {(settings.mode === "difficulty" || settings.mode === "custom") && (
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                난이도 선택
              </label>
              <div className="grid grid-cols-3 gap-3">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() =>
                      setSettings({
                        ...settings,
                        difficulty: diff as "상" | "중" | "하",
                      })
                    }
                    className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                      settings.difficulty === diff
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-700 hover:border-indigo-300"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question Count for Custom Mode */}
          {settings.mode === "custom" && (
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                문제 개수 제한
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="limitQuestions"
                    checked={settings.questionCount !== undefined}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        questionCount: e.target.checked ? 10 : undefined,
                      })
                    }
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="limitQuestions" className="text-gray-700">
                    문제 개수 제한하기
                  </label>
                </div>
                {settings.questionCount !== undefined && (
                  <div className="ml-8 space-y-3">
                    <input
                      type="range"
                      min="5"
                      max={totalQuestions}
                      step="1"
                      value={settings.questionCount}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          questionCount: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">5문제</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        {settings.questionCount}문제
                      </span>
                      <span className="text-gray-600">
                        {totalQuestions}문제
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              추가 옵션
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  checked={settings.shuffleQuestions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shuffleQuestions: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="shuffleQuestions"
                  className="text-gray-700 flex-1"
                >
                  문제 순서 섞기
                </label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="shuffleOptions"
                  checked={settings.shuffleOptions}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shuffleOptions: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="shuffleOptions"
                  className="text-gray-700 flex-1"
                >
                  선택지 순서 섞기
                </label>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartQuiz}
            className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            시험 시작하기
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-gray-800 mb-1">시험 모드 안내</p>
              <ul className="space-y-1">
                <li>
                  • <strong>전체 문제:</strong> 모든 문제를 순서대로 풀이
                </li>
                <li>
                  • <strong>랜덤 출제:</strong> 원하는 개수만큼 무작위로 출제
                </li>
                <li>
                  • <strong>난이도별:</strong> 특정 난이도 문제만 선택
                </li>
                <li>
                  • <strong>커스텀:</strong> 난이도와 문제 수를 조합하여 설정
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
