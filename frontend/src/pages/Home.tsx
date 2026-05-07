import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const companies = [
  { id: "amazon", name: "Amazon", logo: "📦" },
  { id: "microsoft", name: "Microsoft", logo: "🪟" },
  { id: "google", name: "Google", logo: "🔍" },
  { id: "meta", name: "Meta", logo: "♾️" },
];

const roles = [
  { id: "sde", name: "Software Engineer", icon: "💻" },
  { id: "data", name: "Data Analyst", icon: "📊" },
  { id: "android", name: "Android Developer", icon: "🤖" },
];

export default function Home() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (selectedCompany && selectedRole) {
      navigate(`/interview?company=${selectedCompany}&role=${selectedRole}`);
    }
  };

  return (
    <div className="home-wrapper">
      {/* Hero */}
      <section className="hero">
        <div className="max-width">
          <h1 className="hero-h1 reveal">
            Practice interviews <br /> with <span className="text-accent">precision.</span>
          </h1>
          <p className="hero-p reveal" style={{ animationDelay: '0.1s' }}>
            Elevate your performance with real-time feedback on your technical accuracy, 
            communication style, and executive presence.
          </p>
          
          <div className="card-grid reveal" style={{ animationDelay: '0.2s' }}>
            <div className="card">
              <h3 className="card-title">Technical Depth</h3>
              <p className="card-text">Verification of your problem-solving approach and architectural decision-making.</p>
            </div>
            <div className="card">
              <h3 className="card-title">Behavioral Signals</h3>
              <p className="card-text">Analysis of your posture, eye contact, and engagement during live sessions.</p>
            </div>
            <div className="card">
              <h3 className="card-title">Direct Feedback</h3>
              <p className="card-text">Comprehensive performance reports with actionable insights to improve instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Selection */}
      <section id="configure" className="config-wrap">
        <div className="max-width">
          <div className="config-container reveal">
            <h2 style={{ fontSize: '2rem', marginBottom: '3rem' }}>Select your path</h2>

            <div style={{ marginBottom: '3rem' }}>
              <h4 style={{ color: 'var(--primary-muted)', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Company</h4>
              <div className="item-grid">
                {companies.map(c => (
                  <div 
                    key={c.id} 
                    className={`item-button ${selectedCompany === c.id ? 'active' : ''}`}
                    onClick={() => setSelectedCompany(c.id)}
                  >
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '4rem' }}>
              <h4 style={{ color: 'var(--primary-muted)', marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Role</h4>
              <div className="item-grid">
                {roles.map(r => (
                  <div 
                    key={r.id} 
                    className={`item-button ${selectedRole === r.id ? 'active' : ''}`}
                    onClick={() => setSelectedRole(r.id)}
                  >
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              className="btn-main" 
              disabled={!selectedCompany || !selectedRole}
              onClick={handleStart}
            >
              Start Session
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
