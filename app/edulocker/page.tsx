'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAtom } from 'jotai'
import { sessionAtom } from '@/lib/auth-client'

export default function EduLockerPage() {
  const [{ data: session, isPending }] = useAtom(sessionAtom)
  const router = useRouter()

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push('/sign-in')
      } else if (session.user.role === 'student') {
        router.push('/student/digilocker')
      } else {
        router.push('/students')
      }
    }
  }, [session, isPending, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[var(--muted)]">Redirecting to DigiLocker...</p>
      </div>
    </div>
  )
}
