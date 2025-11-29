import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// POST /api/student/quizzes/[id]/submit - Submit quiz answers
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: quizId } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const { answers } = body; // answers: { [questionId]: selectedAnswer }

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: "Invalid answers format" }, { status: 400 });
    }

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        attempts: {
          where: { userId },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if already attempted
    if (quiz.attempts.length > 0) {
      return NextResponse.json({ error: "Already attempted this quiz" }, { status: 400 });
    }

    // Verify enrollment
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId: quiz.courseId,
        studentId: userId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach(question => {
      const studentAnswer = answers[question.id];
      if (studentAnswer !== undefined && studentAnswer === question.correctAnswer) {
        score += question.marks;
      }
    });

    // Create attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        answers: JSON.stringify(answers),
        score,
        passed: score >= (quiz.passingMarks || 0),
      },
      include: {
        quiz: {
          include: {
            course: {
              select: {
                title: true,
                code: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      attempt,
      passed: score >= (quiz.passingMarks || 0),
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
