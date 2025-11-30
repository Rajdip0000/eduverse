'use client'

import { useSession } from '@/lib/auth-client'
import { useEffect } from 'react'

export default function SessionDebug() {
  const { data: session, isPending } = useSession()

  useEffect(() => {
    // Log session data
    console.log('Session Debug:', {
      session,
      isPending,
      cookies: document.cookie,
      userRole: session?.user?.role
    })
  }, [session, isPending])

  if (isPending) {
    return <div>Loading session...</div>
  }

  return (
    <div className="p-4 bg-gray-100 text-black rounded">
      <h3>Session Debug Info:</h3>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <p><strong>Cookies:</strong> {document.cookie}</p>
    </div>
  )
}