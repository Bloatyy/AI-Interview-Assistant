import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignIn, useUser } from '@clerk/clerk-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoaded, signIn } = useSignIn();
  const { isSignedIn } = useUser();

  // Background scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle success messages from search params
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setMessage({ type: 'success', text: 'Email verified successfully! You can now log in.' });
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    if (!isLoaded) return;
    
    try {
      // Clear any potential stale local user data before starting OAuth
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: any) {
      const errorMsg = err.errors?.[0]?.message || '';
      console.error("Google Login Error:", errorMsg);

      if (errorMsg.toLowerCase().includes('session already exists')) {
        // If session exists but local state is broken, try to force a dashboard entry or a clean restart
        navigate('/dashboard');
      } else {
        setMessage({ type: 'error', text: errorMsg || 'Google login failed' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { email, password, name };

    // Hardcoded Admin Bypass for immediate access
    if (email === 'admin@gmail.com' && password === 'admin123') {
      const mockUser = { id: 'admin-123', name: 'Admin User', email: 'admin@gmail.com' };
      localStorage.setItem('token', 'mock-token-admin');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setMessage({ type: 'success', text: 'Admin Login successful!' });
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 1000);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage({ type: 'success', text: 'Login successful!' });
        setTimeout(() => {
          onClose();
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage({ type: 'success', text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.85)', 
        backdropFilter: 'blur(15px)', 
        zIndex: 1000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div 
        className="glass-card reveal" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%', 
          maxWidth: '550px', 
          padding: '2rem 2.5rem', 
          position: 'relative',
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%),
            radial-gradient(at 0% 0%, rgba(251, 191, 36, 0.1) 0, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.05) 0, transparent 50%),
            rgba(15, 15, 15, 0.4)
          `,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(251, 191, 36, 0.03)',
          overflow: 'hidden'
        }}
      >
        {/* Grainy Texture Overlay */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.03, 
          pointerEvents: 'none',
          backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
          filter: 'contrast(150%) brightness(1000%)',
          zIndex: 0
        }}></div>

        {/* Accent Glow */}
        <div style={{ 
          position: 'absolute', 
          top: '-10%', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          width: '80%', 
          height: '20%', 
          background: 'var(--accent)', 
          filter: 'blur(60px)', 
          opacity: 0.1,
          zIndex: -1 
        }}></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '1.25rem', 
            right: '1.25rem', 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid var(--border)', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '1rem',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
            zIndex: 10
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
        >
          ×
        </button>

        <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem', textAlign: 'center', letterSpacing: '-0.03em', position: 'relative', zIndex: 1 }}>
          {isLogin ? 'Welcome' : 'Join Us'}
        </h2>
        <p style={{ color: 'var(--primary-muted)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', position: 'relative', zIndex: 1 }}>
          {isLogin ? 'Continue your path to excellence' : 'The new standard in career preparation'}
        </p>

        {message.text && (
          <div style={{ 
            padding: '0.75rem', 
            borderRadius: '12px', 
            marginBottom: '1.25rem', 
            fontSize: '0.8rem',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
            color: message.type === 'success' ? '#10b981' : '#f87171',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
          {!isLogin && (
            <div className="input-group">
              <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-muted)', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                placeholder="Aritra Roy"
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none', transition: '0.3s', fontSize: '0.9rem' }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          )}
          
          <div className="input-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-muted)', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="name@company.com"
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none', transition: '0.3s', fontSize: '0.9rem' }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div className="input-group">
            <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-muted)', marginBottom: '0.5rem', display: 'block' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none', transition: '0.3s', fontSize: '0.9rem' }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="btn-main" 
            style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center', padding: '0.9rem', fontSize: '0.95rem' }}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ margin: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: '0.6rem', color: 'var(--primary-muted)', textTransform: 'uppercase' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.7rem', position: 'relative', zIndex: 1, fontSize: '0.85rem' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--primary-muted)', position: 'relative', zIndex: 1 }}>
          {isLogin ? "New to the platform?" : "Already a member?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: 'var(--accent)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: '0.5rem' }}
          >
            {isLogin ? 'Create Account' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}
