// Base question interface
export interface BaseQuestion {
  id: number;
  difficulty: string;
  question: string;
  explanation: string;
  reference: string;
}

// Multiple choice question
export interface MultipleChoiceQuestion extends BaseQuestion {
  type?: "multiple_choice";
  options: string[];
  correctAnswer: number;
}

// Short answer question
export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short_answer";
  correctAnswer: Record<string, string>; // e.g., { "ㄱ": "개발 경위", "ㄴ": "취급자 안전" }
}

export type Question = MultipleChoiceQuestion | ShortAnswerQuestion;

export interface Quiz {
  examTitle: string;
  questions: Question[];
}

export interface QuizFile {
  filename: string;
  title: string;
}

export interface UserAnswer {
  questionId: number;
  selectedAnswer: number | null;
  textAnswer?: Record<string, string>; // For short answer questions
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers: {
    questionId: number;
    selectedAnswer: number | null;
    textAnswer?: Record<string, string>;
    correctAnswer: number | Record<string, string>;
    isCorrect: boolean;
  }[];
}

export type QuizMode = "all" | "random" | "difficulty" | "custom" | "range";

export interface QuestionRange {
  start: number;
  end: number;
}

export interface QuizSettings {
  mode: QuizMode;
  questionCount?: number; // 랜덤 모드나 제한할 때
  difficulty?: "상" | "중" | "하"; // 난이도별 필터
  questionRanges?: QuestionRange[]; // 문제 범위 (예: 1-10, 20-30)
  shuffleQuestions?: boolean; // 문제 순서 섞기
  shuffleOptions?: boolean; // 선택지 순서 섞기
}
