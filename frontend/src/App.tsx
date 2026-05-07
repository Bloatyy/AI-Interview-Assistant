import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Report from './pages/Report'

function App() {
  const location = useLocation();

  return (
    <>
      <div className="bg-glow"></div>
      <div className="bg-glow-bottom"></div>
      
      <header className="header">
        <div className="premium-container header-inner">
          <div className="logo-container">
            <div className="logo-symbol"></div>
            <span className="logo-text">Antigravity AI</span>
          </div>
          <nav className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="premium-container footer-inner">
          <p>&copy; 2026 AI Interview Assistant. Built for high-performance candidates.</p>
        </div>
      </footer>
    </>
  )
}

export default App
