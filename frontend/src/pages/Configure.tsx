import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const companies = [
  { 
    id: "amazon", 
    name: "Amazon", 
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.72 15.11c-2.02 1.42-4.88 2.22-7.53 2.22-3.83 0-7.23-1.63-9.52-4.22-.19-.21-.02-.49.23-.38.83.36 1.74.65 2.7.85 3.32.72 6.84.45 9.8-.75 2.1-.85 3.96-2.18 5.48-3.95.21-.24.57-.11.57.19 0 1.94-.73 4.14-1.73 6.04z"/><path d="M17.51 14.25c-.32-.42-1.01-1.48-.82-1.85.2-.37 1.58-.28 2.02.04.44.32.32 1.48-.11 1.99-.33.39-.78.58-1.09.22z"/>
      </svg>
    ) 
  },
  { 
    id: "google", 
    name: "Google", 
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
      </svg>
    ) 
  },
  { 
    id: "meta", 
    name: "Meta", 
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#0668E1">
        <path d="M22.5 12c0-2.1-1.5-4-3.5-4-1.2 0-2.4.7-3.3 1.8L12 14.2l-3.7-4.4C7.4 8.7 6.2 8 5 8 3 8 1.5 9.9 1.5 12c0 2.1 1.5 4 3.5 4 1.2 0 2.4-.7 3.3-1.8l3.7-4.4 3.7 4.4c.9 1.1 2.1 1.8 3.3 1.8 2 0 3.5-1.9 3.5-4z"/>
      </svg>
    ) 
  },
];

const roles = [
  { 
    id: "sde", 
    name: "Software Engineer", 
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ) 
  },
  { 
    id: "frontend", 
    name: "Frontend Engineer", 
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ) 
  },
];

const protocols = [
  { 
    id: "technical", 
    name: "Technical Interview", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    ) 
  },
  { 
    id: "hr", 
    name: "HR Interview", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ) 
  },
];

export default function Configure() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (selectedCompany && selectedRole && selectedProtocol) {
      navigate(`/interview?company=${selectedCompany}&role=${selectedRole}&protocol=${selectedProtocol}`);
    }
  };

  return (
    <div className="premium-container page-padding calibration-wrapper">
      <div className="neural-mesh"></div>
      <div className="bg-glow"></div>
      
      <div className="calibration-header reveal">
        <h1 className="hero-title">Select your <span className="text-gradient">Target Parameters</span></h1>
        <p className="hero-subtitle">Calibrate the simulation environment to begin your session.</p>
      </div>

      <div className="calibration-grid reveal" style={{ animationDelay: '0.2s' }}>
        <div className="glass-card config-panel">
          
          <div className="config-section">
            <h3 className="section-label">Target Organization</h3>
            <div className="selection-grid">
              {companies.map(c => (
                <button 
                  key={c.id} 
                  className={`selection-card ${selectedCompany === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedCompany(c.id)}
                >
                  <div className="card-indicator"></div>
                  <div className="card-icon" style={{ transform: 'scale(1.1)', color: selectedCompany === c.id ? 'white' : 'var(--primary-muted)', transition: 'var(--transition)', display: 'flex' }}>
                    {c.logo}
                  </div>
                  <span className="card-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <h3 className="section-label">Operational Role</h3>
            <div className="selection-grid">
              {roles.map(r => (
                <button 
                  key={r.id} 
                  className={`selection-card ${selectedRole === r.id ? 'active' : ''}`}
                  onClick={() => setSelectedRole(r.id)}
                >
                  <div className="card-indicator"></div>
                  <div className="card-icon" style={{ color: selectedRole === r.id ? 'var(--accent)' : 'var(--primary-muted)', transition: 'var(--transition)', display: 'flex' }}>
                    {r.icon}
                  </div>
                  <span className="card-name">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <h3 className="section-label">Interview Protocol</h3>
            <div className="selection-grid">
              {protocols.map(p => (
                <button 
                  key={p.id} 
                  className={`selection-card ${selectedProtocol === p.id ? 'active' : ''}`}
                  onClick={() => setSelectedProtocol(p.id)}
                >
                  <div className="card-indicator"></div>
                  <div className="card-icon" style={{ color: selectedProtocol === p.id ? 'var(--accent)' : 'var(--primary-muted)', transition: 'var(--transition)', display: 'flex' }}>
                    {p.icon}
                  </div>
                  <span className="card-name">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="config-footer">
            <button 
              className="btn-primary start-btn" 
              disabled={!selectedCompany || !selectedRole || !selectedProtocol} 
              onClick={handleStart}
            >
              <span>Initialize Simulation</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .calibration-wrapper {
          position: relative;
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .calibration-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .hero-title {
          font-size: 2.8rem;
          margin-bottom: 0.5rem;
        }

        .hero-subtitle {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .config-panel {
          width: 100%;
          max-width: 850px;
          padding: 2.5rem;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
          border-radius: 2rem;
        }

        .config-section {
          margin-bottom: 2rem;
        }

        .section-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--primary-muted);
          margin-bottom: 1.25rem;
          text-align: center;
        }

        .selection-grid {
          display: flex;
          gap: 1rem;
          justify-content: center;
          width: 100%;
        }

        .selection-card {
          position: relative;
          flex: 1;
          max-width: 260px;
          padding: 0.8rem 1.2rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 1rem;
          color: white;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .selection-card:hover {
          background: rgba(255,184,0,0.02);
          border-color: rgba(255,184,0,0.3);
          transform: translateY(-3px);
        }

        .selection-card.active {
          background: rgba(255,184,0,0.05);
          border-color: var(--accent);
          box-shadow: var(--neon-glow);
        }

        .card-indicator {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1px solid var(--border);
          transition: var(--transition);
        }

        .selection-card.active .card-indicator {
          background: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 10px var(--accent);
        }

        .card-name {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .config-footer {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
        }

        .start-btn {
          width: 100%;
          max-width: 350px;
          padding: 1.2rem;
          font-size: 1rem;
          justify-content: center;
        }

        .start-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
