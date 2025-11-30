// @/lib/auth-client.ts
'use client'
// @ts-ignore - better-auth has type export issues
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000'
})

export const { signIn, signUp, signOut, useSession } = authClient