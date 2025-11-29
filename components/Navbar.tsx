'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import logo from '@/app/images/logo.jpg'
import { signOut } from '@/lib/auth-client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/sign-in')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navItems = [
    { href: '/students', label: 'Dashboard', icon: '📚' },
    { href: '/notices', label: 'Notices', icon: '📢' },
    { href: '/assignments', label: 'Assignments', icon: '📝' },
    { href: '/attendance', label: 'Attendance', icon: '📅' },
    { href: '/exams', label: 'Exams', icon: '📊' },
    { href: '/fees', label: 'Fees', icon: '💰' },
    { href: '/quiz', label: 'Quiz', icon: '❓' },
    { href: '/edulocker', label: 'EduLocker', icon: '🔒' },
    { href: '/chat', label: 'AI Mentor', icon: '🤖' },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentPage = navItems.find(item => item.href === pathname) || navItems[0]

  return (
    <nav className="sticky top-0 z-[100] bg-[rgba(10,10,20,0.8)] backdrop-blur-[20px] border-b border-[rgba(190,39,245,0.2)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3 cursor-pointer">
          <Image 
            src={logo} 
            alt="EduVerse Logo" 
            width={40} 
            height={40} 
            className="rounded-[10px] shadow-[0_4px_15px_rgba(190,39,245,0.4)] object-cover" 
          />
          <span className="text-xl font-bold bg-gradient-to-br from-[#BE27F5] to-[#A820D9] bg-clip-text text-transparent max-md:hidden">
            EduVerse
          </span>
        </div>

        <div className="relative flex-1 max-w-[300px] md:max-w-[300px]" ref={dropdownRef}>
          <button 
            className="flex items-center gap-3 px-5 py-3 rounded-[12px] bg-gradient-to-br from-[rgba(190,39,245,0.15)] to-[rgba(168,32,217,0.15)] border border-[rgba(190,39,245,0.3)] text-[var(--text)] font-semibold text-[0.95rem] cursor-pointer transition-all duration-300 w-full backdrop-blur-[10px] hover:bg-gradient-to-br hover:from-[rgba(190,39,245,0.25)] hover:to-[rgba(168,32,217,0.25)] hover:border-[var(--primary)] hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(190,39,245,0.3)] max-md:px-4 max-md:py-2.5 max-md:text-[0.85rem]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-[1.1rem]">{currentPage.icon}</span>
            <span>{currentPage.label}</span>
            <span className="ml-auto text-xs text-[var(--primary)]">{isDropdownOpen ? '▲' : '▼'}</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-[rgba(10,10,20,0.95)] backdrop-blur-[20px] border border-[rgba(190,39,245,0.3)] rounded-[12px] overflow-hidden z-[1000] shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-[slideDown_0.2s_ease]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-5 py-3.5 text-[var(--muted)] no-underline transition-all duration-200 font-medium text-[0.95rem] border-b border-[rgba(255,255,255,0.05)] last:border-b-0 hover:bg-[rgba(190,39,245,0.1)] hover:text-[var(--text)] hover:pl-6 max-md:px-4 max-md:py-3 max-md:text-[0.85rem] ${
                    pathname === item.href 
                      ? 'bg-gradient-to-br from-[rgba(190,39,245,0.2)] to-[rgba(168,32,217,0.2)] text-[var(--primary)] border-l-[3px] border-l-[var(--primary)]' 
                      : ''
                  }`}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span className="text-[1.1rem]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleSignOut} 
          className="px-6 py-3 rounded-[12px] border-2 border-[var(--primary)] bg-[rgba(190,39,245,0.1)] text-[var(--primary)] font-semibold cursor-pointer transition-all duration-300 backdrop-blur-[10px] text-[0.95rem] hover:bg-gradient-to-br hover:from-[#BE27F5] hover:to-[#A820D9] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(190,39,245,0.3)] max-md:px-4 max-md:py-2.5 max-md:text-[0.85rem]"
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
