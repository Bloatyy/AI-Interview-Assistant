import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Report from './pages/Report'
import Configure from './pages/Configure'

function App() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>
      
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        {/* Left Side: Nav Links */}
        <nav className="nav-group left">
          <a href="/#standards" className="nav-link">Standards</a>
          <a href="/#ecosystem" className="nav-link">Ecosystem</a>
          <a href="/#mechanism" className="nav-link">Mechanism</a>
        </nav>

        {/* Middle: Logo */}
        <Link to="/" className="logo middle">
          <div className="logo-dot"></div>
          <span>InterviewMitra</span>
        </Link>

        {/* Right Side: Sign In */}
        <div className="nav-group right">
          <Link to="/signin" className="btn-nav">Sign In</Link>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/configure" element={<Configure />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="max-width">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="logo footer-logo">
                <div className="logo-dot"></div>
                <span>InterviewMitra</span>
              </div>
              <p style={{ color: 'var(--primary-muted)', maxWidth: '250px' }}>
                Elevating career preparation through advanced multi-modal artificial intelligence.
              </p>
            </div>
            
            <div className="footer-col">
              <h4 className="footer-title">Platform</h4>
              <div className="footer-links">
                <Link to="/" className="footer-link">Mock Interviews</Link>
                <Link to="/" className="footer-link">AI Feedback</Link>
                <Link to="/" className="footer-link">Reports</Link>
                <Link to="/" className="footer-link">Pricing</Link>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Company</h4>
              <div className="footer-links">
                <Link to="/" className="footer-link">About Us</Link>
                <Link to="/" className="footer-link">Careers</Link>
                <Link to="/" className="footer-link">Privacy Policy</Link>
                <Link to="/" className="footer-link">Terms</Link>
              </div>
            </div>

            <div className="footer-col">
              <h4 className="footer-title">Connect</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Twitter</a>
                <a href="#" className="footer-link">LinkedIn</a>
                <a href="#" className="footer-link">GitHub</a>
                <a href="#" className="footer-link">Discord</a>
              </div>
            </div>
          </div>
          
          <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', color: 'var(--primary-muted)', fontSize: '0.85rem' }}>
            <p>© 2026 InterviewMitra. Designed for professionals.</p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <span>Cookie Settings</span>
              <span>Status</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
