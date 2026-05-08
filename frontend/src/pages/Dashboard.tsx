import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const resources = [
  {
    id: "technical",
    title: "Technical Preparation",
    desc: "Master system design, algorithms, and domain-specific knowledge.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </svg>
    ),
    tags: ["DSA", "System Design", "Backend"]
  },
  {
    id: "behavioral",
    title: "General & Behavioral",
    desc: "Refine your storytelling using STAR method and leadership principles.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    tags: ["Soft Skills", "STAR Method", "Culture Fit"]
  },
  {
    id: "cv",
    title: "CV & Resume Optimization",
    desc: "Learn how to structure your experience for maximum impact.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
    tags: ["Formatting", "Keywords", "ATS Friendly"]
  }
];


export default function Dashboard() {
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsImprovements, setAtsImprovements] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, focus: 0, rank: "Neutral" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchStats = async () => {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user?.id) return;
      try {
        const res = await fetch(`http://localhost:5001/api/reports/user/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const total = data.length;
            const avg = Math.round(data.reduce((acc: any, r: any) => acc + (r.overallScore || 0), 0) / total);
            const focus = Math.round(data.reduce((acc: any, r: any) => acc + (r.postureScore || 0), 0) / total);
            const rank = avg > 90 ? "Elite" : avg > 75 ? "Advanced" : "Standard";
            setStats({ total, avgScore: avg, focus, rank });
            return;
          }
        }
        
        // FALLBACK: If no backend data, check localStorage for current session stats
        const localResults = JSON.parse(localStorage.getItem("interview_results") || "[]");
        if (localResults.length > 0) {
          const avgTech = Math.round(localResults.reduce((acc: any, r: any) => acc + (r.evaluation?.technical_score || r.evaluation?.score || 0), 0) / localResults.length);
          const avgInt = Math.round(localResults.reduce((acc: any, r: any) => acc + (r.evaluation?.integrity_score || 85), 0) / localResults.length);
          const rank = avgTech > 90 ? "Elite" : avgTech > 75 ? "Advanced" : "Standard";
          setStats({ total: 1, avgScore: avgTech, focus: avgInt, rank });
        }
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    fetchStats();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        console.log("DEBUG: Sending CV to backend...");
        const res = await fetch('http://localhost:8000/analyze-cv', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          console.log("DEBUG: Received analysis data:", data);
          if (data.error) {
            setAtsScore(0);
            setAtsImprovements([`Error: ${data.error}`, "Please check file format (PDF/DOCX)"]);
          } else {
            setAtsScore(data.score);
            setAtsImprovements(data.improvements || []);
          }
        } else {
          console.error("Server returned error:", res.status);
          setAtsImprovements(["Connection to analysis server failed."]);
        }
      } catch (err) {
        console.error("CV Analysis error:", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.name || "Professional";

  return (
    <div className="premium-container page-padding dashboard-wrapper">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      />
      {/* Dynamic Background Elements */}
      <div className="neural-mesh"></div>
      <div className="bg-glow"></div>
      
      <header className="dashboard-header reveal">
        <div className="header-content">
          <h1 className="hero-title">
            Interview <span className="text-gradient">Performance Matrix</span>
          </h1>
          <p className="hero-subtitle">
            Welcome, <span className="highlight">{userName}</span>. Your readiness parameters are optimized for today's sessions.
          </p>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Primary Intelligence Section */}
        <div className="intelligence-grid">
          
          {/* Mission Status Center */}
          <section className="mission-module glass-card reveal" style={{ animationDelay: '0.2s', padding: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 className="module-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Mission Status</h2>
                <p className="module-subtitle">Real-time operational metrics</p>
              </div>
              <Link to="/configure" className="btn-primary" style={{ padding: '0.8rem 2rem', textDecoration: 'none' }}>
                Initiate New Session
              </Link>
            </div>
            <div className="mission-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              <div className="mission-item">
                <div className="label">Total Sessions</div>
                <div className="value">{stats.total}</div>
              </div>
              <div className="mission-item">
                <div className="label">Success Rate</div>
                <div className="value">{stats.avgScore}%</div>
              </div>
              <div className="mission-item">
                <div className="label">Neural Rank</div>
                <div className="value">{stats.rank}</div>
              </div>
              <div className="mission-item">
                <div className="label">Focus Score</div>
                <div className="value">{stats.focus}</div>
              </div>
            </div>
          </section>

          {/* Resources Mosaic */}
          <section className="resources-mosaic">
            <div className="section-header reveal">
              <h2>Preparation Resources</h2>
            </div>
            <div className="mosaic-grid">
              {resources.map((res, i) => (
                <Link to={`/resource/${res.id}`} key={i} className="mosaic-card glass-card reveal" style={{ animationDelay: `${0.3 + i * 0.1}s`, textDecoration: 'none', color: 'inherit' }}>
                  <div className="card-top">
                    <div className="mosaic-icon">{res.icon}</div>
                    <div className="mosaic-tag">{res.tags[0]}</div>
                  </div>
                  <h3>{res.title}</h3>
                  <p>{res.desc}</p>
                  <div className="card-footer">
                    <span className="launch-text">Access Module</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Tactical Sidebar */}
        <aside className="tactical-sidebar reveal" style={{ animationDelay: '0.5s' }}>
          
          {/* ATS Tactical Core */}
          <section className="sidebar-module ats-module glass-card reveal" style={{ padding: '2rem' }}>
            <h4 style={{ marginBottom: '1.5rem' }}>ATS Scoring</h4>
            <div className="ats-core-layout vertical" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="upload-zone" onClick={handleUploadClick}>
                <div className="icon-wrapper" style={{ width: '40px', height: '40px', marginBottom: '1rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <h5 style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{isUploading ? 'Analyzing...' : 'Upload CV'}</h5>
                <p style={{ fontSize: '0.7rem', color: 'var(--primary-muted)' }}>PDF/DOCX source</p>
              </div>

              {atsScore && (
                <div className="ats-results-view reveal-up" style={{ textAlign: 'center' }}>
                  <div className="score-circle-wrapper" style={{ width: '100px', height: '100px', marginBottom: '1.5rem' }}>
                    <svg viewBox="0 0 100 100" className="score-svg">
                      <circle cx="50" cy="50" r="45" className="track" />
                      <circle cx="50" cy="50" r="45" className="progress" style={{ strokeDashoffset: 283 - (283 * atsScore) / 100 }} />
                    </svg>
                    <div className="score-value" style={{ fontSize: '1.5rem' }}>{atsScore}%</div>
                  </div>
                  <div className="vector-list" style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Improvements (AI Analysis)</div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {atsImprovements.map((imp, idx) => (
                        <li key={idx} style={{ fontSize: '0.75rem', color: 'var(--primary-muted)', lineHeight: '1.4' }}>
                          <span style={{ color: 'var(--accent)', marginRight: '0.5rem' }}>▲</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>


        </aside>
      </div>

      <style>{`
        .premium-container {
          background: #f8fafc;
          color: #1e293b;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .dashboard-wrapper::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('../../../brain/79c043ce-2da4-4244-8eca-b950d18dc9e8/light_premium_tech_background_1778220671065.png');
          background-size: cover;
          background-position: center;
          opacity: 0.8;
          z-index: -2;
          pointer-events: none;
        }

        .neural-mesh {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: -1;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .hero-title {
          font-size: 4.5rem;
          line-height: 0.9;
          margin-bottom: 1.5rem;
          color: #0f172a;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: #475569;
          max-width: 600px;
          margin: 0 auto;
        }

        .highlight {
          color: var(--accent);
          font-weight: 700;
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 3rem;
          align-items: start;
        }

        .intelligence-grid {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        /* Glass Cards for Light Mode */
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
          color: #1e293b;
        }

        .mosaic-card:hover {
          transform: translateY(-8px);
          border-color: var(--accent);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }

        .module-title {
          color: #0f172a;
        }

        .module-subtitle {
          color: #64748b;
        }

        .mission-item {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .mission-item .label {
          color: #64748b;
        }

        .mission-item .value {
          color: #0f172a;
        }

        .mosaic-card p {
          color: #64748b;
        }

        .mosaic-tag {
          background: rgba(0,0,0,0.03);
          color: #64748b;
        }

        .ats-module {
          background: rgba(255, 255, 255, 0.8);
        }

        .upload-zone {
          background: rgba(0,0,0,0.01);
          border: 1px dashed rgba(0,0,0,0.1);
        }

        .upload-zone:hover {
          background: rgba(99, 102, 241, 0.03);
          border-color: var(--accent);
        }

        .score-svg .track {
          stroke: rgba(0,0,0,0.05);
        }

        .progress-entry .entry-header {
          color: #1e293b;
        }

        .bar-bg {
          background: rgba(0,0,0,0.05);
        }

        @media (max-width: 1400px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 3.5rem;
          }
        }
      `}</style>
    </div>
  );
}
