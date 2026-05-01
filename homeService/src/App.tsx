import { useCallback, useState, useRef } from 'react'
import './transitions.css'

const DEFAULT_PAGE = '/home-service/Html/Home.html'
const STORAGE_KEY = 'home-service-current-page'

function App() {
  const [iframeSrc, setIframeSrc] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || DEFAULT_PAGE
  })
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const loadTimeoutRef = useRef<number | null>(null)

  const handleFrameLoad = useCallback(() => {
    // Kill any pending "show loader" timers
    if (loadTimeoutRef.current) {
      window.clearTimeout(loadTimeoutRef.current)
      loadTimeoutRef.current = null
    }

    setIsLoading(false)
    const frame = iframeRef.current
    if (!frame || !frame.contentDocument) return

    const doc = frame.contentDocument
    
    // Inject smooth transition CSS
    const style = doc.createElement('style')
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-8px); }
      }
      body {
        animation: fadeIn 0.4s ease-out forwards;
        opacity: 0;
      }
      body.leaving {
        animation: fadeOut 0.3s ease-in forwards !important;
      }
    `
    doc.head.appendChild(style)

    // Intercept clicks to trigger exit animation
    const links = doc.getElementsByTagName('a')
    Array.from(links).forEach(link => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href')
        // Only internal links
        if (href && !href.startsWith('http') && !href.startsWith('#') && href !== '#') {
          doc.body.classList.add('leaving')
          
          // Wait for exit animation then show overlay
          loadTimeoutRef.current = window.setTimeout(() => {
            setIsLoading(true)
          }, 300)
        }
      })
    })

    try {
      const currentPath = frame.contentWindow?.location.pathname
      if (currentPath && currentPath !== 'about:blank' && currentPath !== iframeSrc) {
        sessionStorage.setItem(STORAGE_KEY, currentPath)
        setIframeSrc(currentPath)
      }
    } catch {
      // ignore cross-origin
    }
  }, [iframeSrc])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0d9488' }}>
      {/* Global Loading Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#0d9488',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          transition: 'opacity 0.3s ease-out',
          opacity: isLoading ? 1 : 0,
          pointerEvents: isLoading ? 'all' : 'none',
        }}
      >
        <div className="loader" style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid rgba(255,255,255,0.3)', 
          borderTopColor: '#fff', 
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>

      <iframe
        ref={iframeRef}
        title="Home Service"
        src={iframeSrc}
        onLoad={handleFrameLoad}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          transition: 'opacity 0.4s ease-in-out',
          opacity: isLoading ? 0 : 1,
        }}
      />
    </div>
  )
}

export default App
