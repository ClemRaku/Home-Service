import { useCallback, useState } from 'react'

const DEFAULT_PAGE = '/home-service/Html/Home.html'
const STORAGE_KEY = 'home-service-current-page'

function App() {
  const [iframeSrc, setIframeSrc] = useState(() => {
    return sessionStorage.getItem(STORAGE_KEY) || DEFAULT_PAGE
  })

  const handleFrameLoad = useCallback((event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const frame = event.currentTarget

    try {
      const currentPath = frame.contentWindow?.location.pathname
      if (currentPath?.startsWith('/home-service/Html/')) {
        sessionStorage.setItem(STORAGE_KEY, currentPath)
        setIframeSrc(currentPath)
      }
    } catch {
      // ignore if frame location is inaccessible
    }
  }, [])

  return (
    <iframe
      title="Home Service"
      src={iframeSrc}
      onLoad={handleFrameLoad}
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
    />
  )
}

export default App
