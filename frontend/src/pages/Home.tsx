import { Link } from 'react-router-dom'

const companies = [
  { 
    id: "amazon", 
    name: "Amazon", 
    logo: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.93 17.13c-2.68 2.02-6.53 3.03-9.52 3.03-4.14 0-7.85-2.03-10.41-5.22.19-.11.4-.22.62-.31 2.37-.96 5.37-1.48 8.41-1.48 3.04 0 6.04.52 8.41 1.48.22.09.43.2.62.31-2.56 3.19-6.27 5.22-10.41 5.22-.64 0-1.28-.05-1.92-.15.35-.11.68-.24 1-.39 2.1-.96 4.34-2.51 5.61-4.48.4-.62.61-1.31.61-2.01 0-.49-.11-.96-.32-1.39-.21-.43-.53-.8-.92-1.07-.39-.27-.85-.45-1.35-.51-.5-.06-1.03-.02-1.57.11-2.31.54-4.22 2.18-5.38 4.62-.25.53-.41 1.09-.49 1.67-.08.58-.06 1.17.06 1.75.12.58.33 1.14.63 1.66.3.52.68.99 1.13 1.4.15.14.32.27.5.39.18.12.37.23.57.32.2.09.41.16.63.21.22.05.45.08.68.08 4.14 0 7.85-2.03 10.41-5.22z"/>
      </svg>
    ), 
    desc: "Leadership" 
  },
  { 
    id: "google", 
    name: "Google", 
    logo: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
      </svg>
    ), 
    desc: "Innovation" 
  },
  { 
    id: "meta", 
    name: "Meta", 
    logo: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.142 5.5c-1.393 0-2.43.375-3.328 1.405L12 8.016l-.814-1.111C10.288 5.875 9.25 5.5 7.858 5.5 5.093 5.5 3 7.813 3 10.741c0 2.441 1.547 4.241 3.197 5.759.516.474 1.049.92 1.583 1.353.473.383.946.766 1.341 1.148.22.214.417.433.593.654.122.15.226.305.313.46.043.078.08.156.113.235.033.078.06.158.083.24.02.073.037.146.05.22.013.074.022.148.027.224h1.4c.005-.076.014-.15.027-.224.013-.074.03-.147.05-.22.023-.082.05-.162.083-.24.033-.079.07-.157.113-.235.087-.155.191-.31.313-.46.176-.221.373-.44.593-.654.395-.382.868-.765 1.341-1.148.534-.433 1.067-.879 1.583-1.353 1.65-1.518 3.197-3.318 3.197-5.759 0-2.928-2.093-5.241-4.858-5.241z" fill="#0668E1"/>
      </svg>
    ), 
    desc: "Impact" 
  },
];

const roles = [
  { 
    id: "sde", 
    name: "Software Engineer", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ) 
  },
  { 
    id: "frontend", 
    name: "Frontend Engineer", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    ) 
  },
  { 
    id: "data", 
    name: "Data Analyst", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ) 
  },
];

export default function Home() {
  return (
    <div className="home-wrapper">
      {/* Section 1: Hero */}
      <section className="hero">
        <div className="max-width hero-content">
          <h1 className="hero-h1 reveal">
            Practice for your <br /> <span className="text-accent">final round.</span>
          </h1>
          <p className="hero-p reveal" style={{ animationDelay: '0.1s' }}>
            Precision-engineered mock sessions that analyze your logic, 
            delivery, and technical depth against real industry standards.
          </p>
          <div className="reveal" style={{ animationDelay: '0.2s' }}>
            <Link to="/configure" className="btn-main">
              Start Session
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Bento Grid */}
      <section id="standards" className="section">
        <div className="max-width">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>The <span className="text-accent">Standard.</span></h2>
          <p style={{ color: 'var(--primary-muted)', marginBottom: '3rem', fontSize: '0.95rem' }}>Multi-layered analysis designed to bridge the gap between preparation and performance.</p>
          
          <div className="bento-grid">
            <div className="bento-item large reveal">
              <span className="bento-tag">Biometrics</span>
              <h3 className="bento-title">Signal Processing</h3>
              <p className="bento-desc">Analysis of micro-expressions and posture to help you maintain a professional presence throughout the loop.</p>
              <img src="/src/assets/vision.png" className="bento-img" style={{ opacity: 0.1, filter: 'grayscale(1)' }} />
            </div>
            
            <div className="bento-item reveal" style={{ animationDelay: '0.1s' }}>
              <span className="bento-tag">Acoustics</span>
              <h3 className="bento-title">Speech Cadence</h3>
              <p className="bento-desc" style={{ fontSize: '0.9rem' }}>Evaluation of tone, delivery speed, and communication efficiency.</p>
            </div>
            
            <div className="bento-item reveal" style={{ animationDelay: '0.2s' }}>
              <span className="bento-tag">Attention</span>
              <h3 className="bento-title">Engagement Tracking</h3>
              <p className="bento-desc" style={{ fontSize: '0.9rem' }}>Ensuring consistent focus and eye-level engagement with the panel.</p>
            </div>
            
            <div className="bento-item wide reveal" style={{ animationDelay: '0.3s' }}>
              <span className="bento-tag">Feedback</span>
              <h3 className="bento-title">Technical Audits</h3>
              <p className="bento-desc">Comprehensive reports identifying logic gaps and areas for architectural refinement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Ecosystem Preview (Compact) */}
      <section id="ecosystem" className="section" style={{ 
        padding: '6rem 0', 
        backgroundImage: 'linear-gradient(rgba(5, 5, 5, 0.8), rgba(5, 5, 5, 0.8)), url("/src/assets/ecosystem_bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="max-width">
          <div style={{ background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '4rem', borderRadius: '3rem', display: 'flex', gap: '5rem', alignItems: 'center' }}>
            <div style={{ flex: '0 0 320px' }}>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: 1.1 }}>Global <br/><span className="text-accent">Tracks.</span></h2>
              <p style={{ color: 'var(--primary-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Specialized interview modules for {companies.length} industry leaders and {roles.length} core engineering roles.
              </p>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                {companies.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', border: '1px solid var(--border)' }}>
                    <div style={{ transform: 'scale(0.7)', height: '24px', display: 'flex', alignItems: 'center' }}>{c.logo}</div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{c.name}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                {roles.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--accent)', transform: 'scale(0.7)', height: '20px', display: 'flex', alignItems: 'center' }}>{r.icon}</div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{r.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Mechanism */}
      <section id="mechanism" className="section" style={{ background: 'rgba(255,255,255,0.005)' }}>
        <div className="max-width">
          <div className="mechanism-grid">
            <div className="reveal">
              <h2 style={{ fontSize: '3rem', marginBottom: '2rem', lineHeight: 1.1 }}>Behind the <span className="text-accent">Session.</span></h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--glass)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Biometric Processing</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--primary-muted)' }}>High-fidelity tracking of non-verbal cues processed locally for maximum privacy and performance.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--glass)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Tier-1 Question Sets</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--primary-muted)' }}>Questions curated from real-world interview loops, updated to match current industry trends.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--glass)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Rubric-Based Evaluation</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--primary-muted)' }}>Every response is audited against a rigorous 5-point success criteria established by hiring managers.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="reveal" style={{ animationDelay: '0.3s' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '-20px', background: 'var(--accent)', filter: 'blur(100px)', opacity: 0.05 }}></div>
                <img src="/src/assets/mechanism.png" style={{ width: '100%', borderRadius: '2rem', border: '1px solid var(--border)', position: 'relative', filter: 'grayscale(0.5)' }} alt="Mechanism" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
