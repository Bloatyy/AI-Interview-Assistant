import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="premium-container page-padding">
      <div className="neural-mesh"></div>
      
      <div className="glass-card" style={{ padding: '4rem', marginTop: '4rem', maxWidth: '900px', margin: '4rem auto' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Terms of Service</h1>
        
        <div className="terms-content" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>1. Acceptance of Terms</h3>
            <p>
              By accessing InterviewMitra, you agree to be bound by these high-fidelity standards of professional preparation. 
              Our platform is intended for simulation and educational purposes only.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>2. Professional Conduct</h3>
            <p>
              Users are expected to engage with the AI simulator in a professional manner. While the AI may provide 
              critical feedback on attire or grooming, this is strictly based on industry-standard professional auditing metrics.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>3. Limitation of Liability</h3>
            <p>
              InterviewMitra provides AI-driven insights but does not guarantee job placement or specific career outcomes. 
              Decisions made based on AI reports are at the user's sole discretion.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>4. Intellectual Property</h3>
            <p>
              All neural network architectures, custom datasets, and glassmorphic designs are the intellectual 
              property of the InterviewMitra team (Dheer & Kunal).
            </p>
          </section>
        </div>

        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'block' }}>← Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
