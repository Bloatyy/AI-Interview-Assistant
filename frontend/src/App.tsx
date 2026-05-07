import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Report from './pages/Report'

function App() {
  const location = useLocation();

  return (
    <>
      {/* Background elements */}
      <div className="bg-glow"></div>
      
      <header className="header">
        <Link to="/" className="logo">
          <div className="logo-dot"></div>
          <span>InterviewMitra</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Product</Link>
          <Link to="/companies" className="nav-link">Companies</Link>
          <Link to="/resources" className="nav-link">Resources</Link>
          <Link to="/signin" className="btn-nav">Sign In</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </main>

      <footer className="footer" style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div className="max-width">
          <p style={{ color: 'var(--primary-muted)', fontSize: '0.85rem' }}>© 2026 InterviewMitra. Built for performance.</p>
        </div>
      </footer>
    </>
  )
}

export default App
