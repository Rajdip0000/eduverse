import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Fetch teacher dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get active courses count
    const activeCourses = await prisma.course.count({
      where: {
        teacherId: session.user.id,
        isActive: true,
      },
    })

    // Get total students across all courses
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        course: {
          teacherId: session.user.id,
        },
      },
      distinct: ['studentId'],
    })
    const totalStudents = enrollments.length

    // Get pending assignments (ungraded submissions)
    const pendingSubmissions = await prisma.submission.count({
      where: {
        assignment: {
          teacherId: session.user.id,
        },
        grade: null,
      },
    })

    // Get today's classes (courses with attendance marked today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaysClasses = await prisma.attendance.findMany({
      where: {
        course: {
          teacherId: session.user.id,
        },
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        courseId: true,
      },
      distinct: ['courseId'],
    })

    // Get recent assignments
    const recentAssignments = await prisma.assignment.findMany({
      where: {
        teacherId: session.user.id,
      },
      include: {
        course: {
          select: {
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    // Get recent submissions
    const recentSubmissions = await prisma.submission.findMany({
      where: {
        assignment: {
          teacherId: session.user.id,
        },
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
        assignment: {
          select: {
            title: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      take: 10,
    })

    return NextResponse.json({
      stats: {
        activeCourses,
        totalStudents,
        pendingSubmissions,
        todaysClasses: todaysClasses.length,
      },
      recentAssignments,
      recentSubmissions,
    })
  } catch (error) {
    console.error('Fetch dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}


