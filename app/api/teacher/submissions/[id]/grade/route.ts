import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionWithRole } from '@/lib/auth-utils'
import { headers } from 'next/headers'

// PUT - Grade a submission
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionWithRole(await headers())
    
    if (!session?.user || session.user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: true,
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.assignment.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { grade, feedback } = body

    if (grade === undefined || grade < 0 || grade > submission.assignment.maxMarks) {
      return NextResponse.json(
        { error: `Grade must be between 0 and ${submission.assignment.maxMarks}` },
        { status: 400 }
      )
    }

    const gradedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        grade,
        feedback,
        gradedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignment: {
          select: {
            title: true,
            maxMarks: true,
          },
        },
      },
    })

    return NextResponse.json({ submission: gradedSubmission })
  } catch (error) {
    console.error('Grade submission error:', error)
    return NextResponse.json({ error: 'Failed to grade submission' }, { status: 500 })
  }
}
