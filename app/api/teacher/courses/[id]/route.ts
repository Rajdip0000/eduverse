import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Fetch single course details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        department: true,
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        assignments: {
          orderBy: { dueDate: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
            attendances: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Fetch course error:', error)
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

// PUT - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const course = await prisma.course.findUnique({
      where: { id },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, code, description, credits, departmentId } = body

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        credits,
        semester,
        isActive,
        departmentId,
      },
      include: {
        department: true,
      },
    })

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    console.error('Update course error:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}

// DELETE - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const course = await prisma.course.findUnique({
      where: { id },
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.course.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Delete course error:', error)
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 })
  }
}
