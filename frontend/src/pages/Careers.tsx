import React from 'react';
import { Link } from 'react-router-dom';

const Careers = () => {
  const jobs = [
    { title: "AI Research Engineer", dept: "Machine Learning", location: "Remote / Hybrid" },
    { title: "Senior Frontend Architect", dept: "Product", location: "Remote / Hybrid" },
    { title: "Full Stack Developer", dept: "Engineering", location: "Global" }
  ];

  return (
    <div className="premium-container page-padding">
      <div className="neural-mesh"></div>
      <div className="bg-glow-2"></div>
      
      <div className="glass-card" style={{ padding: '4rem', marginTop: '4rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Join the Evolution</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '4rem', maxWidth: '700px' }}>
          We are building the future of professional intelligence. Join Dheer and Kunal in creating 
          tools that transform lives.
        </p>

        <h2 style={{ color: 'white', marginBottom: '2rem' }}>Open Roles</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {jobs.map((job, i) => (
            <div key={i} className="glass-card" style={{ 
              padding: '2rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'rgba(255,255,255,0.02)',
              transition: 'all 0.3s ease'
            }}>
              <div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>{job.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{job.dept} • {job.location}</p>
              </div>
              <button className="btn-secondary" style={{ padding: '0.6rem 1.5rem' }}>Apply Now</button>
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '3rem', marginTop: '4rem', textAlign: 'center', border: '1px dashed var(--accent)' }}>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>Don't see a fit?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            We're always looking for exceptional talent. Send your CV to careers@interviewmitra.ai
          </p>
          <Link to="/" className="btn-primary" style={{ padding: '0.8rem 2rem', textDecoration: 'none' }}>
            Explore Mission
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Careers;
