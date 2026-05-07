import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-mesh">
      {/* Hero */}
      <section className="hero container-premium">
        <div className="hero-content animate-reveal">
          <div className="hero-badge">Next Gen Interview Prep</div>
          <h1 className="hero-title">
            The standard for <br />
            <span className="text-gradient">high-performance</span> prep.
          </h1>
          <p className="hero-subtitle">
            Leverage industry-leading AI to simulate, analyze, and master the technical interview experience.
          </p>
          <div className="hero-ctas">
            <button onClick={() => navigate('/interview')} className="btn btn-primary">
              Start practicing
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn btn-secondary">Request demo</button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-premium section animate-reveal" style={{ animationDelay: '0.2s' }}>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">94%</div>
            <div className="stat-label">Placement Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">500k+</div>
            <div className="stat-label">Simulations</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">3.2x</div>
            <div className="stat-label">Confidence Lift</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">0ms</div>
            <div className="stat-label">Latency</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="about" className="container-premium section">
        <div style={{ marginBottom: '6rem' }}>
          <h2 className="section-title">Built for the <br />modern candidate.</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', marginTop: '1.5rem' }}>
            A comprehensive suite of tools designed to give you a competitive edge in technical and behavioral assessments.
          </p>
        </div>
        
        <div className="feature-grid">
          <div className="card-premium">
            <div className="card-icon">🎙️</div>
            <h3 style={{ marginBottom: '1rem' }}>Voice Intelligence</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Real-time analysis of filler words, tone, and technical precision.</p>
          </div>
          <div className="card-premium">
            <div className="card-icon">👁️</div>
            <h3 style={{ marginBottom: '1rem' }}>Visual Fidelity</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Non-verbal communication tracking including eye contact and posture.</p>
          </div>
          <div className="card-premium">
            <div className="card-icon">⚡</div>
            <h3 style={{ marginBottom: '1rem' }}>Instant Insights</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Detailed performance metrics generated immediately after each session.</p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="how-it-works" className="container-premium section">
        <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
          <h2 className="section-title">Your path to mastery.</h2>
        </div>
        
        <div className="timeline-container">
          <div className="timeline-step animate-reveal">
            <div className="step-marker">01</div>
            <div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Configure Environment</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px' }}>
                Select from specialized tracks including Systems Design, Data Science, and Frontend Engineering.
              </p>
            </div>
          </div>
          <div className="timeline-step animate-reveal" style={{ animationDelay: '0.1s' }}>
            <div className="step-marker">02</div>
            <div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Execute Session</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px' }}>
                Participate in a high-fidelity simulation designed to push your technical boundaries.
              </p>
            </div>
          </div>
          <div className="timeline-step animate-reveal" style={{ animationDelay: '0.2s' }}>
            <div className="step-marker">03</div>
            <div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Receive Analytics</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '500px' }}>
                Analyze deep metrics on clarity, relevance, and communication efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="container-premium section">
        <div className="contact-layout">
          <div>
            <h2 className="section-title">Start the <br />conversation.</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '2rem', maxWidth: '400px' }}>
              For custom enterprise solutions or support inquiries, reach out to our team.
            </p>
          </div>
          
          <form>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <input type="text" className="input-premium" placeholder="Name" />
              <input type="email" className="input-premium" placeholder="Email" />
            </div>
            <input type="text" className="input-premium" placeholder="Subject" style={{ marginTop: '2rem' }} />
            <textarea className="input-premium" placeholder="Message" rows={4} style={{ marginTop: '2rem' }}></textarea>
            <button className="btn btn-primary" style={{ marginTop: '4rem', width: '100%', justifyContent: 'center' }}>
              Send message
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
