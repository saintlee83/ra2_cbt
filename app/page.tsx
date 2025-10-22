import Link from "next/link";
import { getQuizFiles } from "@/lib/quiz-loader";

export default function Home() {
  const quizFiles = getQuizFiles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              의료기기 CBT 시험
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              시험을 선택하여 시작하세요
            </p>
          </div>

          {/* Combined Quiz Button */}
          <div className="mb-8">
            <Link href="/quiz/combined/setup" className="block group">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-1">
                        전체 과목 종합 시험
                      </h2>
                      <p className="text-purple-100 text-sm sm:text-base">
                        여러 과목을 조합하여 시험보기
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-6 h-6 group-hover:translate-x-1 transition-transform"
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
                </div>
              </div>
            </Link>
          </div>

          {/* Quiz List */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {quizFiles.map((quiz, index) => (
              <Link
                key={quiz.filename}
                href={`/quiz/${encodeURIComponent(quiz.filename)}/setup`}
                className="block group"
              >
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-indigo-400">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-indigo-100 text-indigo-600 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-base sm:text-lg">
                      {index + 1}
                    </div>
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-indigo-600 transition-colors"
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
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {quiz.title}
                  </h2>
                  <p className="text-gray-500 text-sm">시험 설정하기</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 sm:mt-12 text-center">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-2xl mx-auto">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                시험 안내
              </h3>
              <ul className="text-gray-600 space-y-2 text-left text-sm sm:text-base">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 mt-1">•</span>
                  <span>
                    다양한 출제 방식을 선택할 수 있습니다 (전체, 랜덤, 난이도별)
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 mt-1">•</span>
                  <span>각 문제를 신중히 읽고 답변하세요</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 mt-1">•</span>
                  <span>정답 제출 후 해설을 확인할 수 있습니다</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2 mt-1">•</span>
                  <span>시험 종료 후 총점을 확인할 수 있습니다</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
