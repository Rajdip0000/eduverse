'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import logo from '../images/logo.jpg'
import { signOut } from '@/lib/auth-client'

function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isRequired, setIsRequired] = useState(false)

  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    const requiredParam = searchParams.get('required')
    if (emailFromUrl) {
      setEmail(emailFromUrl)
    }
    if (requiredParam === 'true') {
      setIsRequired(true)
    }
  }, [searchParams])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return // Only allow digits
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(pastedData)) return // Only accept 6 digits
    
    const newOtp = pastedData.split('')
    setOtp(newOtp)
    
    // Focus last input
    const lastInput = document.getElementById('otp-5')
    lastInput?.focus()
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join('')
    
    if (otpValue.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter complete OTP!' })
      return
    }

    setIsLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify email')
      }

      setMessage({ type: 'success', text: 'Email verified! Redirecting to dashboard...' })
      
      // Determine dashboard path based on role
      const role = data.role || 'student'
      const dashboardPath = role === 'teacher' 
        ? '/teacher/dashboard' 
        : role === 'institute' 
        ? '/institute/dashboard' 
        : '/students'
      
      // Reload the page to refresh the session, then redirect
      setTimeout(() => {
        window.location.href = dashboardPath
      }, 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to verify email' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email not found. Please sign up again.' })
      return
    }

    setIsResending(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      setMessage({ type: 'success', text: 'New verification code sent!' })
      setOtp(['', '', '', '', '', ''])
      
      // Focus first input
      const firstInput = document.getElementById('otp-0')
      firstInput?.focus()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to resend code' })
    } finally {
      setIsResending(false)
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
          <h2 className="text-2xl font-bold text-[var(--text)] m-0 mb-2 text-center">Verify Email</h2>
          <p className="text-sm text-[var(--muted)] m-0 mb-8 text-center">
            {isRequired && (
              <span className="block mb-2 text-orange-400 font-semibold">
                ⚠️ Email verification is required to access the platform
              </span>
            )}
            Enter the 6-digit code sent to<br />
            <span className="text-[var(--text)] font-semibold">{email}</span>
          </p>

          <form onSubmit={handleVerifyEmail} className="flex flex-col gap-5">
            <div className="flex gap-3 justify-center my-4" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-semibold rounded-[12px] border-2 border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] focus:scale-105"
                  required
                />
              ))}
            </div>

            <button type="submit" disabled={isLoading} className="w-full p-4 rounded-[12px] border-none bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(190,39,245,0.4)] hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):shadow-[0_12px_32px_rgba(190,39,245,0.6)] active:not(:disabled):translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button 
              type="button" 
              onClick={handleResendCode}
              disabled={isResending}
              className="w-full p-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-transparent text-[var(--text)] text-[0.9375rem] font-medium cursor-pointer transition-all duration-300 -mt-2 hover:bg-[rgba(255,255,255,0.05)] hover:border-[var(--primary)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </form>

          {!isRequired && (
            <p className="text-center mt-6 text-sm text-[var(--muted)]">
              <button onClick={() => router.push('/sign-up')} className="bg-none border-none text-[var(--primary)] font-semibold cursor-pointer p-0 transition-all duration-200 hover:text-[var(--accent)] hover:underline">
                ← Back to sign up
              </button>
            </p>
          )}

          {isRequired && (
            <p className="text-center mt-6 text-sm text-[var(--muted)]">
              Wrong email?{' '}
              <button onClick={handleSignOut} className="bg-none border-none text-[var(--primary)] font-semibold cursor-pointer p-0 transition-all duration-200 hover:text-[var(--accent)] hover:underline">
                Sign out
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Back to Home - Only show if not required */}
      {!isRequired && (
        <button onClick={() => router.push('/')} className="fixed top-8 left-8 py-3 px-6 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,36,0.6)] backdrop-blur-[20px] text-[var(--text)] font-medium cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] hover:-translate-x-1">
          ← Back to Home
        </button>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  )
}
