import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Fetch all assignments for a teacher
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const where: any = { teacherId: session.user.id }
    if (courseId) {
      where.courseId = courseId
    }

    const assignments = await prisma.assignment.findMany({
      where,
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
            submissions: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('Fetch assignments error:', error)
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
}

// POST - Create a new assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole(await headers())
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, courseId, dueDate, maxMarks } = body

    if (!title || !courseId || !dueDate) {
      return NextResponse.json(
        { error: 'Title, course, and due date are required' },
        { status: 400 }
      )
    }

    // Verify teacher owns the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        courseId,
        teacherId: session.user.id,
        dueDate: new Date(dueDate),
        maxMarks: maxMarks || 100,
      },
      include: {
        course: {
          select: {
            title: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    console.error('Create assignment error:', error)
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
  }
}


