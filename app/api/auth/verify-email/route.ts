import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Find verification record
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: email,
        value: otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Get user info before updating
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    })

    // Update user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    })

    // Delete used verification code
    await prisma.verification.delete({
      where: { id: verification.id },
    })

    return NextResponse.json({
      message: 'Email verified successfully',
      role: user?.role || 'student',
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
