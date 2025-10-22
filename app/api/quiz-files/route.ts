import { NextResponse } from "next/server";
import { getQuizFiles } from "@/lib/quiz-loader";

export async function GET() {
  try {
    const files = getQuizFiles();
    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching quiz files:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz files" },
      { status: 500 }
    );
  }
}
