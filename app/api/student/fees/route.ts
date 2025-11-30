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
    // Get all fee structures (apply to all students)
    const feeRecords = await prisma.feeStructure.findMany({
      orderBy: { dueDate: 'asc' }
    })

    // Get payment history
    const payments = await prisma.feePayment.findMany({
      where: { studentId: session.user.id },
      include: {
        fee: true
      },
      orderBy: { paidAt: 'desc' }
    })

    // Calculate totals
    const totalDue = feeRecords.reduce((sum, fee) => sum + fee.amount, 0)
    const totalPaid = payments
      .filter(p => p.status === 'completed')
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


