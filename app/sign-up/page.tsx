'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import logo from '../images/logo.jpg'
import { signUp, signIn } from '@/lib/auth-client'

export const dynamic = 'force-dynamic'

type Role = 'student' | 'teacher' | 'institute'

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState<Role>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [subject, setSubject] = useState('')
  const [designation, setDesignation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const roleParam = searchParams.get('role') as Role
    if (roleParam && ['student', 'teacher', 'institute'].includes(roleParam)) {
      setRole(roleParam)
    } else {
      router.push('/select-role')
    }
  }, [searchParams, router])

  const roleConfig = {
    student: { icon: '🎓', title: 'Student', color: '#BE27F5' },
    teacher: { icon: '👨‍🏫', title: 'Teacher', color: '#10b981' },
    institute: { icon: '🏫', title: 'Institute', color: '#f59e0b' }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' })
      return
    }
    setIsLoading(true)
    setMessage(null)
    
    const userData: any = {
      name,
      email,
      password,
      role,
    }

    if (role === 'institute') {
      userData.organization = organization
      userData.designation = designation
    } else if (role === 'teacher') {
      userData.subject = subject
      userData.designation = designation
    }

    const res = await signUp.email(userData)

    setIsLoading(false)

    if (res.error) {
      setMessage({ type: 'error', text: res.error.message || 'Something went wrong.' })
    } else {
      try {
        const verifyRes = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        
        if (verifyRes.ok) {
          setMessage({ type: 'success', text: 'Account created! Redirecting to verify email...' })
          setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(email)}`), 1500)
        } else {
          setMessage({ type: 'success', text: 'Account created successfully!' })
          setTimeout(() => router.push('/sign-in'), 1500)
        }
      } catch (error) {
        setMessage({ type: 'success', text: 'Account created successfully!' })
        setTimeout(() => router.push('/sign-in'), 1500)
      }
    }
  }

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setMessage({ type: 'success', text: `Redirecting to ${provider}...` })
    await signIn.social({ provider })
  }

  const config = roleConfig[role]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <div className="w-full max-w-[540px] bg-[rgba(15,23,36,0.6)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.1)] rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-[slideUp_0.5s_ease-out]">
        {/* Logo & Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(190,39,245,0.3)]">
            <Image src={logo} alt="EduVerse Logo" width={56} height={56} style={{ borderRadius: '12px' }} />
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">{config.icon}</span>
            <h1 className="text-[1.75rem] font-bold m-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
              {config.title} Sign Up
            </h1>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">EduVerse LearnSphere</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-3.5 px-4 rounded-xl mb-4 text-sm font-medium animate-[fadeIn_0.3s_ease] ${
            message.type === 'success' 
              ? 'bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[#10b981]'
              : 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444]'
          }`}>
            {message.text}
          </div>
        )}

        <div className="animate-[fadeIn_0.4s_ease]">
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-semibold text-[var(--text)]">
                {role === 'institute' ? 'Institute Name' : 'Full Name'}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'institute' ? 'ABC Institute' : 'John Doe'}
                required
                className="w-full py-3 px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-[var(--muted)] placeholder:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-[var(--text)]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full py-3 px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-[var(--muted)] placeholder:opacity-60"
              />
            </div>

            {role === 'teacher' && (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="text-sm font-semibold text-[var(--text)]">Subject/Specialization</label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Mathematics, Physics, etc."
                    className="w-full py-3 px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-[var(--muted)] placeholder:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="designation" className="text-sm font-semibold text-[var(--text)]">Designation</label>
                  <input
                    id="designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Professor, Lecturer, etc."
                    className="w-full py-3 px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-[var(--muted)] placeholder:opacity-60"
                  />
                </div>
              </>
            )}

            {role === 'institute' && (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="organization" className="text-sm font-semibold text-[var(--text)]">Organization Type</label>
                  <select
                    id="organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full py-3 px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] cursor-pointer"
                  >
                    <option value="">Select type</option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="Training Center">Training Center</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="designation" className="text-sm font-semibold text-[var(--text)]">Your Role</label>
                  <input
                    id="designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Principal, Director, Admin, etc."
                    className="w-full py-3 px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-[var(--muted)] placeholder:opacity-60"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-[var(--text)]">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full py-3 px-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-(--text) text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-(--primary) focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-(--muted) placeholder:opacity-60"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-[var(--text)]">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full py-3 px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-[0.9375rem] transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)] placeholder:text-[var(--muted)] placeholder:opacity-60"
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full p-4 rounded-[12px] border-none bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(190,39,245,0.4)] hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):shadow-[0_12px_32px_rgba(190,39,245,0.6)] active:not(:disabled):translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="relative text-center my-5">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[rgba(255,255,255,0.1)]"></div>
            <span className="relative inline-block px-4 bg-[rgba(15,23,36,0.6)] text-[var(--muted)] text-sm">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleSocialAuth('google')} className="flex items-center justify-center gap-2 py-3 px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[var(--text)] text-[0.9375rem] font-medium cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] hover:-translate-y-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button onClick={() => handleSocialAuth('github')} className="flex items-center justify-center gap-2 py-3 px-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-[var(--text)] text-[0.9375rem] font-medium cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] hover:-translate-y-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <p className="text-center mt-5 text-sm text-[var(--muted)]">
            Already have an account?{' '}
            <button onClick={() => router.push('/sign-in')} className="bg-none border-none text-[var(--primary)] font-semibold cursor-pointer p-0 transition-all duration-200 hover:text-[var(--accent)] hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Back */}
      <button onClick={() => router.push('/select-role')} className="fixed top-8 left-8 py-3 px-6 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,36,0.6)] backdrop-blur-[20px] text-[var(--text)] font-medium cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] hover:-translate-x-1">
        ← Change Role
      </button>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}