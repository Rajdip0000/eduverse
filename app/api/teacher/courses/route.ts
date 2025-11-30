import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Fetch all courses for a teacher
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
      where: { teacherId: session.user.id },
      include: {
        department: true,
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Fetch courses error:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

// POST - Create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, code, credits, semester, departmentId } = body

    if (!title || !code) {
      return NextResponse.json(
        { error: 'Title and code are required' },
        { status: 400 }
      )
    }

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code },
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course code already exists' },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        code,
        credits: credits || 3,
        semester,
        teacherId: session.user.id,
        departmentId,
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error('Create course error:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}


