import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const companies = [
  { id: "amazon", name: "Amazon", logo: "AMZN" },
  { id: "google", name: "Google", logo: "GOOG" },
  { id: "apple", name: "Apple", logo: "AAPL" },
  { id: "meta", name: "Meta", logo: "META" },
  { id: "netflix", name: "Netflix", logo: "NFLX" },
];

const roles = [
  { id: "sde", name: "Software Engineer" },
  { id: "frontend", name: "Frontend Engineer" },
  { id: "data", name: "Data Analyst" },
  { id: "android", name: "Android Developer" },
];

export default function Configure() {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (selectedCompany && selectedRole) {
      navigate(`/interview?company=${selectedCompany}&role=${selectedRole}`);
    }
  };

  return (
    <div className="section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="max-width">
        <div className="config-container" style={{ background: 'var(--surface-color)', border: '1px solid var(--border)', padding: '5rem', borderRadius: '3rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>Configure Session</h2>
          <p style={{ textAlign: 'center', color: 'var(--primary-muted)', marginBottom: '4rem' }}>Finalize your target environment to begin.</p>
          
          <div style={{ marginBottom: '4rem' }}>
            <h4 style={{ color: 'var(--primary-muted)', marginBottom: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Select Company</h4>
            <div className="item-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', border: 'none', background: 'none' }}>
              {companies.map(c => (
                <button 
                  key={c.id} 
                  style={{ padding: '1.5rem 2.5rem', borderRadius: '1rem', border: '1px solid var(--border)', background: selectedCompany === c.id ? 'var(--accent)' : 'var(--glass)', color: selectedCompany === c.id ? 'black' : 'white', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => setSelectedCompany(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '6rem' }}>
            <h4 style={{ color: 'var(--primary-muted)', marginBottom: '1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Select Designation</h4>
            <div className="item-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', border: 'none', background: 'none' }}>
              {roles.map(r => (
                <button 
                  key={r.id} 
                  style={{ padding: '1.5rem 2.5rem', borderRadius: '1rem', border: '1px solid var(--border)', background: selectedRole === r.id ? 'var(--accent)' : 'var(--glass)', color: selectedRole === r.id ? 'black' : 'white', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => setSelectedRole(r.id)}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn-main" 
              style={{ width: '100%', maxWidth: '450px', justifyContent: 'center', background: 'var(--accent)', color: 'black' }} 
              disabled={!selectedCompany || !selectedRole} 
              onClick={handleStart}
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
