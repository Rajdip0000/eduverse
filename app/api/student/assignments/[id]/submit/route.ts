import { NextRequest, NextResponse } from 'next/server'
import { getSessionWithRole } from '@/lib/auth-utils'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionWithRole(await headers())

  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { fileUrl, content } = body

    // Verify assignment exists and student is enrolled
    const assignment = await prisma.assignment.findFirst({
      where: {
        id,
        course: {
          enrollments: {
            some: { studentId: session.user.id }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or you are not enrolled in this course' },
        { status: 404 }
      )
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: id,
        studentId: session.user.id
      }
    })

    if (existingSubmission) {
      // Update existing submission
      const submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileUrl: fileUrl || existingSubmission.fileUrl,
          content: content || existingSubmission.content,
          submittedAt: new Date()
        }
      })

      return NextResponse.json({ submission })
    } else {
      // Create new submission
      const submission = await prisma.submission.create({
        data: {
          assignmentId: id,
          studentId: session.user.id,
          fileUrl,
          content,
          submittedAt: new Date()
        }
      })

      return NextResponse.json({ submission })
    }
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json(
      { error: 'Failed to submit assignment' },
      { status: 500 }
    )
  }
}
