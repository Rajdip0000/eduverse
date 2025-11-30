import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// PUT /api/teacher/questions/[id] - Update question
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const teacherId = session.user.id;
    const body = await req.json();
    const { question, options, correctAnswer, marks } = body;

    // Verify teacher owns the quiz containing this question
    const existingQuestion = await prisma.quizQuestion.findUnique({
      where: { id },
      include: {
        quiz: {
          select: { teacherId: true },
        },
      },
    });

    if (!existingQuestion || existingQuestion.quiz.teacherId !== teacherId) {
      return NextResponse.json({ error: "Question not found or unauthorized" }, { status: 404 });
    }

    const updated = await prisma.quizQuestion.update({
      where: { id },
      data: {
        question,
        options,
        correctAnswer,
        marks,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

// DELETE /api/teacher/questions/[id] - Delete question
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const teacherId = session.user.id;

    // Verify teacher owns the quiz containing this question
    const question = await prisma.quizQuestion.findUnique({
      where: { id },
      include: {
        quiz: {
          select: { teacherId: true },
        },
      },
    });

    if (!question || question.quiz.teacherId !== teacherId) {
      return NextResponse.json({ error: "Question not found or unauthorized" }, { status: 404 });
    }

    await prisma.quizQuestion.delete({ where: { id } });

    return NextResponse.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
