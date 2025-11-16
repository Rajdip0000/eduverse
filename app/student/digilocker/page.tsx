'use client'

import { useState, useEffect, useRef, ChangeEvent, DragEvent, FormEvent } from 'react'
import Navbar from '@/components/Navbar'

interface Document {
  name: string
  data: string
  uploadedAt: number
}

export default function EduLockPage() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [showSetPassword, setShowSetPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [unlockPassword, setUnlockPassword] = useState('')
  const [documents, setDocuments] = useState<Document[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [chosenFiles, setChosenFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const DOCS_KEY = 'edu_docs_v1'
  const LOCKER_PW_HASH_KEY = 'edu_locker_pw_v1'
  const LOCKER_UNLOCKED_KEY = 'edu_locker_unlocked_v1'

  useEffect(() => {
    const pwHash = localStorage.getItem(LOCKER_PW_HASH_KEY)
    setHasPassword(!!pwHash)
    
    const unlocked = sessionStorage.getItem(LOCKER_UNLOCKED_KEY) === '1'
    setIsUnlocked(unlocked)
    
    if (unlocked) {
      loadDocuments()
    }
  }, [])

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
  }

  const sha256hex = async (str: string): Promise<string> => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleSetPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 4) {
      alert('Choose a password (min 4 characters)')
      return
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    const hash = await sha256hex(password)
    localStorage.setItem(LOCKER_PW_HASH_KEY, hash)
    setHasPassword(true)
    setShowSetPassword(false)
    setPassword('')
    setConfirmPassword('')
    alert('Password set. You must unlock the locker to access files.')
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
      setIsUnlocked(true)
      setUnlockPassword('')
      loadDocuments()
    } else {
      alert('Incorrect password')
    }
  }

  const handleLock = () => {
    sessionStorage.removeItem(LOCKER_UNLOCKED_KEY)
    setIsUnlocked(false)
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

  const processFiles = (files: File[]) => {
    if (files.length === 0) return
    
    setChosenFiles(files)
    let pending = files.length
    const docs = [...documents]

    files.forEach(f => {
      const reader = new FileReader()
      reader.onload = () => {
        docs.unshift({
          name: f.name,
          data: reader.result as string,
          uploadedAt: Date.now()
        })
        pending--
        if (pending === 0) {
          saveDocuments(docs)
          setChosenFiles([])
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
      reader.onerror = () => {
        pending--
        if (pending === 0) {
          saveDocuments(docs)
          setChosenFiles([])
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
      reader.readAsDataURL(f)
    })
  }

  const handleDelete = (idx: number) => {
    const docs = [...documents]
    docs.splice(idx, 1)
    saveDocuments(docs)
  }

  const handleDownload = (doc: Document) => {
    const a = document.createElement('a')
    a.href = doc.data
    a.download = doc.name
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      
      <main className="max-w-[1200px] mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">🔒 EduLock</h1>
          <p className="text-[var(--muted)] text-lg">Securely store and manage your important documents</p>
        </div>

        <div className="max-w-[900px] mx-auto">
          {!isUnlocked && (
            <div className="flex justify-center items-center min-h-[60vh]">
              {!hasPassword && !showSetPassword && (
                <div className="bg-[var(--card-bg)] backdrop-blur-[16px] p-12 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-center max-w-[450px] w-full">
                  <div className="text-6xl mb-6">🔐</div>
                  <h2 className="text-[var(--text)] mb-4 text-[1.75rem]">Setup EduLock</h2>
                  <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed mb-6">No locker password set. Create one to protect your uploads.</p>
                  <button className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white px-6 py-4 rounded-[12px] border-none cursor-pointer font-semibold text-base flex-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(190,39,245,0.3)]" onClick={() => setShowSetPassword(true)}>
                    Set Password
                  </button>
                </div>
              )}

              {showSetPassword && (
                <div className="bg-[var(--card-bg)] backdrop-blur-[16px] p-12 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-center max-w-[450px] w-full">
                  <div className="text-6xl mb-6">🔑</div>
                  <h2 className="text-[var(--text)] mb-4 text-[1.75rem]">Create Password</h2>
                  <form onSubmit={handleSetPassword} className="flex flex-col gap-4 mt-6">
                    <input
                      type="password"
                      placeholder="Set locker password (min 4 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="px-4 py-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-base transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)]"
                    />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="px-4 py-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-base transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)]"
                    />
                    <div className="flex gap-4 mt-2">
                      <button type="submit" className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white px-6 py-4 rounded-[12px] border-none cursor-pointer font-semibold text-base flex-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(190,39,245,0.3)]">Set Password</button>
                      <button type="button" className="bg-transparent border-2 border-[rgba(255,255,255,0.1)] text-[var(--text)] px-6 py-4 rounded-[12px] cursor-pointer flex-1 font-semibold transition-all duration-300 hover:border-[var(--primary)] hover:text-[var(--primary)]" onClick={() => setShowSetPassword(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {hasPassword && !showSetPassword && (
                <div className="bg-[var(--card-bg)] backdrop-blur-[16px] p-12 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] text-center max-w-[450px] w-full">
                  <div className="text-6xl mb-6">🔒</div>
                  <h2 className="text-[var(--text)] mb-4 text-[1.75rem]">Unlock EduLock</h2>
                  <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed mb-6">Enter your password to access stored documents.</p>
                  <form onSubmit={handleUnlock} className="flex flex-col gap-4 mt-6">
                    <input
                      type="password"
                      placeholder="Locker password"
                      value={unlockPassword}
                      onChange={(e) => setUnlockPassword(e.target.value)}
                      className="px-4 py-4 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--text)] text-base transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(190,39,245,0.1)]"
                      autoFocus
                    />
                    <div className="flex gap-4 mt-2">
                      <button type="submit" className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white px-6 py-4 rounded-[12px] border-none cursor-pointer font-semibold text-base flex-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(190,39,245,0.3)]">Unlock</button>
                      <button type="button" className="bg-transparent border-2 border-[rgba(255,255,255,0.1)] text-[var(--text)] px-6 py-4 rounded-[12px] cursor-pointer flex-1 font-semibold transition-all duration-300 hover:border-[var(--primary)] hover:text-[var(--primary)]" onClick={() => setShowSetPassword(true)}>
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {isUnlocked && (
            <>
              <div className="flex justify-between items-center mb-8 bg-[var(--card-bg)] backdrop-blur-[16px] p-6 rounded-[16px] border border-[rgba(255,255,255,0.1)]">
                <div className="flex gap-12">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-3xl font-bold text-[var(--primary)]">{documents.length}</span>
                    <span className="text-sm text-[var(--muted)]">Documents</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-3xl font-bold text-[var(--primary)]">
                      {(documents.reduce((acc, doc) => acc + doc.data.length, 0) / 1024).toFixed(0)}
                    </span>
                    <span className="text-sm text-[var(--muted)]">KB Used</span>
                  </div>
                </div>
                <button type="button" className="bg-[rgba(239,68,68,0.1)] border-2 border-[rgba(239,68,68,0.3)] text-[#ef4444] px-6 py-3 rounded-[12px] cursor-pointer font-semibold transition-all duration-300 hover:bg-[rgba(239,68,68,0.2)] hover:border-[#ef4444]" onClick={handleLock}>
                  🔒 Lock
                </button>
              </div>

              <div
                className={`border-[3px] border-dashed border-[rgba(255,255,255,0.1)] p-12 rounded-[20px] flex flex-col items-center gap-6 bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent transition-all duration-300 mb-8 ${dragOver ? 'bg-gradient-to-br from-[rgba(190,39,245,0.1)] to-[rgba(168,32,217,0.05)] border-[var(--primary)] scale-[1.02]' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="text-[3.5rem] mb-2">📁</div>
                  <div className="font-semibold text-xl text-[var(--text)]">Drag & drop files here</div>
                  <div className="text-[var(--muted)]">or click the button below to browse</div>
                  {chosenFiles.length > 0 && (
                    <div className="mt-4 p-4 bg-[rgba(255,255,255,0.05)] rounded-[12px] text-sm text-[var(--muted)] text-left">
                      <strong>Uploading:</strong>
                      {chosenFiles.map((f, idx) => (
                        <div key={idx}>• {f.name}</div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white border-none px-8 py-4 rounded-[12px] cursor-pointer font-semibold text-base transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(190,39,245,0.3)]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </button>
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 text-[var(--text)]">
                  Your Documents ({documents.length})
                </h3>
                
                {documents.length === 0 ? (
                  <div className="text-center p-16 pb-8 bg-[var(--card-bg)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.1)]">
                    <div className="text-6xl mb-4 opacity-50">📄</div>
                    <p>No documents uploaded yet</p>
                    <p className="text-[var(--muted)]">Upload your first document to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="bg-[var(--card-bg)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.1)] p-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] hover:border-[var(--primary)]">
                        <div className="text-4xl flex-shrink-0">
                          {doc.name.endsWith('.pdf') ? '📕' : 
                           doc.name.match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' : '📄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <strong className="block text-[var(--text)] text-base font-semibold mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{doc.name}</strong>
                          <div className="flex gap-4 text-xs text-[var(--muted)]">
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            <span>{(doc.data.length / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button 
                            className="bg-[rgba(190,39,245,0.1)] border border-[rgba(190,39,245,0.3)] text-[var(--primary)] px-3 py-2 rounded-lg cursor-pointer text-xl transition-all duration-300 hover:bg-[var(--primary)] hover:text-white"
                            onClick={() => handleDownload(doc)}
                            title="Download"
                          >
                            ⬇️
                          </button>
                          <button 
                            className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] px-3 py-2 rounded-lg cursor-pointer text-xl transition-all duration-300 hover:bg-[#ef4444] hover:text-white"
                            onClick={() => handleDelete(idx)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 p-6 bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] rounded-[12px] text-[var(--muted)] text-sm leading-relaxed">
                <strong className="text-[#fbbf24]">📌 Note:</strong> Files are stored in your browser's local storage for demonstration purposes. 
                They may be cleared if you clear browser data or exceed storage limits.
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
