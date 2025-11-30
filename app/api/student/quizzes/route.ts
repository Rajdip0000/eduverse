import { NextRequest, NextResponse } from "next/server";
import { getSessionWithRole } from "@/lib/auth-utils";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET /api/student/quizzes - List available quizzes for student
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionWithRole(await headers());
    
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get student's enrolled courses
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: userId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map(e => e.courseId);

    const quizzes = await prisma.quiz.findMany({
      where: {
        courseId: { in: courseIds },
      },
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
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
        attempts: {
          where: { userId },
          orderBy: { attemptedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add status for each quiz
    const now = new Date();
    const quizzesWithStatus = quizzes.map(quiz => {
      let status = 'available';
      const hasAttempt = quiz.attempts.length > 0;
      
      if (quiz.startTime && now < quiz.startTime) {
        status = 'upcoming';
      } else if (quiz.endTime && now > quiz.endTime) {
        status = 'expired';
      } else if (hasAttempt) {
        status = 'completed';
      }

      return {
        ...quiz,
        status,
        yourAttempt: quiz.attempts[0] || null,
      };
    });

    return NextResponse.json(quizzesWithStatus);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

