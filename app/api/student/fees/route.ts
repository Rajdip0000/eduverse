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
    // Get fee structures for student's enrolled courses
    const feeRecords = await prisma.feeStructure.findMany({
      where: {
        OR: [
          { applicableToAll: true },
          {
            course: {
              enrollments: {
                some: { studentId: session.user.id }
              }
            }
          }
        ]
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true
          }
        }
      }
    })

    // Get payment history
    const payments = await prisma.feePayment.findMany({
      where: { studentId: session.user.id },
      include: {
        feeStructure: {
          include: {
            course: {
              select: {
                title: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    })

    // Calculate totals
    const totalDue = feeRecords.reduce((sum, fee) => sum + fee.amount, 0)
    const totalPaid = payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      feeRecords,
      payments,
      totalDue,
      totalPaid,
      balance: totalDue - totalPaid
    })
  } catch (error) {
    console.error('Error fetching fees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fees' },
      { status: 500 }
    )
  }
}
