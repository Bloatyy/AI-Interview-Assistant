import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="premium-container page-padding">
      <div className="neural-mesh"></div>
      
      <div className="glass-card" style={{ padding: '4rem', marginTop: '4rem', maxWidth: '900px', margin: '4rem auto' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Privacy Policy</h1>
        
        <div className="privacy-content" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>1. Data Collection</h3>
            <p>
              InterviewMitra collects biometric data (video/audio) during simulations to provide AI-driven feedback. 
              This data is processed locally where possible or transmitted securely to high-speed inference engines.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>2. Storage & Security</h3>
            <p>
              Your session recordings are stored in your browser's local **IndexedDB** by default. Cloud-persisted reports 
              are encrypted at rest in our MongoDB Atlas clusters. We never sell your interview performance data to third parties.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>3. AI Usage</h3>
            <p>
              We use Groq's Llama and Whisper models for evaluation. Data sent to these endpoints is used solely for 
              generating your report and is not used for training secondary commercial models without explicit consent.
            </p>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h3 style={{ color: 'white', marginBottom: '1rem' }}>4. Your Rights</h3>
            <p>
              You have the right to delete your account and all associated data at any time through your dashboard settings.
            </p>
          </section>
        </div>

        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <p style={{ fontSize: '0.8rem' }}>Last Updated: May 2026</p>
          <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'block', marginTop: '1rem' }}>← Return to Platform</Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
