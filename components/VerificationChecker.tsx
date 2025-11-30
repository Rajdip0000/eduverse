'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAtom } from 'jotai'
import { sessionAtom } from '@/lib/auth-client'

export default function VerificationChecker() {
  const [{ data: session, isPending }] = useAtom(sessionAtom)
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Don't check if we're already on the verification page
    if (pathname === '/verify-email') {
      return
    }

    if (!isPending && session?.user && !hasRedirected.current) {
      // Check if email is verified
      if (!session.user.emailVerified) {
        hasRedirected.current = true
        const verifyUrl = `/verify-email?email=${encodeURIComponent(session.user.email)}&required=true`
        router.push(verifyUrl)
      }
    }
  }, [session, isPending, router, pathname])

  return null // This component doesn't render anything
}
