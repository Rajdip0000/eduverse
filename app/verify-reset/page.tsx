'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import logo from '../images/logo.jpg'

function VerifyResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setEmail(emailFromUrl)
    }
  }, [searchParams])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
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
    if (!/^\d{6}$/.test(pastedData)) return
    
    const newOtp = pastedData.split('')
    setOtp(newOtp)
    
    const lastInput = document.getElementById('otp-5')
    lastInput?.focus()
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpValue = otp.join('')
    
    if (otpValue.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter complete OTP!' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' })
      return
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters!' })
      return
    }

    setIsLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setMessage({ type: 'success', text: 'Password reset successful! Redirecting...' })
      setTimeout(() => router.push('/sign-in'), 2000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to reset password' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email not found. Please try again.' })
      return
    }

    setIsResending(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend code')
      }

      setMessage({ type: 'success', text: 'New reset code sent!' })
      setOtp(['', '', '', '', '', ''])
      
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
          <h2 className="text-2xl font-bold text-[var(--text)] m-0 mb-2 text-center">Reset Password</h2>
          <p className="text-sm text-[var(--muted)] m-0 mb-6 text-center">
            Enter the code sent to<br />
            <span className="text-[var(--text)] font-semibold">{email}</span>
          </p>

          <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
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

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-[var(--text)]">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full py-[0.875rem] px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-[var(--muted)] placeholder:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-[var(--text)]">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full py-[0.875rem] px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-[var(--muted)] placeholder:opacity-60"
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full p-4 rounded-[12px] border-none bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(190,39,245,0.4)] hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):shadow-[0_12px_32px_rgba(190,39,245,0.6)] active:not(:disabled):translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Resetting...' : 'Reset Password'}
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

          <p className="text-center mt-6 text-sm text-[var(--muted)]">
            <button onClick={() => router.push('/sign-in')} className="bg-none border-none text-[var(--primary)] font-semibold cursor-pointer p-0 transition-all duration-200 hover:text-[var(--accent)] hover:underline">
              ← Back to sign in
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

export default function VerifyResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyResetForm />
    </Suspense>
  )
}
