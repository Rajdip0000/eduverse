'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from '../images/logo.jpg'

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setMessage({ type: 'success', text: 'Reset code sent! Redirecting...' })
      setTimeout(() => {
        router.push(`/verify-reset?email=${encodeURIComponent(email)}`)
      }, 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send reset email' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <div className="w-full max-w-[460px] bg-[rgba(15,23,36,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-[24px] p-12 px-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[slideUp_0.5s_ease-out]">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-[12px] overflow-hidden shadow-[0_8px_24px_rgba(190,39,245,0.3)]">
            <Image src={logo} alt="EduVerse Logo" width={56} height={56} style={{ borderRadius: '12px' }} />
          </div>
          <h1 className="text-[1.75rem] font-bold m-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">EduVerse</h1>
          <p className="text-sm text-[var(--muted)] mt-1 m-0">LearnSphere</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-[0.875rem] px-4 rounded-[12px] mb-6 text-sm font-medium animate-[fadeIn_0.3s_ease] ${
            message.type === 'success' 
              ? 'bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[#10b981]'
              : 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444]'
          }`}>
            {message.text}
          </div>
        )}

        <div className="animate-[fadeIn_0.4s_ease]">
          <h2 className="text-2xl font-bold text-[var(--text)] m-0 mb-2 text-center">Reset Password</h2>
          <p className="text-sm text-[var(--muted)] m-0 mb-8 text-center">Enter your email to receive a reset link</p>

          <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-[var(--text)]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full py-[0.875rem] px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-[var(--muted)] placeholder:opacity-60"
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full p-4 rounded-[12px] border-none bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(190,39,245,0.4)] hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):shadow-[0_12px_32px_rgba(190,39,245,0.6)] active:not(:disabled):translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[var(--muted)]">
            Remember your password?{' '}
            <button onClick={() => router.push('/sign-in')} className="bg-none border-none text-[var(--primary)] font-semibold cursor-pointer p-0 transition-all duration-200 hover:text-[var(--accent)] hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Back to Home */}
      <button onClick={() => router.push('/')} className="fixed top-8 left-8 py-3 px-6 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,36,0.6)] backdrop-blur-[20px] text-[var(--text)] font-medium cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] hover:-translate-x-1">
        ← Back to Home
      </button>
    </div>
  )
}
