'use client'

import { useSession } from '@/lib/auth-client'
import { useEffect, useState } from 'react'

export default function SessionDebug() {
  const { data: session, isPending } = useSession()
  const [cookieInfo, setCookieInfo] = useState('')

  useEffect(() => {
    // Get all cookies and check for Better Auth specific ones
    const allCookies = document.cookie
    const cookiesArray = allCookies ? allCookies.split('; ') : []
    const betterAuthCookies = cookiesArray.filter(cookie => 
      cookie.includes('better-auth') || cookie.includes('session')
    )
    
    setCookieInfo(JSON.stringify({
      allCookies: allCookies || 'No cookies found',
      betterAuthCookies: betterAuthCookies,
      totalCookies: cookiesArray.length
    }, null, 2))

    // Log session data
    console.log('Session Debug:', {
      session,
      isPending,
      allCookies,
      betterAuthCookies,
      userRole: session?.user?.role,
      sessionExists: !!session,
      userId: session?.user?.id
    })
  }, [session, isPending])

  if (isPending) {
    return <div className="p-4 bg-yellow-100 text-black">Loading session...</div>
  }

  return (
    <div className="p-4 bg-gray-100 text-black rounded mb-4">
      <h3 className="font-bold mb-2">🔍 Session Debug Info:</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Session Status:</h4>
        <p>Authenticated: {session ? '✅ Yes' : '❌ No'}</p>
        {session && (
          <>
            <p>User Role: <strong>{session.user?.role}</strong></p>
            <p>User ID: {session.user?.id}</p>
            <p>Email: {session.user?.email}</p>
          </>
        )}
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Cookie Information:</h4>
        <pre className="text-xs bg-white p-2 rounded">{cookieInfo}</pre>
      </div>

      <div>
        <h4 className="font-semibold">Full Session Data:</h4>
        <pre className="text-xs bg-white p-2 rounded max-h-40 overflow-y-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}