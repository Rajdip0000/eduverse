'use client'

import { useEffect, useRef } from 'react'

const symbols = ['∑', 'π', '√', '∞', '∫', '∆', 'σ', 'θ', 'λ', '∂', '🧬', '🔬', '⚛️', '📘', '🔢', '🧪']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  symbol: string
  alpha: number
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const DPR = Math.max(1, window.devicePixelRatio || 1)
    let W = window.innerWidth
    let H = window.innerHeight

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.floor(W * DPR)
      canvas.height = Math.floor(H * DPR)
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    window.addEventListener('resize', resize)
    resize()

    const particles: Particle[] = []
    const MAX = Math.min(60, Math.floor(W / 20))
    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    for (let i = 0; i < MAX; i++) {
      particles.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.5, 0.5),
        vy: rand(-0.3, -1.2),
        size: rand(14, 36),
        rot: rand(0, Math.PI * 2),
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        alpha: rand(0.08, 0.28)
      })
    }

    const maxOffset = 80
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }

    const onPointerMove = (px: number, py: number) => {
      const nx = (px - W / 2) / W
      const ny = (py - H / 2) / H
      target.x = nx * maxOffset
      target.y = ny * maxOffset * 0.6
    }

    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const resetTarget = () => {
      target.x = 0
      target.y = 0
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('mouseleave', resetTarget)
    window.addEventListener('touchend', resetTarget)

    let last = performance.now()
    let animationId: number

    const animate = (now: number) => {
      const dt = Math.min(50, now - last)
      last = now
      const ease = 0.18

      current.x += (target.x - current.x) * ease
      current.y += (target.y - current.y) * ease

      ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR)
      ctx.save()
      ctx.translate(current.x, current.y)

      particles.forEach(p => {
        p.x += p.vx * (dt / 8)
        p.y += p.vy * (dt / 8)
        p.rot += 0.01 * (dt / 16)

        if (p.y < -80) {
          p.y = H + 40
          p.x = rand(0, W)
        }
        if (p.x < -80) p.x = W + 40
        if (p.x > W + 80) p.x = -40

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.font = `${p.size}px system-ui,Segoe UI,Arial`
        ctx.fillStyle = 'rgba(190,39,245,0.12)'
        ctx.fillText(p.symbol, -p.size / 2 - 1, p.size / 3 - 1)
        ctx.fillStyle = 'rgba(230,238,248,0.95)'
        ctx.fillText(p.symbol, -p.size / 2, p.size / 3)
        ctx.restore()
      })

      ctx.restore()
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseleave', resetTarget)
      window.removeEventListener('touchend', resetTarget)
    }
  }, [])

  return <canvas ref={canvasRef} id="subject-bg" />
}
