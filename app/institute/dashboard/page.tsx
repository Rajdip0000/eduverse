'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import VerificationChecker from '@/components/VerificationChecker'

export default function InstituteDashboard() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stats] = useState({
    totalStudents: 1245,
    totalTeachers: 78,
    totalCourses: 156,
    departments: 12
  })

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== 'institute')) {
      router.push('/sign-in')
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'institute') {
    return null
  }

  return (
    <div className="min-h-screen">
      <VerificationChecker />
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[2.5rem] font-bold text-[var(--text)] mb-2">
            🏫 Institute Dashboard
          </h1>
          <p className="text-[var(--muted)] text-lg">
            Welcome back! Manage your institution efficiently.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(59,130,246,0.3)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-[rgba(59,130,246,0.2)] flex items-center justify-center text-3xl">
                👨‍🎓
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Total Students</p>
                <p className="text-3xl font-bold text-[#3b82f6]">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(16,185,129,0.3)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-[rgba(16,185,129,0.2)] flex items-center justify-center text-3xl">
                👨‍🏫
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Total Teachers</p>
                <p className="text-3xl font-bold text-[#10b981]">{stats.totalTeachers}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(190,39,245,0.3)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-[rgba(190,39,245,0.2)] flex items-center justify-center text-3xl">
                📚
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-[var(--primary)]">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,158,11,0.3)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-[rgba(245,158,11,0.2)] flex items-center justify-center text-3xl">
                🏢
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Departments</p>
                <p className="text-3xl font-bold text-[#f59e0b]">{stats.departments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">⚡ Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-4 rounded-[12px] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-semibold hover:opacity-90 transition-all text-left flex items-center gap-2">
                <span>➕</span>
                <span>Add New Teacher</span>
              </button>
              <button className="w-full p-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] font-semibold hover:bg-[rgba(255,255,255,0.05)] transition-all text-left flex items-center gap-2">
                <span>👨‍🎓</span>
                <span>Enroll Students</span>
              </button>
              <button className="w-full p-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] font-semibold hover:bg-[rgba(255,255,255,0.05)] transition-all text-left flex items-center gap-2">
                <span>📊</span>
                <span>View Reports</span>
              </button>
              <button className="w-full p-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] font-semibold hover:bg-[rgba(255,255,255,0.05)] transition-all text-left flex items-center gap-2">
                <span>⚙️</span>
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Department Overview */}
          <div className="lg:col-span-2 bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">🏢 Department Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Computer Science', students: 245, teachers: 12, courses: 28, color: '#3b82f6' },
                { name: 'Mathematics', students: 198, teachers: 10, courses: 22, color: '#10b981' },
                { name: 'Physics', students: 167, teachers: 8, courses: 18, color: '#f59e0b' },
                { name: 'Chemistry', students: 156, teachers: 8, courses: 16, color: '#ef4444' },
                { name: 'English', students: 223, teachers: 15, courses: 25, color: '#8b5cf6' },
                { name: 'History', students: 134, teachers: 7, courses: 14, color: '#06b6d4' }
              ].map((dept, index) => (
                <div
                  key={index}
                  className="p-4 rounded-[12px] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(190,39,245,0.3)] transition-all cursor-pointer"
                >
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xl mb-3"
                    style={{ backgroundColor: `${dept.color}30` }}
                  >
                    📖
                  </div>
                  <h4 className="font-bold text-[var(--text)] mb-2">{dept.name}</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-[var(--muted)] block">Students</span>
                      <span className="text-[var(--text)] font-semibold">{dept.students}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted)] block">Teachers</span>
                      <span className="text-[var(--text)] font-semibold">{dept.teachers}</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted)] block">Courses</span>
                      <span className="text-[var(--text)] font-semibold">{dept.courses}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">🔔 Recent Activity</h3>
            <div className="space-y-3">
              {[
                { text: '45 new student enrollments this week', time: '1 hour ago', icon: '👨‍🎓' },
                { text: '3 teachers joined Computer Science dept', time: '3 hours ago', icon: '👨‍🏫' },
                { text: 'Mid-term examinations scheduled', time: '5 hours ago', icon: '📝' },
                { text: 'Annual report generated successfully', time: '1 day ago', icon: '📊' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-[10px] border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-all">
                  <div className="w-10 h-10 rounded-full bg-[rgba(190,39,245,0.2)] flex items-center justify-center text-xl flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[var(--text)] mb-1">{activity.text}</p>
                    <span className="text-sm text-[var(--muted)]">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.08)]">
            <h3 className="text-xl font-bold text-[var(--text)] mb-4">📢 Announcements</h3>
            <div className="space-y-3">
              {[
                { title: 'Winter Break Notice', date: 'Dec 20 - Jan 5', priority: 'high' },
                { title: 'New Course Registration Open', date: 'Starting Dec 1', priority: 'medium' },
                { title: 'Faculty Meeting Scheduled', date: 'Nov 25, 3:00 PM', priority: 'medium' },
                { title: 'Sports Day Event', date: 'Dec 15', priority: 'low' }
              ].map((announcement, index) => (
                <div key={index} className="p-4 rounded-[10px] border border-[rgba(255,255,255,0.05)] hover:border-[var(--primary)] transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-[var(--text)]">{announcement.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      announcement.priority === 'high' ? 'bg-[rgba(239,68,68,0.2)] text-[#ef4444]' :
                      announcement.priority === 'medium' ? 'bg-[rgba(245,158,11,0.2)] text-[#f59e0b]' :
                      'bg-[rgba(16,185,129,0.2)] text-[#10b981]'
                    }`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--muted)]">{announcement.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
