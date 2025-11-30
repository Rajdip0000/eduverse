'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import logo from './images/logo.jpg'
import { useAtom } from 'jotai'
import { sessionAtom, signOut } from '@/lib/auth-client'

export default function Home() {
  const router = useRouter()

  const [{ data, isPending }] = useAtom(sessionAtom)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/sign-in')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  console.log(data?.user)

  return (
    <div className="w-screen pt-6 mx-auto px-6 min-h-screen flex flex-col">
      <header className="flex items-center justify-between mb-7 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] flex items-center justify-center shadow-[0_10px_30px_rgba(2,6,23,0.6)] overflow-hidden">
            <Image src={logo} alt="EduVerse Logo" width={44} height={44} style={{ borderRadius: '10px' }} />
          </div>
          <div className='cursor-pointer' onClick={() => router.push('/')}>
            <div className="font-bold text-[var(--text)]">EduVerse</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">LearnSphere</div>
          </div>
        </div>
        <nav className="flex items-center gap-[18px]">
          <a href="#features" className="no-underline text-[var(--muted)] font-semibold hover:text-[var(--text)] transition-colors">Features</a>
          <a href="#pricing" className="no-underline text-[var(--muted)] font-semibold hover:text-[var(--text)] transition-colors">Pricing</a>
          {!data&&!isPending&&<a onClick={() => router.push('/select-role')} className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-3.5 py-2 rounded-[10px] font-semibold cursor-pointer hover:opacity-90 transition-opacity cursor-pointer">Login</a>}
          {data&&!isPending&&<a onClick={handleSignOut} className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-3.5 py-2 rounded-[10px] font-semibold cursor-pointer hover:opacity-90 transition-opacity cursor-pointer">Sign out</a>}
        </nav>
      </header>

      <main className="w-[75vw] mx-auto">
        <section className="grid grid-cols-1 gap-5 items-center justify-items-center bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] px-7 py-7 rounded-[14px] shadow-[0_10px_30px_rgba(2,6,23,0.6)] backdrop-blur-[6px] h-full content-center">
          <div className="px-2 text-center max-w-full">
            <h1 className="text-[28px] md:text-4xl m-0 mb-2.5 leading-tight font-bold">AI-powered learning for curious minds</h1>
            <p className="text-[var(--muted)] my-0 mb-[18px]">
              Personalized lessons, guided mentorship, and real-time feedback — all in one place. 
              Build skills faster with interactive content and micro-practice.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <button 
                onClick={() => router.push('/students')} 
                className="inline-block px-4 py-2.5 rounded-[10px] border-none cursor-pointer font-semibold text-sm bg-[var(--primary)] text-white shadow-[0_6px_18px_rgba(92,33,182,0.18)] hover:opacity-90 transition-opacity"
              >
                Start Learning
              </button>
              <button 
                onClick={() => router.push('/students')} 
                className="inline-block px-4 py-2.5 rounded-[10px] cursor-pointer font-semibold text-sm bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--muted)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Explore Courses
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 justify-items-center max-w-[900px] mx-auto">
              <div className="p-4 rounded-xl bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
                <h4 className="m-0 mb-1.5 text-[var(--text)]">Interactive Courses</h4>
                <div className="text-[var(--muted)] text-sm">Hands-on labs, quizzes, and immediate feedback.</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
                <h4 className="m-0 mb-1.5 text-[var(--text)]">Mentor Guidance</h4>
                <div className="text-[var(--muted)] text-sm">1:1 mentoring sessions and curated learning paths.</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
                <h4 className="m-0 mb-1.5 text-[var(--text)]">Progress Tracker</h4>
                <div className="text-[var(--muted)] text-sm">See your growth and celebrate milestones.</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
                <h4 className="m-0 mb-1.5 text-[var(--text)]">AI-Powered Insights</h4>
                <div className="text-[var(--muted)] text-sm">Smart recommendations and adaptive learning algorithms.</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
                <h4 className="m-0 mb-1.5 text-[var(--text)]">Community Forum</h4>
                <div className="text-[var(--muted)] text-sm">Connect with peers, share ideas, and collaborate on projects.</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
                <h4 className="m-0 mb-1.5 text-[var(--text)]">Digital Certificates</h4>
                <div className="text-[var(--muted)] text-sm">Earn verified credentials and showcase your achievements.</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto px-[18px] py-[18px] text-center text-[var(--muted)] text-[13px] flex-shrink-0">
        © {new Date().getFullYear()} EduVerse — Built for lifelong learners.
      </footer>
    </div>
  )
}
