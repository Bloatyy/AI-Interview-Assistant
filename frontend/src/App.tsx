import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Report from './pages/Report'

function App() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if we are on a specialized page (like interview) to hide the global navbar/footer if needed
  const isInterview = location.pathname === '/interview';

  return (
    <>
      <div className="bg-glow"></div>
      <div className="bg-glow-bottom"></div>
      
      {!isInterview && (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
          <div className="header-inner">
            <nav className="nav-links">
              <a href="#about" className="nav-link">About</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#contact" className="nav-link">Contact</a>
            </nav>
            
            <div className="logo-center">
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="logo-symbol"></div>
                <span className="logo-text">Antigravity AI</span>
              </Link>
            </div>
            
            <div className="nav-right">
              <button className="btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}>Login</button>
            </div>
          </div>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </main>

      {!isInterview && (
        <footer className="footer">
          <div className="premium-container">
            <div className="footer-grid">
              <div className="footer-column" style={{ gridColumn: 'span 2' }}>
                <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
                  <div className="logo-symbol"></div>
                  <span className="logo-text">InterviewAI</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.8 }}>
                  Elevating your career through AI-driven mock interviews and real-time performance analytics.
                </p>
              </div>
              
              <div className="footer-column">
                <h4>Platform</h4>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Features</a></li>
                  <li><a href="#" className="footer-link">Pricing</a></li>
                  <li><a href="#" className="footer-link">AI Technology</a></li>
                  <li><a href="#" className="footer-link">Success Stories</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Company</h4>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">About Us</a></li>
                  <li><a href="#" className="footer-link">Careers</a></li>
                  <li><a href="#" className="footer-link">Blog</a></li>
                  <li><a href="#" className="footer-link">Press Kit</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Support</h4>
                <ul className="footer-links">
                  <li><a href="#" className="footer-link">Help Center</a></li>
                  <li><a href="#" className="footer-link">Community</a></li>
                  <li><a href="#" className="footer-link">Contact</a></li>
                  <li><a href="#" className="footer-link">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="copyright-bar">
              <p>&copy; 2026 InterviewAI. All rights reserved. Designed for excellence.</p>
            </div>
          </div>
        </footer>
      )}
    </>
  )
}

export default App
