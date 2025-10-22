export interface Question {
  id: number;
  difficulty: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  reference: string;
}

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
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers: {
    questionId: number;
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
  }[];
}

export type QuizMode = "all" | "random" | "difficulty" | "custom";

export interface QuizSettings {
  mode: QuizMode;
  questionCount?: number; // 랜덤 모드나 제한할 때
  difficulty?: "상" | "중" | "하"; // 난이도별 필터
  shuffleQuestions?: boolean; // 문제 순서 섞기
  shuffleOptions?: boolean; // 선택지 순서 섞기
}
