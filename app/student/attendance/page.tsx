'use client'

import { useState } from 'react'

export default function StudentAttendance() {
  const [attendanceData] = useState([
    { date: '2024-12-01', subject: 'Mathematics', status: 'Present' },
    { date: '2024-11-30', subject: 'Physics', status: 'Present' },
    { date: '2024-11-29', subject: 'Chemistry', status: 'Absent' },
    { date: '2024-11-28', subject: 'English', status: 'Present' },
    { date: '2024-11-27', subject: 'History', status: 'Present' },
  ])

  const presentDays = attendanceData.filter((a) => a.status === 'Present').length
  const totalDays = attendanceData.length
  const percentage = Math.round((presentDays / totalDays) * 100)

  return (
    <div className="max-w-[56rem] mx-auto">
      <h1 className="text-[2rem] font-bold mb-8 text-[var(--text)]">✓ Attendance Record</h1>

      {/* Attendance Summary */}
      <div className="glass-card mb-8">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Overall Attendance</h2>
        <div className="flex items-center gap-8">
          <div className="text-5xl font-bold text-[var(--primary)]">{percentage}%</div>
          <div className="flex-1">
            <p className="text-[var(--text)] mb-2">Present: {presentDays}/{totalDays} days</p>
            <div className="w-full h-3 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
        {percentage >= 80 ? (
          <p className="text-[#10b981] font-medium mt-4 mb-0">✓ Great attendance! Keep it up!</p>
        ) : (
          <p className="text-[#ef4444] font-medium mt-4 mb-0">⚠ Attendance below 80%. Please improve.</p>
        )}
      </div>

      {/* Attendance List */}
      <div className="glass-card">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">Recent Classes</h2>
        <div className="flex flex-col gap-3">
          {attendanceData.map((record, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 rounded-[12px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div>
                <p className="font-semibold text-[var(--text)] mb-1">{record.subject}</p>
                <p className="text-sm text-[var(--muted)] m-0">
                  {new Date(record.date).toLocaleDateString()}
                </p>
              </div>
              <span className={`py-[0.375rem] px-[0.875rem] rounded-[20px] text-xs font-semibold ${record.status === 'Present' ? 'bg-[rgba(16,185,129,0.2)] text-[#10b981] border border-[rgba(16,185,129,0.3)]' : 'bg-[rgba(239,68,68,0.2)] text-[#ef4444] border border-[rgba(239,68,68,0.3)]'}`}>
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
