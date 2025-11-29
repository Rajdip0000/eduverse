import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET /api/student/quizzes/[id] - Get quiz details for taking quiz
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            marks: true,
            // Don't send correctAnswer to students
          },
          orderBy: { createdAt: 'asc' },
        },
        attempts: {
          where: { userId },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Verify student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId: quiz.courseId,
        studentId: userId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
    }

    // Check if student already attempted
    if (quiz.attempts.length > 0) {
      return NextResponse.json({ error: "Already attempted this quiz" }, { status: 400 });
    }

    // Check time constraints
    const now = new Date();
    if (quiz.startTime && now < quiz.startTime) {
      return NextResponse.json({ error: "Quiz not started yet" }, { status: 400 });
    }
    if (quiz.endTime && now > quiz.endTime) {
      return NextResponse.json({ error: "Quiz has ended" }, { status: 400 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
