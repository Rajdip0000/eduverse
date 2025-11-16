'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleGenAI } from '@google/genai'

interface Message {
    id: number
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export default function ChatPage() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: 'assistant',
            content: 'Hello! I\'m your AI study mentor. How can I help you today?',
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const quickPrompts = [
        'Explain Newton\'s Laws',
        'Help with calculus',
        'Study tips for exams',
        'Explain photosynthesis'
    ]

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: messages.length + 1,
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        const userInput = input
        setInput('')
        setIsTyping(true)

        try {
            // Initialize Google GenAI
            const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyAhXoUUyorHo_sjQjsHUiQO7wI8_LsEj2I'
            const ai = new GoogleGenAI({ apiKey: geminiApiKey })

            console.log('Sending request to Gemini API...')

            // Generate content
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents: `You are a helpful AI study mentor for students. Provide clear, concise, and educational responses. Question: ${userInput}`,
            })
            const aiResponse = response.text


            const aiMessage: Message = {
                id: messages.length + 2,
                role: 'assistant',
                content: aiResponse!,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])
        } catch (error: any) {
            console.error('Error calling Gemini API:', error)
            const errorMessage: Message = {
                id: messages.length + 2,
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message || 'Please check your internet connection and try again.'}`,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
        }
    }

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt)
    }

    return (
        <div className="min-h-screen p-8 max-w-[1400px] mx-auto">
            <header className="flex items-center gap-6 mb-8">
                <button 
                    onClick={() => router.back()} 
                    className="px-6 py-3 rounded-[12px] bg-[var(--card-bg)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.1)] text-[var(--text)] font-medium cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]"
                >
                    ← Back
                </button>
                <h1 className="text-3xl font-bold text-[var(--text)]">🤖 AI Study Mentor</h1>
            </header>

            <div className="bg-[var(--card-bg)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.1)] h-[calc(100vh-200px)] flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {messages.map(message => (
                        <div
                            key={message.id}
                            className={`flex animate-[fadeIn_0.3s_ease] ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] px-5 py-4 rounded-[16px] relative ${
                                message.role === 'user' 
                                    ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white rounded-br-[4px]'
                                    : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[var(--text)] rounded-bl-[4px]'
                            }`}>
                                <p className="mb-2 leading-relaxed">{message.content}</p>
                                <span className="text-xs opacity-70">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex justify-start animate-[fadeIn_0.3s_ease]">
                            <div className="max-w-[70%] px-5 py-4 rounded-[16px] relative bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[var(--text)] rounded-bl-[4px]">
                                <div className="flex gap-2 py-2">
                                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-[typing_1.4s_infinite]" style={{ animationDelay: '0s' }}></span>
                                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-[typing_1.4s_infinite]" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-[typing_1.4s_infinite]" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                <div className="flex gap-3 p-6 border-t border-[rgba(255,255,255,0.1)] overflow-x-auto">
                    {quickPrompts.map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickPrompt(prompt)}
                            className="px-4 py-2 rounded-[20px] bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)] text-[var(--primary)] text-sm whitespace-nowrap cursor-pointer transition-all duration-300 hover:bg-[rgba(139,92,246,0.2)] hover:border-[var(--primary)]"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <div className="flex gap-4 p-6 border-t border-[rgba(255,255,255,0.1)]">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything about your studies..."
                        className="flex-1 px-5 py-4 rounded-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[var(--text)] text-base transition-all duration-300 focus:outline-none focus:border-[var(--primary)] focus:bg-[rgba(255,255,255,0.08)] placeholder:text-[var(--muted)]"
                    />
                    <button
                        onClick={handleSend}
                        className="px-8 py-4 rounded-[12px] bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white font-semibold border-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        disabled={!input.trim()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    )
}
