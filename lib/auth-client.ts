// @/lib/auth-client.ts
'use client'

import { createAuthClient } from 'better-auth/react'

// Extend the default types
declare module 'better-auth/react' {
  interface Session {
    user: {
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
  }
}

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
})