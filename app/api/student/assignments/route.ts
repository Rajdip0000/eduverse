import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('courseId')

    const where: any = {
      course: {
        enrollments: {
          some: { studentId: session.user.id }
        }
      }
    }

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
            teacher: { select: { name: true } }
          }
        },
        submissions: {
          where: { studentId: session.user.id },
          select: {
            id: true,
            submittedAt: true,
            grade: true,
            feedback: true,
            fileUrl: true
          }
        }
      },
      orderBy: { dueDate: 'desc' }
    })

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}


