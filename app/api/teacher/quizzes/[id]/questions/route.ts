import { NextRequest, NextResponse } from "next/server";
import { getSessionWithRole } from "@/lib/auth-utils";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// POST /api/teacher/quizzes/[id]/questions - Add question to quiz
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole(await headers());
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: quizId } = await params;
    const teacherId = session.user.id;
    const body = await req.json();
    const { question, options, correctAnswer, marks, explanation } = body;

    if (!question || !options || !correctAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify teacher owns the quiz
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, teacherId },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found or unauthorized" }, { status: 404 });
    }

    const newQuestion = await prisma.quizQuestion.create({
      data: {
        quizId,
        question,
        options,
        correctAnswer,
        marks: marks || 1,
        explanation,
      },
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
