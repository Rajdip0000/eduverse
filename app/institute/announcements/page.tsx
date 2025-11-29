'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './announcements.module.css'

interface Announcement {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    name: string
    email: string
  }
}

export default function AnnouncementsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in')
    } else if (session?.user?.role !== 'institute') {
      router.push('/')
    }
  }, [session, isPending, router])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/institute/announcements')
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'institute') {
      fetchAnnouncements()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/institute/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchAnnouncements()
        setFormData({ title: '', content: '' })
        setShowModal(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create announcement')
      }
    } catch (error) {
      console.error('Failed to create announcement:', error)
      alert('Failed to create announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading || isPending) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading announcements...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1>Announcements</h1>
            <p className={styles.subtitle}>Institution-wide announcements</p>
          </div>
          <button onClick={() => setShowModal(true)} className={styles.createBtn}>
            + New Announcement
          </button>
        </div>

        <div className={styles.announcementsList}>
          {announcements.length === 0 ? (
            <div className={styles.empty}>
              No announcements yet. Create one to get started.
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className={styles.announcementCard}>
                <div className={styles.cardHeader}>
                  <h2>{announcement.title}</h2>
                  <span className={styles.date}>{formatDate(announcement.createdAt)}</span>
                </div>
                <div className={styles.cardContent}>
                  <p>{announcement.content}</p>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.author}>
                    <div className={styles.authorAvatar}>
                      {announcement.author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className={styles.authorInfo}>
                      <div className={styles.authorName}>{announcement.author.name}</div>
                      <div className={styles.authorEmail}>{announcement.author.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Create Announcement</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Announcement title"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  placeholder="Write your announcement here..."
                  rows={8}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelBtn}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
