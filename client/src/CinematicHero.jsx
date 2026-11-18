import { useEffect, useRef } from 'react'
import gsap from 'gsap'

function CinematicHero({
  search,
  setSearch,
  onSearch,
  onReportLost,
  onReportFound
}) {
  const heroRef = useRef(null)
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 })

  // Full-coverage Edge-to-Edge 45-Degree Interactive Waves Background Effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId

    function handleResize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    function handleMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.targetX = e.clientX - rect.left
      mouseRef.current.targetY = e.clientY - rect.top
    }

    function handleMouseLeave() {
      mouseRef.current.targetX = -1000
      mouseRef.current.targetY = -1000
    }

    const heroEl = heroRef.current
    heroEl?.addEventListener('mousemove', handleMouseMove)
    heroEl?.addEventListener('mouseleave', handleMouseLeave)

    let step = 0

    function render() {
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1

      step += 0.015
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      // Background
      ctx.fillStyle = '#071426'
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      // Rotate canvas by 45 degrees from center
      ctx.translate(width / 2, height / 2)
      ctx.rotate(Math.PI / 4)
      ctx.translate(-width / 2, -height / 2)

      // Expanded diagonal calculation with safety factor to cover all corners completely
      const diagonal = Math.sqrt(width * width + height * height) * 1.5
      const spacing = 18
      const cols = Math.floor(diagonal / spacing)
      const pointsPerLine = 45

      for (let i = -cols; i <= cols * 2; i++) {
        const xBase = i * spacing - diagonal * 0.5
        ctx.beginPath()

        for (let j = 0; j <= pointsPerLine; j++) {
          const yBase = (j / pointsPerLine) * diagonal - diagonal * 0.5

          const seed = i * 14.23
          const wave1 = Math.sin(xBase * 0.007 + step * 0.9 + seed) * 22
          const wave2 = Math.cos(yBase * 0.009 - step * 0.6 + seed * 0.5) * 18
          const wave3 = Math.sin((xBase + yBase) * 0.004 + step * 1.2) * 12

          let dx = 0
          let dy = 0

          const distX = xBase - mouseRef.current.x
          const distY = yBase - mouseRef.current.y
          const dist = Math.sqrt(distX * distX + distY * distY)
          const maxDist = 200

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 40
            dx = (distX / dist) * force
            dy = (distY / dist) * force
          }

          const px = xBase + wave1 + wave3 + dx
          const py = yBase + wave2 + dy

          if (j === 0) {
            ctx.moveTo(px, py)
          } else {
            ctx.lineTo(px, py)
          }
        }

        ctx.strokeStyle = 'rgba(66, 200, 255, 0.25)'
        ctx.lineWidth = 1.2
        ctx.stroke()
      }

      ctx.restore()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      heroEl?.removeEventListener('mousemove', handleMouseMove)
      heroEl?.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const intro = gsap.timeline({
          defaults: { ease: 'power3.out' }
        })

        intro
          .from('.cinematic-tag', { y: 20, opacity: 0, duration: 0.6 })
          .from('.cinematic-title', { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
          .from('.cinematic-description', { y: 15, opacity: 0, duration: 0.6 }, '-=0.3')
          .from('.cinematic-words', { y: 15, opacity: 0, duration: 0.6 }, '-=0.25')
          .from('.cinematic-search', { y: 15, opacity: 0, duration: 0.6 }, '-=0.25')
          .from('.hero-actions', { y: 15, opacity: 0, duration: 0.6 }, '-=0.25')
          .from('.hologram', { scale: 0.92, opacity: 0, duration: 1 }, '-=0.7')

        gsap.to('.hologram', {
          y: -10,
          duration: 4,
          delay: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      }, heroRef)

      return () => ctx.revert()
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="cinematic-hero" id="home" ref={heroRef} style={{ position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="cinematic-glow"></div>

      <div className="cinematic-content" style={{ position: 'relative', zIndex: 1 }}>
        <div className="cinematic-tag">
          <span className="hologram-dot"></span>
          SMART LOST & FOUND PLATFORM
        </div>

        <h1 className="cinematic-title">
          Lost Something?
          <br />
          <span>Find It Again.</span>
        </h1>

        <p className="cinematic-description">
          A smarter way to reconnect people with their lost
          belongings. Report, search and help make a difference.
        </p>

        <div className="cinematic-words">
          <span className="flying-word">LOST</span>
          <span className="flying-word">FOUND</span>
          <span className="flying-word">RECONNECTED</span>
        </div>

        <div className="search-box cinematic-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search lost or found items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearch()
            }}
          />

          <button onClick={onSearch}>Search</button>
        </div>

        <div className="hero-actions">
          <button className="primary-btn" onClick={onReportLost}>
            Report Lost Item
          </button>

          <button className="secondary-btn" onClick={onReportFound}>
            Report Found Item
          </button>
        </div>
      </div>

      <div className="hologram" style={{ position: 'relative', zIndex: 1 }}>
        <div 
          style={{
            position: 'absolute',
            inset: '-25px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(66,200,255,0.25) 0%, rgba(0,0,0,0) 70%)',
            animation: 'pulse 3s infinite ease-in-out',
            zIndex: -1
          }}
        ></div>

        <div className="hologram-ring ring-one" style={{ animation: 'spinSlow 12s linear infinite', border: '1px dashed rgba(66, 200, 255, 0.8)' }}></div>
        <div className="hologram-ring ring-two" style={{ animation: 'spinReverse 10s linear infinite', border: '1px dotted rgba(66, 200, 255, 0.9)' }}></div>
        <div className="hologram-ring ring-three" style={{ animation: 'spinSlow 18s linear infinite', border: '1px solid rgba(66, 200, 255, 0.4)' }}></div>

        <div className="hologram-text">
          <span>LOST ITEMS.</span>
          <span>FOUND</span>
          <span>CONNECTIONS.</span>
        </div>

        <div className="hologram-caption">SYSTEM ACTIVE</div>
      </div>
    </section>
  )
}

export default CinematicHero