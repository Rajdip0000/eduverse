import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// GET /api/teacher/quizzes - List all quizzes created by teacher
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionWithRole(await headers());
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;

    const quizzes = await prisma.quiz.findMany({
      where: { teacherId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

// POST /api/teacher/quizzes - Create a new quiz
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionWithRole(await headers());
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;
    const body = await req.json();
    const { title, description, courseId, duration, totalMarks, passingMarks, startTime, endTime } = body;

    if (!title || !courseId || !duration || !totalMarks) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify teacher owns the course
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found or unauthorized" }, { status: 404 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        courseId,
        teacherId,
        duration,
        totalMarks,
        passingMarks: passingMarks || 0,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}

