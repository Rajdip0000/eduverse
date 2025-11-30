// @ts-ignore - better-auth has type export issues
import { createAuthClient } from 'better-auth/client'
// @ts-ignore
import { useStore } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000'
})

export const { signIn, signUp, signOut } = authClient
export const useSession = () => useStore(authClient.$store)