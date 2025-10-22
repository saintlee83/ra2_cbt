import { Quiz, QuizFile, Question } from "@/types/quiz";
import fs from "fs";
import path from "path";

export function getQuizFiles(): QuizFile[] {
  const quizDir = path.join(process.cwd(), "public", "quiz_sets");
  const files = fs.readdirSync(quizDir);

  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({
      filename: file,
      title: file.replace(".json", ""),
    }));
}

export function getQuizByFilename(filename: string): Quiz | null {
  try {
    const quizDir = path.join(process.cwd(), "public", "quiz_sets");
    const filePath = path.join(quizDir, filename);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error loading quiz:", error);
    return null;
  }
}

export function getAllQuizzes(): Quiz[] {
  const quizFiles = getQuizFiles();
  const quizzes: Quiz[] = [];

  for (const file of quizFiles) {
    const quiz = getQuizByFilename(file.filename);
    if (quiz) {
      quizzes.push(quiz);
    }
  }

  return quizzes;
}

export function getCombinedQuiz(filenames: string[]): Quiz | null {
  try {
    const combinedQuestions: Question[] = [];
    const titles: string[] = [];

    for (const filename of filenames) {
      const quiz = getQuizByFilename(filename);
      if (quiz) {
        combinedQuestions.push(...quiz.questions);
        titles.push(quiz.examTitle);
      }
    }

    if (combinedQuestions.length === 0) {
      return null;
    }

    return {
      examTitle: `종합 시험 (${titles.join(", ")})`,
      questions: combinedQuestions,
    };
  } catch (error) {
    console.error("Error combining quizzes:", error);
    return null;
  }
}
