import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Fetch students for a course
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

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

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: {
        student: {
          name: 'asc',
        },
      },
    })

    // Get submission statistics for each student
    const studentsWithStats = await Promise.all(
      enrollments.map(async (enrollment) => {
        const submissions = await prisma.submission.findMany({
          where: {
            studentId: enrollment.studentId,
            assignment: {
              courseId,
            },
          },
          select: {
            grade: true,
            assignment: {
              select: {
                maxMarks: true,
              },
            },
          },
        })

        const totalSubmissions = submissions.length
        const gradedSubmissions = submissions.filter((s) => s.grade !== null).length
        const averageGrade = gradedSubmissions > 0
          ? submissions
              .filter((s) => s.grade !== null)
              .reduce((sum, s) => sum + (s.grade! / s.assignment.maxMarks) * 100, 0) /
            gradedSubmissions
          : null

        const attendanceStats = await prisma.attendance.findMany({
          where: {
            courseId,
            studentId: enrollment.studentId,
          },
          select: {
            status: true,
          },
        })

        const totalClasses = attendanceStats.length
        const presentClasses = attendanceStats.filter((a) => a.status === 'present').length
        const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

        return {
          ...enrollment,
          stats: {
            totalSubmissions,
            gradedSubmissions,
            averageGrade: averageGrade ? Math.round(averageGrade) : null,
            attendancePercentage: Math.round(attendancePercentage),
            totalClasses,
            presentClasses,
          },
        }
      })
    )

    return NextResponse.json({ students: studentsWithStats })
  } catch (error) {
    console.error('Fetch students error:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}
