"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuizSettings } from "@/types/quiz";

interface QuizFileWithMeta {
  filename: string;
  title: string;
  questionCount: number;
  difficulties: string[];
}

export default function CombinedQuizSetupPage() {
  const router = useRouter();
  const [quizFiles, setQuizFiles] = useState<QuizFileWithMeta[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [settings, setSettings] = useState<QuizSettings>({
    mode: "all",
    questionCount: undefined,
    difficulty: undefined,
    shuffleQuestions: false,
    shuffleOptions: false,
  });

  useEffect(() => {
    // Load all quiz files metadata
    const loadQuizMetadata = async () => {
      try {
        const response = await fetch("/api/quiz-files");
        const files = await response.json();

        const filesWithMeta = await Promise.all(
          files.map(async (file: { filename: string; title: string }) => {
            const quizResponse = await fetch(`/quiz_sets/${file.filename}`);
            const quizData = await quizResponse.json();

            return {
              filename: file.filename,
              title: file.title,
              questionCount: quizData.questions.length,
              difficulties: Array.from(
                new Set(quizData.questions.map((q: any) => q.difficulty))
              ) as string[],
            };
          })
        );

        setQuizFiles(filesWithMeta);
      } catch (error) {
        console.error("Failed to load quiz files:", error);
      }
    };

    loadQuizMetadata();
  }, []);

  useEffect(() => {
    // Calculate total questions based on selected files
    const total = quizFiles
      .filter((file) => selectedFiles.includes(file.filename))
      .reduce((sum, file) => sum + file.questionCount, 0);
    setTotalQuestions(total);
  }, [selectedFiles, quizFiles]);

  const toggleFile = (filename: string) => {
    setSelectedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  const selectAll = () => {
    setSelectedFiles(quizFiles.map((f) => f.filename));
  };

  const deselectAll = () => {
    setSelectedFiles([]);
  };

  const handleStartQuiz = () => {
    if (selectedFiles.length === 0) {
      alert("최소 1개 이상의 과목을 선택해주세요.");
      return;
    }

    // Store settings in sessionStorage
    sessionStorage.setItem("quizSettings", JSON.stringify(settings));
    sessionStorage.setItem("selectedQuizFiles", JSON.stringify(selectedFiles));
    router.push("/quiz/combined/start");
  };

  const allSelected =
    selectedFiles.length === quizFiles.length && quizFiles.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
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
            종합 시험 설정
          </h1>
          <p className="text-gray-600 mt-2">
            시험에 포함할 과목과 설정을 선택하세요
          </p>
        </div>

        {/* Subject Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              과목 선택
              {selectedFiles.length > 0 && (
                <span className="text-indigo-600 ml-2">
                  ({selectedFiles.length}개 선택됨)
                </span>
              )}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={allSelected}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  allSelected
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                전체 선택
              </button>
              <button
                onClick={deselectAll}
                disabled={selectedFiles.length === 0}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  selectedFiles.length === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                전체 해제
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {quizFiles.map((file) => {
              const isSelected = selectedFiles.includes(file.filename);
              return (
                <button
                  key={file.filename}
                  onClick={() => toggleFile(file.filename)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-white"
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
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {file.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {file.questionCount}문제 • 난이도:{" "}
                        {file.difficulties.join(", ")}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {totalQuestions > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <span className="text-gray-700">총 문제 수:</span>
                <span className="text-2xl font-bold text-indigo-600 ml-2">
                  {totalQuestions}문제
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quiz Settings */}
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
                  선택한 과목의 모든 문제
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
          {settings.mode === "random" && totalQuestions > 0 && (
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
                {["상", "중", "하"].map((diff) => (
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
          {settings.mode === "custom" && totalQuestions > 0 && (
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
            disabled={selectedFiles.length === 0}
            className={`w-full py-4 font-bold text-lg rounded-lg transition-all shadow-lg ${
              selectedFiles.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl"
            }`}
          >
            시험 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
