'use client'

// @ts-ignore - better-auth has type export issues
import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000'
})

export const { signIn, signUp, signOut } = authClient

// Export the session atom for use with Jotai
export const sessionAtom = authClient.$sessionSignal