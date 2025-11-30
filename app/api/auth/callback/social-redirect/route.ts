import { NextRequest, NextResponse } from 'next/server'
import { getSessionWithRole } from '@/lib/auth-utils'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await getSessionWithRole(await headers())

  if (!session?.user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Get the user and check/set role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // If user doesn't have a role, set it from signup context or default to student
  if (!user.role) {
    // In a real app, you'd get this from a state parameter in the OAuth flow
    // For now, default to student for social signups
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'student' },
    })
  }

  // Redirect based on role
  const role = user.role || 'student'
  const dashboardPath = role === 'teacher' 
    ? '/teacher/dashboard' 
    : role === 'institute' 
    ? '/institute/dashboard' 
    : '/students'

  return NextResponse.redirect(new URL(dashboardPath, request.url))
}


