'use client'

// @ts-ignore - better-auth has type export issues
import { createAuthClient } from 'better-auth/client'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000'
})

export const { signIn, signUp, signOut } = authClient

// Simple session hook that fetches session on mount
export function useSession() {
  const [session, setSession] = React.useState<any>(null)
  const [isPending, setIsPending] = React.useState(true)
  const [error, setError] = React.useState<any>(null)

  React.useEffect(() => {
    authClient.$fetch('/session/get')
      .then((res: any) => {
        setSession(res.data)
        setIsPending(false)
      })
      .catch((err: any) => {
        setError(err)
        setIsPending(false)
      })
  }, [])

  return { data: session, isPending, error }
}

import * as React from 'react'