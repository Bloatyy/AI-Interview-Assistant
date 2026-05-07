import { Link } from 'react-router-dom'

export default function Report() {
  const report = {
    overallScore: 82,
    sections: [
      { name: "Technical Accuracy", score: 85 },
      { name: "Clarity & Communication", score: 78 },
      { name: "Behavioral Alignment", score: 88 },
      { name: "Confidence", score: 75 },
    ],
    strengths: [
      "Excellent use of leadership principles in behavioral answers.",
      "Strong technical foundation in system design concepts.",
      "Maintained good eye contact throughout the session.",
    ],
    weaknesses: [
      "Slightly over-explaining simple concepts (Technical Section).",
      "Minor pauses when answering rapid-fire questions.",
      "Background noise detected in question 3.",
    ],
    suggestions: [
      "Try to use the STAR method more consistently for behavioral questions.",
      "Keep technical answers concise; focus on the high-level architecture first.",
    ]
  };

  return (
    <div className="premium-container page-padding">
      <div className="report-header">
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Interview <span className="text-gradient">Performance Report</span></h1>
        <p style={{ color: 'var(--text-secondary)' }}>Generated on May 7, 2026 • Amazon | Software Engineer</p>
      </div>

      <div className="score-grid">
        <div className="glass-card score-circle-container">
          <div className="circle-wrapper">
            <svg width="200" height="200" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-color)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary-color)" strokeWidth="8" 
                strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * report.overallScore) / 100}
                strokeLinecap="round" transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="circle-text">
              <span style={{ fontSize: '3rem', fontWeight: 800 }}>{report.overallScore}</span>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overall</div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '2rem' }}>Section Breakdown</h3>
          <div className="section-list">
            {report.sections.map((section) => (
              <div key={section.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>{section.name}</span>
                  <span style={{ fontWeight: 600 }}>{section.score}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${section.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: '#10b981' }}>Strengths</h3>
          <ul className="feedback-list">
            {report.strengths.map((s, i) => <li key={i} style={{ color: 'var(--text-secondary)' }}>{s}</li>)}
          </ul>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>Weaknesses</h3>
          <ul className="feedback-list">
            {report.weaknesses.map((w, i) => <li key={i} style={{ color: 'var(--text-secondary)' }}>{w}</li>)}
          </ul>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Suggested Improvements</h3>
        <ul className="feedback-list">
          {report.suggestions.map((s, i) => <li key={i} style={{ color: 'var(--text-secondary)' }}>{s}</li>)}
        </ul>
      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link to="/" className="btn-primary" style={{ padding: '1rem 3rem' }}>
          Practice Again
        </Link>
      </div>
    </div>
  );
}
