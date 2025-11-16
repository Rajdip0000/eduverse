'use client'

import { useState } from 'react'

export default function StudentNotices() {
  const [notices] = useState([
    {
      id: 1,
      title: 'Holiday Announcement',
      content: 'Winter break starts on December 20th. Classes resume on January 5th.',
      date: '2024-12-10',
      isGlobal: true,
    },
    {
      id: 2,
      title: 'Assignment Due',
      content: 'History assignment on World War II is due by Friday midnight.',
      date: '2024-12-08',
      isGlobal: false,
    },
    {
      id: 3,
      title: 'Library Access',
      content: 'New science fiction section has been added to the library.',
      date: '2024-12-05',
      isGlobal: true,
    },
  ])

  return (
    <div className="max-w-[56rem] mx-auto">
      <h1 className="text-[2rem] font-bold mb-8 text-[var(--text)]">📢 Notices Board</h1>

      <div className="flex flex-col gap-4">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-[var(--card-bg)] backdrop-blur-[8px] border border-[var(--card-border)] border-l-4 border-l-[var(--primary)] rounded-[var(--radius)] p-6 shadow-[var(--shadow)]">
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-xl font-semibold text-[var(--text)] m-0">{notice.title}</h2>
              {notice.isGlobal && (
                <span className="bg-[linear-gradient(90deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))] text-[#10b981] text-xs py-1 px-3 rounded-full font-semibold border border-[rgba(16,185,129,0.3)]">Global</span>
              )}
            </div>
            <p className="text-[var(--muted)] mb-3 leading-relaxed">{notice.content}</p>
            <p className="text-sm text-[var(--muted)] opacity-70">
              {new Date(notice.date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
