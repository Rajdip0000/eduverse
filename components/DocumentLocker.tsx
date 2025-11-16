'use client'

import { useState, useEffect, useRef, ChangeEvent, DragEvent, FormEvent } from 'react'

interface Document {
  name: string
  data: string
  uploadedAt: number
}

export default function DocumentLocker() {
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
    <div className="bg-[rgba(15,23,36,0.22)] backdrop-blur-[8px] p-4 rounded-[12px] shadow-[0_10px_30px_rgba(2,6,23,0.6)] border border-[rgba(255,255,255,0.04)]">
      <h3 className="mt-0">Document Locker</h3>
      <p className="text-[var(--muted)] text-sm">
        Upload and store important study files (demo stored in localStorage).
      </p>

      {!isUnlocked && (
        <div>
          {!hasPassword && !showSetPassword && (
            <div className="mt-2">
              <p className="text-[var(--muted)] text-sm">No locker password set. Create one to protect uploads.</p>
              <button className="bg-[var(--primary)] text-white px-3 py-2 rounded-[10px] border-0 cursor-pointer font-semibold flex-1" onClick={() => setShowSetPassword(true)}>
                Set Password
              </button>
            </div>
          )}

          {showSetPassword && (
            <form onSubmit={handleSetPassword} className="mt-2 flex flex-col gap-2">
              <input
                type="password"
                placeholder="Set locker password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-2 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-transparent text-[var(--text)] w-full"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-2 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-transparent text-[var(--text)] w-full"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-[var(--primary)] text-white px-3 py-2 rounded-[10px] border-0 cursor-pointer font-semibold flex-1">Set Password</button>
                <button type="button" className="bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--text)] px-2 py-1.5 rounded-lg cursor-pointer flex-1" onClick={() => setShowSetPassword(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {hasPassword && !showSetPassword && (
            <form onSubmit={handleUnlock} className="mt-2 flex flex-col gap-2">
              <p className="text-[var(--muted)] text-sm">Locker is password-protected. Unlock to access files.</p>
              <input
                type="password"
                placeholder="Locker password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                className="px-2 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-transparent text-[var(--text)] w-full"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-[var(--primary)] text-white px-3 py-2 rounded-[10px] border-0 cursor-pointer font-semibold flex-1">Unlock Locker</button>
                <button type="button" className="bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--text)] px-2 py-1.5 rounded-lg cursor-pointer flex-1" onClick={() => setShowSetPassword(true)}>
                  Change Password
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {isUnlocked && (
        <>
          <div
            className={`mt-2.5 border-2 border-dashed border-[rgba(255,255,255,0.06)] px-[18px] py-[18px] rounded-[10px] flex items-center justify-between gap-3 bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent ${
              dragOver ? 'bg-gradient-to-r from-[rgba(124,58,237,0.06)] to-[rgba(92,33,182,0.04)] border-[rgba(124,58,237,0.28)]' : ''
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="font-semibold">Drag & drop files here</div>
              <div className="text-[var(--muted)] text-sm">PDFs, docs, images — stored locally for demo purposes.</div>
              {chosenFiles.length > 0 && (
                <div className="mt-2 text-[13px] text-[var(--muted)]">
                  {chosenFiles.map((f, idx) => (
                    <div key={idx}>{f.name}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={handleFileSelect}
              />
              <button
                type="button"
                className="bg-transparent text-[var(--primary)] border border-[rgba(255,255,255,0.06)] px-2 py-2 rounded-lg cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose files
              </button>
              <button type="button" className="bg-transparent text-[var(--primary)] border border-[rgba(255,255,255,0.06)] px-2 py-2 rounded-lg cursor-pointer" onClick={handleLock}>
                Lock Locker
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-3">
            {documents.length === 0 ? (
              <div className="text-[var(--muted)]">No files uploaded yet.</div>
            ) : (
              documents.map((doc, idx) => (
                <div key={idx} className="flex justify-between items-center px-2 py-2 rounded-[10px] border border-[rgba(255,255,255,0.04)]">
                  <div className="flex-1">
                    <strong>{doc.name}</strong>
                    <div className="text-[var(--muted)]">
                      {new Date(doc.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-[var(--primary)] text-white px-3 py-2 rounded-[10px] border-0 cursor-pointer font-semibold flex-1" onClick={() => handleDownload(doc)}>
                      Download
                    </button>
                    <button className="bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--text)] px-2 py-1.5 rounded-lg cursor-pointer flex-1" onClick={() => handleDelete(idx)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="mt-2.5 text-[13px] text-[var(--muted)]">
            Note: files are stored in your browser for demo purposes and may be cleared by browser storage limits.
          </p>
        </>
      )}
    </div>
  )
}
