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
    const targetRole = searchParams.get('targetRole')

    // Get notices based on role and active status
    const where: any = {
      isActive: true,
      OR: [
        { targetRole: null }, // Notices for all
        { targetRole: session.user.role }
      ]
    }

    if (targetRole) {
      where.targetRole = targetRole
    }

    const notices = await prisma.notice.findMany({
      where,
      orderBy: { createdAt: 'desc' }
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
