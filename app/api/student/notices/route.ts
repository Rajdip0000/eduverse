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

    // Get notices for student's enrolled courses
    const where: any = {
      OR: [
        { publishToAll: true },
        {
          course: {
            enrollments: {
              some: { studentId: session.user.id }
            }
          }
        }
      ]
    }

    if (courseId) {
      where.courseId = courseId
    }

    const notices = await prisma.notice.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        },
        author: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json({ notices })
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    )
  }
}
