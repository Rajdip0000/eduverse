'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { GoogleGenAI } from '@google/genai'

interface Message {
  who: 'user' | 'bot'
  text: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { who: 'bot', text: 'Welcome to Edu Assistant — ask about the site, files, or lectures.' }
  ])
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('edu_bot_api_key') || ''
      setApiKey(stored)
    }
  }, [])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages])

  const localBotReply = (msg: string): string => {
    const m = msg.toLowerCase()
    if (m.includes('hello') || m.includes('hi')) {
      return 'Hi! I can help with courses, notes, uploads, and lecture guidance. Try asking "How do I upload files?" or "Summarize the current lecture."'
    }
    if (m.includes('upload')) {
      return 'Go to the Document Locker on the left, unlock the locker (if set), then drag & drop files or use the Choose files button.'
    }
    if (m.includes('summarize') || m.includes('summary')) {
      return 'Paste a transcript into the Notes & Summarizer box or open a lecture and use "Use current video" to get metadata.'
    }
    if (m.includes('todo')) {
      return 'Open the To‑Do list area to add, complete, or delete tasks. I can create a quick task for you if you say the task text.'
    }
    return "I'm a local demo assistant — for richer responses, save a Gemini API key in settings. You asked: " + msg
  }

  const callGeminiAI = async (prompt: string) => {
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    const ai = new GoogleGenAI({ apiKey: geminiApiKey })
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are a helpful assistant for EduVerse. Keep answers concise and focused on education. Question: ${prompt}`,
    })
    return response.text!
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    setInput('')
    setMessages(prev => [...prev, { who: 'user', text }])
    setMessages(prev => [...prev, { who: 'bot', text: '…' }])

    try {
      const key = localStorage.getItem('edu_bot_api_key')
      let reply = ''

      // Always use Gemini AI now
      try {
        reply = await callGeminiAI(text)
      } catch (e: any) {
        console.warn('Gemini API failed', e)
        reply = localBotReply(text)
      }

      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = { who: 'bot', text: reply }
        return newMessages
      })
    } catch (err: any) {
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = { who: 'bot', text: 'Error: ' + err.message }
        return newMessages
      })
    }
  }

  const handleSave = () => {
    localStorage.setItem('edu_bot_api_key', apiKey.trim())
    alert('API key saved locally.')
  }

  const handleClear = () => {
    localStorage.removeItem('edu_bot_api_key')
    setApiKey('')
    alert('API key cleared from localStorage.')
  }

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard) {
        alert('Clipboard API not available in this environment.')
        return
      }
      const text = (await navigator.clipboard.readText()).trim()
      if (!text) {
        alert('Clipboard is empty. Copy your API key first and try again.')
        return
      }
      setApiKey(text)
      localStorage.setItem('edu_bot_api_key', text)
      alert('API key pasted from clipboard and saved locally.')
    } catch (err) {
      console.error('Clipboard read failed', err)
      alert('Could not read clipboard. Ensure you are running in a secure context.')
    }
  }

  return (
    <>
      <button
        className="fixed right-5 bottom-5 w-[54px] h-[54px] rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white border-0 shadow-[0_8px_30px_rgba(92,33,182,0.2)] cursor-pointer text-xl flex items-center justify-center z-[1000]"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: isOpen ? 'none' : 'flex' }}
        title="Chat with EduVerse"
      >
        💬
      </button>

      {isOpen && (
        <div className="fixed right-5 bottom-[90px] w-80 max-w-[calc(100%-40px)] bg-[var(--surface)] rounded-[14px] shadow-[0_20px_50px_rgba(2,6,23,0.6)] overflow-hidden border border-[rgba(255,255,255,0.04)] flex flex-col z-[1000]">
          <div className="p-3 bg-gradient-to-r from-[rgba(124,58,237,0.06)] to-[rgba(139,92,246,0.06)] flex items-center justify-between font-bold">
            <span>Edu Assistant</span>
            <button 
              className="bg-transparent border-0 text-[var(--muted)] cursor-pointer text-lg p-0"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div 
            className="p-3 flex-1 overflow-auto min-h-[120px] max-h-80" 
            ref={bodyRef} 
            role="log" 
            aria-live="polite"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`mb-2.5 ${msg.who === 'user' ? 'text-right' : ''}`}
              >
                <div 
                  className={`inline-block px-2.5 py-2 rounded-[10px] max-w-[80%] text-sm ${
                    msg.who === 'user' 
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white' 
                      : 'bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent text-[var(--text)] border border-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form className="flex p-2.5 border-t border-[rgba(255,255,255,0.03)] gap-2" onSubmit={handleSubmit}>
            <input
              className="flex-1 px-2 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-transparent text-[var(--text)] text-sm"
              placeholder="Ask me about courses, notes, or lectures..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
            />
            <div className="flex gap-1.5">
              <button 
                type="submit" 
                className="bg-[var(--primary)] text-white border-0 px-2.5 py-2 rounded-lg cursor-pointer"
              >
                Send
              </button>
              <button 
                type="button" 
                className="bg-[var(--primary)] text-white border-0 px-2.5 py-2 rounded-lg cursor-pointer"
                onClick={() => setShowSettings(!showSettings)}
              >
                ⚙
              </button>
            </div>
          </form>

          {showSettings && (
            <div className="p-2 border-t border-[rgba(255,255,255,0.03)] text-[13px]">
              <label className="block mb-1.5">Gemini API Key (optional)</label>
              <input
                className="w-full px-2 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-transparent text-[var(--text)] mb-2"
                placeholder="AIzaSy... (stored locally)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="flex-1 px-2 py-1.5 rounded-lg cursor-pointer text-[13px] bg-[var(--primary)] text-white border-0"
                >
                  Save
                </button>
                <button 
                  onClick={handleClear}
                  className="flex-1 px-2 py-1.5 rounded-lg cursor-pointer text-[13px] bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--text)]"
                >
                  Clear
                </button>
                <button 
                  onClick={handlePaste}
                  className="flex-1 px-2 py-1.5 rounded-lg cursor-pointer text-[13px] bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--text)]"
                >
                  Paste
                </button>
              </div>
              <div className="mt-2 text-[var(--muted)]">
                Tip: Using an API key calls Gemini AI directly. Get your key at Google AI Studio.
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
