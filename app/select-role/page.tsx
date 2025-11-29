'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import logo from '../images/logo.jpg'

type Role = 'student' | 'teacher' | 'institute'

export default function SelectRolePage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const roles = [
    {
      id: 'student' as Role,
      title: 'Student',
      icon: '🎓',
      description: 'Access courses, assignments, quizzes, and track your learning progress',
      features: ['Interactive Courses', 'Assignments & Quizzes', 'Progress Tracking', 'AI Mentor'],
      color: '#BE27F5'
    },
    {
      id: 'teacher' as Role,
      title: 'Teacher',
      icon: '👨‍🏫',
      description: 'Create and manage courses, assignments, track student progress',
      features: ['Course Creation', 'Student Management', 'Grade Assignments', 'Analytics Dashboard'],
      color: '#10b981'
    },
    {
      id: 'institute' as Role,
      title: 'Institute',
      icon: '🏫',
      description: 'Manage your educational institution, teachers, and students',
      features: ['Multi-User Management', 'Institutional Analytics', 'Course Oversight', 'Resource Management'],
      color: '#f59e0b'
    }
  ]

  const handleContinue = () => {
    if (selectedRole) {
      router.push(`/sign-up?role=${selectedRole}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <div className="w-full max-w-[900px]">
        {/* Logo & Brand */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(190,39,245,0.3)]">
            <Image src={logo} alt="EduVerse Logo" width={64} height={64} style={{ borderRadius: '12px' }} />
          </div>
          <h1 className="text-4xl font-bold m-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent mb-3">
            Welcome to EduVerse
          </h1>
          <p className="text-lg text-[var(--muted)]">Choose your role to get started</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`text-left p-6 rounded-[20px] border-2 transition-all duration-300 cursor-pointer bg-[rgba(15,23,36,0.4)] backdrop-blur-[12px] hover:scale-105 ${
                selectedRole === role.id
                  ? 'border-[var(--primary)] shadow-[0_8px_32px_rgba(190,39,245,0.4)]'
                  : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]'
              }`}
            >
              <div
                className="w-16 h-16 rounded-[12px] flex items-center justify-center text-4xl mb-4 shadow-lg"
                style={{ backgroundColor: `${role.color}30` }}
              >
                {role.icon}
              </div>
              <h3 className="text-2xl font-bold text-[var(--text)] mb-2">{role.title}</h3>
              <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">
                {role.description}
              </p>
              <div className="space-y-2">
                {role.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <span style={{ color: role.color }}>✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {selectedRole === role.id && (
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <span className="text-sm font-semibold" style={{ color: role.color }}>
                    Selected ✓
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="px-8 py-4 rounded-[12px] border-none bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white text-base font-semibold cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(190,39,245,0.4)] hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):shadow-[0_12px_32px_rgba(190,39,245,0.6)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to Sign Up →
          </button>
          <p className="text-center mt-4 text-sm text-[var(--muted)]">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/sign-in')}
              className="bg-none border-none text-[var(--primary)] font-semibold cursor-pointer p-0 transition-all duration-200 hover:text-[var(--accent)] hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>

      {/* Back to Home */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-8 left-8 py-3 px-6 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,36,0.6)] backdrop-blur-[20px] text-[var(--text)] font-medium cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[var(--primary)] hover:-translate-x-1"
      >
        ← Back to Home
      </button>
    </div>
  )
}
