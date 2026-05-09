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
        const res = await fetch(`http://localhost:5001/api/reports/${user.id}`);
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
            setAtsScore(null); // Reset score on error
            setAtsImprovements([data.error]);
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
        .dashboard-wrapper {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .dashboard-wrapper::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('../../../brain/79c043ce-2da4-4244-8eca-b950d18dc9e8/nano_banana_background_1778220464103.png');
          background-size: cover;
          background-position: center;
          opacity: 0.7;
          filter: brightness(1.3);
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
            radial-gradient(circle at 2px 2px, rgba(255,184,0,0.03) 1px, transparent 0);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: -1;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1.25rem;
          background: rgba(255,184,0,0.05);
          border: 1px solid rgba(255,184,0,0.1);
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--accent);
          margin-bottom: 2rem;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--accent);
          animation: pulse-glow 2s infinite;
        }

        @keyframes pulse-glow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }

        .hero-title {
          font-size: 4.5rem;
          line-height: 0.9;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--primary-muted);
          max-width: 600px;
          margin: 0 auto;
        }

        .highlight {
          color: white;
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

        /* ATS Module */
        .ats-module {
          padding: 4rem;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
          border: 1px solid var(--border);
        }

        .module-header {
          margin-bottom: 3rem;
        }

        .module-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .module-subtitle {
          color: var(--primary-muted);
          font-size: 0.9rem;
        }

        .ats-core-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          transition: all 0.5s ease;
        }

        .ats-core-layout.has-results {
          grid-template-columns: 1fr 1fr;
        }

        .upload-zone {
          position: relative;
          padding: 2.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 1.5rem;
          text-align: center;
          cursor: pointer;
          background: rgba(255,255,255,0.01);
          transition: var(--transition);
        }

        .upload-zone:hover {
          background: rgba(255,184,0,0.03);
          border: 1px solid var(--accent);
          box-shadow: 0 0 20px rgba(255,184,0,0.1);
        }

        .icon-wrapper {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }

        .ats-results-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          justify-content: center;
        }

        .score-circle-wrapper {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto;
        }

        .score-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .score-svg circle {
          fill: none;
          stroke-width: 8;
          stroke-linecap: round;
        }

        .score-svg .track {
          stroke: var(--border);
        }

        .score-svg .progress {
          stroke: var(--accent);
          stroke-dasharray: 283;
          transition: stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .score-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          font-weight: 800;
          font-family: var(--font-display);
        }

        .vector-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .vector-list li {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: var(--primary-muted);
        }

        .vector-list li span {
          color: var(--accent);
          font-weight: 800;
        }

        /* Mosaic Grid */
        .mosaic-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .mosaic-card {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: var(--transition);
        }

        .mosaic-card:hover {
          transform: translateY(-8px);
          border-color: var(--accent);
          background: rgba(255,184,0,0.02);
        }

        .mosaic-card h3 {
          font-size: 1.25rem;
          line-height: 1.2;
        }

        .mosaic-card p {
          font-size: 0.85rem;
          color: var(--primary-muted);
          line-height: 1.6;
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .mosaic-icon {
          color: var(--accent);
        }

        .mosaic-tag {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.25rem 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--primary-muted);
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent);
          opacity: 0;
          transform: translateX(-10px);
          transition: var(--transition);
        }

        .mosaic-card:hover .card-footer {
          opacity: 1;
          transform: translateX(0);
        }

        /* Tactical Sidebar */
        .tactical-sidebar {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .sidebar-module {
          padding: 2.5rem;
        }

        .sidebar-module h4 {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--primary-muted);
          margin-bottom: 2rem;
        }

        .mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .mission-item {
          padding: 1.25rem;
          background: rgba(255,255,255,0.02);
          border-radius: 1rem;
          border: 1px solid var(--border);
        }

        .mission-item .label {
          font-size: 0.65rem;
          color: var(--primary-muted);
          margin-bottom: 0.5rem;
        }

        .mission-item .value {
          font-size: 1.5rem;
          font-weight: 800;
        }

        .tactical-btn {
          width: 100%;
          padding: 1.25rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
          font-size: 0.9rem;
        }

        .eval-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .eval-item {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 1rem;
          transition: var(--transition);
          cursor: pointer;
          border: 1px solid transparent;
        }

        .eval-item:hover {
          background: rgba(255,255,255,0.02);
          border-color: var(--border);
        }

        .eval-name {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .eval-meta {
          font-size: 0.7rem;
          color: var(--primary-muted);
        }

        .eval-action {
          color: var(--accent);
          opacity: 0;
          transform: translateX(-5px);
          transition: var(--transition);
        }

        .eval-item:hover .eval-action {
          opacity: 1;
          transform: translateX(0);
        }

        .progress-stack {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .progress-entry .entry-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 0.75rem;
        }

        .bar-bg {
          height: 4px;
          background: var(--border);
          border-radius: 10px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 10px;
        }

        .reveal-up {
          animation: reveal-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes reveal-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1400px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }
          .tactical-sidebar {
            order: -1;
          }
          .hero-title {
            font-size: 3.5rem;
          }
        }

        @media (max-width: 900px) {
          .mosaic-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
