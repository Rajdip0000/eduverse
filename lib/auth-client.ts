'use client'

// @ts-ignore - better-auth has type export issues
import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000'
})

export const { signIn, signUp, signOut } = authClient

// Export the useSession hook from Better Auth client
export const useSession = authClient.useSession