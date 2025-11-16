'use client'

import { useState, useEffect, FormEvent } from 'react'

interface SavedNote {
  title: string
  summary: string
  raw: string
  createdAt: number
}

const STOPWORDS = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'it', 'that', 'this', 'for', 'on', 'with', 'as', 'are', 'was', 'by', 'an', 'be', 'or', 'from', 'at', 'your', 'you', 'we'])

const lectures = [
  { title: 'Intro to Course', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { title: 'Lecture 1', src: 'https://www.youtube.com/embed/3JZ_D3ELwOQ' },
  { title: 'Lecture 2', src: 'https://www.youtube.com/embed/oHg5SJYRHA0' }
]

export default function VideoLectures() {
  const [activeVideo, setActiveVideo] = useState(lectures[0].src)
  const [videoUrl, setVideoUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [notes, setNotes] = useState<SavedNote[]>([])

  const NOTES_KEY = 'edu_video_notes_v1'

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]')
      setNotes(stored)
    } catch (e) {
      setNotes([])
    }
  }

  const saveNotes = (newNotes: SavedNote[]) => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes))
    setNotes(newNotes)
  }

  const summarizeText = (text: string, maxSentences = 3): string => {
    if (!text) return ''

    const sentences = text.split(/(?<=[\.\?\!])\s+/).map(s => s.trim()).filter(Boolean)
    if (sentences.length <= maxSentences) return sentences.join(' ')

    const freq: Record<string, number> = {}
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .forEach(w => {
        if (!w || STOPWORDS.has(w)) return
        freq[w] = (freq[w] || 0) + 1
      })

    const scores = sentences.map(s => {
      let score = 0
      s.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .forEach(w => {
          if (!w) return
          score += freq[w] || 0
        })
      return { s, score }
    })

    scores.sort((a, b) => b.score - a.score)
    const top = scores.slice(0, maxSentences)
      .sort((a, b) => text.indexOf(a.s) - text.indexOf(b.s))
      .map(x => x.s)

    return top.join(' ')
  }

  const handlePlayVideo = (e: FormEvent) => {
    e.preventDefault()
    const url = videoUrl.trim()
    if (!url) return

    const embed = toEmbed(url)
    if (!embed) {
      alert('Unsupported URL. Paste a YouTube watch URL.')
      return
    }

    setActiveVideo(embed)
  }

  const toEmbed = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes('youtube')) {
        const v = urlObj.searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}`
        
        const paths = urlObj.pathname.split('/')
        return `https://www.youtube.com/embed/${paths.pop()}`
      }
    } catch (e) {
      return null
    }
    return null
  }

  const handleSummarize = () => {
    const text = transcript.trim()
    if (!text) {
      setSummary('Paste a transcript or use the current video.')
      return
    }

    const summ = summarizeText(text, 3)
    setSummary(summ)
  }

  const handleUseCurrentVideo = async () => {
    const src = activeVideo
    const vidMatch = src.match(/embed\/(.*?)($|\?)/)
    if (!vidMatch) {
      alert('No video found in the player.')
      return
    }

    const id = vidMatch[1]
    const watchUrl = `https://www.youtube.com/watch?v=${id}`

    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`)
      const data = await res.json()

      const sourceText = `${data.title} by ${data.author_name}.\n${data.author_url || ''}`
      setTranscript(sourceText + '\n\n' + transcript)

      const summ = summarizeText(sourceText + ' ' + (data.title || ''), 3)
      setSummary(summ)
    } catch (err) {
      console.warn(err)
      alert('Could not fetch video metadata. Paste transcript manually.')
    }
  }

  const handleSaveNote = () => {
    const summ = summary.trim()
    const raw = transcript.trim()
    if (!summ) {
      alert('Generate a summary first.')
      return
    }

    const newNotes = [
      {
        title: activeVideo.split('/').pop() || 'Note',
        summary: summ,
        raw: raw,
        createdAt: Date.now()
      },
      ...notes
    ]

    saveNotes(newNotes)
    alert('Note saved locally.')
  }

  const handleDeleteNote = (idx: number) => {
    const newNotes = [...notes]
    newNotes.splice(idx, 1)
    saveNotes(newNotes)
  }

  return (
    <div className="bg-[rgba(15,23,36,0.22)] backdrop-blur-[8px] p-[18px] rounded-[12px] shadow-[0_10px_30px_rgba(2,6,23,0.6)] border border-[rgba(255,255,255,0.04)]">
      <h3 className="mt-0">Video Lectures</h3>
      <p className="text-[var(--muted)] text-sm">Select a lecture or paste a YouTube URL to play.</p>

      <form onSubmit={handlePlayVideo} className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="YouTube URL (optional)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="flex-1 px-2.5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.06)] bg-transparent text-[var(--text)]"
        />
        <button type="submit" className="bg-[var(--primary)] text-white px-3 py-2 rounded-[10px] border-0 cursor-pointer font-semibold">Play</button>
      </form>

      <div className="mt-3">
        <div className="flex gap-2 flex-wrap">
          {lectures.map((lecture, idx) => (
            <button
              key={idx}
              className={`bg-transparent border border-[rgba(255,255,255,0.04)] text-[var(--text)] px-3 py-2 rounded-[10px] cursor-pointer font-semibold hover:bg-gradient-to-r hover:from-[rgba(139,92,246,0.08)] hover:to-[rgba(124,58,237,0.06)] hover:border-[rgba(139,92,246,0.18)] ${
                activeVideo === lecture.src 
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white border-[rgba(139,92,246,0.36)] shadow-[0_8px_24px_rgba(11,17,50,0.45)]' 
                  : ''
              }`}
              onClick={() => setActiveVideo(lecture.src)}
            >
              {lecture.title}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <iframe
            src={activeVideo}
            allowFullScreen
            className="w-full h-[360px] border-0 rounded-[10px]"
          />
        </div>

        <div className="mt-3.5 border-t border-dashed border-[rgba(15,23,42,0.04)] pt-3">
          <h4 className="m-0 mb-2">Notes & Summarizer</h4>
          <p className="text-[var(--muted)] text-sm">
            Paste a transcript or use the current video to generate a short summary. This is a local demo summarizer.
          </p>

          <textarea
            placeholder="Paste transcript or notes here"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full min-h-[120px] px-2.5 py-2.5 rounded-lg border border-[rgba(255,255,255,0.06)] mt-2 bg-transparent text-[var(--text)] resize-y font-[inherit]"
          />

          <div className="flex gap-2 mt-2 flex-wrap">
            <button className="bg-[var(--primary)] text-white px-3 py-2 rounded-[10px] border-0 cursor-pointer font-semibold" onClick={handleSummarize}>Summarize</button>
            <button className="bg-transparent text-[var(--primary)] border border-[rgba(11,17,33,0.06)] px-3 py-2 rounded-[10px] cursor-pointer" onClick={handleUseCurrentVideo}>
              Use current video
            </button>
            <button className="bg-[var(--primary)] text-white px-3 py-2 rounded-[10px] border-0 cursor-pointer font-semibold" onClick={handleSaveNote}>Save note</button>
          </div>

          {summary && (
            <div className="mt-3 px-2.5 py-2.5 rounded-lg bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-transparent border border-[rgba(255,255,255,0.03)] text-[var(--text)]">
              {summary}
            </div>
          )}

          <h5 className="mt-3 mb-2">Saved Notes</h5>
          <div className="flex flex-col gap-2">
            {notes.length === 0 ? (
              <div className="text-[var(--muted)]">No saved notes yet.</div>
            ) : (
              notes.map((note, idx) => (
                <div key={idx} className="flex justify-between items-center px-2 py-2 rounded-[10px] border border-[rgba(255,255,255,0.04)]">
                  <div className="flex-1">
                    <strong>{note.title}</strong>
                    <div className="text-[var(--muted)]">
                      {new Date(note.createdAt).toLocaleString()}
                    </div>
                    <div className="mt-1.5">{note.summary}</div>
                  </div>
                  <button className="bg-transparent border border-[rgba(255,255,255,0.06)] text-[var(--text)] px-2 py-1.5 rounded-lg cursor-pointer" onClick={() => handleDeleteNote(idx)}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
