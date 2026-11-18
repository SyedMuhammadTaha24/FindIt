import { useEffect, useRef } from 'react'
import gsap from 'gsap'

function Footer() {
  const textRef = useRef(null)

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    const text = "Find What You've Lost. Reconnect."
    el.innerHTML = ''

    const chars = text.split('').map((char) => {
      const span = document.createElement('span')
      span.textContent = char === ' ' ? '\u00A0' : char
      span.style.opacity = '0'
      el.appendChild(span)
      return span
    })

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 })

    tl.to(chars, {
      opacity: 1,
      duration: 0.05,
      stagger: 0.05,
      ease: 'none'
    }).to(chars, {
      opacity: 0,
      duration: 0.03,
      stagger: { each: 0.03, from: 'end' },
      delay: 1.5,
      ease: 'none'
    })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <footer className="cinematic-footer" style={{ padding: '80px 9%', background: '#020a15', borderTop: '1px solid rgba(66, 200, 255, 0.2)', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="footer-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '800', lineHeight: '1.3', marginBottom: '20px', minHeight: '1.3em', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span ref={textRef} style={{ color: '#fff' }}></span>
          <span style={{ display: 'inline-block', width: '3px', height: '0.9em', backgroundColor: '#42c8ff', marginLeft: '4px', animation: 'blink 1s infinite' }}></span>
        </div>

        <p style={{ color: '#8da5c1', fontSize: '14px', marginBottom: '30px' }}>
          A smarter way to reconnect people with their lost belongings.
        </p>

        <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px', fontSize: '14px', fontWeight: '600' }}>
          <a href="#home" style={{ color: '#42c8ff', textDecoration: 'none' }}>Home</a>
          <a href="#browse" style={{ color: '#8da5c1', textDecoration: 'none' }}>Browse Items</a>
          <a href="#how" style={{ color: '#8da5c1', textDecoration: 'none' }}>How It Works</a>
        </div>

        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(66,200,255,0.4), transparent)', margin: '20px 0' }}></div>

        <small style={{ color: '#627a97', fontSize: '12px' }}>© 2026 FindIt. All rights reserved.</small>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </footer>
  )
}

export default Footer