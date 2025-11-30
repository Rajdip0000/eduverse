import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Fetch attendance records
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const date = searchParams.get('date')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Verify teacher owns the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course || course.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const where: any = { courseId }
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where,
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
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ records: attendanceRecords })
  } catch (error) {
    console.error('Fetch attendance error:', error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

// POST - Mark attendance
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithRole(await headers())
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { courseId, studentId, status, date, remarks } = body

    if (!courseId || !studentId || !status) {
      return NextResponse.json(
        { error: 'Course ID, student ID, and status are required' },
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

    const attendanceDate = date ? new Date(date) : new Date()
    attendanceDate.setHours(0, 0, 0, 0)

    const attendance = await prisma.attendance.upsert({
      where: {
        courseId_studentId_date: {
          courseId,
          studentId,
          date: attendanceDate,
        },
      },
      update: {
        status,
        remarks,
      },
      create: {
        courseId,
        studentId,
        status,
        date: attendanceDate,
        remarks,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('Mark attendance error:', error)
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 })
  }
}


