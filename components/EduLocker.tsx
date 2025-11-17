'use client'

import { useState, useEffect, useRef, ChangeEvent, DragEvent, FormEvent } from 'react'

interface Document {
  id: string
  name: string
  data: string
  size: number
  type: string
  uploadedAt: number
  encrypted: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
]

const SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes

export default function EduLocker() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [showSetPassword, setShowSetPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [unlockPassword, setUnlockPassword] = useState('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const DOCS_KEY = 'edu_docs_v2'
  const LOCKER_PW_HASH_KEY = 'edu_locker_pw_v2'
  const LOCKER_UNLOCKED_KEY = 'edu_locker_unlocked_v2'
  const ENCRYPTION_KEY = 'edu_locker_enc_key_v2'

  useEffect(() => {
    const pwHash = localStorage.getItem(LOCKER_PW_HASH_KEY)
    setHasPassword(!!pwHash)
    
    const unlocked = sessionStorage.getItem(LOCKER_UNLOCKED_KEY) === '1'
    setIsUnlocked(unlocked)
    
    if (unlocked) {
      loadDocuments()
      startSessionTimer()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startSessionTimer = () => {
    const checkSession = () => {
      const timeSinceActivity = Date.now() - lastActivity
      if (timeSinceActivity > SESSION_TIMEOUT) {
        handleLock()
        alert('Session timed out due to inactivity. Please unlock again.')
      } else {
        timeoutRef.current = setTimeout(checkSession, 60000) // Check every minute
      }
    }
    checkSession()
  }

  const updateActivity = () => {
    setLastActivity(Date.now())
  }

  const loadDocuments = () => {
    try {
      const docs = JSON.parse(localStorage.getItem(DOCS_KEY) || '[]')
      setDocuments(docs)
    } catch (e) {
      setDocuments([])
    }
  }

  const saveDocuments = (docs: Document[]) => {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs))
    setDocuments(docs)
    updateActivity()
  }

  const sha256hex = async (str: string): Promise<string> => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const encryptData = async (data: string, password: string): Promise<string> => {
    try {
      const enc = new TextEncoder()
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      )
      
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: enc.encode('edulocker-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )

      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(data)
      )

      const combined = new Uint8Array(iv.length + encrypted.byteLength)
      combined.set(iv, 0)
      combined.set(new Uint8Array(encrypted), iv.length)

      return btoa(String.fromCharCode(...combined))
    } catch (error) {
      console.error('Encryption error:', error)
      return data
    }
  }

  const decryptData = async (encryptedData: string, password: string): Promise<string> => {
    try {
      const enc = new TextEncoder()
      const dec = new TextDecoder()
      
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0))
      const iv = combined.slice(0, 12)
      const data = combined.slice(12)

      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      )

      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: enc.encode('edulocker-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      )

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )

      return dec.decode(decrypted)
    } catch (error) {
      console.error('Decryption error:', error)
      return encryptedData
    }
  }

  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++

    if (strength <= 1) return { strength, label: 'Weak', color: '#ef4444' }
    if (strength <= 3) return { strength, label: 'Medium', color: '#f59e0b' }
    return { strength, label: 'Strong', color: '#10b981' }
  }

  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      alert('Choose a password (minimum 6 characters)')
      return
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    const { strength } = getPasswordStrength(password)
    if (strength < 2) {
      const confirm = window.confirm('Your password is weak. Continue anyway?')
      if (!confirm) return
    }

    const hash = await sha256hex(password)
    localStorage.setItem(LOCKER_PW_HASH_KEY, hash)
    localStorage.setItem(ENCRYPTION_KEY, password)
    setHasPassword(true)
    setShowSetPassword(false)
    setPassword('')
    setConfirmPassword('')
    alert('Password set successfully! Please unlock to access your files.')
  }

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault()
    if (!unlockPassword) {
      alert('Enter locker password')
      return
    }

    const stored = localStorage.getItem(LOCKER_PW_HASH_KEY)
    if (!stored) {
      alert('No password set - create one first.')
      return
    }

    const hash = await sha256hex(unlockPassword)
    if (hash === stored) {
      sessionStorage.setItem(LOCKER_UNLOCKED_KEY, '1')
      localStorage.setItem(ENCRYPTION_KEY, unlockPassword)
      setIsUnlocked(true)
      setUnlockPassword('')
      setLastActivity(Date.now())
      loadDocuments()
      startSessionTimer()
    } else {
      alert('Incorrect password')
    }
  }

  const handleLock = () => {
    sessionStorage.removeItem(LOCKER_UNLOCKED_KEY)
    setIsUnlocked(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} exceeds the 10MB size limit`
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type) {
      return `File type ${file.type} is not allowed`
    }
    return null
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isUnlocked) {
      alert('Unlock the locker first')
      e.target.value = ''
      return
    }
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (!isUnlocked) {
      alert('Unlock the locker first')
      return
    }
    const files = Array.from(e.dataTransfer.files || [])
    processFiles(files)
  }

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return
    
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    }

    if (errors.length > 0) {
      alert('Some files were not uploaded:\n' + errors.join('\n'))
    }

    if (validFiles.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    const password = localStorage.getItem(ENCRYPTION_KEY) || ''
    const docs = [...documents]
    let processed = 0

    for (const file of validFiles) {
      try {
        const data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const encryptedData = await encryptData(data, password)

        docs.unshift({
          id: crypto.randomUUID(),
          name: file.name,
          data: encryptedData,
          size: file.size,
          type: file.type,
          uploadedAt: Date.now(),
          encrypted: true
        })

        processed++
        setUploadProgress((processed / validFiles.length) * 100)
      } catch (error) {
        console.error('Error processing file:', file.name, error)
      }
    }

    saveDocuments(docs)
    setUploading(false)
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    const docs = documents.filter(doc => doc.id !== id)
    saveDocuments(docs)
  }

  const handleDownload = async (doc: Document) => {
    try {
      let data = doc.data
      if (doc.encrypted) {
        const password = localStorage.getItem(ENCRYPTION_KEY) || ''
        data = await decryptData(doc.data, password)
      }
      
      const a = document.createElement('a')
      a.href = data
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      updateActivity()
    } catch (error) {
      console.error('Download error:', error)
      alert('Error downloading file')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredAndSortedDocuments = documents
    .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'size':
          return b.size - a.size
        case 'date':
        default:
          return b.uploadedAt - a.uploadedAt
      }
    })

  const passwordStrength = getPasswordStrength(password)

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[var(--text)] mb-2">🔒 EduLocker</h2>
        <p className="text-[var(--muted)]">
          Secure document storage with AES-256 encryption. Your files are encrypted and stored locally.
        </p>
      </div>

      {/* Locked State */}
      {!isUnlocked && (
        <div className="max-w-[500px] mx-auto mt-12">
          <div className="bg-[rgba(15,23,36,0.4)] backdrop-blur-[12px] p-8 rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.08)]">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-4xl shadow-[0_8px_24px_rgba(190,39,245,0.4)]">
                🔒
              </div>
              <h3 className="text-2xl font-bold text-[var(--text)]">Secure Document Vault</h3>
            </div>

            {!hasPassword && !showSetPassword && (
              <div>
                <p className="text-[var(--muted)] mb-4 text-center">
                  No password set. Create a secure password to protect your documents.
                </p>
                <button 
                  className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-6 py-3 rounded-[12px] font-semibold hover:opacity-90 transition-all shadow-[0_4px_15px_rgba(190,39,245,0.3)]" 
                  onClick={() => setShowSetPassword(true)}
                >
                  Create Password
                </button>
              </div>
            )}

            {showSetPassword && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="Create password (min 6 characters)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setShowPasswordStrength(e.target.value.length > 0)
                    }}
                    className="w-full px-4 py-3 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all"
                    required
                  />
                  {showPasswordStrength && password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[var(--muted)]">Password Strength:</span>
                        <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                      </div>
                      <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-300" 
                          style={{ 
                            width: `${(passwordStrength.strength / 5) * 100}%`,
                            backgroundColor: passwordStrength.color 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all"
                  required
                />
                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-6 py-3 rounded-[12px] font-semibold hover:opacity-90 transition-all shadow-[0_4px_15px_rgba(190,39,245,0.3)]"
                  >
                    Set Password
                  </button>
                  <button 
                    type="button" 
                    className="px-6 py-3 rounded-[12px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)] transition-all" 
                    onClick={() => {
                      setShowSetPassword(false)
                      setPassword('')
                      setConfirmPassword('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {hasPassword && !showSetPassword && (
              <form onSubmit={handleUnlock} className="space-y-4">
                <p className="text-[var(--muted)] text-center mb-4">
                  Enter your password to unlock the vault
                </p>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all"
                  required
                />
                <div className="flex flex-col gap-3">
                  <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-6 py-3 rounded-[12px] font-semibold hover:opacity-90 transition-all shadow-[0_4px_15px_rgba(190,39,245,0.3)]"
                  >
                    Unlock Vault
                  </button>
                  <button 
                    type="button" 
                    className="w-full px-6 py-3 rounded-[12px] border border-[rgba(255,255,255,0.1)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[rgba(255,255,255,0.05)] transition-all text-sm" 
                    onClick={() => setShowSetPassword(true)}
                  >
                    Change Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Unlocked State */}
      {isUnlocked && (
        <>
          {/* Controls Bar */}
          <div className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-4 rounded-[12px] border border-[rgba(255,255,255,0.06)] mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all"
                />
              </div>
              <div className="flex gap-3 items-center">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                  className="px-4 py-2 rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-all cursor-pointer"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                </select>
                <button 
                  onClick={handleLock}
                  className="px-4 py-2 rounded-[10px] border border-[var(--primary)] text-[var(--primary)] hover:bg-[rgba(190,39,245,0.1)] transition-all font-semibold"
                >
                  🔒 Lock Vault
                </button>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-[16px] p-8 mb-6 transition-all ${
              dragOver 
                ? 'border-[var(--primary)] bg-[rgba(190,39,245,0.1)]' 
                : 'border-[rgba(255,255,255,0.1)] bg-[rgba(15,23,36,0.2)]'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                Drag & Drop Files Here
              </h3>
              <p className="text-[var(--muted)] mb-4">
                or click to browse • Max 10MB per file • PDF, DOC, XLS, PPT, Images
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white px-6 py-3 rounded-[12px] font-semibold hover:opacity-90 transition-all shadow-[0_4px_15px_rgba(190,39,245,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Choose Files'}
              </button>
            </div>

            {uploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[var(--muted)]">Encrypting and uploading...</span>
                  <span className="text-[var(--primary)]">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Documents List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[var(--text)]">
                Your Documents ({filteredAndSortedDocuments.length})
              </h3>
              {documents.length > 0 && (
                <span className="text-sm text-[var(--muted)]">
                  Total: {formatFileSize(documents.reduce((acc, doc) => acc + doc.size, 0))}
                </span>
              )}
            </div>

            {filteredAndSortedDocuments.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted)]">
                <div className="text-5xl mb-4">📭</div>
                <p>{searchQuery ? 'No documents match your search' : 'No documents uploaded yet'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredAndSortedDocuments.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="bg-[rgba(15,23,36,0.3)] backdrop-blur-[8px] p-4 rounded-[12px] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(190,39,245,0.3)] transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-[10px] flex items-center justify-center text-2xl shadow-[0_4px_15px_rgba(190,39,245,0.3)]">
                        {doc.type.includes('pdf') ? '📄' : 
                         doc.type.includes('image') ? '🖼️' :
                         doc.type.includes('word') ? '📝' :
                         doc.type.includes('excel') || doc.type.includes('sheet') ? '📊' :
                         doc.type.includes('powerpoint') || doc.type.includes('presentation') ? '📽️' : '📎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--text)] truncate">{doc.name}</h4>
                        <div className="flex gap-4 text-sm text-[var(--muted)] mt-1">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          {doc.encrypted && (
                            <>
                              <span>•</span>
                              <span className="text-[var(--primary)]">🔐 Encrypted</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDownload(doc)}
                          className="px-4 py-2 rounded-[10px] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-semibold hover:opacity-90 transition-all shadow-[0_4px_15px_rgba(190,39,245,0.3)]"
                        >
                          Download
                        </button>
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          className="px-4 py-2 rounded-[10px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] hover:bg-[rgba(255,0,0,0.1)] hover:border-red-500 hover:text-red-500 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 rounded-[12px] bg-[rgba(190,39,245,0.05)] border border-[rgba(190,39,245,0.2)]">
            <div className="flex gap-3">
              <span className="text-2xl">🔐</span>
              <div>
                <h4 className="font-semibold text-[var(--text)] mb-1">Security Notice</h4>
                <p className="text-sm text-[var(--muted)]">
                  Files are encrypted with AES-256 encryption and stored locally in your browser. 
                  Your session will automatically lock after 15 minutes of inactivity. 
                  Remember to lock the vault when you're done!
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
