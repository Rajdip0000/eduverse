import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET /api/student/quizzes/[id]/result - Get quiz result
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: quizId } = await params;
    const studentId = session.user.id;

    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        studentId,
      },
      include: {
        quiz: {
          include: {
            course: {
              select: {
                name: true,
                code: true,
              },
            },
            questions: {
              select: {
                id: true,
                text: true,
                options: true,
                correctAnswer: true,
                marks: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "No attempt found" }, { status: 404 });
    }

    // Build detailed results
    const questionResults = attempt.quiz.questions.map(question => {
      const studentAnswer = (attempt.answers as any)[question.id];
      const isCorrect = studentAnswer === question.correctAnswer;
      
      return {
        questionId: question.id,
        text: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer,
        studentAnswer,
        isCorrect,
        marksAwarded: isCorrect ? question.marks : 0,
        totalMarks: question.marks,
      };
    });

    return NextResponse.json({
      attempt,
      quiz: attempt.quiz,
      questionResults,
      passed: attempt.score >= (attempt.quiz.passingMarks || 0),
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 });
  }
}
