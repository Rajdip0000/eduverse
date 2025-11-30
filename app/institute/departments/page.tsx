'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './departments.module.css'

interface Department {
  id: string
  name: string
  code: string
  description: string | null
  _count: {
    teachers: number
    courses: number
  }
}

export default function DepartmentsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in')
    } else if (session?.user?.role !== 'institute') {
      router.push('/')
    }
  }, [session, isPending, router])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/institute/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'institute') {
      fetchDepartments()
    }
  }, [session])

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept)
      setFormData({
        name: dept.name,
        code: dept.code,
        description: dept.description || ''
      })
    } else {
      setEditingDept(null)
      setFormData({ name: '', code: '', description: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingDept(null)
    setFormData({ name: '', code: '', description: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingDept
        ? `/api/institute/departments/${editingDept.id}`
        : '/api/institute/departments'
      const method = editingDept ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchDepartments()
        handleCloseModal()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save department')
      }
    } catch (error) {
      console.error('Failed to save department:', error)
      alert('Failed to save department')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return

    try {
      const response = await fetch(`/api/institute/departments/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchDepartments()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete department')
      }
    } catch (error) {
      console.error('Failed to delete department:', error)
      alert('Failed to delete department')
    }
  }

  if (loading || isPending) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading departments...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1>Department Management</h1>
            <p className={styles.subtitle}>Manage academic departments</p>
          </div>
          <button onClick={() => handleOpenModal()} className={styles.createBtn}>
            + Create Department
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Code</th>
                <th>Description</th>
                <th>Teachers</th>
                <th>Courses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    No departments found. Create one to get started.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id}>
                    <td className={styles.deptName}>{dept.name}</td>
                    <td>
                      <span className={styles.code}>{dept.code}</span>
                    </td>
                    <td className={styles.description}>
                      {dept.description || 'No description'}
                    </td>
                    <td>{dept._count.teachers}</td>
                    <td>{dept._count.courses}</td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => handleOpenModal(dept)}
                        className={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{editingDept ? 'Edit Department' : 'Create Department'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Department Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Department Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                  placeholder="e.g., CS"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the department"
                  rows={4}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  {submitting ? 'Saving...' : editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
