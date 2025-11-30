import { NextRequest, NextResponse } from 'next/server'
import { getSessionWithRole } from '@/lib/auth-utils'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSessionWithRole(await headers())

  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get student's enrolled courses
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          include: {
            teacher: { select: { name: true, email: true } },
            _count: { select: { assignments: true } }
          }
        }
      }
    })

    // Get pending assignments
    const pendingAssignments = await prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: { studentId: session.user.id }
          }
        },
        dueDate: { gte: new Date() },
        submissions: {
          none: { studentId: session.user.id }
        }
      },
      include: {
        course: { select: { title: true, code: true } }
      },
      orderBy: { dueDate: 'asc' },
      take: 5
    })

    // Get recent submissions
    const recentSubmissions = await prisma.submission.findMany({
      where: { studentId: session.user.id },
      include: {
        assignment: {
          include: {
            course: { select: { title: true, code: true } }
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: 5
    })

    // Get attendance stats
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: session.user.id }
    })

    const presentCount = attendanceRecords.filter(r => r.status === 'present').length
    const lateCount = attendanceRecords.filter(r => r.status === 'late').length
    const attendancePercentage = attendanceRecords.length > 0
      ? Math.round(((presentCount + lateCount * 0.5) / attendanceRecords.length) * 100)
      : 0

    // Get grades stats
    const gradedSubmissions = recentSubmissions.filter(s => s.grade !== null)
    const averageGrade = gradedSubmissions.length > 0
      ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length)
      : null

    const stats = {
      enrolledCourses: enrollments.length,
      pendingAssignments: pendingAssignments.length,
      attendancePercentage,
      averageGrade,
      totalSubmissions: recentSubmissions.length,
      gradedSubmissions: gradedSubmissions.length
    }

    return NextResponse.json({
      stats,
      enrollments,
      pendingAssignments,
      recentSubmissions
    })
  } catch (error) {
    console.error('Error fetching student dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}


