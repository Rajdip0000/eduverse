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
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    const where: any = { studentId: session.user.id }
    if (courseId) {
      where.courseId = courseId
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Calculate stats per course
    const courseStats = attendance.reduce((acc: any, record) => {
      const courseId = record.course.id
      if (!acc[courseId]) {
        acc[courseId] = {
          course: record.course,
          total: 0,
          present: 0,
          late: 0,
          absent: 0
        }
      }
      acc[courseId].total++
      if (record.status === 'present') acc[courseId].present++
      else if (record.status === 'late') acc[courseId].late++
      else if (record.status === 'absent') acc[courseId].absent++
      
      acc[courseId].percentage = Math.round(
        ((acc[courseId].present + acc[courseId].late * 0.5) / acc[courseId].total) * 100
      )
      
      return acc
    }, {})

    return NextResponse.json({
      attendance,
      courseStats: Object.values(courseStats)
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}


