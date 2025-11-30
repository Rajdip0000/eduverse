import { auth } from '@/lib/auth'
import type { Session } from 'better-auth/types'

export interface SessionUser {
  id: string
  email: string
  name: string
  image?: string | null
  role: string
  phoneNumber?: string | null
  dateOfBirth?: Date | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SessionWithRole {
  session: {
    userId: string
    expiresAt: Date
    token: string
    ipAddress?: string
    userAgent?: string
  }
  user: SessionUser
}

export async function getSessionWithRole(headers: Headers): Promise<SessionWithRole | null> {
  const session = await auth.api.getSession({ headers })
  return session as SessionWithRole | null
}
