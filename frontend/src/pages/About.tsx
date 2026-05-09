import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="premium-container page-padding">
      <div className="neural-mesh"></div>
      <div className="bg-glow"></div>
      
      <div className="glass-card" style={{ padding: '4rem', marginTop: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>About InterviewMitra</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
          <p>
            InterviewMitra is the world's most advanced AI-powered interview simulation platform. 
            Born out of the need for high-fidelity professional preparation, we bridge the gap between candidate 
            potential and real-world hiring standards.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem' }}>
            <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Our Mission</h3>
              <p>
                To democratize high-end career coaching using cutting-edge multi-modal AI, 
                ensuring every professional has the tools to succeed in the most competitive environments.
              </p>
            </div>
            <div className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>Our Technology</h3>
              <p>
                We utilize high-speed inference engines and custom-trained neural networks to audit 
                everything from technical logic to non-verbal cues like attire and gaze stability.
              </p>
            </div>
          </div>

          <h2 style={{ color: 'white', marginTop: '3rem' }}>The Team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ padding: '1.5rem', borderLeft: '3px solid var(--accent)' }}>
              <h4 style={{ color: 'white' }}>Dheer</h4>
              <p style={{ fontSize: '0.9rem' }}>ML & Backend Architecture</p>
            </div>
            <div style={{ padding: '1.5rem', borderLeft: '3px solid #6366f1' }}>
              <h4 style={{ color: 'white' }}>Kunal</h4>
              <p style={{ fontSize: '0.9rem' }}>Full Stack Web Development</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '4rem' }}>
          <Link to="/" className="btn-primary" style={{ padding: '1rem 3rem', textDecoration: 'none' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
