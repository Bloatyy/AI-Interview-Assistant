import { Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Interview from './pages/Interview'
import Report from './pages/Report'
import Configure from './pages/Configure'
import Dashboard from './pages/Dashboard'
import ResourceView from './pages/ResourceView'
import AuthModal from './components/AuthModal'

import { useClerk, useUser, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'

// ScrollToTop component to ensure pages start at the top on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

function App() {
  const clerk = useClerk();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isIndexPage = location.pathname === '/';
  const authenticatedRoutes = ['/dashboard', '/configure', '/interview', '/report'];
  const isAuthRoute = authenticatedRoutes.includes(location.pathname);
  
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  });
  const isAuthenticated = !!user;
  const [searchParams] = useSearchParams();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      const emailPrefix = email.split('@')[0];
      const userData = {
        id: clerkUser.id,
        name: emailPrefix,
        email: email
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'clerk-session');
      setUser(userData); // Update state to trigger re-render
    }
  }, [clerkUser, isClerkLoaded]);

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setIsAuthModalOpen(true);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      if (clerk.session) {
        await clerk.signOut();
      }
      sessionStorage.clear();
      window.location.replace("/");
    } catch (err) {
      console.error("Critical Logout Failure:", err);
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const showNavbar = isIndexPage || location.pathname === '/dashboard';

  return (
    <>
      <ScrollToTop />
      <style>{`
        .nav-content-auth {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: var(--max-width);
          margin: 0 auto;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.4rem 0.8rem;
          border-radius: 100px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          transition: var(--transition);
        }

        .profile-trigger:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
        }

        .avatar-placeholder {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), #ff8a00);
          box-shadow: 0 0 10px rgba(255,184,0,0.2);
        }

        .profile-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .profile-group {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: var(--transition);
          cursor: pointer;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
        }

        .report-nav {
          backdrop-filter: blur(15px);
          background: rgba(10, 10, 10, 0.4);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        main {
          padding-top: ${location.pathname === '/dashboard' ? '5.75rem' : '0'};
        }
      `}</style>
      <div className="bg-glow"></div>
      <div className="bg-glow-2"></div>
      
      {showNavbar && (
        <header className={`header ${isScrolled ? 'scrolled' : ''} ${location.pathname === '/dashboard' ? 'report-nav' : ''}`}>
          {isIndexPage && !isAuthenticated ? (
            <>
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
                <button onClick={() => setIsAuthModalOpen(true)} className="btn-nav">Sign In / Login</button>
              </div>
            </>
          ) : (
            <div className="nav-content-auth">
              {/* Logo on the Far Left - Inheriting Index Page Design */}
              <Link to="/dashboard" className="logo middle">
                <div className="logo-dot"></div>
                <span className="text-gradient">InterviewMitra</span>
              </Link>

              {/* Profile and Logout on the Far Right */}
              <div className="nav-group right" style={{ gap: '2rem' }}>
                <div className="profile-group">
                  <div className="profile-trigger">
                    <div className="avatar-placeholder"></div>
                    <span className="profile-text">{user?.name || 'Professional'}</span>
                  </div>
                  
                  <button onClick={handleLogout} className="btn-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/configure" element={<Configure />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/report" element={<Report />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resource/:id" element={<ResourceView />} />
          <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
        </Routes>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={(userData: any) => setUser(userData)}
      />

      {isIndexPage && (
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
      )}
    </>
  )
}

export default App
